const storageKey = "mycel-browser-storage";
const pendingKey = "mycel-sync-pending";
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "").replace(/\/$/, "");
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

function readStore() {
  try { return JSON.parse(window.localStorage.getItem(storageKey) || "{}"); }
  catch { return {}; }
}

function writeStore(store) { window.localStorage.setItem(storageKey, JSON.stringify(store)); }
function readPending() { try { return JSON.parse(window.localStorage.getItem(pendingKey) || "{}"); } catch { return {}; } }
function writePending(pending) { window.localStorage.setItem(pendingKey, JSON.stringify(pending)); }
function queueChange(key,value) { const pending=readPending();pending[scopedKey(key)]={key,value};writePending(pending); }
function clearChange(key) { const pending=readPending();delete pending[scopedKey(key)];writePending(pending); }
function scopedKey(key) { return window.__mycelUserId ? `${window.__mycelUserId}:${key}` : key; }
function authSession() {
  try { return JSON.parse(window.localStorage.getItem("mycel-auth-session") || "null"); }
  catch { return null; }
}
function announce(detail) { window.dispatchEvent(new CustomEvent("mycel:sync", { detail })); }
function cloudReady() { return Boolean(supabaseUrl && supabaseKey && window.__mycelUserId && authSession()?.access_token); }
function cloudHeaders(prefer) {
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${authSession()?.access_token}`,
    "Content-Type": "application/json",
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

async function cloudGet(key) {
  const query = new URLSearchParams({select:"value,updated_at",user_id:`eq.${window.__mycelUserId}`,storage_key:`eq.${key}`,limit:"1"});
  const response = await fetch(`${supabaseUrl}/rest/v1/mycel_user_data?${query}`, {headers:cloudHeaders()});
  if (!response.ok) throw new Error(`Cloud read failed (${response.status})`);
  return (await response.json())[0] || null;
}

async function cloudSet(key, value) {
  if (value === null || value === undefined) {
    const query = new URLSearchParams({user_id:`eq.${window.__mycelUserId}`,storage_key:`eq.${key}`});
    const response = await fetch(`${supabaseUrl}/rest/v1/mycel_user_data?${query}`, {method:"DELETE",headers:cloudHeaders("return=minimal")});
    if (!response.ok) throw new Error(`Cloud delete failed (${response.status})`);
    return;
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/mycel_user_data?on_conflict=user_id,storage_key`, {
    method:"POST",headers:cloudHeaders("resolution=merge-duplicates,return=minimal"),
    body:JSON.stringify({user_id:window.__mycelUserId,storage_key:key,value}),
  });
  if (!response.ok) throw new Error(`Cloud save failed (${response.status})`);
}

export function createMycelStorage() {
  return {
    async get(key) {
      const store=readStore();const localKey=scopedKey(key);const localValue=localKey in store?store[localKey]:null;
      if (!cloudReady()) return localValue===null?null:{value:localValue};
      try {
        const queued=readPending()[localKey];
        if(queued){await cloudSet(key,queued.value);clearChange(key);announce({state:"synced",at:new Date().toISOString()});return queued.value===null?null:{value:queued.value};}
        const remote=await cloudGet(key);
        if (remote) {store[localKey]=remote.value;writeStore(store);announce({state:"synced",at:remote.updated_at});return {value:remote.value};}
        if (localValue!==null) {await cloudSet(key,localValue);announce({state:"synced",at:new Date().toISOString()});return {value:localValue};}
        return null;
      } catch(error) {announce({state:"offline",message:error.message});return localValue===null?null:{value:localValue};}
    },
    async set(key,value) {
      const store=readStore();const localKey=scopedKey(key);
      if(value===null||value===undefined)delete store[localKey];else store[localKey]=value;
      writeStore(store);queueChange(key,value);announce({state:"local",at:new Date().toISOString()});
      if(!cloudReady())return;
      announce({state:"syncing"});
      try{await cloudSet(key,value);clearChange(key);announce({state:"synced",at:new Date().toISOString()});}
      catch(error){announce({state:"offline",message:error.message});}
    },
  };
}

export function adoptLocalData(userId) {
  if(!userId)return;
  const store=readStore();let changed=false;
  for(const [key,value] of Object.entries({...store})){
    if(key.includes(":"))continue;
    const destination=`${userId}:${key}`;
    if(!(destination in store)){store[destination]=value;changed=true;}
  }
  if(changed)writeStore(store);
}
