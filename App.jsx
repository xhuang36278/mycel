import React, { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,50,0;1,9..144,300..500,50,1&display=swap');`;

// â”€â”€ TOKENS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const L = {
  bg:"#F1ECDF",sf:"#FBF7EF",card:"#FFFDF8",raised:"#E8DDCA",d2:"#EFE6D7",
  bd:"#D9CDBA",bdS:"#E7DDCF",
  ink:"#27211A",body:"#4D463A",muted:"#776D5D",faint:"#A69B89",
  am:"#94622A",amBg:"#94622A12",amBd:"#94622A30",
  sg:"#557746",sgBg:"#55774612",sgBd:"#55774630",
  oc:"#2F7883",ocBg:"#2F788312",ocBd:"#2F788330",
  ru:"#8E3E25",ruBg:"#8E3E2512",ruBd:"#8E3E2530",
  pu:"#675097",puBg:"#67509712",puBd:"#67509730",
  net:"#5A7A48",netBg:"#5A7A4810",netBd:"#5A7A4828",
  gold:"#BC9438",goldBg:"#BC943812",goldBd:"#BC943830",
  thr:"#A06B2E30",nwm:"#3A7E8C",
  shadow:"0 18px 54px -34px rgba(80,57,28,0.42),0 2px 10px -6px rgba(80,57,28,0.18)",
  shadowSoft:"0 10px 28px -22px rgba(80,57,28,0.32),0 1px 4px -2px rgba(80,57,28,0.12)",
};
const D = {
  bg:"#0F0C08",sf:"#17130D",card:"#1F1A12",raised:"#272116",d2:"#19150F",
  bd:"#302719",bdS:"#251F15",
  ink:"#EEE7D7",body:"#C5BBA3",muted:"#8A806E",faint:"#51483B",
  am:"#C99456",amBg:"#C9945614",amBd:"#C994562C",
  sg:"#7EA876",sgBg:"#7EA87614",sgBd:"#7EA8762C",
  oc:"#5E9CA8",ocBg:"#5E9CA814",ocBd:"#5E9CA82C",
  ru:"#C05C3A",ruBg:"#C05C3A14",ruBd:"#C05C3A2C",
  pu:"#8A6CC0",puBg:"#8A6CC014",puBd:"#8A6CC02C",
  net:"#7EA876",netBg:"#7EA87614",netBd:"#7EA8762C",
  gold:"#D4AC48",goldBg:"#D4AC4814",goldBd:"#D4AC4830",
  thr:"#C9945638",nwm:"#5E9CA8",
  shadow:"0 22px 60px -34px rgba(0,0,0,0.88),0 2px 12px -6px rgba(0,0,0,0.58)",
  shadowSoft:"0 14px 36px -28px rgba(0,0,0,0.72),0 1px 8px -4px rgba(0,0,0,0.42)",
};
const F={ui:"'Inter',system-ui,sans-serif",mono:"'DM Mono',monospace",display:"'Fraunces',Georgia,serif"};
// All AI calls go through the Vercel proxy (/api/chat) which holds the API key server-side.
// On localhost without the proxy running, AI features will show a connection error -- expected.
const API_URL="/api/chat";
const AI_ENABLED=import.meta.env.VITE_AI_ENABLED==="true";
// Spacing scale -- use these instead of ad-hoc values for vertical rhythm
const SP={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32};
const tc=(T,t)=>t===1?T.am:t===2?T.oc:T.sg;
const tl=t=>t===1?"T1 . core":t===2?"T2 . applied":"T3 . extended";

// â”€â”€ DATA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const UNITS=[
  {id:"agric1001",code:"AGRIC 1001",label:"Intro to agricultural science",icon:"AG"},
  {id:"agric1002",code:"AGRIC 1002",label:"Agricultural systems",icon:"AS"},
  {id:"soil2001",code:"SOIL 2001",label:"Soil science",icon:"SO"},
  {id:"plnt2003",code:"PLNT 2003",label:"Plant physiology",icon:"PL"},
  {id:"biol1003",code:"BIOL 1003",label:"Biology 1A",icon:"BI"},
  {id:"biol1004",code:"BIOL 1004",label:"Biology 1B",icon:"BI"},
  {id:"chem1002",code:"CHEM 1002",label:"Chemistry 1A",icon:"CH"},
  {id:"stat1000",code:"STAT 1000",label:"Statistics",icon:"ST"},
];

const SQ=[
  {id:"goal",q:"What's your main goal for using Mycel?",opts:["Understand my units deeply","Prepare for exams","Connect ideas across fields","Build research skills","All of the above"]},
  {id:"challenge",q:"What's your biggest study challenge right now?",opts:["Understanding mechanisms, not just facts","Connecting concepts across units","Turning notes into useful summaries","Staying consistent","Finding time to review"]},
  {id:"style",q:"How do you learn best?",opts:["Asking questions and exploring","Reading and annotating","Making notes and summaries","Testing myself","A mix of all"]},
  {id:"year",q:"What year are you in?",opts:["Year 1","Year 2","Year 3","Honours","Postgrad"]},
  {id:"symbia",q:"Are you interested in soil restoration or sustainable agriculture research?",opts:["Yes, very much","Somewhat","Not really","I don't know yet"]},
];

const NOTE_TPLS=[
  {id:"mechanism",name:"Mechanism breakdown",icon:"MECH",desc:"How something works step by step",s:"CONCEPT:\nDEFINITION:\nMECHANISM (step by step):\nWHY IT MATTERS:\nCROSS-UNIT LINK:\nCOMMON EXAM MISTAKE:\nPRACTICE QUESTION:"},
  {id:"comparison",name:"Compare and contrast",icon:"<->",desc:"Compare two processes or concepts",s:"ITEM A:\nITEM B:\nSIMILARITIES:\nDIFFERENCES:\nWHEN EACH APPLIES:\nPRACTICE QUESTION:"},
  {id:"system",name:"System analysis",icon:"SYS",desc:"Map a biological or ecological system",s:"SYSTEM NAME:\nINPUTS:\nPROCESSES:\nOUTPUTS:\nFEEDBACK LOOPS:\nFAILURE MODES:\nREAL EXAMPLE:"},
  {id:"labprep",name:"Pre-lab primer",icon:"LAB",desc:"Prime your understanding before the lab",s:"LAB TITLE:\nCORE MECHANISM BEING TESTED:\nWHAT I EXPECT TO OBSERVE:\nWHY (THEORY):\nKEY VARIABLES:\nWHAT COULD GO WRONG:"},
  {id:"postreflect",name:"Post-lab reflection",icon:"POST",desc:"Connect observations to theory after the lab",s:"WHAT I OBSERVED:\nWHAT I EXPECTED:\nWHAT SURPRISED ME:\nMECHANISM EXPLANATION:\nCONNECTION TO THEORY:\nQUESTION THIS RAISED:"},
  {id:"symbia",name:"Symbia research note",icon:"SYM",desc:"Connect learning to soil restoration and Symbia",s:"CONCEPT:\nCONNECTION TO SOIL HEALTH:\nCONNECTION TO MYCORRHIZAL NETWORKS:\nAPPLICATION IN RESTORATION:\nGAP IN CURRENT KNOWLEDGE:\nRESEARCH QUESTION THIS RAISES:"},
];

const EMAIL_TPLS=[
  {id:"volunteer",label:"Request to volunteer in lab",icon:"LAB",fields:["supervisorName","supervisorEmail","labFocus","yourBackground"]},
  {id:"extension",label:"Request assignment extension",icon:"DATE",fields:["lecturerName","unitCode","assignmentName","reason","proposedDate"]},
  {id:"meeting",label:"Request meeting with supervisor",icon:"MEET",fields:["supervisorName","purpose","availability"]},
  {id:"intro",label:"Introduce yourself to a researcher",icon:"MAIL",fields:["researcherName","institution","theirWork","yourProject","ask"]},
  {id:"thankyou",label:"Thank you after meeting",icon:"NOTE",fields:["recipientName","meetingTopic","keyTakeaway"]},
  {id:"custom",label:"Custom email",icon:"WRITE",fields:["to","subject","context","tone"]},
];

// â”€â”€ STORAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const db={
  async get(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}},
  async set(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}},
};

// â”€â”€ STREAMING AI â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function streamAI(messages, system, onToken, onDone, max=1400){
  if(!AI_ENABLED){onToken("AI features are disabled in Core mode. Your non-AI work remains available.");onDone();return;}
  try{
    const res=await fetch(API_URL,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:max,system,messages,stream:true}),
    });
    if(!res.ok){const err=await res.text();throw new Error(err||`AI request failed (${res.status})`);}
    if(!res.body)throw new Error("AI response did not include a stream");
    const reader=res.body.getReader();
    const dec=new TextDecoder();
    let buf="";
    while(true){
      const{done,value}=await reader.read();
      if(done)break;
      buf+=dec.decode(value,{stream:true});
      const lines=buf.split("\n");
      buf=lines.pop()||"";
      for(const line of lines){
        if(line.startsWith("data: ")){
          try{
            const d=JSON.parse(line.slice(6));
            if(d.type==="content_block_delta"&&d.delta?.text){onToken(d.delta.text);}
            if(d.type==="message_stop"){onDone();}
          }catch{}
        }
      }
    }
    onDone();
  }catch(e){onDone();throw e;}
}

async function callAI(messages,system,max=1200){
  if(!AI_ENABLED)throw new Error("AI features are disabled in Core mode.");
  const res=await fetch(API_URL,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:max,system,messages}),
  });
  if(!res.ok){const err=await res.text();throw new Error(err||`AI request failed (${res.status})`);}
  const d=await res.json();
  return d.content?.map(b=>b.text||"").join("")||"";
}

// PDF binaries are kept in IndexedDB so a saved library document survives reloads
// without overflowing localStorage. Document metadata remains in the normal app store.
const fileStore={
  open(){return new Promise((resolve,reject)=>{const req=indexedDB.open("mycel-library",1);req.onupgradeneeded=()=>req.result.createObjectStore("files");req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});},
  async set(id,blob){const d=await this.open();return new Promise((resolve,reject)=>{const tx=d.transaction("files","readwrite");tx.objectStore("files").put(blob,id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});},
  async get(id){const d=await this.open();return new Promise((resolve,reject)=>{const req=d.transaction("files").objectStore("files").get(id);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>reject(req.error);});},
  async del(id){const d=await this.open();return new Promise((resolve,reject)=>{const tx=d.transaction("files","readwrite");tx.objectStore("files").delete(id);tx.oncomplete=resolve;tx.onerror=()=>reject(tx.error);});},
};
const loadScript=(src,test)=>test()?Promise.resolve():new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s);});

function buildSys(fields,graph,name,survey,mode){
  const units=fields.map(f=>f.code+"("+f.label+")").join(", ");
  const top=[...graph].sort((a,b)=>b.w-a.w).slice(0,6).map(n=>n.label+"x"+n.w).join(", ");
  const sc=survey?"Learner: goal="+survey.goal+", style="+survey.style+", year="+survey.year+".":"";
  const base="You are Mycel -- AI learning companion for "+(name||"a student")+" at Adelaide University, Roseworthy Campus. Units: "+units+". Knowledge map: "+(top||"building...")+" "+sc+" Ground every answer in specific mechanism. Surface cross-unit connections. Use SA/Roseworthy context.";
  const noteInstructions="\n\nOUTPUT FORMAT -- STRUCTURED NOTE:\n## [Topic Title]\n### 1. [Section Name]\n- **Key term**: precise definition\n- **Mechanism**: step-by-step process\n- **Why it matters**: agricultural relevance\nBold ALL key terms. Be dense and precise. End with:\n> Key takeaway: one sentence.\n> Exam trap: the most common misconception.";
  const explainInstructions="\n\nOUTPUT FORMAT -- BREAKDOWN:\nUse emoji anchors for sections. Quote the technical sentence first (in italics), then explain in plain language. Use bullets. Language: conversational (Means: / Translation: / Basically:). End with one sharp question the student must think about themselves.";
  if(mode==="note") return base+noteInstructions;
  return base+explainInstructions;
}

function extractC(t){
  const s=new Set(["this","that","what","when","where","which","with","from","into","than","then","they","your","have","does","been","more","also","will","would","could","about","after","before","these","those","their","there","other"]);
  return[...new Set(t.toLowerCase().replace(/[^a-z\s]/g," ").split(/\s+/).filter(w=>w.length>4&&!s.has(w)))].slice(0,6);
}

// â”€â”€ LOGO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function MycelIcon({size=22,color="#A87010"}){
  return(
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <circle cx="50" cy="50" r="5.5" fill="none" stroke={color} strokeWidth="3.5"/>
      <path d="M47,46 Q38,35 28,20 Q24,13 20,8" stroke={color} strokeWidth="3.2" strokeLinecap="round" fill="none"/>
      <path d="M28,20 Q22,17 16,14" stroke={color} strokeWidth="1.4" strokeLinecap="round" fill="none"/>
      <path d="M28,20 Q25,12 22,7" stroke={color} strokeWidth="1.2" strokeLinecap="round" fill="none"/>
      <path d="M53,46 Q64,38 74,28 Q80,22 84,17" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M74,28 Q80,24 86,22" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M45,50 Q33,48 20,44 Q13,42 7,40" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"/>
      <path d="M20,44 Q14,38 10,32" stroke={color} strokeWidth="1.3" strokeLinecap="round" fill="none"/>
      <path d="M20,44 Q12,46 6,48" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none"/>
      <path d="M53,54 Q65,64 76,74 Q82,80 86,86" stroke={color} strokeWidth="2.8" strokeLinecap="round" fill="none"/>
      <path d="M50,55.5 Q50,68 48,80 Q47,88 46,94" stroke={color} strokeWidth="2.6" strokeLinecap="round" fill="none"/>
      <path d="M48,80 Q42,86 38,92" stroke={color} strokeWidth="1.1" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function Logo({T,size=20}){
  // Official Mycel logo: tree-of-knowledge growing from a book.
  // Light logo (cream) for dark theme; dark logo (charcoal) for light theme.
  const isDark=T===D;
  const src=isDark?"/mycel-logo-light.png?v=official-1":"/mycel-logo-dark.png?v=official-1";
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <img src={src} alt="Mycel" style={{height:size*1.5,width:"auto",objectFit:"contain",display:"block"}}
        onError={(e)=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
      <span style={{display:"none"}}><MycelIcon size={size} color={T.am}/></span>
      <span style={{fontFamily:F.ui,fontSize:size*0.95,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>Mycel</span>
    </div>
  );
}

// â”€â”€ SURVEY â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function SurveyScreen({onDone,T}){
  const[step,setStep]=useState(0);const[ans,setAns]=useState({});
  const q=SQ[step];const pct=(step/SQ.length)*100;
  return(
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24,fontFamily:F.ui}}>
      <div style={{maxWidth:520,width:"100%"}}>
        <Logo T={T} size={24}/>
        <div style={{marginTop:28,marginBottom:6,height:3,background:T.raised,borderRadius:2}}><div style={{height:"100%",width:`${pct}%`,background:T.am,borderRadius:2,transition:"width 0.3s ease"}}/></div>
        <div style={{fontFamily:F.mono,fontSize:10,color:T.muted,marginBottom:28}}>{step+1} of {SQ.length}</div>
        <div style={{fontSize:22,fontWeight:700,color:T.ink,letterSpacing:"-0.025em",marginBottom:20,lineHeight:1.3}}>{q.q}</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {q.opts.map(opt=>(
            <button key={opt} onClick={()=>{const na={...ans,[q.id]:opt};setAns(na);if(step<SQ.length-1)setStep(s=>s+1);else onDone(na);}}
              style={{padding:"12px 16px",background:ans[q.id]===opt?T.amBg:T.card,border:`1px solid ${ans[q.id]===opt?T.amBd:T.bd}`,borderRadius:11,fontSize:14,color:ans[q.id]===opt?T.am:T.body,cursor:"pointer",textAlign:"left",fontWeight:ans[q.id]===opt?600:400,transition:"all 0.1s"}}>
              {opt}
            </button>
          ))}
        </div>
        {step>0&&<button onClick={()=>setStep(s=>s-1)} style={{marginTop:16,background:"none",border:"none",fontSize:13,color:T.muted,cursor:"pointer"}}>Back</button>}
      </div>
    </div>
  );
}

// â”€â”€ ONBOARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function OnboardScreen({onDone,T}){
  const[sel,setSel]=useState([]);const[name,setName]=useState("");const[search,setSearch]=useState("");const[custom,setCustom]=useState([]);
  const toggle=f=>setSel(p=>p.find(x=>x.id===f.id)?p.filter(x=>x.id!==f.id):[...p,f]);
  const all=[...UNITS,...custom];
  const results=search.trim()?all.filter(f=>f.label.toLowerCase().includes(search.toLowerCase())||f.code.toLowerCase().includes(search.toLowerCase())):[];
  const addC=()=>{if(!search.trim())return;const f={id:`cx_${Date.now()}`,code:search.trim().toUpperCase().slice(0,10),label:search.trim().toLowerCase(),icon:"NEW"};setCustom(p=>[...p,f]);toggle(f);setSearch("");};
  return(
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:F.ui,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <Logo T={T} size={26}/>
      <h1 style={{fontSize:26,fontWeight:700,color:T.ink,margin:"20px 0 8px",letterSpacing:"-0.03em",textAlign:"center"}}>Which units are you studying?</h1>
      <p style={{fontSize:14,color:T.muted,marginBottom:24,textAlign:"center",maxWidth:380,lineHeight:1.6}}>Mycel grounds answers in your actual units and surfaces connections between them.</p>
      <div style={{width:"100%",maxWidth:480}}>
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="Your name (optional)" style={{width:"100%",padding:"10px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,color:T.ink,fontSize:14,outline:"none",marginBottom:12,boxSizing:"border-box"}}/>
        <div style={{position:"relative",marginBottom:14}}>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search or add a unit..." onKeyDown={e=>e.key==="Enter"&&results.length===0&&addC()} style={{width:"100%",padding:"10px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,color:T.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
          {search.trim()&&<div style={{position:"absolute",top:"calc(100% + 4px)",left:0,right:0,background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,padding:5,zIndex:50,boxShadow:"0 12px 36px -12px rgba(20,16,10,0.2)"}}>
            {results.slice(0,5).map(f=>(<div key={f.id} onClick={()=>{toggle(f);setSearch("");}} style={{padding:"8px 12px",borderRadius:7,cursor:"pointer"}} onMouseEnter={e=>e.currentTarget.style.background=T.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><span style={{fontSize:13,color:T.ink}}>{f.label}</span></div>))}
            <div onClick={addC} style={{padding:"8px 12px",borderRadius:7,cursor:"pointer",display:"flex",gap:8,alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=T.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><span style={{color:T.am,fontWeight:700}}>+</span><span style={{fontSize:13,color:T.am}}>Add "{search.trim()}"</span></div>
          </div>}
        </div>
        {sel.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{sel.map(f=>(<div key={f.id} onClick={()=>toggle(f)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:7,cursor:"pointer"}}><span style={{fontSize:12,fontWeight:500,color:T.ink}}>{f.code}</span><span style={{color:T.am,fontWeight:700}}>x</span></div>))}</div>}
        <div style={{fontFamily:F.mono,fontSize:9,color:T.faint,letterSpacing:"0.2em",marginBottom:10}}>ROSEWORTHY UNITS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:22}}>
          {UNITS.map(f=>{const on=sel.find(x=>x.id===f.id);return(<div key={f.id} onClick={()=>toggle(f)} style={{padding:"10px 12px",background:on?T.amBg:T.card,border:`1px solid ${on?T.amBd:T.bd}`,borderRadius:10,cursor:"pointer",transition:"all 0.1s"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontFamily:F.mono,fontSize:9,color:on?T.am:T.muted}}>{f.code}</span>{on&&<span style={{marginLeft:"auto",color:T.am,fontWeight:700}}>Selected</span>}</div>
            <div style={{fontSize:12,color:T.ink,fontWeight:500}}>{f.label}</div>
          </div>);})}
        </div>
        <button onClick={()=>sel.length>0&&onDone({fields:sel,name:name.trim()})} disabled={sel.length===0} style={{width:"100%",padding:"13px",background:sel.length>0?T.am:T.raised,border:"none",borderRadius:11,color:sel.length>0?"#FFF":T.faint,fontSize:15,fontWeight:700,cursor:sel.length>0?"pointer":"not-allowed",transition:"all 0.15s"}}>
          {sel.length===0?"Select at least one unit":`Start with ${sel.length} unit${sel.length>1?"s":""} `}
        </button>
      </div>
    </div>
  );
}


// â”€â”€ STREAK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function StreakRing({streak,T,size=44}){
  const r=size/2-4;const c=2*Math.PI*r;const p=Math.min(streak/7,1);
  return(<div style={{position:"relative",width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center"}}>
    <svg width={size} height={size} style={{position:"absolute",transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.d2} strokeWidth="3"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={T.am} strokeWidth="3" strokeDasharray={c} strokeDashoffset={c*(1-p)} strokeLinecap="round"/>
    </svg>
    <div style={{textAlign:"center"}}><div style={{fontFamily:F.ui,fontSize:size*0.28,fontWeight:700,color:T.ink,lineHeight:1}}>{streak}</div><div style={{fontFamily:F.mono,fontSize:size*0.15,color:T.muted,lineHeight:1}}>days</div></div>
  </div>);
}

// â”€â”€ PATTERN TRACKER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PatternTracker({sessions,T}){
  if(!sessions?.length)return(<div style={{padding:"20px 0",textAlign:"center",fontSize:12,color:T.faint}}>Start chatting to build your pattern.</div>);
  const last14=sessions.slice(-14);const topics={};
  sessions.forEach(s=>(s.topics||[]).forEach(t=>{topics[t]=(topics[t]||0)+1;}));
  const sorted=Object.entries(topics).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const totalQ=sessions.reduce((a,s)=>a+(s.questions||0),0);
  const totalB=sessions.reduce((a,s)=>a+(s.branches||0),0);
  const streak14=last14.filter(s=>s.questions>0).length;
  return(<div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10}}>
      {[{l:"Questions",v:totalQ,c:T.am},{l:"Branches",v:totalB,c:T.oc},{l:"Active days",v:streak14,c:T.sg},{l:"Topics",v:sorted.length,c:(T.net||T.sg)}].map(s=>(<div key={s.l} style={{padding:"7px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:8,textAlign:"center"}}><div style={{fontSize:16,fontWeight:700,color:s.c}}>{s.v}</div><div style={{fontFamily:F.mono,fontSize:7,color:T.muted,marginTop:1}}>{s.l}</div></div>))}
    </div>
    <div style={{display:"flex",gap:2,alignItems:"flex-end",height:36,marginBottom:10}}>
      {last14.map((s,i)=>{const h=Math.max(3,((s.questions||0)/Math.max(...last14.map(x=>x.questions||1),1))*33);return(<div key={i} style={{flex:1,height:h,background:T.amBd,borderRadius:2,cursor:"default"}} title={`${s.date}: ${s.questions||0} Q`} onMouseEnter={e=>e.currentTarget.style.background=T.am} onMouseLeave={e=>e.currentTarget.style.background=T.amBd}/>);})}
    </div>
    {sorted.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:8}}>{sorted.map(([t,c])=>(<div key={t} style={{padding:"2px 7px",background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:12}}><span style={{fontSize:10,color:T.body}}>{t}</span><span style={{fontFamily:F.mono,fontSize:8,color:T.muted,marginLeft:4}}>x{c}</span></div>))}</div>}
    {totalB>0&&totalQ>0&&<div style={{fontSize:10,color:T.muted,lineHeight:1.4}}>{((totalB/totalQ)*100).toFixed(0)}% branch rate -- {totalB/(totalQ)*100>30?"deep explorer":"building depth"}</div>}
  </div>);
}

// â”€â”€ TASK CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function TaskCard({task,onToggle,T}){
  const color=tc(T,task.tier);
  return(<div style={{padding:"10px 12px",background:task.done?T.d2:T.card,border:`1px solid ${task.done?T.bdS:T.bd}`,borderRadius:10,marginBottom:6,opacity:task.done?0.55:1,transition:"all 0.12s"}}>
    <div style={{display:"flex",alignItems:"flex-start",gap:10}}>
      <div onClick={()=>onToggle(task.id)} style={{width:18,height:18,borderRadius:5,border:`2px solid ${task.done?color:T.bd}`,background:task.done?color:"transparent",flexShrink:0,marginTop:1,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all 0.12s"}}>
        {task.done&&<svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="#FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>}
      </div>
      <div style={{flex:1}}>
        <div style={{display:"flex",alignItems:"baseline",gap:8,flexWrap:"wrap"}}>
          <span style={{fontSize:13.5,color:task.done?T.muted:T.ink,textDecoration:task.done?"line-through":"none",fontWeight:500}}>{task.text}</span>
          {task.unitCode&&<span style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>{task.unitCode}</span>}
        </div>
        {task.description&&<div style={{fontSize:11.5,color:T.muted,lineHeight:1.5,marginTop:4}}>{task.description}</div>}
        <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:4}}>{[task.projectName,task.due&&`Due ${task.due}`,task.effort].filter(Boolean).join(" / ")}</div>
      </div>
      {task.source==="canvas"&&<span style={{fontFamily:F.mono,fontSize:8,padding:"1px 6px",background:T.puBg,border:`1px solid ${T.puBd}`,borderRadius:5,color:T.pu}}>Canvas</span>}
    </div>
  </div>);
}

// â”€â”€ CALENDAR STRIP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function CalStrip({tasks,deadlines,today,selDay,onSel,T}){
  const days=[];
  for(let i=-1;i<=5;i++){const d=new Date(today);d.setDate(d.getDate()+i);const ds=d.toISOString().slice(0,10);days.push({date:d,ds,hasTasks:tasks.filter(t=>t.due===ds&&!t.done).length,hasDeadline:deadlines.filter(dl=>dl.due===ds).length,isToday:i===0});}
  const DOW=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  return(<div style={{display:"flex",gap:5,overflowX:"auto",paddingBottom:4,marginBottom:16}}>
    {days.map(({date,ds,hasTasks,hasDeadline,isToday})=>{const sel=selDay===ds;return(<div key={ds} onClick={()=>onSel(ds)} style={{flex:"0 0 auto",width:52,padding:"8px 4px",background:sel?T.amBg:isToday?T.raised:T.card,border:`1px solid ${sel?T.amBd:isToday?T.bd:T.bdS}`,borderRadius:10,cursor:"pointer",textAlign:"center",transition:"all 0.1s"}}>
      <div style={{fontFamily:F.mono,fontSize:9,color:sel?T.am:T.muted,marginBottom:3}}>{DOW[date.getDay()]}</div>
      <div style={{fontSize:14,fontWeight:isToday?700:500,color:sel?T.am:T.ink}}>{date.getDate()}</div>
      <div style={{display:"flex",gap:3,justifyContent:"center",marginTop:4}}>
        {hasTasks>0&&<div style={{width:5,height:5,borderRadius:"50%",background:T.am}}/>}
        {hasDeadline>0&&<div style={{width:5,height:5,borderRadius:"50%",background:T.ru}}/>}
      </div>
    </div>);})}</div>);
}

// â”€â”€ PRE-LAB SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PreLabScreen({T,setup,graph,survey,onClose,onSaveNote}){
  const[step,setStep]=useState(0); // 0=intro, 1=labname, 2=priming, 3=questions, 4=ready
  const[labName,setLabName]=useState("");
  const[primingText,setPrimingText]=useState("");
  const[userAns,setUserAns]=useState({});
  const[questions,setQuestions]=useState([]);
  const[qBusy,setQBusy]=useState(false);
  const[streamText,setStreamText]=useState("");

  const genPriming=async()=>{
    if(!labName.trim())return;
    setStep(2);setStreamText("");setQBusy(true);
    const sys=buildSys(setup?.fields||[],graph,setup?.name,survey);
    let acc="";
    try{
      await streamAI([{role:"user",content:`I am about to do this lab: "${labName}"\n\nGive me a 3-part pre-lab primer:\n1. MECHANISM -- what biological or chemical process is this lab actually testing? Be specific.\n2. WHAT TO EXPECT -- what should I observe and why (based on the mechanism)?\n3. CRITICAL VARIABLES -- what are the 2-3 variables that will most affect my results?\n\nThen give me 3 short targeted questions that will help me notice the right things during the lab.`}],
        sys,
        (token)=>{acc+=token;setStreamText(acc);},
        ()=>{
          setPrimingText(acc);
          const qLines=acc.split("\n").filter(l=>/^\d\./.test(l.trim())||/^\?/.test(l.trim())).slice(-3);
          setQuestions(qLines.length>=2?qLines:["What is the core mechanism being tested?","What do you predict will happen and why?","What variable are you most uncertain about?"]);
          setQBusy(false);setStep(3);
        },600
      );
    }catch{setQBusy(false);}
  };

  const saveAndClose=()=>{
    if(Object.values(userAns).some(a=>a.trim())){
      const noteText=`PRE-LAB: ${labName}\n\n${primingText}\n\nMY ANSWERS:\n${Object.entries(userAns).map(([q,a])=>`${q}\n ${a}`).join("\n\n")}`;
      onSaveNote({text:noteText,title:`Pre-lab: ${labName}`,template:"labprep"});
    }
    onClose();
  };

  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,display:"flex",flexDirection:"column",fontFamily:F.ui}}>
      {/* Header */}
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:12,background:T.sf}}>
        <div style={{width:32,height:32,borderRadius:8,background:T.sgBg,border:`1px solid ${T.sgBd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
          <span style={{fontFamily:F.mono,fontSize:10}}>PRE</span>
        </div>
        <div>
          <div style={{fontSize:15,fontWeight:700,color:T.ink}}>Pre-lab primer</div>
          <div style={{fontFamily:F.mono,fontSize:10,color:T.sg,marginTop:1}}>Understand the mechanism before you walk in</div>
        </div>
        <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer"}}>Close</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"28px 20px",maxWidth:680,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
        {step===0&&(
          <div>
            <div style={{fontSize:26,fontWeight:700,color:T.ink,letterSpacing:"-0.025em",marginBottom:12,lineHeight:1.2}}>Before you go in,<br/>understand the <em style={{color:T.sg}}>mechanism</em>.</div>
            <p style={{fontSize:15,color:T.body,lineHeight:1.7,marginBottom:28,maxWidth:500}}>Most students arrive at labs knowing the procedure. Mycel will prime you on the underlying biology or chemistry (what you're actually testing and why it matters) so you can observe intelligently instead of just following steps.</p>
            <div style={{display:"flex",flexDirection:"column",gap:14,marginBottom:32}}>
              {[{t:"Mechanism first",d:"Understand what's actually happening at the molecular or cellular level"},
                {t:"Predict then observe",d:"Form a prediction before you enter. It makes your observations 10x more meaningful."},
                {t:"Save your primer",d:"Your pre-lab notes are saved and become the foundation for your post-lab reflection"},
              ].map(f=>(<div key={f.t} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <div><div style={{fontSize:14,fontWeight:600,color:T.ink}}>{f.t}</div><div style={{fontSize:13,color:T.muted,marginTop:2}}>{f.d}</div></div>
              </div>))}
            </div>
            <button onClick={()=>setStep(1)} style={{padding:"13px 28px",background:T.sg,border:"none",borderRadius:11,color:"#FFF",fontSize:15,fontWeight:600,cursor:"pointer"}}>Start pre-lab primer</button>
          </div>
        )}

        {step===1&&(
          <div>
            <div style={{fontSize:20,fontWeight:700,color:T.ink,marginBottom:8}}>What lab are you about to do?</div>
            <p style={{fontSize:14,color:T.muted,marginBottom:20,lineHeight:1.6}}>Name the lab or describe what you'll be doing. The more specific, the better the primer.</p>
            <textarea value={labName} onChange={e=>setLabName(e.target.value)} placeholder="e.g. Soil pH and plant nutrient availability lab, SOIL 2001 Week 4..." rows={3} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11,color:T.ink,fontSize:14,padding:"12px 14px",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box",marginBottom:16}}/>
            <button onClick={genPriming} disabled={!labName.trim()} style={{padding:"12px 28px",background:labName.trim()?T.sg:T.raised,border:"none",borderRadius:10,color:labName.trim()?"#FFF":T.faint,fontSize:14,fontWeight:600,cursor:labName.trim()?"pointer":"not-allowed"}}>Prime me</button>
          </div>
        )}

        {step===2&&(
          <div>
            <div style={{fontFamily:F.mono,fontSize:10,color:T.sg,marginBottom:12,letterSpacing:"0.1em"}}>GENERATING PRIMER / {labName}</div>
            <div style={{padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12}}>
              <div style={{fontSize:14,color:T.ink,lineHeight:1.85,whiteSpace:"pre-wrap",fontFamily:F.ui}}>
                {streamText}
                {qBusy&&<span style={{display:"inline-block",width:2,height:16,background:T.sg,marginLeft:2,animation:"blink 0.8s step-end infinite",verticalAlign:"text-bottom"}}/>}
              </div>
            </div>
          </div>
        )}

        {step===3&&(
          <div>
            <div style={{padding:"14px 16px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:12,marginBottom:20}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.sg,marginBottom:8}}>YOUR PRIMER / {labName}</div>
              <div style={{fontSize:13.5,color:T.body,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{primingText}</div>
            </div>
            <div style={{fontSize:16,fontWeight:700,color:T.ink,marginBottom:6}}>Now answer these before you go in:</div>
            <p style={{fontSize:13,color:T.muted,marginBottom:18,lineHeight:1.6}}>Writing your prediction, even briefly, makes your observations 10x more meaningful. These are saved with your primer notes.</p>
            {["What is the core mechanism this lab is testing?","What do you predict will happen and why?","What are you most uncertain about going in?"].map((q,i)=>(
              <div key={i} style={{marginBottom:16}}>
                <div style={{fontSize:13.5,color:T.ink,fontWeight:500,marginBottom:7}}>{q}</div>
                <textarea value={userAns[q]||""} onChange={e=>setUserAns(p=>({...p,[q]:e.target.value}))} placeholder="Your answer (brief is fine)..." rows={2} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13.5,padding:"9px 12px",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box"}}/>
              </div>
            ))}
            <div style={{display:"flex",gap:10,marginTop:8}}>
              <button onClick={saveAndClose} style={{padding:"12px 24px",background:T.sg,border:"none",borderRadius:10,color:"#FFF",fontSize:14,fontWeight:600,cursor:"pointer"}}>Save primer and go</button>
              <button onClick={onClose} style={{padding:"12px 16px",background:"none",border:`1px solid ${T.bd}`,borderRadius:10,fontSize:13,color:T.muted,cursor:"pointer"}}>Skip saving</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€ POST-LAB SCREEN â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function PostLabScreen({T,setup,graph,survey,notes,onClose,onSaveNote}){
  const[step,setStep]=useState(0);
  const[observation,setObservation]=useState("");
  const[expected,setExpected]=useState("");
  const[surprising,setSurprising]=useState("");
  const[streamText,setStreamText]=useState("");
  const[sBusy,setSBusy]=useState(false);
  const[saved,setSaved]=useState(false);

  const relatedPrelab=notes.find(n=>n.template==="labprep");

  const analyse=async()=>{
    if(!observation.trim())return;
    setStep(2);setStreamText("");setSBusy(true);
    const sys=buildSys(setup?.fields||[],graph,setup?.name,survey);
    const preCtx=relatedPrelab?`\nPre-lab primer context:\n${relatedPrelab.text.slice(0,600)}`:"";
    let acc="";
    try{
      await streamAI([{role:"user",content:`I just completed a lab. Here is what happened:\n\nWHAT I OBSERVED: ${observation}\nWHAT I EXPECTED: ${expected||"(not specified)"}\nWHAT SURPRISED ME: ${surprising||"(nothing noted)"}\n${preCtx}\n\nHelp me:\n1. MECHANISM CONNECTION -- explain exactly what mechanism produced what I observed. Be specific at the molecular/cellular level.\n2. WHY THE SURPRISE (if any) -- if something was unexpected, what does that tell us about the underlying biology?\n3. CONNECTION TO THEORY -- how does what I observed connect to what I'm learning in my units?\n4. ONE INSIGHT -- what is the one most important thing I should take away from this lab?\n\nEnd with one question I should be able to answer now that I couldn't before.`}],
        sys,
        (token)=>{acc+=token;setStreamText(acc);},
        ()=>{setSBusy(false);},700
      );
    }catch{setSBusy(false);}
  };

  const saveAndClose=()=>{
    const noteText=`POST-LAB REFLECTION\n\nWHAT I OBSERVED:\n${observation}\n\nWHAT I EXPECTED:\n${expected}\n\nWHAT SURPRISED ME:\n${surprising}\n\nMYCEL ANALYSIS:\n${streamText}`;
    onSaveNote({text:noteText,title:"Post-lab reflection",template:"postreflect"});
    setSaved(true);setTimeout(onClose,1200);
  };

  return(
    <div style={{position:"fixed",inset:0,background:T.bg,zIndex:200,display:"flex",flexDirection:"column",fontFamily:F.ui}}>
      <div style={{padding:"14px 20px",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:12,background:T.sf}}>
        <div><div style={{fontSize:15,fontWeight:700,color:T.ink}}>Post-lab reflection</div><div style={{fontFamily:F.mono,fontSize:10,color:T.oc,marginTop:1}}>Connect what you observed to the mechanism</div></div>
        <button onClick={onClose} style={{marginLeft:"auto",background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer"}}>Close</button>
      </div>

      <div style={{flex:1,overflowY:"auto",padding:"28px 20px",maxWidth:680,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
        {step===0&&(
          <div>
            <div style={{fontSize:26,fontWeight:700,color:T.ink,letterSpacing:"-0.025em",marginBottom:12,lineHeight:1.2}}>What did you<br/><em style={{color:T.oc}}>actually observe</em>?</div>
            <p style={{fontSize:15,color:T.body,lineHeight:1.7,marginBottom:28,maxWidth:500}}>The most important moment in a lab is right after, when you describe what happened before the details blur. Mycel will connect your observations to the underlying mechanism in real time.</p>
            {relatedPrelab&&<div style={{padding:"10px 14px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:10,marginBottom:24}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.oc,marginBottom:4}}>FOUND YOUR PRE-LAB PRIMER</div>
              <div style={{fontSize:13,color:T.body,lineHeight:1.5}}>{relatedPrelab.text.slice(0,150)}...</div>
            </div>}
            <button onClick={()=>setStep(1)} style={{padding:"13px 28px",background:T.oc,border:"none",borderRadius:11,color:"#FFF",fontSize:15,fontWeight:600,cursor:"pointer"}}>Start reflection</button>
          </div>
        )}

        {step===1&&(
          <div>
            {[{val:observation,set:setObservation,label:"What did you observe?",hint:"Describe what actually happened: measurements, colours, reactions, anything notable. Be specific.",rows:4},
              {val:expected,set:setExpected,label:"What did you expect to happen?",hint:"What did your pre-lab primer predict?",rows:2},
              {val:surprising,set:setSurprising,label:"What surprised you (if anything)?",hint:"Anything that didn't match your prediction or seemed unexpected.",rows:2},
            ].map(({val,set,label,hint,rows})=>(
              <div key={label} style={{marginBottom:18}}>
                <div style={{fontSize:14,fontWeight:600,color:T.ink,marginBottom:5}}>{label}</div>
                <div style={{fontSize:12,color:T.muted,marginBottom:8,lineHeight:1.5}}>{hint}</div>
                <textarea value={val} onChange={e=>set(e.target.value)} rows={rows} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13.5,padding:"9px 12px",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box"}}/>
              </div>
            ))}
            <button onClick={analyse} disabled={!observation.trim()} style={{padding:"12px 28px",background:observation.trim()?T.oc:T.raised,border:"none",borderRadius:10,color:observation.trim()?"#FFF":T.faint,fontSize:14,fontWeight:600,cursor:observation.trim()?"pointer":"not-allowed"}}>Analyse with Mycel</button>
          </div>
        )}

        {step>=2&&(
          <div>
            <div style={{padding:"12px 14px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:10,marginBottom:16}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.oc,marginBottom:6}}>WHAT YOU OBSERVED</div>
              <div style={{fontSize:13,color:T.body,lineHeight:1.6}}>{observation}</div>
            </div>
            <div style={{padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.oc,marginBottom:10}}>MYCEL ANALYSIS</div>
              <div style={{fontSize:14,color:T.ink,lineHeight:1.85,whiteSpace:"pre-wrap"}}>
                {streamText}
                {sBusy&&<span style={{display:"inline-block",width:2,height:16,background:T.oc,marginLeft:2,animation:"blink 0.8s step-end infinite",verticalAlign:"text-bottom"}}/>}
              </div>
            </div>
            {!sBusy&&streamText&&!saved&&(
              <div style={{marginTop:16,display:"flex",gap:10}}>
                <button onClick={saveAndClose} style={{padding:"12px 24px",background:T.oc,border:"none",borderRadius:10,color:"#FFF",fontSize:14,fontWeight:600,cursor:"pointer"}}>Save reflection</button>
                <button onClick={onClose} style={{padding:"12px 16px",background:"none",border:`1px solid ${T.bd}`,borderRadius:10,fontSize:13,color:T.muted,cursor:"pointer"}}>Close without saving</button>
              </div>
            )}
            {saved&&<div style={{marginTop:16,padding:"12px 14px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10,fontSize:13,color:T.sg,fontWeight:600}}>Saved to your notes</div>}
          </div>
        )}
      </div>
    </div>
  );
}


// â”€â”€ PDF VIEWER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const HIGHLIGHT_TYPES={
  gold:{label:"Key idea",hint:"Definitions, claims, and central mechanisms"},
  green:{label:"Evidence",hint:"Examples, results, and supporting observations"},
  blue:{label:"Connection",hint:"Links to another concept, unit, or project"},
  coral:{label:"Question",hint:"Confusion, disagreement, or something to revisit"},
};
function highlightedReading(text,annotations){
  const hs=(annotations||[]).filter(a=>a.type==="highlight"&&a.text).sort((a,b)=>text.indexOf(a.text)-text.indexOf(b.text));
  if(!hs.length)return text;
  const out=[];let pos=0;
  hs.forEach((h,i)=>{const at=text.indexOf(h.text,pos);if(at<0)return;out.push(text.slice(pos,at));out.push(<mark key={h.id||i} className={`reader-mark ${h.color||"gold"}`} title={HIGHLIGHT_TYPES[h.color||"gold"]?.label}>{h.text}</mark>);pos=at+h.text.length;});
  out.push(text.slice(pos));return out;
}
function MonthCalendar({tasks,deadlines,selDay,onSel,T}){
  const base=new Date(selDay+"T12:00:00");const y=base.getFullYear(),m=base.getMonth();const first=new Date(y,m,1);const cells=[];for(let i=0;i<first.getDay();i++)cells.push(null);for(let d=1;d<=new Date(y,m+1,0).getDate();d++){const date=new Date(y,m,d);cells.push({d,ds:`${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`});}
  const move=n=>{const d=new Date(y,m+n,1);onSel(d.toISOString().slice(0,10));};
  return <div className="month-calendar"><div className="month-head"><button onClick={()=>move(-1)}>←</button><b>{base.toLocaleDateString("en-AU",{month:"long",year:"numeric"})}</b><button onClick={()=>move(1)}>→</button></div><div className="month-grid">{["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=><span className="month-dow" key={x}>{x}</span>)}{cells.map((c,i)=>c?<button key={c.ds} className={selDay===c.ds?"selected":""} onClick={()=>onSel(c.ds)}><b>{c.d}</b><span>{tasks.filter(t=>t.due===c.ds&&!t.done).length>0&&<i className="task-dot"/>}{deadlines.some(x=>x.due===c.ds)&&<i className="deadline-dot"/>}</span></button>:<span key={`x${i}`}/>)}</div></div>;
}
function PDFViewer({doc,onDelete,onUpdate,T,sysPrompt}){
  const[open,setOpen]=useState(false);const[sel,setSel]=useState("");const[mode,setMode]=useState("highlight");
  const[askQ,setAskQ]=useState("");const[reflTxt,setReflTxt]=useState("");
  const[streamText,setStreamText]=useState("");const[sBusy,setSBusy]=useState(false);
  const[anns,setAnns]=useState(doc.annotations||[]);const[panel,setPanel]=useState("quick");
  const[sessionRefl,setSessionRefl]=useState("");const[closing,setClosing]=useState(false);const[started,setStarted]=useState(null);
  const[highlightColor,setHighlightColor]=useState("gold");const[vocabDef,setVocabDef]=useState("");
  const[flashIndex,setFlashIndex]=useState(0);const[flashFlipped,setFlashFlipped]=useState(false);
  const[intention,setIntention]=useState(doc.readingIntention||"");const[quickBusy,setQuickBusy]=useState(false);
  const[summaryBusy,setSummaryBusy]=useState(false);

  useEffect(()=>setAnns(doc.annotations||[]),[doc.annotations]);
  const persist=(next,extra={})=>{setAnns(next);onUpdate(doc.id,{annotations:next,...extra});};
  const begin=()=>{setOpen(true);setStarted(new Date());onUpdate(doc.id,{lastOpenedAt:new Date().toISOString(),openCount:(doc.openCount||0)+1});};
  const requestClose=()=>{setClosing(true);};
  const finishClose=()=>{
    const reflection=sessionRefl.trim()?{id:`s_${Date.now()}`,text:sessionRefl.trim(),createdAt:new Date().toISOString(),minutes:Math.max(1,Math.round((Date.now()-(started?.getTime()||Date.now()))/60000))}:null;
    onUpdate(doc.id,{sessions:reflection?[...(doc.sessions||[]),reflection]:(doc.sessions||[])});
    setSessionRefl("");setClosing(false);setOpen(false);setSel("");
  };

  const handleUp=()=>{const s=window.getSelection();if(!s||s.isCollapsed)return;const t=s.toString().trim();if(t.length>3){setSel(t);setStreamText("");setAskQ("");setReflTxt("");}};

  const ask=async()=>{
    setSBusy(true);setStreamText("");
    let acc="";
    await streamAI([{role:"user",content:`From this text: "${sel}"\n\nQuestion: ${askQ||"What does this mean and why does it matter in an agricultural science context?"}`}],
      sysPrompt,(t)=>{acc+=t;setStreamText(acc);},(()=>{setSBusy(false);}),700
    );
  };

  const saveRefl=async()=>{
    if(!reflTxt.trim())return;
    setSBusy(true);setStreamText("");
    let acc="";
    await streamAI([{role:"user",content:`Passage: "${sel}"\nStudent reflection: "${reflTxt}"\n\nIs this understanding correct? What's right, what's missing or wrong? Be direct and specific.`}],
      sysPrompt,(t)=>{acc+=t;setStreamText(acc);},(()=>{
        const ann={id:`a_${Date.now()}`,text:sel,type:"reflection",content:reflTxt,aiCheck:acc,createdAt:new Date().toISOString()};
        persist([...anns,ann]);setSBusy(false);
      }),600
    );
  };

  const saveAsk=()=>{
    const ann={id:`a_${Date.now()}`,text:sel,type:"question",content:`Q: ${askQ||"explanation"}\nA: ${streamText}`,createdAt:new Date().toISOString()};
    persist([...anns,ann]);setSel("");setStreamText("");setAskQ("");
  };

  const saveHighlight=()=>{if(!sel)return;persist([...anns,{id:`a_${Date.now()}`,text:sel,type:"highlight",content:"",color:highlightColor,createdAt:new Date().toISOString()}]);setSel("");};
  const saveNote=()=>{if(!sel||!reflTxt.trim())return;persist([...anns,{id:`a_${Date.now()}`,text:sel,type:"note",content:reflTxt.trim(),createdAt:new Date().toISOString()}]);setSel("");setReflTxt("");};
  const saveVocabulary=()=>{if(!sel)return;const item={id:`v_${Date.now()}`,term:sel.trim(),definition:vocabDef.trim(),createdAt:new Date().toISOString()};onUpdate(doc.id,{vocabulary:[...(doc.vocabulary||[]),item]});setVocabDef("");setSel("");setPanel("vocab");};
  const removeVocab=id=>onUpdate(doc.id,{vocabulary:(doc.vocabulary||[]).filter(v=>v.id!==id)});
  const removeAnn=id=>persist(anns.filter(a=>a.id!==id));
  const openOriginal=async()=>{const blob=await fileStore.get(doc.id);if(!blob)return;window.open(URL.createObjectURL(blob),"_blank","noopener,noreferrer");};
  const shareStudyPack=()=>{const esc=s=>String(s||"").replace(/[&<>]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[c]));const html=`<!doctype html><meta charset="utf-8"><title>${esc(doc.name)} - Mycel study pack</title><style>body{max-width:760px;margin:48px auto;padding:0 24px;font:16px/1.7 system-ui;color:#29231b;background:#f5f0e7}h1,h2{font-family:Georgia,serif}section{background:#fff;padding:20px;margin:16px 0;border:1px solid #ddd2c1}blockquote{color:#6d6254;border-left:3px solid #b58a33;padding-left:12px}</style><h1>${esc(doc.name)}</h1><p>Shared from Mycel as a read-only study pack.</p><section><h2>Highlights and notes</h2>${anns.map(a=>`<article><b>${esc(a.type)}</b><blockquote>${esc(a.text)}</blockquote>${a.content?`<p>${esc(a.content)}</p>`:""}</article>`).join("")||"<p>No saved annotations.</p>"}</section><section><h2>Vocabulary</h2>${(doc.vocabulary||[]).map(v=>`<p><b>${esc(v.term)}</b><br>${esc(v.definition)}</p>`).join("")||"<p>No saved vocabulary.</p>"}</section><section><h2>Reflections</h2>${(doc.sessions||[]).map(s=>`<p>${esc(s.text)}</p>`).join("")||"<p>No saved reflections.</p>"}</section>`;const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([html],{type:"text/html"}));a.download=`${doc.name.replace(/\.[^.]+$/,"")}-mycel-study-pack.html`;a.click();URL.revokeObjectURL(a.href);};
  const runQuickRead=async()=>{setQuickBusy(true);try{const result=await callAI([{role:"user",content:`Reading intention: ${intention||"Understand the document efficiently"}\n\nDocument:\n${(doc.text||"").slice(0,18000)}\n\nReturn concise JSON only: {"overview":"3-5 sentence overview","focus":[{"section":"chapter, page marker, or topic","reason":"why it serves the intention"}],"questions":["three questions to carry into the reading"]}`}],sysPrompt,900);const parsed=JSON.parse(result.replace(/```json?|```/g,"").trim());onUpdate(doc.id,{readingIntention:intention,quickRead:parsed});}catch{onUpdate(doc.id,{readingIntention:intention,quickRead:{overview:"QuickRead needs the AI connection. Your intention has been saved.",focus:[],questions:[]}});}setQuickBusy(false);};
  const summarizePanel=async(kind)=>{setSummaryBusy(true);const source=kind==="notes"?anns:(doc.sessions||[]);try{const text=source.map(x=>`${x.type||"reflection"}: ${x.text||""} ${x.content||""}`).join("\n");const result=await callAI([{role:"user",content:`Summarize this learner's ${kind} from one document. Identify what they understand, recurring questions, and the most useful next step. Do not replace their words; synthesize them.\n\n${text.slice(0,10000)}`}],sysPrompt,650);onUpdate(doc.id,{[kind==="notes"?"notesSummary":"reflectionSummary"]:result});}catch{onUpdate(doc.id,{[kind==="notes"?"notesSummary":"reflectionSummary"]:"Connect AI to generate this synthesis."});}setSummaryBusy(false);};

  if(open)return <div className="reader-overlay">
    <header className="reader-header">
      <div style={{display:"flex",alignItems:"center",gap:12,minWidth:0}}>
        <button className="icon-button" onClick={requestClose} aria-label="Close reader" title="Close reader">←</button>
        <div style={{minWidth:0}}><div className="reader-title">{doc.name}</div><div className="reader-meta">{doc.pageCount?`${doc.pageCount} pages · `:""}{anns.length} saved items</div></div>
      </div>
      <div style={{display:"flex",gap:8}}><button className="quiet-button" onClick={shareStudyPack}>Share study pack</button>{doc.hasOriginal&&<button className="quiet-button" onClick={openOriginal}>Original file ↗</button>}<button className="primary-button" onClick={requestClose}>Finish reading</button></div>
    </header>
    <div className="reader-layout">
      <main className="reader-document" onMouseUp={handleUp}>
        <article className="reader-paper">
          <div className="reader-kicker">{doc.kind==="pdf"?"PDF STUDY VIEW":"READING"}</div>
          <h1>{doc.name.replace(/\.[^.]+$/,"")}</h1>
          <div className="reader-rule"/>
          <div className="reader-text">{doc.text?highlightedReading(doc.text,anns):"No selectable text was found. Open the original file to view scanned pages."}</div>
        </article>
        {sel&&<div className="selection-dock">
          <div className="selection-preview">“{sel.slice(0,150)}{sel.length>150?"…":""}”</div>
          <div className="selection-tabs">{[["highlight","Highlight"],["vocab","Vocabulary"],["note","Add note"],["ask","Ask Mycel"],["reflect","Check understanding"]].map(([id,label])=><button key={id} className={mode===id?"active":""} onClick={()=>{setMode(id);setStreamText("");}}>{label}</button>)}<button onClick={()=>setSel("")} aria-label="Dismiss selection">×</button></div>
          {mode==="highlight"&&<div><div className="highlight-choices">{Object.entries(HIGHLIGHT_TYPES).map(([id,item])=><button key={id} className={`highlight-choice ${id} ${highlightColor===id?"selected":""}`} onClick={()=>setHighlightColor(id)}><span/>{item.label}<small>{item.hint}</small></button>)}</div><button className="primary-button" onClick={saveHighlight}>Save {HIGHLIGHT_TYPES[highlightColor].label.toLowerCase()} highlight</button></div>}
          {mode==="vocab"&&<div className="selection-compose"><textarea value={vocabDef} onChange={e=>setVocabDef(e.target.value)} placeholder="Definition in your own words (you can refine it later)" rows={2}/><button className="primary-button" onClick={saveVocabulary}>Add to vocabulary</button></div>}
          {mode==="note"&&<div className="selection-compose"><textarea value={reflTxt} onChange={e=>setReflTxt(e.target.value)} placeholder="What should future-you remember here?" rows={3}/><button className="primary-button" onClick={saveNote} disabled={!reflTxt.trim()}>Save note</button></div>}
          {mode==="ask"&&<div className="selection-compose"><input value={askQ} onChange={e=>setAskQ(e.target.value)} placeholder="Ask about the mechanism, significance, or connection…" onKeyDown={e=>e.key==="Enter"&&ask()}/><button className="primary-button" onClick={ask} disabled={sBusy}>{sBusy?"Thinking…":"Ask"}</button></div>}
          {mode==="reflect"&&<div className="selection-compose"><textarea value={reflTxt} onChange={e=>setReflTxt(e.target.value)} placeholder="Explain this passage in your own words first…" rows={3}/><button className="primary-button" onClick={saveRefl} disabled={sBusy||!reflTxt.trim()}>{sBusy?"Checking…":"Validate reflection"}</button></div>}
          {streamText&&<div className="reader-ai"><b>Mycel</b><div>{streamText}</div>{!sBusy&&mode==="ask"&&<button className="quiet-button" onClick={saveAsk}>Save answer</button>}</div>}
        </div>}
      </main>
      <aside className="reader-sidebar">
        <div className="reader-side-tabs"><button className={panel==="quick"?"active":""} onClick={()=>setPanel("quick")}>QuickRead</button><button className={panel==="notes"?"active":""} onClick={()=>setPanel("notes")}>Notes</button><button className={panel==="sessions"?"active":""} onClick={()=>setPanel("sessions")}>Reflections</button><button className={panel==="vocab"?"active":""} onClick={()=>setPanel("vocab")}>Vocabulary</button></div>
        {panel==="quick"?<div className="reader-side-scroll"><div className="side-section-title">Read with an intention</div><p className="side-help">Tell Mycel what you need from this source. QuickRead will point you toward the most relevant sections instead of replacing the reading.</p><textarea className="side-textarea" value={intention} onChange={e=>setIntention(e.target.value)} placeholder="I need to compare nutrient uptake mechanisms for my assignment…" rows={4}/><button className="primary-button full" onClick={runQuickRead} disabled={quickBusy||!doc.text}>{quickBusy?"Reading the document…":"Create QuickRead"}</button>{doc.quickRead&&<div className="quickread-result"><h3>Overview</h3><p>{doc.quickRead.overview}</p>{doc.quickRead.focus?.length>0&&<><h3>Focus here</h3>{doc.quickRead.focus.map((f,i)=><div className="focus-item" key={i}><b>{f.section}</b><span>{f.reason}</span></div>)}</>}{doc.quickRead.questions?.length>0&&<><h3>Carry these questions</h3><ol>{doc.quickRead.questions.map((q,i)=><li key={i}>{q}</li>)}</ol></>}</div>}</div>:
        panel==="notes"?<div className="reader-side-scroll">
          {anns.length>0&&<button className="summary-button" onClick={()=>summarizePanel("notes")} disabled={summaryBusy}>{summaryBusy?"Synthesizing…":"Summarize my notes"}</button>}{doc.notesSummary&&<div className="panel-summary"><b>What your notes show</b>{doc.notesSummary}</div>}
          {!anns.length&&<div className="reader-empty"><b>Your thinking lives here.</b><span>Select a passage to highlight it, attach a note, or ask Mycel.</span></div>}
          {anns.map(a=><div className={`annotation-card ${a.type}`} key={a.id}><div className="annotation-top"><span>{a.type}</span><button onClick={()=>removeAnn(a.id)} aria-label="Delete annotation">×</button></div><blockquote>{a.text}</blockquote>{a.content&&<p>{a.content}</p>}{a.aiCheck&&<div className="annotation-check"><b>Mycel check</b>{a.aiCheck}</div>}</div>)}
        </div>:panel==="sessions"?<div className="reader-side-scroll">
          {(doc.sessions||[]).length>0&&<button className="summary-button" onClick={()=>summarizePanel("reflections")} disabled={summaryBusy}>{summaryBusy?"Synthesizing…":"Summarize my reflections"}</button>}{doc.reflectionSummary&&<div className="panel-summary"><b>How your understanding is changing</b>{doc.reflectionSummary}</div>}
          {!(doc.sessions||[]).length&&<div className="reader-empty"><b>No reflections yet.</b><span>Finish a reading session to record what changed in your understanding.</span></div>}
          {[...(doc.sessions||[])].reverse().map(s=><div className="session-card" key={s.id}><time>{new Date(s.createdAt).toLocaleDateString()} · {s.minutes} min</time><p>{s.text}</p></div>)}
        </div>:<div className="reader-side-scroll"><div className="side-section-title">Vocabulary bank</div><p className="side-help">Save unfamiliar terms from the reading, define them in your own words, then test recall without leaving the source.</p>{!(doc.vocabulary||[]).length?<div className="reader-empty"><b>No terms yet.</b><span>Select a word or concept in the document and choose Vocabulary.</span></div>:<><button className="flashcard" onClick={()=>setFlashFlipped(v=>!v)}><small>{flashIndex+1} / {doc.vocabulary.length}</small><strong>{flashFlipped?(doc.vocabulary[flashIndex]?.definition||"Add a definition to complete this card."):doc.vocabulary[flashIndex]?.term}</strong><span>{flashFlipped?"Definition":"Tap to reveal"}</span></button><div className="flash-nav"><button onClick={()=>{setFlashIndex(i=>(i-1+doc.vocabulary.length)%doc.vocabulary.length);setFlashFlipped(false);}}>Previous</button><button onClick={()=>{setFlashIndex(i=>(i+1)%doc.vocabulary.length);setFlashFlipped(false);}}>Next</button></div>{doc.vocabulary.map(v=><div className="vocab-item" key={v.id}><div><b>{v.term}</b><p>{v.definition||"Definition not added yet"}</p></div><button onClick={()=>removeVocab(v.id)}>×</button></div>)}</>}</div>}
      </aside>
    </div>
    {closing&&<div className="reflection-backdrop"><div className="reflection-dialog"><div className="reader-kicker">SESSION REFLECTION</div><h2>What changed in your understanding?</h2><p>One sentence is enough. The aim is to notice what became clearer, what remains unresolved, or what connected elsewhere.</p><textarea autoFocus value={sessionRefl} onChange={e=>setSessionRefl(e.target.value)} rows={5} placeholder="I understand now that… / I’m still unsure why… / This connects to…"/><div className="dialog-actions"><button className="quiet-button" onClick={finishClose}>Skip for now</button><button className="primary-button" onClick={finishClose} disabled={!sessionRefl.trim()}>Save reflection</button></div></div></div>}
  </div>;

  return(
    <div className="library-document">
      <div className="library-document-main" onClick={begin}>
        <div className="document-mark">{doc.kind==="pdf"?"PDF":doc.kind==="doc"?"DOC":doc.kind==="slides"?"PPT":"TXT"}</div>
        <div style={{flex:1,minWidth:0}}>
          <div className="document-name">{doc.name}</div>
          <div className="document-stats">{doc.pageCount?`${doc.pageCount} pages · `:""}{anns.length} annotation{anns.length!==1?"s":""} · {(doc.sessions||[]).length} reflection{(doc.sessions||[]).length!==1?"s":""}</div>
        </div>
        <button className="open-document">Open reader →</button>
      </div>
      <button className="document-delete" onClick={()=>onDelete(doc.id)} aria-label={`Delete ${doc.name}`} title="Delete document">×</button>
    </div>
  );
}

// â”€â”€ NOTE TEMPLATES â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NoteTemplates({T,onUse}){
  const[sel,setSel]=useState(null);
  const[filled,setFilled]=useState("");
  const[custom,setCustom]=useState([]);
  const[creating,setCreating]=useState(false);
  const[newTpl,setNewTpl]=useState({name:"",desc:"",s:""});
  const[msg,setMsg]=useState("");

  // Keep filled state independent from sel so it doesn't reset
  const handleSelect=(tpl)=>{setSel(tpl);setFilled(tpl.s);};

  const saveCustom=()=>{
    if(!newTpl.name||!newTpl.s)return;
    setCustom(p=>[...p,{id:`cx_${Date.now()}`,...newTpl}]);
    setCreating(false);setNewTpl({name:"",desc:"",s:""});
  };

  const all=[...NOTE_TPLS,...custom];

  if(creating)return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={()=>setCreating(false)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer"}}>Back</button>
        <div style={{fontSize:16,fontWeight:700,color:T.ink}}>Create template</div>
      </div>
      {[{f:"name",l:"Name",ph:"Template name"},{f:"desc",l:"Description",ph:"What is this template for?"}].map(({f,l,ph})=>(
        <div key={f} style={{marginBottom:11}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:5}}>{l.toUpperCase()}</div>
          <input value={newTpl[f]||""} onChange={e=>setNewTpl(p=>({...p,[f]:e.target.value}))} placeholder={ph} style={{width:"100%",padding:"9px 13px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}/>
        </div>
      ))}
      <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>STRUCTURE (use LABEL: format for fields)</div>
      <textarea value={newTpl.s} onChange={e=>setNewTpl(p=>({...p,s:e.target.value}))} placeholder={"CONCEPT:\nMECHANISM:\nEXAMPLE:\nPRACTICE QUESTION:"} rows={7} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:14,padding:"12px 14px",outline:"none",resize:"vertical",lineHeight:1.8,boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={saveCustom} disabled={!newTpl.name||!newTpl.s} style={{background:newTpl.name&&newTpl.s?T.am:T.raised,border:"none",borderRadius:10,padding:"10px 20px",color:newTpl.name&&newTpl.s?"#FFF":T.faint,fontSize:13,fontWeight:600,cursor:newTpl.name&&newTpl.s?"pointer":"not-allowed"}}>Save template</button>
        <button onClick={()=>setCreating(false)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:T.muted,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>
  );

  if(sel)return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:14}}>
        <button onClick={()=>{setSel(null);setFilled("");setMsg("");}} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer"}}>Back</button>
        <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{sel.name}</div>
      </div>
      <textarea value={filled} onChange={e=>setFilled(e.target.value)} rows={12} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11,color:T.ink,fontSize:14,padding:"13px 15px",outline:"none",resize:"vertical",lineHeight:1.9,boxSizing:"border-box",marginBottom:12}}/>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <button onClick={()=>{onUse({title:sel.name,text:filled,template:sel.id});setSel(null);setFilled("");}} style={{background:T.am,border:"none",borderRadius:10,padding:"10px 20px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>Save to Notes</button>
        <button onClick={()=>{const code=`mycel-tpl-${sel.id}-${Date.now()}`;navigator.clipboard.writeText(`Mycel template: ${sel.name} | code: ${code}`);setMsg("Link copied!");setTimeout(()=>setMsg(""),2000);}} style={{background:T.puBg,border:`1px solid ${T.puBd}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:T.pu,cursor:"pointer"}}>{msg||"Share template"}</button>
        <button onClick={()=>{setSel(null);setFilled("");}} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:T.muted,cursor:"pointer"}}>Discard</button>
      </div>
    </div>
  );

  return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
        <div style={{fontSize:15,fontWeight:700,color:T.ink}}>Note templates</div>
        <button onClick={()=>setCreating(true)} style={{background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:8,padding:"6px 14px",fontSize:12,fontWeight:600,color:T.am,cursor:"pointer"}}>+ Create</button>
      </div>
      <div style={{fontSize:13,color:T.muted,marginBottom:16}}>Structured frameworks for different study goals: fill in, save to notes, or share with classmates.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {all.map(tpl=>(<div key={tpl.id} onClick={()=>handleSelect(tpl)} style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11,cursor:"pointer",transition:"all 0.1s"}} onMouseEnter={e=>e.currentTarget.style.borderColor=T.amBd} onMouseLeave={e=>e.currentTarget.style.borderColor=T.bd}>
          <div style={{fontSize:13.5,fontWeight:600,color:T.ink,marginBottom:4}}>{tpl.name}</div>
          <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>{tpl.desc}</div>
          {tpl.id?.startsWith("cx_")&&<div style={{marginTop:6,fontFamily:F.mono,fontSize:8,color:T.am}}>custom</div>}
        </div>))}
      </div>
    </div>
  );
}

// â”€â”€ EXAM BUILDER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ExamBuilder({notes,T,sysPrompt}){
  const[cfg,setCfg]=useState({numQ:10,types:["short-answer","mechanism","application"],scoring:"equal",passmark:60,title:"My exam"});
  const[exam,setExam]=useState(null);const[busy,setBusy]=useState(false);
  const[answers,setAnswers]=useState({});const[results,setResults]=useState(null);const[rbBusy,setRbBusy]=useState(false);const[copied,setCopied]=useState(false);
  const TYPES=[{id:"short-answer",l:"Short answer"},{id:"mechanism",l:"Explain mechanism"},{id:"application",l:"Apply to scenario"},{id:"comparison",l:"Compare concepts"},{id:"mcq",l:"Multiple choice"}];
  const SCORING=[{id:"equal",l:"Equal weight"},{id:"tier",l:"Tiered (harder = more marks)"},{id:"pass-fail",l:"Pass/Fail only"}];
  const toggleT=t=>setCfg(c=>({...c,types:c.types.includes(t)?c.types.filter(x=>x!==t):[...c.types,t]}));

  const generate=async()=>{
    if(!notes.length)return;setBusy(true);setExam(null);setAnswers({});setResults(null);
    try{
      const txt=notes.slice(-8).map(n=>n.text).join("\n---\n");
      const r=await callAI([{role:"user",content:`Generate ${cfg.numQ} exam questions from these notes. Types: ${cfg.types.join(", ")}. Scoring: ${cfg.scoring}. Title: "${cfg.title}". Respond ONLY with valid JSON, no markdown:\n{"title":"...","questions":[{"id":1,"type":"...","question":"...","marks":1,"modelAnswer":"..."}],"totalMarks":${cfg.numQ},"passMark":${cfg.passmark}}\n\n${txt}`}],sysPrompt,1200);
      setExam(JSON.parse(r.replace(/```json|```/g,"").trim()));
    }catch(e){console.error(e);}finally{setBusy(false);}
  };

  const submit=async()=>{
    if(!exam)return;setRbBusy(true);
    try{
      const ans=exam.questions.map(q=>`Q${q.id}: ${q.question}\nStudent: ${answers[q.id]||"(blank)"}\nModel: ${q.modelAnswer}`).join("\n\n");
      const r=await callAI([{role:"user",content:`Evaluate. JSON only: {"scores":[{"id":1,"marks":1,"feedback":"..."}],"total":0,"percentage":0,"grade":"...","summary":"..."}\n\n${ans}`}],sysPrompt,900);
      setResults(JSON.parse(r.replace(/```json|```/g,"").trim()));
    }catch(e){console.error(e);}finally{setRbBusy(false);}
  };

  if(exam)return(
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div><div style={{fontSize:18,fontWeight:700,color:T.ink}}>{exam.title}</div><div style={{fontFamily:F.mono,fontSize:10,color:T.muted,marginTop:2}}>{exam.questions?.length} Q . {exam.totalMarks} marks . Pass: {exam.passMark}%</div></div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{navigator.clipboard.writeText(`Mycel exam: ${exam.title} -- code: exam-${Date.now()}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:T.puBg,border:`1px solid ${T.puBd}`,borderRadius:8,padding:"6px 14px",fontSize:12,color:T.pu,cursor:"pointer"}}>{copied?"Copied":"Share link"}</button>
          <button onClick={()=>{setExam(null);setResults(null);setAnswers({});}} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"6px 14px",fontSize:12,color:T.muted,cursor:"pointer"}}>New exam</button>
        </div>
      </div>
      {exam.questions?.map(q=>(<div key={q.id} style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:10}}>
        <div style={{display:"flex",gap:10,marginBottom:8}}>
          <span style={{fontFamily:F.mono,fontSize:10,color:T.am,width:24}}>Q{q.id}</span>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:8,marginBottom:5,flexWrap:"wrap"}}><span style={{fontFamily:F.mono,fontSize:9,padding:"1px 7px",background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:20,color:T.am}}>{q.type}</span><span style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>{q.marks} mark{q.marks!==1?"s":""}</span></div>
            <div style={{fontSize:14,color:T.ink,fontWeight:500,lineHeight:1.65}}>{q.question}</div>
          </div>
        </div>
        {!results?(<textarea value={answers[q.id]||""} onChange={e=>setAnswers(a=>({...a,[q.id]:e.target.value}))} placeholder="Your answer..." rows={3} style={{width:"100%",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.ink,fontSize:13.5,padding:"9px 12px",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box"}}/>):(()=>{const sc=results.scores?.find(s=>s.id===q.id);return(<div><div style={{padding:"8px 12px",background:T.raised,borderRadius:8,marginBottom:6,fontSize:13,color:T.body}}>{answers[q.id]||"(blank)"}</div>{sc&&<div style={{padding:"8px 12px",background:sc.marks>=q.marks?T.sgBg:T.ruBg,border:`1px solid ${sc.marks>=q.marks?T.sgBd:T.ruBd}`,borderRadius:8}}><div style={{fontFamily:F.mono,fontSize:9,color:sc.marks>=q.marks?T.sg:T.ru,marginBottom:4}}>{sc.marks}/{q.marks} marks</div><div style={{fontSize:12.5,color:T.body,lineHeight:1.6}}>{sc.feedback}</div></div>}</div>);})()}
      </div>))}
      {!results?(<button onClick={submit} disabled={rbBusy} style={{width:"100%",padding:"12px",background:T.am,border:"none",borderRadius:11,color:"#FFF",fontSize:14,fontWeight:700,cursor:"pointer",marginTop:4}}>{rbBusy?"Marking...":"Submit for marking ->"}</button>):(
        <div style={{padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:13,marginTop:4}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.am,marginBottom:8}}>RESULTS</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            {[{l:"Score",v:`${results.total}/${exam.totalMarks}`},{l:"Percentage",v:`${results.percentage}%`},{l:"Grade",v:results.grade}].map(s=>(<div key={s.l} style={{textAlign:"center",padding:"10px",background:T.raised,borderRadius:9}}><div style={{fontSize:20,fontWeight:700,color:T.am}}>{s.v}</div><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>{s.l}</div></div>))}
          </div>
          <div style={{fontSize:13.5,color:T.body,lineHeight:1.75}}>{results.summary}</div>
        </div>
      )}
    </div>
  );

  return(<div>
    <div style={{fontSize:15,fontWeight:700,color:T.ink,marginBottom:4}}>Exam paper builder</div>
    <div style={{fontSize:13,color:T.muted,marginBottom:16,lineHeight:1.6}}>Generate an exam from your notes: set question types, scoring, and share the link with classmates.</div>
    {!notes.length&&<div style={{padding:"14px",background:T.raised,borderRadius:10,textAlign:"center",fontSize:13,color:T.muted,marginBottom:14}}>Save notes in Learn first. Exam questions are generated from your notes.</div>}
    <div style={{marginBottom:12}}><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:6}}>EXAM TITLE</div><input value={cfg.title} onChange={e=>setCfg(c=>({...c,title:e.target.value}))} style={{width:"100%",padding:"9px 13px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}/></div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
      <div><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>NUMBER OF QUESTIONS</div><div style={{display:"flex",gap:5}}>{[5,10,15,20].map(n=>(<button key={n} onClick={()=>setCfg(c=>({...c,numQ:n}))} style={{flex:1,padding:"8px",background:cfg.numQ===n?T.amBg:T.card,border:`1px solid ${cfg.numQ===n?T.amBd:T.bd}`,borderRadius:8,fontSize:13,fontWeight:600,color:cfg.numQ===n?T.am:T.body,cursor:"pointer"}}>{n}</button>))}</div></div>
      <div><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>PASS MARK %</div><input type="number" min={0} max={100} value={cfg.passmark} onChange={e=>setCfg(c=>({...c,passmark:+e.target.value}))} style={{width:"100%",padding:"9px 13px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:14,outline:"none",boxSizing:"border-box"}}/></div>
    </div>
    <div style={{marginBottom:12}}><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>QUESTION TYPES</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{TYPES.map(t=>(<button key={t.id} onClick={()=>toggleT(t.id)} style={{padding:"6px 12px",background:cfg.types.includes(t.id)?T.amBg:T.card,border:`1px solid ${cfg.types.includes(t.id)?T.amBd:T.bd}`,borderRadius:20,fontSize:12,color:cfg.types.includes(t.id)?T.am:T.body,cursor:"pointer",fontWeight:cfg.types.includes(t.id)?600:400}}>{cfg.types.includes(t.id)?"Selected / ":""}{t.l}</button>))}</div></div>
    <div style={{marginBottom:18}}><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>SCORING</div>{SCORING.map(s=>(<div key={s.id} onClick={()=>setCfg(c=>({...c,scoring:s.id}))} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:cfg.scoring===s.id?T.amBg:T.card,border:`1px solid ${cfg.scoring===s.id?T.amBd:T.bd}`,borderRadius:9,marginBottom:6,cursor:"pointer"}}><div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${cfg.scoring===s.id?T.am:T.bd}`,background:cfg.scoring===s.id?T.am:"transparent",flexShrink:0}}/><span style={{fontSize:13,color:T.body}}>{s.l}</span></div>))}</div>
    <button onClick={generate} disabled={busy||!notes.length} style={{width:"100%",padding:"12px",background:notes.length&&!busy?T.am:T.raised,border:"none",borderRadius:11,color:notes.length&&!busy?"#FFF":T.faint,fontSize:15,fontWeight:700,cursor:notes.length&&!busy?"pointer":"not-allowed"}}>{busy?"Generating exam...":"Generate exam ->"}</button>
  </div>);
}

// â”€â”€ QUICK QUIZ â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QuickQuiz({notes,T,sysPrompt}){
  const[q,setQ]=useState(null);const[ans,setAns]=useState("");const[fb,setFb]=useState(null);const[busy,setBusy]=useState(false);const[streamFb,setStreamFb]=useState("");
  const gen=async()=>{if(!notes.length)return;setBusy(true);setFb(null);setAns("");try{const txt=notes.slice(-5).map(n=>n.text).join("\n---\n");const r=await callAI([{role:"user",content:`Write ONE Adelaide-style exam question testing mechanism or application (not recall). Just the question.\n\n${txt}`}],sysPrompt,300);setQ({text:r});}catch{}finally{setBusy(false);}};
  const sub=async()=>{
    if(!ans.trim()||!q)return;setBusy(true);setStreamFb("");
    let acc="";
    await streamAI([{role:"user",content:`Q: ${q.text}\nAnswer: ${ans}\n\nFeedback: what's correct, what's missing, what's the precise answer. Be direct.`}],sysPrompt,(t)=>{acc+=t;setStreamFb(acc);},(()=>{setFb(acc);setBusy(false);}),600);
  };
  if(!q)return(<div style={{padding:"40px 0",textAlign:"center"}}><div style={{fontSize:14,color:T.muted,lineHeight:1.7,marginBottom:20}}>{!notes.length?"Save notes in Learn to generate quiz questions.":"Test yourself with an Adelaide-style exam question from your notes."}</div><button onClick={gen} disabled={!notes.length||busy} style={{background:notes.length?T.am:T.raised,border:"none",borderRadius:11,padding:"12px 26px",fontSize:14,fontWeight:600,color:notes.length?"#FFF":T.faint,cursor:notes.length?"pointer":"not-allowed"}}>{busy?"Generating...":"Generate question ->"}</button></div>);
  return(<div>
    <div style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:14}}><div style={{fontFamily:F.mono,fontSize:9,color:T.am,marginBottom:8}}>QUESTION</div><div style={{fontSize:15,color:T.ink,fontWeight:500,lineHeight:1.75}}>{q.text}</div></div>
    {!fb?(<><textarea value={ans} onChange={e=>setAns(e.target.value)} placeholder="Your answer..." rows={4} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11,color:T.ink,fontSize:14,padding:"12px 14px",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box",marginBottom:10}}/>
    <div style={{display:"flex",gap:8}}>
      <button onClick={sub} disabled={!ans.trim()||busy} style={{background:ans.trim()?T.am:T.raised,border:"none",borderRadius:10,padding:"10px 22px",fontSize:14,fontWeight:600,color:ans.trim()?"#FFF":T.faint,cursor:ans.trim()?"pointer":"not-allowed"}}>{busy?"Marking...":"Submit ->"}</button>
      <button onClick={gen} disabled={busy} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:10,padding:"10px 16px",fontSize:13,color:T.muted,cursor:"pointer"}}>New question</button>
    </div></>):(<>
    <div style={{padding:"12px 14px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:10,marginBottom:12}}><div style={{fontFamily:F.mono,fontSize:9,color:T.oc,marginBottom:5}}>Your answer</div><div style={{fontSize:13,color:T.body,lineHeight:1.7}}>{ans}</div></div>
    <div style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:14}}>
      <div style={{fontFamily:F.mono,fontSize:9,color:T.sg,marginBottom:7}}>Feedback</div>
      <div style={{fontSize:14,color:T.ink,lineHeight:1.85,whiteSpace:"pre-wrap"}}>{streamFb}{busy&&<span style={{display:"inline-block",width:2,height:16,background:T.sg,marginLeft:2,animation:"blink 0.8s step-end infinite",verticalAlign:"text-bottom"}}/>}</div>
    </div>
    <button onClick={()=>{setQ(null);setFb(null);setAns("");setStreamFb("");gen();}} style={{background:T.am,border:"none",borderRadius:10,padding:"10px 22px",fontSize:14,fontWeight:600,color:"#FFF",cursor:"pointer"}}>Next question</button>
    </>)}
  </div>);
}

// â”€â”€ CHAT MESSAGE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ChatMessage({m,T,setHl,genNote,onAddToNotes}){
  const isAI=m.role==="assistant";const[hov,setHov]=useState(false);
  const[added,setAdded]=useState(false);
  const crossUnitSf=m.crossUnit&&!m.streaming?"'Fraunces', Georgia, serif":"inherit";
  return(<div style={{marginBottom:m.branch?12:24,paddingLeft:isAI?0:"14%",position:"relative"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
    {m.branch&&<div style={{position:"absolute",left:3,top:-12,bottom:0,width:2,background:T.thr,borderRadius:1}}/>}
    {isAI&&<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
      <img src={T===D?"/mycel-logo-light.png?v=official-1":"/mycel-logo-dark.png?v=official-1"} alt="" style={{height:15,width:"auto",objectFit:"contain"}} onError={(e)=>{e.target.style.display="none";e.target.nextSibling.style.display="inline-block";}}/>
      <span style={{display:"none"}}><MycelIcon size={15} color={T.am}/></span>
      <span style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>Mycel</span>
      {m.crossUnit&&<span style={{fontFamily:"'Fraunces',Georgia,serif",fontStyle:"italic",fontSize:11,padding:"1px 10px",background:(T.goldBg||T.amBg),border:`1px solid ${T.goldBd||T.amBd}`,borderRadius:20,color:(T.gold||T.am)}}>cross-unit</span>}
    </div>}
    <div onMouseUp={()=>{if(!isAI)return;const s=window.getSelection();if(!s||s.isCollapsed)return;const t=s.toString().trim();if(t.length>3)setHl(t);}}
      className={m.crossUnit&&!m.streaming?"cross-unit-flash":""}
      style={{padding:"13px 16px",background:isAI?T.card:T.amBg,border:`1px solid ${isAI?T.bd:T.amBd}`,borderRadius:isAI?"3px 13px 13px 13px":"13px 3px 13px 13px",transition:"border-color 0.3s"}}>
      {!isAI&&m.hlCtx&&<div style={{padding:"5px 10px",background:T.ocBg,borderLeft:`2px solid ${T.oc}`,borderRadius:4,marginBottom:9,fontSize:12,color:T.body,fontStyle:"italic"}}>"{m.hlCtx.slice(0,130)}{m.hlCtx.length>130?"...":""}"</div>}
      <div style={{fontSize:14.5,color:T.ink,lineHeight:1.75,whiteSpace:"pre-wrap",userSelect:isAI?"text":"none",cursor:isAI?"text":"default"}}>
        {m.content}
        {m.streaming&&<span style={{display:"inline-block",width:2,height:16,background:T.am,marginLeft:2,animation:"blink 0.8s step-end infinite",verticalAlign:"text-bottom"}}/>}
      </div>
      {isAI&&!m.streaming&&<div style={{display:"flex",gap:8,marginTop:9,paddingTop:8,borderTop:`1px solid ${T.d2}`,alignItems:"center",flexWrap:"wrap",opacity:hov?1:0.4,transition:"opacity 0.15s"}}>
        <span style={{fontFamily:F.mono,fontSize:9,color:T.faint}}>Select to Branch</span>
        <button onClick={()=>genNote(m,"","single")} style={{background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:7,padding:"4px 12px",fontSize:11.5,fontWeight:500,color:T.am,cursor:"pointer",fontFamily:F.ui}}>Note This</button>
        <button onClick={()=>genNote(m,"","session")} style={{background:`${T.nwm||"#5EB8C8"}12`,border:`1px solid ${T.nwm||"#5EB8C8"}35`,borderRadius:7,padding:"4px 12px",fontSize:11.5,fontWeight:500,color:T.nwm||"#5EB8C8",cursor:"pointer",fontFamily:F.ui}}>Note Session</button>
        {onAddToNotes&&<button onClick={()=>{onAddToNotes(m.content);setAdded(true);setTimeout(()=>setAdded(false),2000);}}
          style={{background:added?T.sgBg:T.card,border:`1px solid ${added?T.sgBd:T.bd}`,borderRadius:7,
            padding:"4px 12px",fontSize:11.5,fontWeight:500,color:added?T.sg:T.muted,cursor:"pointer",fontFamily:F.ui,transition:"all 0.2s"}}>
          {added?"Added to panel":"+ live notes"}
        </button>}
      </div>}
    </div>
    {m.savedNote&&<div style={{marginTop:8,padding:"10px 13px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10}}><div style={{fontFamily:F.mono,fontSize:8,color:T.sg,marginBottom:5}}>SAVED NOTE</div><div style={{fontSize:13,color:T.body,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.savedNote}</div></div>}
  </div>);
}

// â”€â”€ NOTE EDIT MODAL â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function NoteEdit({note,onSave,onClose,onCustom,T}){
  const[text,setText]=useState(note);const[req,setReq]=useState("");const[showC,setShowC]=useState(false);
  useEffect(()=>{if(note)setText(note);},[note]);
  return(<>
    <textarea value={text} onChange={e=>setText(e.target.value)} style={{flex:1,background:T.sf,border:"none",outline:"none",color:T.ink,fontSize:14,lineHeight:1.75,padding:"18px 20px",resize:"none",minHeight:280}}/>
    {showC&&<div style={{padding:"10px 18px",borderTop:`1px solid ${T.bd}`,display:"flex",gap:8}}>
      <input value={req} onChange={e=>setReq(e.target.value)} placeholder="e.g. add 3 practice questions, include an SA soil example..." onKeyDown={e=>{if(e.key==="Enter"){onCustom(req);setReq("");setShowC(false);}}} style={{flex:1,background:T.raised,border:`1px solid ${T.bd}`,borderRadius:8,color:T.ink,fontSize:13,padding:"8px 12px",outline:"none"}}/>
      <button onClick={()=>{onCustom(req);setReq("");setShowC(false);}} style={{background:T.oc,border:"none",borderRadius:8,padding:"8px 16px",color:"#FFF",fontSize:12,fontWeight:500,cursor:"pointer"}}>Regenerate</button>
    </div>}
    <div style={{padding:"11px 18px",borderTop:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <button onClick={()=>setShowC(v=>!v)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"7px 14px",color:T.body,fontSize:12,cursor:"pointer"}}>+ Customise</button>
      <div style={{display:"flex",gap:8}}>
        <button onClick={onClose} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"7px 16px",color:T.muted,fontSize:12,cursor:"pointer"}}>Discard</button>
        <button onClick={()=>onSave(text)} style={{background:T.am,border:"none",borderRadius:8,padding:"7px 20px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>Save</button>
      </div>
    </div>
  </>);
}

function PasteArea({T,onSave}){
  const[name,setName]=useState("");const[text,setText]=useState("");
  return(<div style={{display:"flex",flexDirection:"column",gap:8}}>
    <input value={name} onChange={e=>setName(e.target.value)} placeholder="Document title..." style={{padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.ink,fontSize:13,outline:"none"}}/>
    <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Paste lecture notes, textbook passages, or any reading material..." rows={5} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.ink,fontSize:13,padding:"10px 12px",outline:"none",resize:"vertical",lineHeight:1.7}}/>
    <button onClick={()=>{if(name&&text){onSave(name,text);setName("");setText("");}}} disabled={!name||!text} style={{background:name&&text?T.am:T.raised,border:"none",borderRadius:8,padding:"9px",color:name&&text?"#FFF":T.faint,fontSize:13,fontWeight:600,cursor:name&&text?"pointer":"not-allowed"}}>Add to library</button>
  </div>);
}

function gCSS(T){return`
*{box-sizing:border-box;margin:0;padding:0;}
html,body,#root{min-height:100%;}
body,button,input,textarea,select{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
body{
  background:${T.bg};
  color:${T.ink};
}
[style*="Fraunces"]{font-optical-sizing:auto;font-variation-settings:'SOFT' 60,'WONK' 0;}
.mycel-display{font-family:'Fraunces',Georgia,serif;font-optical-sizing:auto;font-variation-settings:'SOFT' 60,'WONK' 0;letter-spacing:-0.01em;}
::-webkit-scrollbar{width:4px;height:4px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:${T.bd};border-radius:3px;}
::selection{background:${T.amBd};}
@keyframes pulse{0%,100%{opacity:.3;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
@keyframes netPulse{0%,100%{r:4;opacity:0.6}50%{r:6;opacity:1}}
@keyframes edgeDraw{from{stroke-dashoffset:200}to{stroke-dashoffset:0}}
@keyframes crossUnit{0%{border-color:${T.gold};box-shadow:0 0 0 0 ${T.goldBg}}60%{box-shadow:0 0 0 8px transparent}100%{border-color:${T.bd}}}
@keyframes nodeGlow{0%,100%{filter:none}30%{filter:drop-shadow(0 0 4px ${T.gold})}}
@keyframes sway{0%,100%{opacity:0.5;transform:scale(1)}50%{opacity:0.8;transform:scale(1.04)}}
textarea:focus,input:focus,select:focus{border-color:${T.am}!important;box-shadow:0 0 0 3px ${T.amBg};}
button:focus-visible,a:focus-visible{outline:2px solid ${T.am};outline-offset:2px;}
button,input,textarea,select{font-family:'Inter',system-ui,sans-serif;}
button:hover{box-shadow:${T.shadowSoft};}
button:disabled:hover{box-shadow:none;}
input,textarea,select{transition:border-color .15s ease,box-shadow .15s ease,background .15s ease;}
.mycel-shell{
  background:${T.bg};
}
.mycel-header{
  background:color-mix(in srgb, ${T.sf} 92%, transparent);
  backdrop-filter:blur(18px) saturate(140%);
  box-shadow:0 1px 0 ${T.bdS},0 14px 38px -34px rgba(0,0,0,.35);
}
.mycel-sidebar{
  background:
    linear-gradient(180deg, color-mix(in srgb, ${T.sf} 96%, ${T.amBg}), ${T.sf}),
    linear-gradient(90deg, ${T.amBg}, transparent);
}
.mycel-page{animation:fadeUp .35s ease;}
.mycel-card{
  background:${T.card};
  border:1px solid ${T.bd};
  border-radius:8px;
  box-shadow:none;
}
.mycel-subnav{
  background:color-mix(in srgb, ${T.sf} 94%, transparent);
  backdrop-filter:blur(14px);
}
.mycel-hero-thread{
  background:${T.card};
}
.mycel-button-primary{
  background:linear-gradient(135deg, ${T.am}, color-mix(in srgb, ${T.am} 78%, ${T.gold}));
  color:#fff;
}
.empty-state{
  padding:44px 18px;
  border:1px dashed ${T.bd};
  border-radius:8px;
  background:${T.sf};
  color:${T.muted};
  text-align:center;
  line-height:1.7;
}
.core-mode-badge{padding:4px 7px;border:1px solid ${T.bd};border-radius:5px;background:${T.card};color:${T.muted};font:8px 'DM Mono',monospace;text-transform:uppercase;letter-spacing:.06em;white-space:nowrap}
.library-document{position:relative;display:flex;align-items:stretch;background:${T.card};border:1px solid ${T.bd};border-radius:10px;margin-bottom:10px;box-shadow:${T.shadowSoft};overflow:hidden;}
.library-document-main{display:flex;align-items:center;gap:14px;flex:1;padding:15px 18px;cursor:pointer;min-width:0;}
.document-mark{width:42px;height:50px;display:grid;place-items:center;flex:0 0 auto;background:${T.ruBg};border:1px solid ${T.ruBd};border-radius:6px;font-family:'DM Mono',monospace;font-size:10px;font-weight:600;color:${T.ru};}
.document-name{font-size:14px;font-weight:650;color:${T.ink};overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.document-stats{margin-top:5px;font:10px 'DM Mono',monospace;color:${T.muted};}
.open-document,.quiet-button,.primary-button,.icon-button{border:1px solid ${T.bd};background:${T.card};color:${T.body};border-radius:7px;padding:8px 12px;font-size:12px;font-weight:600;cursor:pointer;white-space:nowrap;}
.primary-button{background:${T.am};border-color:${T.am};color:#fff;}
.primary-button:disabled{background:${T.raised};border-color:${T.bd};color:${T.faint};cursor:not-allowed;}
.icon-button{width:36px;height:36px;padding:0;font-size:18px;}
.document-delete{width:40px;border:0;border-left:1px solid ${T.bd};background:${T.sf};color:${T.faint};cursor:pointer;font-size:17px;}
.reader-overlay{position:fixed;inset:0;z-index:1000;background:${T.bg};color:${T.ink};display:flex;flex-direction:column;font-family:'Inter',sans-serif;}
.reader-header{height:66px;flex:0 0 66px;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:0 18px;background:${T.sf};border-bottom:1px solid ${T.bd};}
.reader-title{font-size:14px;font-weight:650;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:46vw;}.reader-meta{font:9px 'DM Mono',monospace;color:${T.muted};margin-top:3px;}
.reader-layout{display:grid;grid-template-columns:minmax(0,1fr) 340px;min-height:0;flex:1;}
.reader-document{overflow:auto;padding:42px 5vw 160px;background:${T.raised};position:relative;}
.reader-paper{max-width:780px;min-height:calc(100vh - 140px);margin:auto;background:${T.card};border:1px solid ${T.bd};box-shadow:0 24px 70px -38px rgba(42,30,15,.5);padding:68px clamp(32px,7vw,84px);}
.reader-paper h1{font:500 clamp(28px,4vw,42px)/1.15 'Fraunces',Georgia,serif;color:${T.ink};margin:10px 0 22px;letter-spacing:0;}
.reader-kicker{font:9px 'DM Mono',monospace;letter-spacing:.14em;color:${T.am};}.reader-rule{height:1px;background:${T.bd};margin-bottom:32px;}
.reader-text{white-space:pre-wrap;font:16px/1.82 'Inter',sans-serif;color:${T.body};user-select:text;}
.reader-sidebar{display:flex;flex-direction:column;min-width:0;background:${T.sf};border-left:1px solid ${T.bd};}.reader-side-tabs{display:grid;grid-template-columns:1fr 1fr;padding:10px;border-bottom:1px solid ${T.bd};gap:5px;}.reader-side-tabs button,.selection-tabs button{border:0;border-radius:6px;padding:8px;background:transparent;color:${T.muted};font-size:11px;font-weight:600;cursor:pointer;}.reader-side-tabs button.active,.selection-tabs button.active{background:${T.amBg};color:${T.am};}.reader-side-scroll{overflow:auto;padding:14px;}
.reader-mark{padding:1px 2px;border-radius:2px;color:inherit}.reader-mark.gold{background:#F2D67599}.reader-mark.green{background:#98C98C88}.reader-mark.blue{background:#86BED488}.reader-mark.coral{background:#E99A8588}.highlight-choices{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:9px}.highlight-choice{display:grid;grid-template-columns:12px 1fr;gap:2px 7px;text-align:left;padding:8px;background:${T.card};border:1px solid ${T.bd};border-radius:7px;color:${T.ink};cursor:pointer;font-size:11px}.highlight-choice.selected{border-color:${T.am};box-shadow:0 0 0 2px ${T.amBg}}.highlight-choice span{width:12px;height:12px;border-radius:3px;grid-row:1/3;margin-top:1px}.highlight-choice.gold span{background:#E7C650}.highlight-choice.green span{background:#79AD70}.highlight-choice.blue span{background:#64A6C0}.highlight-choice.coral span{background:#D87F68}.highlight-choice small{grid-column:2;color:${T.muted};font-size:9px;line-height:1.35}.side-section-title{font-family:'Fraunces',Georgia,serif;font-size:21px;color:${T.ink};margin-bottom:6px}.side-help{font-size:11px;line-height:1.55;color:${T.muted};margin-bottom:12px}.side-textarea{width:100%;padding:10px;border:1px solid ${T.bd};background:${T.card};color:${T.ink};border-radius:7px;font-size:12px;line-height:1.55;resize:vertical;margin-bottom:8px}.full{width:100%}.quickread-result{margin-top:14px}.quickread-result h3{font:9px 'DM Mono',monospace;color:${T.am};text-transform:uppercase;letter-spacing:.1em;margin:14px 0 6px}.quickread-result p,.quickread-result li{font-size:12px;line-height:1.6;color:${T.body}}.quickread-result ol{padding-left:18px}.focus-item{display:flex;flex-direction:column;gap:3px;padding:9px 0;border-bottom:1px solid ${T.bdS};font-size:11px}.focus-item b{color:${T.ink}}.focus-item span{color:${T.muted};line-height:1.45}.summary-button{width:100%;padding:8px;border:1px solid ${T.sgBd};background:${T.sgBg};color:${T.sg};border-radius:7px;font-size:11px;font-weight:650;cursor:pointer;margin-bottom:9px}.panel-summary{padding:11px;background:${T.sgBg};border:1px solid ${T.sgBd};border-radius:8px;font-size:11px;line-height:1.6;white-space:pre-wrap;color:${T.body};margin-bottom:10px}.panel-summary b{display:block;color:${T.sg};margin-bottom:5px}.flashcard{width:100%;min-height:160px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;padding:18px;background:linear-gradient(145deg,${T.card},${T.amBg});border:1px solid ${T.amBd};border-radius:9px;color:${T.ink};cursor:pointer;text-align:center}.flashcard small{font:9px 'DM Mono',monospace;color:${T.muted}}.flashcard strong{font:500 21px 'Fraunces',Georgia,serif}.flashcard span{font-size:10px;color:${T.am}}.flash-nav{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin:7px 0 14px}.flash-nav button{padding:7px;border:1px solid ${T.bd};background:${T.card};color:${T.body};border-radius:6px;cursor:pointer}.vocab-item{display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-bottom:1px solid ${T.bdS}}.vocab-item b{font-size:12px;color:${T.ink}}.vocab-item p{font-size:11px;color:${T.muted};line-height:1.45;margin-top:3px}.vocab-item button{border:0;background:none;color:${T.faint};cursor:pointer}
.reader-empty{display:flex;flex-direction:column;gap:7px;padding:28px 18px;border:1px dashed ${T.bd};border-radius:8px;color:${T.muted};font-size:12px;line-height:1.6;}.reader-empty b{color:${T.ink};font-size:13px;}
.annotation-card,.session-card{padding:12px;background:${T.card};border:1px solid ${T.bd};border-radius:8px;margin-bottom:9px;}.annotation-card.highlight{border-left:3px solid ${T.gold};}.annotation-card.reflection{border-left:3px solid ${T.sg};}.annotation-top{display:flex;justify-content:space-between;font:9px 'DM Mono',monospace;text-transform:uppercase;color:${T.am};}.annotation-top button{border:0;background:none;color:${T.faint};cursor:pointer}.annotation-card blockquote{font-size:11px;line-height:1.55;color:${T.muted};font-style:italic;margin:8px 0;display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden}.annotation-card p,.session-card p{font-size:12px;line-height:1.6;color:${T.body};}.annotation-check{margin-top:8px;padding:9px;background:${T.sgBg};border-radius:6px;font-size:11px;line-height:1.55;color:${T.body};white-space:pre-wrap}.annotation-check b{display:block;color:${T.sg};margin-bottom:4px}.session-card time{font:9px 'DM Mono',monospace;color:${T.muted};display:block;margin-bottom:7px;}
.selection-dock{position:fixed;z-index:3;left:calc((100vw - 340px)/2);bottom:22px;transform:translateX(-50%);width:min(680px,calc(100vw - 390px));padding:14px;background:color-mix(in srgb,${T.sf} 96%,transparent);border:1px solid ${T.bd};border-radius:10px;box-shadow:0 25px 70px -25px rgba(0,0,0,.45);backdrop-filter:blur(18px);}.selection-preview{font-family:'Fraunces',Georgia,serif;font-size:13px;font-style:italic;color:${T.body};white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:8px;}.selection-tabs{display:flex;gap:3px;margin-bottom:8px;overflow:auto;}.selection-compose{display:flex;gap:8px;align-items:flex-end}.selection-compose input,.selection-compose textarea,.reflection-dialog textarea{flex:1;width:100%;border:1px solid ${T.bd};background:${T.card};color:${T.ink};border-radius:7px;padding:10px 12px;resize:vertical;font-size:13px;line-height:1.55;}.reader-ai{margin-top:9px;padding:11px;border:1px solid ${T.sgBd};background:${T.sgBg};border-radius:7px;font-size:12px;line-height:1.6;white-space:pre-wrap}.reader-ai b{display:block;color:${T.sg};font:9px 'DM Mono',monospace;margin-bottom:5px}.reader-ai button{margin-top:8px;}
.reflection-backdrop{position:fixed;inset:0;z-index:5;background:rgba(15,12,8,.65);display:grid;place-items:center;padding:18px;backdrop-filter:blur(8px)}.reflection-dialog{width:min(540px,100%);background:${T.card};border:1px solid ${T.bd};border-radius:12px;padding:26px;box-shadow:0 30px 100px rgba(0,0,0,.35)}.reflection-dialog h2{font:500 28px 'Fraunces',Georgia,serif;margin:9px 0;color:${T.ink}}.reflection-dialog p{font-size:13px;line-height:1.65;color:${T.muted};margin-bottom:16px}.dialog-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px;}
.project-companion-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px}.project-companion,.thought-stream{padding:16px;background:${T.card};border:1px solid ${T.bd};border-radius:9px}.project-companion.busy-window{border-color:${T.ocBd};background:linear-gradient(145deg,${T.card},${T.ocBg})}.project-companion h3{font:500 18px/1.3 'Fraunces',Georgia,serif;color:${T.ink};margin:8px 0 12px}.project-companion textarea,.thought-stream textarea{width:100%;padding:10px;border:1px solid ${T.bd};border-radius:7px;background:${T.sf};color:${T.ink};font-size:12px;line-height:1.5;resize:vertical}.project-actions{display:flex;gap:6px;margin-top:7px}.project-actions button,.thought-stream button,.project-actions select{flex:1;padding:8px;border:1px solid ${T.amBd};border-radius:7px;background:${T.amBg};color:${T.am};font-size:11px;font-weight:650;cursor:pointer}.project-actions select{background:${T.card};color:${T.body};border-color:${T.bd}}.thought-stream{margin-bottom:18px}.thought-stream button{margin:7px 0 8px}.thought-stream p{padding:9px 0;border-top:1px solid ${T.bdS};font-family:'Fraunces',Georgia,serif;font-size:14px;line-height:1.55;color:${T.body}}
.project-wizard{padding:26px;background:${T.card};border:1px solid ${T.amBd};border-radius:10px;margin-bottom:18px;box-shadow:${T.shadow}}.wizard-progress{height:3px;background:${T.raised};border-radius:2px;margin:-26px -26px 24px;overflow:hidden}.wizard-progress span{display:block;height:100%;background:${T.am};transition:width .25s}.project-wizard h2{font:500 29px/1.2 'Fraunces',Georgia,serif;color:${T.ink};margin:9px 0 7px}.project-wizard>p{font-size:13px;color:${T.muted};line-height:1.6;margin-bottom:18px}.project-type-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.project-type-grid button{padding:13px;text-align:left;background:${T.sf};border:1px solid ${T.bd};border-radius:8px;color:${T.ink};cursor:pointer}.project-type-grid button.selected{border-color:${T.am};background:${T.amBg};box-shadow:0 0 0 2px ${T.amBg}}.project-type-grid b{display:block;font-size:13px;margin-bottom:4px}.project-type-grid span{display:block;font-size:11px;line-height:1.45;color:${T.muted}}.project-wizard label{display:flex;flex-direction:column;gap:6px;font:9px 'DM Mono',monospace;color:${T.muted};margin-bottom:13px;text-transform:uppercase;letter-spacing:.08em}.project-wizard input,.project-wizard textarea,.project-wizard select{width:100%;padding:10px 12px;border:1px solid ${T.bd};border-radius:7px;background:${T.sf};color:${T.ink};font-size:13px;line-height:1.55;text-transform:none;letter-spacing:0}.wizard-fields{display:grid;grid-template-columns:1fr 1fr;gap:9px}.project-wizard .check-row{flex-direction:row;align-items:center;text-transform:none;font-family:'Inter';font-size:12px;letter-spacing:0}.project-wizard .check-row input{width:auto}.wizard-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}.wizard-actions button{padding:9px 16px;border:1px solid ${T.bd};border-radius:7px;background:${T.sf};color:${T.body};font-weight:650;cursor:pointer}.wizard-actions button.primary{background:${T.am};border-color:${T.am};color:#fff}.wizard-actions button:disabled{opacity:.45;cursor:not-allowed}.project-list-card{padding:16px;background:${T.card};border:1px solid ${T.bd};border-left:3px solid ${T.sg};border-radius:9px;cursor:pointer;box-shadow:${T.shadowSoft}}.project-card-top{display:flex;justify-content:space-between;gap:8px;font:8px 'DM Mono',monospace;text-transform:uppercase;color:${T.sg};letter-spacing:.08em}.project-card-top small{color:${T.muted}}.project-card-title{font:500 20px 'Fraunces',Georgia,serif;color:${T.ink};margin:12px 0 6px}.project-list-card p{font-size:11px;line-height:1.5;color:${T.muted};min-height:34px}.project-mini-progress,.project-progress-track{height:5px;background:${T.raised};border-radius:3px;overflow:hidden;margin:13px 0 7px}.project-mini-progress span,.project-progress-track span{display:block;height:100%;background:linear-gradient(90deg,${T.sg},${T.gold});border-radius:3px}.project-card-meta{font:8px 'DM Mono',monospace;color:${T.muted}}.project-detail-head{display:flex;align-items:center;justify-content:space-between;gap:20px}.project-detail-head p{font-size:13px;color:${T.muted};line-height:1.6;max-width:600px}.project-type-label{font:9px 'DM Mono',monospace;color:${T.sg};text-transform:uppercase;letter-spacing:.1em;margin-bottom:6px}.project-progress-ring{width:88px;height:88px;flex:0 0 88px;border:7px solid ${T.sgBd};border-top-color:${T.sg};border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center}.project-progress-ring b{font-size:18px;color:${T.sg}}.project-progress-ring span{font:7px 'DM Mono',monospace;color:${T.muted};margin-top:2px}.project-progress-track{height:7px;margin:16px 0 22px}.milestone-map,.project-ai,.project-sources,.completion-memory{padding:18px;background:${T.card};border:1px solid ${T.bd};border-radius:9px;margin-bottom:12px}.section-row,.project-ai-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.section-row h3,.project-ai-head h3,.project-sources h3,.completion-memory h3{font:500 20px 'Fraunces',Georgia,serif;color:${T.ink};margin-top:5px}.section-row>button{padding:7px 11px;background:${T.sgBg};border:1px solid ${T.sgBd};border-radius:6px;color:${T.sg};font-size:10px;cursor:pointer}.milestone-row{display:grid;grid-template-columns:30px 1fr auto;gap:10px;align-items:start;padding:13px 0;border-top:1px solid ${T.bdS}}.milestone-row:first-of-type{margin-top:12px}.milestone-row>button{width:26px;height:26px;border-radius:50%;border:1px solid ${T.bd};background:${T.sf};color:${T.muted};cursor:pointer}.milestone-row.complete>button{background:${T.sg};color:#fff;border-color:${T.sg}}.milestone-row b{font-size:13px;color:${T.ink}}.milestone-row p{font-size:11px;line-height:1.5;color:${T.muted};margin:3px 0}.milestone-row small{font-size:10px;color:${T.sg}}.milestone-row>span{font:8px 'DM Mono',monospace;color:${T.muted};text-transform:uppercase}.project-ai{border-color:${T.sgBd};background:linear-gradient(145deg,${T.card},${T.sgBg})}.project-ai-head>span{font:8px 'DM Mono',monospace;color:${T.sg}}.project-chat{max-height:340px;overflow:auto;padding:12px 0}.project-ai-empty{padding:18px;text-align:center;font-family:'Fraunces',Georgia,serif;color:${T.muted};line-height:1.6}.project-message{max-width:88%;padding:10px 12px;border-radius:8px;margin:7px 0;font-size:12px;line-height:1.6;white-space:pre-wrap}.project-message.user{margin-left:auto;background:${T.amBg};border:1px solid ${T.amBd}}.project-message.assistant{background:${T.card};border:1px solid ${T.sgBd}}.project-chat-input{display:flex;gap:7px}.project-chat-input textarea{flex:1;padding:10px 12px;border:1px solid ${T.bd};border-radius:7px;background:${T.sf};color:${T.ink};font-size:12px;resize:none}.project-chat-input button{padding:0 17px;border:0;border-radius:7px;background:${T.sg};color:#fff;font-weight:650;cursor:pointer}.project-chat-input button:disabled{opacity:.45}.project-sources>p{font-size:11px;color:${T.muted};margin-top:8px}.project-sources select{width:100%;margin-top:9px;padding:9px;border:1px solid ${T.bd};border-radius:7px;background:${T.sf};color:${T.body}}.source-row{display:flex;justify-content:space-between;padding:9px 0;border-top:1px solid ${T.bdS};font-size:11px}.source-row b{color:${T.ink}}.source-row span{font:8px 'DM Mono',monospace;color:${T.muted};text-transform:uppercase}.completion-memory{border-color:${T.goldBd};background:${T.goldBg}}.completion-memory p{font-family:'Fraunces',Georgia,serif;font-size:15px;line-height:1.65;color:${T.body};margin-top:8px}
.outcome-planner,.manual-task,.project-task-list{padding:18px;background:${T.card};border:1px solid ${T.bd};border-radius:8px;margin-bottom:12px}.planner-head h3,.manual-task h3,.project-task-list h3{font:500 21px 'Fraunces',Georgia,serif;color:${T.ink};margin:6px 0}.planner-head p{font-size:11px;line-height:1.55;color:${T.muted};max-width:620px}.planner-inputs{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:13px}.planner-inputs label{font:9px 'DM Mono',monospace;color:${T.muted}}.planner-inputs textarea,.manual-task input,.manual-task textarea,.manual-task select{width:100%;margin-top:5px;padding:9px 10px;border:1px solid ${T.bd};border-radius:6px;background:${T.sf};color:${T.ink};font-size:12px;line-height:1.5}.plan-buttons{max-width:360px}.plan-preview{margin-top:14px;border-top:1px solid ${T.bd};padding-top:13px}.preview-head{display:flex;justify-content:space-between;align-items:flex-start}.preview-head h4{font:500 18px 'Fraunces',Georgia,serif;color:${T.ink};margin-top:4px}.preview-head button{border:0;background:none;color:${T.ru};font-size:10px;cursor:pointer}.preview-task{display:grid;grid-template-columns:1fr 100px;gap:12px;padding:11px 0;border-bottom:1px solid ${T.bdS}}.preview-task b{font-size:12px;color:${T.ink}}.preview-task p{font-size:11px;color:${T.muted};line-height:1.45;margin:3px 0}.preview-task small{font-size:10px;color:${T.sg}}.preview-task>span{text-align:right;font:8px/1.6 'DM Mono',monospace;color:${T.muted}}.approve-plan,.manual-task>button{margin-top:11px;padding:9px 13px;border:0;border-radius:6px;background:${T.sg};color:#fff;font-size:11px;font-weight:650;cursor:pointer}.manual-task-fields{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}.manual-task>button:disabled{opacity:.45}.project-task-list h3{margin-bottom:10px}.project-task-row{display:grid;grid-template-columns:24px 1fr auto;gap:9px;padding:11px 0;border-top:1px solid ${T.bdS}}.project-task-row>button{width:20px;height:20px;border:1px solid ${T.bd};border-radius:4px;background:${T.sf};color:#fff;cursor:pointer}.project-task-row.done>button{background:${T.sg};border-color:${T.sg}}.project-task-row.done{opacity:.6}.project-task-row.done b{text-decoration:line-through}.project-task-row b{font-size:12px;color:${T.ink}}.project-task-row p{font-size:11px;line-height:1.45;color:${T.muted};margin-top:3px}.project-task-row small{display:block;font:8px/1.5 'DM Mono',monospace;color:${T.muted};margin-top:4px}.project-task-row em{display:block;font-size:10px;color:${T.body};margin-top:4px}.project-task-row>span{font:8px 'DM Mono',monospace;color:${T.am}}
.preview-resources{padding:11px 0}.preview-resources a,.resource-row{display:flex;flex-direction:column;gap:3px;padding:8px 0;border-bottom:1px solid ${T.bdS};text-decoration:none}.preview-resources a b,.resource-row b{font-size:11px;color:${T.oc}}.preview-resources a span,.resource-row span{font-size:10px;line-height:1.4;color:${T.muted}}
.upload-screen{padding:12px;margin-top:12px;border:1px solid ${T.bd};background:${T.sf};border-radius:6px}.upload-screen>div:first-child{display:flex;flex-direction:column;gap:3px}.upload-screen b{font-size:11px;color:${T.ink}}.upload-screen span,.upload-screen>p{font-size:9px;line-height:1.45;color:${T.muted}}.upload-button{display:inline-block!important;width:auto!important;margin:9px 0!important;padding:7px 10px;border:1px solid ${T.bd};border-radius:5px;background:${T.card};color:${T.body}!important;font:10px 'Inter',sans-serif!important;cursor:pointer}.upload-button input{display:none}.upload-row{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:8px 0;border-top:1px solid ${T.bdS}}.upload-row>div{display:flex;flex-direction:column}.upload-row strong{font-size:9px;color:${T.sg}}.upload-row.rejected strong{color:${T.ru}}.rights-check{display:flex!important;flex-direction:row!important;align-items:flex-start;gap:7px!important;font:10px/1.45 'Inter',sans-serif!important;text-transform:none!important;letter-spacing:0!important;color:${T.body}!important}.rights-check input{width:auto!important;margin-top:2px}.thread-attachments{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px;margin:14px 0}.thread-media{margin:0;border:1px solid ${T.bd};background:${T.sf}}.thread-media img,.thread-media video{width:100%;max-height:300px;display:block;object-fit:contain;background:#111}.thread-media figcaption{padding:7px;font-size:9px;color:${T.muted}}.thread-file{display:flex;flex-direction:column;gap:4px;padding:14px;border:1px solid ${T.bd};background:${T.sf};text-decoration:none}.thread-file b{font-size:11px;color:${T.ink}}.thread-file span,.attachment-loading{font-size:9px;color:${T.muted}}.screening-result{padding:7px 9px;margin:10px 0;font-size:9px;border-left:3px solid ${T.sg};background:${T.sgBg};color:${T.sg}}.screening-result.review{border-color:${T.gold};background:${T.goldBg};color:${T.gold}}
.month-calendar{padding:12px;background:${T.card};border:1px solid ${T.bd};border-radius:10px;margin-bottom:16px}.month-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}.month-head b{font-family:'Fraunces',Georgia,serif;font-size:18px;color:${T.ink}}.month-head button{width:30px;height:30px;border:1px solid ${T.bd};background:${T.sf};color:${T.body};border-radius:6px;cursor:pointer}.month-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:3px}.month-dow{text-align:center;font:8px 'DM Mono',monospace;color:${T.muted};padding:4px}.month-grid button{min-height:52px;border:1px solid ${T.bdS};background:${T.sf};border-radius:6px;color:${T.body};cursor:pointer;display:flex;flex-direction:column;justify-content:space-between;padding:6px;text-align:left}.month-grid button.selected{border-color:${T.am};background:${T.amBg};color:${T.am}}.month-grid button span{display:flex;gap:3px}.month-grid i{width:5px;height:5px;border-radius:50%;display:block}.task-dot{background:${T.am}}.deadline-dot{background:${T.ru}}
.space-tabs{display:flex;border-bottom:1px solid ${T.bd};margin-bottom:20px}.space-tabs button{padding:10px 14px;border:0;border-bottom:2px solid transparent;background:none;color:${T.muted};font-size:12px;font-weight:650;cursor:pointer}.space-tabs button.active{color:${T.am};border-bottom-color:${T.am}}.relational-shell{max-width:820px;margin:0 auto}.relational-head{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:18px}.relational-head h1,.thread-detail h1{font:500 31px/1.18 'Fraunces',Georgia,serif;color:${T.ink};margin:7px 0}.relational-head p{max-width:600px;font-size:13px;line-height:1.6;color:${T.muted}}.relational-head>button,.publish-thread{padding:9px 14px;border:0;border-radius:6px;background:${T.am};color:#fff;font-weight:650;cursor:pointer;white-space:nowrap}.relational-filters{display:flex;gap:4px;margin-bottom:14px;overflow:auto}.relational-filters button{padding:6px 10px;border:1px solid ${T.bd};border-radius:6px;background:${T.card};color:${T.muted};font-size:10px;text-transform:capitalize;cursor:pointer}.relational-filters button.active{border-color:${T.am};color:${T.am};background:${T.amBg}}.thread-list{border-top:1px solid ${T.bd}}.thread-row{padding:18px 4px;border-bottom:1px solid ${T.bd};cursor:pointer}.thread-row:hover h2{color:${T.am}}.thread-anchor{display:flex;align-items:center;gap:7px;font:9px 'DM Mono',monospace;color:${T.muted}}.thread-anchor span{padding:2px 6px;border:1px solid ${T.sgBd};border-radius:4px;color:${T.sg};text-transform:uppercase}.thread-row h2{font:500 20px/1.3 'Fraunces',Georgia,serif;color:${T.ink};margin:8px 0 5px}.thread-row>p{font-size:12px;line-height:1.55;color:${T.body};display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.thread-row-foot{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;margin-top:11px;font:9px 'DM Mono',monospace;color:${T.muted}}.thread-author{display:flex;gap:7px;align-items:center;font-size:10px}.thread-author b{color:${T.ink}}.thread-author span,.thread-author time{color:${T.muted}}.thread-compose{padding:18px;background:${T.card};border:1px solid ${T.amBd};border-radius:8px;margin-bottom:16px}.thread-compose label,.reply-compose label{display:flex;flex-direction:column;gap:5px;font:9px 'DM Mono',monospace;color:${T.muted};margin-top:10px}.thread-compose input,.thread-compose textarea,.thread-compose select,.reply-compose textarea{width:100%;padding:9px 11px;border:1px solid ${T.bd};border-radius:6px;background:${T.sf};color:${T.ink};font-size:12px;line-height:1.55}.compose-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.publish-thread{margin-top:12px}.back-link{border:0;background:none;color:${T.am};font-size:11px;cursor:pointer;margin-bottom:15px}.thread-detail{padding-bottom:20px;border-bottom:1px solid ${T.bd}}.thread-body{font-size:14px;line-height:1.75;color:${T.body};margin:18px 0}.thread-actions{display:flex;gap:6px}.thread-actions button,.reply-card button{padding:6px 9px;border:1px solid ${T.bd};border-radius:5px;background:${T.card};color:${T.muted};font-size:10px;cursor:pointer}.section-heading{font:10px 'DM Mono',monospace;color:${T.muted};text-transform:uppercase;letter-spacing:.1em;margin:18px 0 10px}.reply-card{padding:15px 0;border-bottom:1px solid ${T.bd}}.reply-card p{font-size:13px;line-height:1.65;color:${T.body};margin:9px 0}.reply-compose{margin-top:18px;padding:16px;border-left:3px solid ${T.sg};background:${T.sgBg}}.reply-compose>button{margin-top:8px;padding:8px 13px;border:0;border-radius:5px;background:${T.sg};color:#fff;font-weight:650;cursor:pointer}.reply-compose>button:disabled{opacity:.45}.relational-empty{padding:24px 0;font-family:'Fraunces',Georgia,serif;color:${T.muted};line-height:1.6}.moderation-note{margin-top:8px;padding:6px 8px;background:${T.ruBg};color:${T.ru};font-size:9px}.thread-row.reported{opacity:.65}
.mob-overlay{display:flex;}
@media(min-width:701px){.mob-overlay{display:none!important;}}
.mob-note-btn{display:none;}
@media(max-width:700px){.mob-note-btn{display:block!important;}}
.cross-unit-flash{animation:crossUnit 1.8s ease forwards;}
.net-node-pulse{animation:sway 3s ease-in-out infinite;}
@media(max-width:700px){.hide-mobile{display:none!important;}.mob-nav{display:flex!important;}}
@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
@keyframes growIn{from{opacity:0;transform:scale(0.97)}to{opacity:1;transform:scale(1)}}
button{transition:transform 0.12s ease,background 0.15s ease,border-color 0.15s ease,box-shadow 0.15s ease;}
button:active{transform:scale(0.98);}
body{transition:background 0.3s ease;}
*{scrollbar-width:thin;}
@media(max-width:700px){
  body{font-size:15px;}
  .empty-state{padding:34px 14px;}
  .open-document{display:none}.library-document-main{padding:12px}.reader-header{height:auto;min-height:62px;padding:9px 12px}.reader-header .quiet-button{display:none}.reader-title{max-width:45vw}.reader-layout{display:block;overflow:auto}.reader-document{padding:16px 12px 150px;overflow:visible}.reader-paper{padding:38px 24px;min-height:auto}.reader-text{font-size:15px;line-height:1.75}.reader-sidebar{border:0;border-top:1px solid ${T.bd};min-height:340px}.selection-dock{left:12px;right:12px;bottom:76px;width:auto;transform:none}.selection-tabs{padding-bottom:2px}.selection-compose{align-items:stretch;flex-direction:column}.reader-header .primary-button{padding:8px 10px}.reader-paper h1{font-size:30px;}
  .project-companion-grid,.project-type-grid,.wizard-fields,.compose-grid,.planner-inputs,.manual-task-fields{grid-template-columns:1fr}.highlight-choices{grid-template-columns:1fr}.project-wizard{padding:18px}.wizard-progress{margin:-18px -18px 18px}.project-detail-head{align-items:flex-start}.project-progress-ring{width:70px;height:70px;flex-basis:70px}.milestone-row{grid-template-columns:28px 1fr}.milestone-row>span{display:none}.project-chat-input{flex-direction:column}.project-chat-input button{padding:9px}.section-row{flex-direction:column}.relational-head{flex-direction:column}.relational-head h1,.thread-detail h1{font-size:27px}.thread-row-foot{align-items:flex-start;flex-direction:column}.thread-author{flex-wrap:wrap}.preview-task{grid-template-columns:1fr}.preview-task>span{text-align:left}.thread-attachments{grid-template-columns:1fr}
  html,body,#root{min-height:100%;min-height:100dvh;overflow-x:hidden}
  input,textarea,select{font-size:16px!important}
  .mycel-page{padding:18px 14px calc(92px + env(safe-area-inset-bottom))!important;max-width:100%!important}
  .mycel-header{padding-left:12px!important;padding-right:12px!important}
  .mycel-subnav{flex-wrap:nowrap!important;overflow-x:auto;padding:8px 12px!important;scrollbar-width:none}
  .mycel-subnav::-webkit-scrollbar{display:none}.mycel-subnav>button{flex:0 0 auto;min-height:38px}
  .mob-nav{padding-bottom:calc(7px + env(safe-area-inset-bottom))!important}.mob-nav button{min-height:44px}
  .reader-header{padding-top:calc(9px + env(safe-area-inset-top))}.reader-title{max-width:42vw}
  .reader-side-tabs{position:sticky;top:0;z-index:2;background:${T.sf}}
  .month-grid button{min-height:46px;padding:5px}.month-dow{font-size:7px}
  .auth-panel{padding:24px 20px}.auth-panel h1{font-size:28px}
}
@media(min-width:701px) and (max-width:1050px){.mycel-sidebar{width:190px!important}.mycel-page{max-width:760px!important;padding-left:18px!important;padding-right:18px!important}.reader-layout{grid-template-columns:minmax(0,1fr) 300px}.reader-paper{padding-left:52px;padding-right:52px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}
`;}



// â”€â”€ VOICE QUIZ COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function VoiceQuiz({T,F,notes,docs,setup,survey,SP,graph,addToGraph,quizState,setQuizState,quizSession,setQuizSession,quizReport,setQuizReport,isListening,setIsListening,transcript,setTranscript,quizSource,setQuizSource,quizMode,setQuizMode,mcqState,setMcqState,mcqSession,setMcqSession,mcqReport,setMcqReport,setTab,setLearnSub,setInput}){
  const [currentAnswer,setCurrentAnswer]=useState("");
  const [evalResult,setEvalResult]=useState(null);
  const [error,setError]=useState("");
  const recognitionRef=useRef(null);

  // â”€â”€ Speech recognition setup â”€â”€
  const startListening=()=>{
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setError("Voice not supported in this browser. Use text input below.");return;}
    const rec=new SR();
    rec.continuous=false;
    rec.interimResults=true;
    rec.lang="en-AU";
    rec.onstart=()=>setIsListening(true);
    rec.onresult=(e)=>{
      const t=Array.from(e.results).map(r=>r[0].transcript).join(" ");
      setTranscript(t);
      if(e.results[0].isFinal){setCurrentAnswer(t);setIsListening(false);}
    };
    rec.onerror=()=>setIsListening(false);
    rec.onend=()=>setIsListening(false);
    recognitionRef.current=rec;
    rec.start();
  };
  const stopListening=()=>{recognitionRef.current?.stop();setIsListening(false);};

  // â”€â”€ Source content for quiz â”€â”€
  const getSourceContent=()=>{
    if(quizSource==="notes"){
      return notes.slice(-20).map(n=>`[${n.unit||"General"}] ${n.title||""}: ${n.body||""}`).join("\n\n");
    }
    return docs.slice(-3).map(d=>`[${d.name}]\n${d.text.slice(0,3000)}`).join("\n\n---\n\n");
  };

  // â”€â”€ Generate adaptive question set â”€â”€
  const startSession=async()=>{
    setQuizState("loading");setError("");
    const content=getSourceContent();
    if(!content.trim()){setError("No notes or documents to quiz from. Add some notes in Learn mode first.");setQuizState("idle");return;}

    const units=(setup?.fields||[]).map(f=>f.code).join(", ");
    const prompt=`You are a university examiner for ${setup?.name||"a student"} studying ${units||"agricultural science"} at Adelaide University.

Based on these study notes, generate an adaptive quiz session. Use MIX style: Socratic questions (open-ended, "why/how/what would happen if") for concepts that appear NEW or complex, and Direct questions (specific recall + application) for concepts that appear PRACTICED.

The number of questions should be adaptive: simple notes = 3-4 questions, complex multi-topic notes = 6-8 questions. Maximum 8.

NOTES TO QUIZ FROM:
${content.slice(0,4000)}

Respond ONLY in this exact JSON format, no other text:
{
  "questionCount": 5,
  "topics": ["phosphorus chemistry", "AMF biology"],
  "questions": [
    {
      "id": 1,
      "style": "socratic",
      "question": "You mentioned that pH affects phosphorus availability -- walk me through the mechanism at the molecular level. What is actually happening to the phosphate ion?",
      "targetConcept": "phosphorus precipitation chemistry",
      "unit": "CHEM 1002",
      "crossUnit": null
    },
    {
      "id": 2,
      "style": "direct",
      "question": "At what pH does aluminium phosphate precipitation become the dominant mechanism limiting P availability?",
      "targetConcept": "pH threshold for Al-P precipitation",
      "unit": "SOIL 2001",
      "crossUnit": "CHEM 1002"
    }
  ]
}`;

    try{
      const res=await fetch(API_URL,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:1200,
          system:"You are a university examiner. Respond ONLY with valid JSON, no markdown, no backticks.",
          messages:[{role:"user",content:prompt}]})
      });
      const data=await res.json();
      const raw=data.content?.[0]?.text||"{}";
      const parsed=JSON.parse(raw.replace(/```json?|```/g,"").trim());
      setQuizSession({questions:parsed.questions||[],answers:[],current:0,startedAt:Date.now(),topics:parsed.topics||[]});
      setQuizState("active");
      setCurrentAnswer("");setTranscript("");setEvalResult(null);
    }catch(e){setError("AI is not connected yet. Features that need AI are paused.");setQuizState("idle");}
  };

  // â”€â”€ Submit answer and evaluate â”€â”€
  const submitAnswer=async()=>{
    if(!currentAnswer.trim())return;
    const q=quizSession.questions[quizSession.current];
    setQuizState("evaluating");

    const evalPrompt=`You are evaluating a student's answer in a university quiz.

Question: "${q.question}"
Target concept: ${q.targetConcept}
Unit: ${q.unit}${q.crossUnit?` (cross-unit link to: ${q.crossUnit})`:""}
Question style: ${q.style}

Student's answer: "${currentAnswer}"

Evaluate and respond ONLY in this exact JSON format:
{
  "understood": true,
  "crossUnitMade": false,
  "score": "strong",
  "feedback": "Good -- you correctly identified the Al3+ precipitation mechanism. Missing: you did not mention the pH threshold (5.5) or the iron oxide adsorption pathway that operates at slightly higher pH.",
  "gapIdentified": "pH threshold specificity and Fe-oxide adsorption pathway",
  "followUp": null
}

score options: "strong" | "partial" | "missing"
crossUnitMade: true if student made the cross-unit connection without being prompted
followUp: null OR a brief follow-up question if answer was partial`;

    try{
      const res=await fetch(API_URL,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:400,
          system:"You are a university examiner. Respond ONLY with valid JSON.",
          messages:[{role:"user",content:evalPrompt}]})
      });
      const data=await res.json();
      const raw=data.content?.[0]?.text||"{}";
      const result=JSON.parse(raw.replace(/```json?|```/g,"").trim());
      setEvalResult(result);

      const updatedAnswers=[...quizSession.answers,{question:q,answer:currentAnswer,eval:result}];
      setQuizSession(s=>({...s,answers:updatedAnswers}));
      setQuizState("active");
    }catch(e){setQuizState("active");}
  };

  // â”€â”€ Advance to next question or generate report â”€â”€
  const nextQuestion=()=>{
    const next=quizSession.current+1;
    if(next>=quizSession.questions.length){generateReport();}
    else{setQuizSession(s=>({...s,current:next}));setCurrentAnswer("");setTranscript("");setEvalResult(null);}
  };

  // â”€â”€ Generate final report â”€â”€
  const generateReport=async()=>{
    setQuizState("loading");
    const answers=quizSession.answers;
    const summary=answers.map((a,i)=>`Q${i+1} [${a.question.unit}] ${a.question.targetConcept}: ${a.eval?.score||"?"} -- ${a.eval?.gapIdentified||"none"}`).join("\n");

    const reportPrompt=`Generate a learning report from this quiz session.

Quiz answers summary:
${summary}

Topics covered: ${quizSession.topics?.join(", ")}

Respond ONLY in this exact JSON format:
{
  "overallScore": "partial",
  "summary": "You demonstrated solid understanding of phosphorus chemistry but have not yet connected it to the AMF mechanism in BIOL 1004.",
  "concepts": [
    {"concept": "Al-P precipitation mechanism", "unit": "CHEM 1002", "status": "understood", "note": ""},
    {"concept": "pH threshold specificity", "unit": "SOIL 2001", "status": "partial", "note": "Know the direction but not the exact threshold values"},
    {"concept": "AMF phosphorus mobilisation", "unit": "BIOL 1004", "status": "not_covered", "note": "Not tested this session"}
  ],
  "crossUnitLinks": [
    {"from": "CHEM 1002", "to": "SOIL 2001", "status": "made", "description": "Connected precipitation chemistry to soil pH dynamics"},
    {"from": "SOIL 2001", "to": "BIOL 1004", "status": "missing", "description": "Did not connect pH dynamics to AMF phosphorus access mechanism"}
  ],
  "priorityGaps": ["pH threshold values (5.5 for Al, 7.5 for Ca)", "AMF P-transporter mechanism in periarbuscular membrane"],
  "nextSession": "Focus on BIOL 1004 AMF notes and explicitly connect to the SOIL 2001 pH content from today."
}

overallScore options: "strong" | "partial" | "early"`;

    try{
      const res=await fetch(API_URL,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,
          system:"You are a learning analyst. Respond ONLY with valid JSON.",
          messages:[{role:"user",content:reportPrompt}]})
      });
      const data=await res.json();
      const raw=data.content?.[0]?.text||"{}";
      const report=JSON.parse(raw.replace(/```json?|```/g,"").trim());
      setQuizReport(report);
      // Save top gap so the Daily companion can follow up tomorrow -- closes the learning loop
      try{
        const gaps=report.priorityGaps||[];
        const missingLinks=(report.crossUnitLinks||[]).filter(l=>l.status==="missing").map(l=>l.from+" <-> "+l.to+": "+l.description);
        const topGap=[...gaps,...missingLinks].slice(0,2).join(" | ");
        if(topGap)await window.storage?.set("mycel_last_gap",topGap);
      }catch{}
      setQuizState("report");
    }catch(e){setQuizState("report");setQuizReport({summary:"Session complete.",concepts:[],crossUnitLinks:[],priorityGaps:[],nextSession:""});}
  };

  const scoreColor=(s)=>s==="understood"||s==="strong"?T.sg:s==="partial"?"#C8A050":T.cld||"#C87870";
  const scoreLabel=(s)=>s==="understood"||s==="strong"?"Understood":s==="partial"?"Partial":s==="missing"||s==="not_covered"?"Gap":"--";

  // â”€â”€ MCQ MODE: connection-focused multiple choice â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const startMCQ=async()=>{
    let content="";
    if(quizSource==="notes"){content=notes.slice(-15).map(n=>(n.title?n.title+": ":"")+n.text).join("\n\n");}
    else{content=docs.map(d=>d.name+": "+(d.text||"").slice(0,2000)).join("\n\n");}
    if(!content.trim()){setMcqState("error");return;}
    setMcqState("loading");
    const units=(setup?.fields||[]).map(f=>f.code).join(", ");
    const prompt="You are Mycel, building a CONNECTION-FOCUSED multiple choice quiz for a student studying "+(units||"agricultural science")+".\n\nTheir study material:\n"+content.slice(0,6000)+"\n\nCRITICAL: This is NOT a recall quiz. Every question must test whether the student can CONNECT a concept from one unit to a concept in another unit, or connect a mechanism to its consequence. Do NOT ask 'what is X'. Ask 'how does X (from one unit) explain or relate to Y (from another unit)'. Each of the 4 options should be a plausible way of connecting the two ideas; exactly one is correct.\n\nGenerate 6 questions. Respond ONLY in this exact JSON:\n{\"questions\":[{\"q\":\"the connection question\",\"options\":[\"a\",\"b\",\"c\",\"d\"],\"correct\":0,\"explanation\":\"why the correct option links the two concepts, and why the tempting wrong one fails\",\"unitsLinked\":[\"UNIT1\",\"UNIT2\"],\"concept\":\"the core concept being connected\"}]}";
    try{
      const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:2000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const parsed=JSON.parse((data.content?.[0]?.text||"{}").replace(/```json?|```/g,"").trim());
      setMcqSession({questions:parsed.questions||[],current:0,answers:[]});
      setMcqState("active");
    }catch(e){setMcqState("error");}
  };

  const answerMCQ=(choiceIdx)=>{
    const q=mcqSession.questions[mcqSession.current];
    const correct=choiceIdx===q.correct;
    // Feed concepts into the knowledge graph
    if(addToGraph&&q.concept)addToGraph(q.concept);
    if(addToGraph&&q.unitsLinked)q.unitsLinked.forEach(u=>addToGraph(u));
    const answers=[...mcqSession.answers,{q,choice:choiceIdx,correct}];
    setMcqSession({...mcqSession,answers,revealed:true});
  };

  const nextMCQ=()=>{
    const next=mcqSession.current+1;
    if(next>=mcqSession.questions.length){genMCQReport();}
    else setMcqSession({...mcqSession,current:next,revealed:false});
  };

  const genMCQReport=async()=>{
    setMcqState("loading");
    const answers=mcqSession.answers;
    const summary=answers.map((a,i)=>`Q${i+1} [${(a.q.unitsLinked||[]).join("+")}] ${a.q.concept}: ${a.correct?"CORRECT":"WRONG"}`).join("\n");
    const units=(setup?.fields||[]).map(f=>f.code).join(", ");
    const prompt="You are Mycel, a learning companion for a student studying "+(units||"agricultural science")+". They finished a connection-focused MCQ quiz.\n\nResults:\n"+summary+"\n\nWrite a report that does THREE things: identify weak concepts and loose cross-unit connections, suggest HOW to study each weak area, and give a dependency-ordered priority (what to learn first because it is the foundation for the rest).\n\nRespond ONLY in this exact JSON:\n{\"score\":\"X/Y\",\"summary\":\"one encouraging but honest sentence\",\"weakConcepts\":[{\"concept\":\"name\",\"howToStudy\":\"concrete way to relearn it\",\"exploreInLearn\":\"a question to ask in Learn chat to explore it\"}],\"looseConnections\":[{\"from\":\"UNIT1 concept\",\"to\":\"UNIT2 concept\",\"bridgeQuestion\":\"a question that explores the link\"}],\"priorityOrder\":[\"learn this first (foundation)\",\"then this\",\"then this\"],\"priorityReason\":\"one sentence on why this order follows dependency\"}";
    try{
      const res=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1500,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const parsed=JSON.parse((data.content?.[0]?.text||"{}").replace(/```json?|```/g,"").trim());
      // Save top gap for Daily companion
      try{const topGap=(parsed.weakConcepts?.[0]?.concept||"")+(parsed.looseConnections?.[0]?(" | "+parsed.looseConnections[0].from+" <-> "+parsed.looseConnections[0].to):"");if(topGap.trim())await window.storage?.set("mycel_last_gap",topGap);}catch{}
      setMcqReport(parsed);setMcqState("report");
    }catch(e){setMcqState("report");setMcqReport({score:"",summary:"Quiz complete.",weakConcepts:[],looseConnections:[],priorityOrder:[],priorityReason:""});}
  };

  // â”€â”€ MODE TOGGLE (shown on idle) â”€â”€
  const ModeToggle=()=>(
    <div style={{display:"flex",gap:6,marginBottom:20,background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,padding:4,width:"fit-content"}}>
      {[{id:"voice",l:"Voice Quiz"},{id:"mcq",l:"Connection MCQ"}].map(m=>(
        <button key={m.id} onClick={()=>setQuizMode(m.id)}
          style={{padding:"7px 16px",background:quizMode===m.id?T.am:"transparent",border:"none",borderRadius:9,
            fontSize:12.5,fontWeight:quizMode===m.id?600:400,color:quizMode===m.id?"#FFF":T.muted,cursor:"pointer"}}>{m.l}</button>
      ))}
    </div>
  );

  // â”€â”€ MCQ RENDER (when mode is mcq) â”€â”€
  if(quizMode==="mcq"){
    if(mcqState==="loading")return(<div><ModeToggle/><div style={{padding:"70px 0",textAlign:"center"}}><div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:14}}>Building connection questions...</div><div style={{display:"flex",gap:6,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.am,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}</div></div></div>);

    if(mcqState==="active"&&mcqSession){
      const q=mcqSession.questions[mcqSession.current];
      const revealed=mcqSession.revealed;
      const lastAns=mcqSession.answers[mcqSession.answers.length-1];
      return(<div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
          <div style={{fontFamily:F.mono,fontSize:10,color:T.muted}}>Question {mcqSession.current+1} / {mcqSession.questions.length}</div>
          {q.unitsLinked&&<div style={{display:"flex",gap:5}}>{q.unitsLinked.map(u=><span key={u} style={{fontFamily:F.mono,fontSize:8,padding:"2px 8px",background:T.goldBg||T.amBg,border:`1px solid ${T.goldBd||T.amBd}`,borderRadius:10,color:T.gold||T.am}}>{u}</span>)}</div>}
        </div>
        <div style={{padding:"18px 20px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:16,marginBottom:14,boxShadow:T.shadowSoft}}>
          <p style={{margin:0,fontFamily:F.display,fontSize:19,color:T.ink,lineHeight:1.4}}>{q.q}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:16}}>
          {q.options.map((opt,i)=>{
            const isCorrect=i===q.correct;
            const isChosen=revealed&&lastAns&&lastAns.choice===i;
            let bg=T.card,bd=T.bd,col=T.body;
            if(revealed){if(isCorrect){bg=`${T.sg}15`;bd=T.sg;col=T.ink;}else if(isChosen){bg=`${T.cld||"#C87870"}12`;bd=T.cld||"#C87870";col=T.ink;}}
            return(<button key={i} disabled={revealed} onClick={()=>answerMCQ(i)}
              style={{padding:"13px 16px",background:bg,border:`1px solid ${bd}`,borderRadius:12,textAlign:"left",
                cursor:revealed?"default":"pointer",fontSize:13.5,color:col,lineHeight:1.5,display:"flex",gap:10,alignItems:"flex-start"}}>
              <span style={{fontFamily:F.mono,fontSize:11,color:revealed&&isCorrect?T.sg:T.faint,flexShrink:0,marginTop:1}}>{String.fromCharCode(65+i)}</span>
              <span>{opt}</span>
            </button>);
          })}
        </div>
        {revealed&&<div style={{animation:"fadeUp 0.3s ease"}}>
          <div style={{padding:"14px 16px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:14}}>
            <div style={{fontFamily:F.mono,fontSize:9,color:lastAns?.correct?T.sg:T.cld||"#C87870",marginBottom:6}}>{lastAns?.correct?"CORRECT":"NOT QUITE"}</div>
            <p style={{margin:0,fontSize:13,color:T.body,lineHeight:1.65}}>{q.explanation}</p>
          </div>
          <button onClick={nextMCQ} style={{width:"100%",padding:"13px",background:T.am,border:"none",borderRadius:12,fontSize:14,fontWeight:600,color:"#FFF",cursor:"pointer"}}>{mcqSession.current+1>=mcqSession.questions.length?"See My Report":"Next Question"}</button>
        </div>}
      </div>);
    }

    if(mcqState==="report"&&mcqReport){
      return(<div>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontFamily:F.display,fontSize:40,color:T.ink}}>{mcqReport.score}</div>
          <p style={{margin:"4px 0 0",fontSize:14,color:T.muted,lineHeight:1.6}}>{mcqReport.summary}</p>
        </div>
        {(mcqReport.priorityOrder||[]).length>0&&<div style={{padding:"16px 18px",background:`${T.am}0C`,border:`1px solid ${T.amBd}`,borderRadius:16,marginBottom:14}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.am,marginBottom:10}}>LEARN IN THIS ORDER</div>
          {mcqReport.priorityOrder.map((p,i)=>(<div key={i} style={{display:"flex",gap:10,marginBottom:8,alignItems:"flex-start"}}>
            <span style={{fontFamily:F.display,fontSize:18,color:T.am,flexShrink:0,lineHeight:1}}>{i+1}</span>
            <span style={{fontSize:13,color:T.ink,lineHeight:1.5}}>{p}</span>
          </div>))}
          {mcqReport.priorityReason&&<p style={{margin:"8px 0 0",fontSize:11,color:T.muted,fontStyle:"italic",lineHeight:1.5}}>{mcqReport.priorityReason}</p>}
        </div>}
        {(mcqReport.weakConcepts||[]).length>0&&<div style={{marginBottom:14}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:8}}>CONCEPTS TO STRENGTHEN</div>
          {mcqReport.weakConcepts.map((w,i)=>(<div key={i} style={{padding:"13px 15px",background:T.card,border:`1px solid ${T.bd}`,borderLeft:`3px solid ${T.cld||"#C87870"}`,borderRadius:12,marginBottom:8}}>
            <div style={{fontSize:13.5,fontWeight:600,color:T.ink,marginBottom:4}}>{w.concept}</div>
            <p style={{margin:"0 0 8px",fontSize:12,color:T.body,lineHeight:1.6}}>{w.howToStudy}</p>
            {w.exploreInLearn&&<button onClick={()=>{setInput&&setInput(w.exploreInLearn);setLearnSub&&setLearnSub("chat");}} style={{background:"none",border:`1px solid ${T.amBd}`,borderRadius:8,padding:"5px 12px",fontSize:11,color:T.am,cursor:"pointer"}}>Explore in Learn</button>}
          </div>))}
        </div>}
        {(mcqReport.looseConnections||[]).length>0&&<div style={{marginBottom:14}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.nwm||T.oc,marginBottom:8}}>CONNECTIONS TO TIGHTEN</div>
          {mcqReport.looseConnections.map((c,i)=>(<div key={i} style={{padding:"13px 15px",background:`${T.nwm||T.oc}0A`,border:`1px solid ${(T.nwm||T.oc)}30`,borderRadius:12,marginBottom:8}}>
            <div style={{fontSize:13,color:T.ink,marginBottom:6}}><span style={{fontWeight:600}}>{c.from}</span> <span style={{color:T.nwm||T.oc}}>&lt;-&gt;</span> <span style={{fontWeight:600}}>{c.to}</span></div>
            {c.bridgeQuestion&&<button onClick={()=>{setInput&&setInput(c.bridgeQuestion);setLearnSub&&setLearnSub("chat");}} style={{background:"none",border:`1px solid ${(T.nwm||T.oc)}40`,borderRadius:8,padding:"5px 12px",fontSize:11,color:T.nwm||T.oc,cursor:"pointer"}}>Explore This Link</button>}
          </div>))}
        </div>}
        <button onClick={()=>{setMcqState("idle");setMcqSession(null);setMcqReport(null);}} style={{width:"100%",padding:"12px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,fontSize:13,color:T.body,cursor:"pointer"}}>New Quiz</button>
      </div>);
    }

    // MCQ idle
    return(<div>
      <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em",marginBottom:4}}>Connection MCQ</div>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:20}}>Multiple choice that tests how concepts connect across your units, not just recall</div>
      <ModeToggle/>
      <div style={{marginBottom:16}}>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:8}}>QUIZ FROM</div>
        <div style={{display:"flex",gap:8}}>
          {[{id:"notes",l:"My Notes",sub:`${notes.length} saved`},{id:"upload",l:"Library Docs",sub:`${docs.length} uploaded`}].map(s=>(
            <button key={s.id} onClick={()=>setQuizSource(s.id)} style={{flex:1,padding:"12px 16px",background:quizSource===s.id?`${T.am}15`:T.card,border:`1px solid ${quizSource===s.id?T.amBd:T.bd}`,borderRadius:12,cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:600,color:quizSource===s.id?T.am:T.ink}}>{s.l}</div>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>
      {mcqState==="error"&&<div style={{padding:"10px 14px",background:`${T.cld||"#C87870"}12`,border:`1px solid ${T.cld||"#C87870"}30`,borderRadius:8,fontSize:12,color:T.cld||"#C87870",marginBottom:16}}>No notes or documents to quiz from. Add some notes in Learn first.</div>}
      <button onClick={startMCQ} style={{width:"100%",padding:"14px",background:T.am,border:"none",borderRadius:12,fontSize:15,fontWeight:700,color:"#FFF",cursor:"pointer"}}>Start Connection Quiz</button>
      <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,textAlign:"center",marginTop:8}}>6 questions, each testing a cross-unit connection</div>
    </div>);
  }

  // â”€â”€ IDLE STATE â”€â”€
  if(quizState==="idle") return(
    <div>
      <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em",marginBottom:4}}>Voice Quiz</div>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:20}}>AI questions from your notes. Answer by voice or text, get a concept map report</div>
      <ModeToggle/>

      <div style={{marginBottom:16}}>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:8}}>QUIZ FROM</div>
        <div style={{display:"flex",gap:8}}>
          {[{id:"notes",l:"My notes",sub:`${notes.length} saved`},{id:"upload",l:"Library docs",sub:`${docs.length} uploaded`}].map(s=>(
            <button key={s.id} onClick={()=>setQuizSource(s.id)}
              style={{flex:1,padding:"12px 16px",background:quizSource===s.id?`${T.am}15`:T.card,
                border:`1px solid ${quizSource===s.id?T.amBd:T.bd}`,borderRadius:10,cursor:"pointer",textAlign:"left"}}>
              <div style={{fontSize:13,fontWeight:600,color:quizSource===s.id?T.am:T.ink}}>{s.l}</div>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>{s.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {error&&<div style={{padding:"10px 14px",background:`${T.cld||"#C87870"}12`,border:`1px solid ${T.cld||"#C87870"}30`,borderRadius:8,fontSize:12,color:T.cld||"#C87870",marginBottom:16}}>{error}</div>}

      <button onClick={startSession}
        style={{width:"100%",padding:"14px",background:T.am,border:"none",borderRadius:12,
          fontSize:15,fontWeight:700,color:"#FFF",cursor:"pointer"}}>
        Start Quiz Session
      </button>
      <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,textAlign:"center",marginTop:8}}>
        Adaptive -- AI decides question count based on your notes complexity
      </div>
    </div>
  );

  // â”€â”€ LOADING STATE â”€â”€
  if(quizState==="loading") return(
    <div style={{padding:"80px 0",textAlign:"center"}}>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:16}}>Preparing your questions...</div>
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.am,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );

  // â”€â”€ ACTIVE QUIZ STATE â”€â”€
  if(quizState==="active"||quizState==="evaluating"){
    const q=quizSession.questions[quizSession.current];
    const progress=quizSession.current/quizSession.questions.length;
    const answered=quizSession.answers.length>quizSession.current;
    return(
      <div>
        {/* Progress */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>Question {quizSession.current+1} of {quizSession.questions.length}</div>
          <div style={{fontFamily:F.mono,fontSize:9,padding:"2px 8px",background:q.style==="socratic"?`${T.nwm||"#5EB8C8"}15`:`${T.am}15`,border:`1px solid ${q.style==="socratic"?T.nwm||"#5EB8C8":T.amBd}`,borderRadius:4,color:q.style==="socratic"?T.nwm||"#5EB8C8":T.am}}>{q.style==="socratic"?"Socratic":"Direct"}</div>
        </div>
        <div style={{height:3,background:T.bd,borderRadius:2,marginBottom:20,overflow:"hidden"}}>
          <div style={{width:`${progress*100}%`,height:"100%",background:T.am,transition:"width 0.4s",borderRadius:2}}/>
        </div>

        {/* Unit tag */}
        <div style={{display:"flex",gap:6,marginBottom:12,flexWrap:"wrap"}}>
          <span style={{fontFamily:F.mono,fontSize:8,padding:"2px 8px",background:`${T.sg}15`,border:`1px solid ${T.sgBd}`,borderRadius:4,color:T.sg}}>{q.unit}</span>
          {q.crossUnit&&<span style={{fontFamily:F.mono,fontSize:8,padding:"2px 8px",background:`${T.am}10`,border:`1px solid ${T.amBd}`,borderRadius:4,color:T.am}}>x {q.crossUnit}</span>}
        </div>

        {/* Question */}
        <div style={{padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:20}}>
          <div style={{fontFamily:F.mono,fontSize:8,color:T.muted,marginBottom:8}}>QUESTION</div>
          <p style={{margin:0,fontSize:15,color:T.ink,lineHeight:1.7,fontStyle:q.style==="socratic"?"italic":"normal"}}>{q.question}</p>
        </div>

        {/* Evaluation result (shown after answering) */}
        {evalResult&&answered&&(
          <div style={{padding:"12px 14px",background:`${scoreColor(evalResult.score)}10`,border:`1px solid ${scoreColor(evalResult.score)}30`,borderRadius:10,marginBottom:16}}>
            <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:6}}>
              <span style={{fontFamily:F.mono,fontSize:9,fontWeight:"bold",color:scoreColor(evalResult.score)}}>{scoreLabel(evalResult.score).toUpperCase()}</span>
              {evalResult.crossUnitMade&&<span style={{fontFamily:F.mono,fontSize:8,padding:"1px 6px",background:`${T.am}15`,border:`1px solid ${T.amBd}`,borderRadius:4,color:T.am}}>cross-unit link made</span>}
            </div>
            <p style={{margin:"0 0 6px",fontSize:12,color:T.body,lineHeight:1.6}}>{evalResult.feedback}</p>
            {evalResult.gapIdentified&&<div style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>Gap: {evalResult.gapIdentified}</div>}
          </div>
        )}

        {/* Answer input */}
        {!answered&&(
          <div>
            <div style={{display:"flex",gap:8,marginBottom:8}}>
              <button onClick={isListening?stopListening:startListening}
                style={{padding:"10px 18px",background:isListening?`${T.cld||"#C87870"}20`:T.sgBg,
                  border:`1px solid ${isListening?T.cld||"#C87870":T.sgBd}`,borderRadius:10,
                  fontSize:13,fontWeight:600,color:isListening?T.cld||"#C87870":T.sg,cursor:"pointer",
                  display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                <span style={{fontSize:16}}>{isListening?"stop":"speak"}</span>
                {isListening?"Listening...":"Voice"}
              </button>
              <div style={{flex:1,position:"relative"}}>
                <textarea value={currentAnswer||transcript}
                  onChange={e=>{setCurrentAnswer(e.target.value);setTranscript(e.target.value);}}
                  placeholder="Speak or type your answer..."
                  rows={3} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,
                    color:T.ink,fontSize:13,padding:"10px 12px",outline:"none",resize:"none",
                    lineHeight:1.6,boxSizing:"border-box"}}/>
              </div>
            </div>
            {isListening&&<div style={{fontFamily:F.mono,fontSize:9,color:T.sg,marginBottom:8,padding:"6px 10px",background:T.sgBg,borderRadius:6}}>{transcript||"Listening, speak now..."}</div>}
            <button onClick={submitAnswer} disabled={!(currentAnswer||transcript).trim()||quizState==="evaluating"}
              style={{width:"100%",padding:"11px",background:(currentAnswer||transcript).trim()&&quizState!=="evaluating"?T.am:T.bd,
                border:"none",borderRadius:10,fontSize:14,fontWeight:600,
                color:(currentAnswer||transcript).trim()&&quizState!=="evaluating"?"#FFF":T.muted,
                cursor:(currentAnswer||transcript).trim()&&quizState!=="evaluating"?"pointer":"not-allowed"}}>
              {quizState==="evaluating"?"Evaluating...":"Submit Answer"}
            </button>
          </div>
        )}

        {answered&&(
          <button onClick={nextQuestion}
            style={{width:"100%",padding:"11px",background:T.am,border:"none",borderRadius:10,
              fontSize:14,fontWeight:600,color:"#FFF",cursor:"pointer",marginTop:8}}>
            {quizSession.current+1>=quizSession.questions.length?"Generate Report":"Next Question"}
          </button>
        )}
      </div>
    );
  }

  // â”€â”€ REPORT STATE â”€â”€
  if(quizState==="report"&&quizReport) return(
    <div>
      <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em",marginBottom:4}}>Session Report</div>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:20}}>{quizSession.questions.length} questions / {new Date(quizSession.startedAt).toLocaleTimeString()}</div>

      {/* Summary */}
      <div style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:20}}>
        <p style={{margin:0,fontSize:13,color:T.body,lineHeight:1.7}}>{quizReport.summary}</p>
      </div>

      {/* Concepts */}
      <div style={{marginBottom:20}}>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:10}}>CONCEPTS</div>
        {(quizReport.concepts||[]).map((c,i)=>(
          <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",background:T.card,
            border:`1px solid ${T.bd}`,borderLeft:`3px solid ${scoreColor(c.status)}`,
            borderRadius:8,marginBottom:6,alignItems:"flex-start"}}>
            <div style={{flex:1}}>
              <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
                <span style={{fontSize:12,fontWeight:600,color:T.ink}}>{c.concept}</span>
                <span style={{fontFamily:F.mono,fontSize:8,color:T.sg}}>{c.unit}</span>
              </div>
              {c.note&&<div style={{fontSize:11,color:T.muted}}>{c.note}</div>}
            </div>
            <div style={{fontFamily:F.mono,fontSize:8,fontWeight:"bold",color:scoreColor(c.status),flexShrink:0,marginTop:2}}>{scoreLabel(c.status).toUpperCase()}</div>
          </div>
        ))}
      </div>

      {/* Cross-unit links */}
      {(quizReport.crossUnitLinks||[]).length>0&&(
        <div style={{marginBottom:20}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:10}}>CROSS-UNIT CONNECTIONS</div>
          {quizReport.crossUnitLinks.map((l,i)=>(
            <div key={i} style={{display:"flex",gap:10,padding:"9px 12px",background:T.card,
              border:`1px solid ${l.status==="made"?T.amBd:T.bd}`,borderRadius:8,marginBottom:6,alignItems:"center"}}>
              <div style={{flex:1}}>
                <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:2,flexWrap:"wrap"}}>
                  <span style={{fontFamily:F.mono,fontSize:9,fontWeight:"bold",color:T.sg}}>{l.from}</span>
                  <span style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>x</span>
                  <span style={{fontFamily:F.mono,fontSize:9,fontWeight:"bold",color:T.sg}}>{l.to}</span>
                </div>
                <div style={{fontSize:11,color:T.muted}}>{l.description}</div>
              </div>
              <div style={{fontFamily:F.mono,fontSize:8,fontWeight:"bold",color:l.status==="made"?T.am:T.muted,flexShrink:0}}>{l.status==="made"?"CONNECTED":"MISSING"}</div>
            </div>
          ))}
        </div>
      )}

      {/* Priority gaps */}
      {(quizReport.priorityGaps||[]).length>0&&(
        <div style={{padding:"12px 14px",background:`${T.cld||"#C87870"}08`,border:`1px solid ${T.cld||"#C87870"}25`,borderRadius:10,marginBottom:16}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.cld||"#C87870",marginBottom:8}}>STUDY BEFORE NEXT SESSION</div>
          {quizReport.priorityGaps.map((g,i)=>(
            <div key={i} style={{fontSize:12,color:T.body,marginBottom:4,display:"flex",gap:6}}>
              <span style={{color:T.cld||"#C87870",flexShrink:0}}>x</span>{g}
            </div>
          ))}
        </div>
      )}

      {/* Next session recommendation */}
      {quizReport.nextSession&&(
        <div style={{padding:"12px 14px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10,marginBottom:20}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.sg,marginBottom:6}}>NEXT SESSION</div>
          <p style={{margin:0,fontSize:12,color:T.body,lineHeight:1.6}}>{quizReport.nextSession}</p>
        </div>
      )}

      <button onClick={()=>{setQuizState("idle");setQuizReport(null);setQuizSession(null);setCurrentAnswer("");setEvalResult(null);}}
        style={{width:"100%",padding:"11px",background:T.am,border:"none",borderRadius:10,
          fontSize:14,fontWeight:600,color:"#FFF",cursor:"pointer"}}>
        New Session
      </button>
    </div>
  );

  return null;
}

// â”€â”€ QUICK CAPTURE COMPONENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function QuickCapture({T,F,notes,setNotes,projects,setup}){
  const[captureText,setCaptureText]=useState("");
  const[captureUrl,setCaptureUrl]=useState("");
  const[captureType,setCaptureType]=useState("text");
  const[targetProject,setTargetProject]=useState("");
  const[busy,setBusy]=useState(false);
  const[result,setResult]=useState(null);
  const[captures,setCaptures]=useState([]);
  const[sessionTime,setSessionTime]=useState(0);
  const timerRef=useRef(null);
  const db=window.storage;

  useEffect(()=>{(async()=>{try{const r=await db?.get("mycel_captures");if(r?.value)setCaptures(JSON.parse(r.value));}catch{}})();},[]);
  useEffect(()=>{timerRef.current=setInterval(()=>setSessionTime(t=>t+1),1000);return()=>clearInterval(timerRef.current);},[]);

  const fmt=(s)=>{const m=Math.floor(s/60);return m>0?m+"m "+(s%60)+"s":(s%60)+"s";};
  const save=async(c)=>{setCaptures(c);try{await db?.set("mycel_captures",JSON.stringify(c));}catch{}};

  const process=async()=>{
    if(!captureText.trim()&&!captureUrl.trim())return;
    setBusy(true);setResult(null);
    const body=captureType==="url"?"URL: "+captureUrl+"\n\nNotes: "+captureText:captureText;
    const topics=notes.slice(-10).map(n=>n.title||n.text?.slice(0,50)).join(", ");
    const projs=projects.map(p=>p.name).join(", ");
    try{
      const res=await fetch(API_URL,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:500,
          messages:[{role:"user",content:"You are Mycel, an agricultural science learning companion.\n\nStudent captured:\n"+body+"\n\nRecent topics: "+(topics||"none")+"\nProjects: "+(projs||"none")+(targetProject?"\nTarget: "+targetProject:"")+"\n\nRespond ONLY in this exact JSON, no other text:\n{\"summary\":\"one sentence what this is\",\"connections\":[\"how it connects to existing knowledge\"],\"nextAction\":\"what to do with this\",\"tags\":[\"tag1\"]}"}]})});
      const data=await res.json();
      const parsed=JSON.parse((data.content?.[0]?.text||"{}").replace(/```json?|```/g,"").trim());
      setResult(parsed);
      const cap={id:"cap_"+Date.now(),type:captureType,text:captureText.slice(0,500),url:captureUrl||null,
        project:targetProject||null,summary:parsed.summary||"",connections:parsed.connections||[],
        nextAction:parsed.nextAction||"",tags:parsed.tags||[],sessionTime,createdAt:new Date().toISOString()};
      await save([cap,...captures]);
    }catch{setResult({summary:"Saved as raw capture.",connections:[],nextAction:"Review manually.",tags:[]});}
    setBusy(false);
  };

  const saveNote=async()=>{
    if(!result)return;
    const note={id:Date.now(),title:result.summary||"Quick capture",
      text:(captureUrl?"[Source: "+captureUrl+"]\n\n":"")+captureText+"\n\nConnections: "+result.connections.join("; "),
      unit:setup?.fields?.[0]?.code||"",tags:result.tags,createdAt:new Date().toISOString(),fromCapture:true};
    const updated=[...notes,note];
    setNotes(updated);
    try{await db?.set("mycel_nt7",JSON.stringify(updated));}catch{}
    setCaptureText("");setCaptureUrl("");setResult(null);
  };

  return(<div>
    <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em",marginBottom:4}}>Quick Capture</div>
    <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:16}}>Bring outside content in / Mycel connects it to what you already know</div>
    <div style={{padding:"12px 14px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:11,marginBottom:18,fontSize:12.5,color:T.body,lineHeight:1.7}}>
      <strong>What This Does:</strong> Found something useful while studying -- a paper, a lecture slide, a quote, an idea? Paste it here. Mycel reads it, then tells you how it connects to the concepts you are already learning in your other units, and suggests what to do with it next. It is how you turn scattered reading into connected understanding.
    </div>

    <div style={{display:"flex",gap:10,marginBottom:20,flexWrap:"wrap"}}>
      <div style={{padding:"8px 14px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:9,display:"flex",gap:8,alignItems:"center"}}>
        <span style={{fontFamily:F.mono,fontSize:9,color:T.sg}}>Session</span>
        <span style={{fontFamily:F.mono,fontSize:13,fontWeight:700,color:T.sg}}>{fmt(sessionTime)}</span>
      </div>
      {projects.length>0&&<select value={targetProject} onChange={e=>setTargetProject(e.target.value)}
        style={{flex:1,background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.muted,fontSize:12,padding:"8px 12px",outline:"none"}}>
        <option value="">Link to project (optional)</option>
        {projects.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
      </select>}
    </div>

    <div style={{display:"flex",gap:4,marginBottom:12}}>
      {[{id:"text",l:"Paste text"},{id:"url",l:"URL + notes"},{id:"note",l:"Quick note"}].map(t=>(
        <button key={t.id} onClick={()=>setCaptureType(t.id)}
          style={{flex:1,padding:"7px",background:captureType===t.id?`${T.am}15`:T.card,
            border:`1px solid ${captureType===t.id?T.amBd:T.bd}`,borderRadius:8,
            fontSize:11,color:captureType===t.id?T.am:T.muted,cursor:"pointer"}}>{t.l}</button>
      ))}
    </div>

    {captureType==="url"&&<input value={captureUrl} onChange={e=>setCaptureUrl(e.target.value)}
      placeholder="https://doi.org/... or any URL"
      style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,
        color:T.ink,fontSize:13,padding:"10px 12px",outline:"none",marginBottom:10,boxSizing:"border-box"}}/>}

    <textarea value={captureText} onChange={e=>setCaptureText(e.target.value)}
      placeholder={captureType==="url"?"Key quotes or your notes on this page...":captureType==="note"?"Quick thought or observation...":"Paste from paper, lecture, textbook, or anywhere..."}
      rows={5} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,
        color:T.ink,fontSize:13,padding:"11px 13px",outline:"none",resize:"none",
        lineHeight:1.6,boxSizing:"border-box",marginBottom:10}}/>

    <button onClick={process} disabled={(!captureText.trim()&&!captureUrl.trim())||busy}
      style={{width:"100%",padding:"11px",
        background:(!captureText.trim()&&!captureUrl.trim())||busy?T.raised:T.am,
        border:"none",borderRadius:10,fontSize:14,fontWeight:600,
        color:(!captureText.trim()&&!captureUrl.trim())||busy?T.faint:"#FFF",cursor:"pointer",marginBottom:16}}>
      {busy?"Connecting to your knowledge...":"Process + connect"}
    </button>

    {result&&<div style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.amBd}`,borderRadius:12,marginBottom:16}}>
      <div style={{fontFamily:F.mono,fontSize:9,color:T.am,marginBottom:8}}>MYCEL ANALYSIS</div>
      <p style={{margin:"0 0 10px",fontSize:13,color:T.ink,lineHeight:1.6}}>{result.summary}</p>
      {result.connections?.length>0&&<div style={{marginBottom:10}}>
        <div style={{fontFamily:F.mono,fontSize:8,color:T.muted,marginBottom:5}}>CONNECTS TO YOUR KNOWLEDGE</div>
        {result.connections.map((c,i)=><div key={i} style={{display:"flex",gap:6,marginBottom:3}}>
          <span style={{color:T.sg,flexShrink:0}}>v</span>
          <span style={{fontSize:12,color:T.body,lineHeight:1.5}}>{c}</span>
        </div>)}
      </div>}
      {result.tags?.length>0&&<div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
        {result.tags.map(tag=><span key={tag} style={{fontFamily:F.mono,fontSize:8,padding:"2px 8px",
          background:`${T.nwm||"#5EB8C8"}12`,border:`1px solid ${T.nwm||"#5EB8C8"}30`,
          borderRadius:5,color:T.nwm||"#5EB8C8"}}>{tag}</span>)}
      </div>}
      <div style={{padding:"8px 10px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:8,marginBottom:12}}>
        <div style={{fontFamily:F.mono,fontSize:8,color:T.sg,marginBottom:3}}>SUGGESTED NEXT ACTION</div>
        <p style={{margin:0,fontSize:12,color:T.body,lineHeight:1.5}}>{result.nextAction}</p>
      </div>
      <div style={{display:"flex",gap:8}}>
        <button onClick={saveNote} style={{flex:1,padding:"9px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:9,fontSize:13,fontWeight:600,color:T.sg,cursor:"pointer"}}>Save to Notes</button>
        <button onClick={()=>{setCaptureText("");setCaptureUrl("");setResult(null);}} style={{padding:"9px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,fontSize:13,color:T.muted,cursor:"pointer"}}>New Capture</button>
      </div>
    </div>}

    {captures.length>0&&!result&&<div>
      <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:10}}>RECENT CAPTURES ({captures.length})</div>
      {captures.slice(0,5).map(c=><div key={c.id} style={{marginBottom:8,padding:"10px 13px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9}}>
        <div style={{display:"flex",gap:8,marginBottom:4,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{fontFamily:F.mono,fontSize:8,color:T.am,padding:"1px 6px",background:`${T.am}12`,borderRadius:4}}>{c.type}</span>
          {c.project&&<span style={{fontFamily:F.mono,fontSize:8,color:T.sg}}>{c.project}</span>}
          {c.sessionTime>0&&<span style={{fontFamily:F.mono,fontSize:8,color:T.faint,marginLeft:"auto"}}>{fmt(c.sessionTime)} in session</span>}
        </div>
        <p style={{margin:"0 0 4px",fontSize:12,color:T.ink,lineHeight:1.5,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{c.summary||c.text?.slice(0,120)}</p>
        {c.connections?.length>0&&<div style={{fontFamily:F.mono,fontSize:8,color:T.muted}}>Connects: {c.connections.slice(0,2).join(" - ")}</div>}
      </div>)}
    </div>}
  </div>);
}


// â”€â”€ CONNECT TAB CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const RELATIONAL_SEED=[
  {id:"rt_1",anchorType:"source",anchorTitle:"Phosphorus availability in acidic soils",title:"Does aluminium fixation explain the whole pattern?",body:"The reading frames low phosphorus availability mainly through aluminium and iron oxides. In waterlogged patches, would redox changes weaken that explanation? I am trying to separate the dominant mechanism from the exceptions.",author:"Mina Tran",role:"Soil Science, Year 2",tags:["phosphorus","soil chemistry"],useful:7,createdAt:"2026-06-28T10:00:00Z",replies:[{id:"rr_1",author:"Jack Hall",role:"Agronomy, Year 3",body:"I would treat aluminium fixation as the aerobic baseline, then ask what happens to Fe(III) minerals under reducing conditions. Your exception may be a change in the sorption surface rather than phosphorus behaving differently.",useful:4}]},
  {id:"rt_2",anchorType:"experiment",anchorTitle:"AMF inoculation pot trial",title:"Control treatment when the soil already contains native fungi",body:"My available soil cannot be sterilised. What comparison would still let me make a careful claim about the inoculant without pretending the native community is absent?",author:"Ari Singh",role:"Plant Science Honours",tags:["experiment design","mycorrhiza"],useful:11,createdAt:"2026-06-30T04:00:00Z",replies:[{id:"rr_2",author:"Grace Le",role:"Agricultural Science",body:"Could you quantify baseline colonisation first, then frame the treatment as added inoculum rather than presence versus absence? That changes the claim, but it may fit the system you actually have.",useful:6}]},
  {id:"rt_3",anchorType:"project",anchorTitle:"Roseworthy winter cover crop guide",title:"Looking for a second set of eyes on the decision tree",body:"I have mapped recommendations by rainfall and soil texture. I am worried the guide hides uncertainty around establishment timing. What would make that uncertainty visible without making the guide unusable?",author:"Luca Martin",role:"Agricultural Systems",tags:["field guide","decision making"],useful:5,createdAt:"2026-07-01T02:00:00Z",replies:[]},
  {id:"rt_4",anchorType:"question",anchorTitle:"Mechanism check",title:"Is buffering capacity a useful analogy for ecological resilience?",body:"Both seem to describe resistance to change, but I suspect the analogy breaks when biological adaptation enters. Where exactly does it stop helping?",author:"Nora Chen",role:"Environmental Science",tags:["cross-unit","systems"],useful:9,createdAt:"2026-07-02T06:30:00Z",replies:[]},
];
function AttachmentPreview({item}){
  const[url,setUrl]=useState("");
  useEffect(()=>{let current="";(async()=>{const blob=await fileStore.get(item.fileId);if(blob){current=URL.createObjectURL(blob);setUrl(current);}})();return()=>{if(current)URL.revokeObjectURL(current);};},[item.fileId]);
  if(!url)return <div className="attachment-loading">Loading {item.name}…</div>;
  if(item.type.startsWith("image/"))return <figure className="thread-media"><img src={url} alt={item.name}/><figcaption>{item.name}</figcaption></figure>;
  if(item.type.startsWith("video/"))return <figure className="thread-media"><video src={url} controls preload="metadata"/><figcaption>{item.name}</figcaption></figure>;
  return <a className="thread-file" href={url} target="_blank" rel="noreferrer"><b>{item.name}</b><span>Open attached document</span></a>;
}
function RelationalLayer({T,projects,docs,setup}){
  const[threads,setThreads]=useState(RELATIONAL_SEED);const[filter,setFilter]=useState("all");const[selected,setSelected]=useState(null);const[compose,setCompose]=useState(false);const[reply,setReply]=useState("");const[draft,setDraft]=useState({anchorType:"question",anchorTitle:"",title:"",body:"",tags:""});
  const[pendingFiles,setPendingFiles]=useState([]);const[attested,setAttested]=useState(false);const[screening,setScreening]=useState(false);
  useEffect(()=>{(async()=>{const saved=await db.get("mycel_relational_demo");if(saved)setThreads(saved);})();},[]);
  const save=async next=>{setThreads(next);await db.set("mycel_relational_demo",next);};
  const screenUploads=files=>{const allowed=["application/pdf","application/vnd.openxmlformats-officedocument.wordprocessingml.document","application/vnd.openxmlformats-officedocument.presentationml.presentation","image/jpeg","image/png","image/webp","video/mp4","video/webm"];const next=[...files].slice(0,5).map(file=>{const limit=file.type.startsWith("video/")?40:file.type.startsWith("image/")?8:15;const reason=!allowed.includes(file.type)?"File type is not allowed":file.size>limit*1024*1024?`File exceeds the ${limit} MB limit`:null;return{file,name:file.name,type:file.type,size:file.size,status:reason?"rejected":"approved",reason};});setPendingFiles(next);};
  const create=async()=>{if(!draft.title.trim()||!draft.body.trim()||!draft.anchorTitle.trim()||pendingFiles.some(f=>f.status==="rejected")||(pendingFiles.length&&!attested))return;setScreening(true);let moderation="approved";try{const result=await callAI([{role:"user",content:`Screen this educational community post for unsafe instructions, harassment, personal data exposure, spam, or likely unauthorised copyrighted sharing. Title: ${draft.title}\nBody: ${draft.body}\nFiles: ${pendingFiles.map(f=>f.name).join(", ")}. JSON only: {"decision":"approve|review|reject","reason":"short reason"}`}],"You moderate Mycel, an educational community. Allow good-faith academic questions and critique. Do not reject merely because a topic is technical. Protect privacy, safety, and copyright.",250);const parsed=JSON.parse(result.replace(/```json?|```/g,"").trim());moderation=parsed.decision||"review";if(moderation==="reject"){alert(`This post was not approved: ${parsed.reason}`);setScreening(false);return;}}catch{moderation=pendingFiles.length?"review":"approved";}const attachments=[];for(const p of pendingFiles){const fileId=`att_${Date.now()}_${Math.random().toString(36).slice(2)}`;await fileStore.set(fileId,p.file);attachments.push({fileId,name:p.name,type:p.type,size:p.size,status:moderation});}const t={id:`rt_${Date.now()}`,anchorType:draft.anchorType,anchorTitle:draft.anchorTitle.trim(),title:draft.title.trim(),body:draft.body.trim(),author:setup?.name||"You",role:"Mycel learner",tags:draft.tags.split(",").map(x=>x.trim()).filter(Boolean),useful:0,createdAt:new Date().toISOString(),replies:[],attachments,moderation};await save([t,...threads]);setCompose(false);setDraft({anchorType:"question",anchorTitle:"",title:"",body:"",tags:""});setPendingFiles([]);setAttested(false);setSelected(t.id);setScreening(false);};
  const useful=async id=>save(threads.map(t=>t.id===id?{...t,useful:(t.useful||0)+1}:t));
  const replyUseful=async(threadId,replyId)=>save(threads.map(t=>t.id===threadId?{...t,replies:(t.replies||[]).map(r=>r.id===replyId?{...r,useful:(r.useful||0)+1}:r)}:t));
  const addReply=async()=>{if(!reply.trim()||!selected)return;const next=threads.map(t=>t.id===selected?{...t,replies:[...(t.replies||[]),{id:`rr_${Date.now()}`,author:setup?.name||"You",role:"Mycel learner",body:reply.trim(),useful:0}]}:t);await save(next);setReply("");};
  const report=async id=>save(threads.map(t=>t.id===id?{...t,reported:true}:t));
  const shown=threads.filter(t=>filter==="all"||t.anchorType===filter);const thread=threads.find(t=>t.id===selected);
  if(thread)return <div className="relational-shell"><button className="back-link" onClick={()=>setSelected(null)}>← Back to threads</button><article className="thread-detail"><div className="thread-anchor"><span>{thread.anchorType}</span>{thread.anchorTitle}</div><h1>{thread.title}</h1><div className="thread-author"><b>{thread.author}</b><span>{thread.role}</span><time>{new Date(thread.createdAt).toLocaleDateString()}</time></div><p className="thread-body">{thread.body}</p>{(thread.attachments||[]).length>0&&<div className="thread-attachments">{thread.attachments.map(a=><AttachmentPreview item={a} key={a.fileId}/>)}</div>}{thread.moderation&&<div className={`screening-result ${thread.moderation}`}>{thread.moderation==="approved"?"Automated screening passed":"Media retained for moderator review before public release"}</div>}<div className="thread-actions"><button onClick={()=>useful(thread.id)}>Useful {thread.useful||0}</button><button onClick={()=>report(thread.id)}>{thread.reported?"Reported for review":"Report"}</button></div></article><section className="reply-list"><div className="section-heading">{thread.replies?.length||0} responses</div>{!(thread.replies||[]).length&&<div className="relational-empty">No responses yet. A useful reply can offer evidence, clarify a mechanism, name uncertainty, or ask a sharper question.</div>}{(thread.replies||[]).map(r=><article className="reply-card" key={r.id}><div className="thread-author"><b>{r.author}</b><span>{r.role}</span></div><p>{r.body}</p><button onClick={()=>replyUseful(thread.id,r.id)}>Useful {r.useful||0}</button></article>)}<div className="reply-compose"><label>Contribute to the thinking<textarea value={reply} onChange={e=>setReply(e.target.value)} rows={4} placeholder="Offer evidence, a mechanism, a useful challenge, or a question that moves the work forward…"/></label><button onClick={addReply} disabled={!reply.trim()}>Add response</button></div></section></div>;
  return <div className="relational-shell"><div className="relational-head"><div><div className="reader-kicker">COMMONS / LOCAL DEMO</div><h1>Threads attached to real work</h1><p>Questions and exchanges stay connected to the project, source, experiment, or concept that gave rise to them.</p></div><button onClick={()=>setCompose(true)}>Start a thread</button></div><div className="relational-filters">{["all","project","source","experiment","question"].map(x=><button className={filter===x?"active":""} onClick={()=>setFilter(x)} key={x}>{x}</button>)}</div>{compose&&<div className="thread-compose"><div className="section-row"><div><div className="reader-kicker">NEW THREAD</div><h3>Attach the conversation to something real</h3></div><button onClick={()=>setCompose(false)}>Close</button></div><div className="compose-grid"><label>Attached to<select value={draft.anchorType} onChange={e=>setDraft(d=>({...d,anchorType:e.target.value,anchorTitle:""}))}><option value="question">Question</option><option value="project">Project</option><option value="source">Source</option><option value="experiment">Experiment</option></select></label><label>Specific anchor{draft.anchorType==="project"&&projects.length?<select value={draft.anchorTitle} onChange={e=>setDraft(d=>({...d,anchorTitle:e.target.value}))}><option value="">Choose a project…</option>{projects.map(p=><option key={p.id}>{p.name}</option>)}</select>:draft.anchorType==="source"&&docs.length?<select value={draft.anchorTitle} onChange={e=>setDraft(d=>({...d,anchorTitle:e.target.value}))}><option value="">Choose a source…</option>{docs.map(d=><option key={d.id}>{d.name}</option>)}</select>:<input value={draft.anchorTitle} onChange={e=>setDraft(d=>({...d,anchorTitle:e.target.value}))} placeholder="Name the experiment, question, or context"/>}</label></div><label>Thread title<input value={draft.title} onChange={e=>setDraft(d=>({...d,title:e.target.value}))} placeholder="What are you trying to understand or improve?"/></label><label>Context<textarea value={draft.body} onChange={e=>setDraft(d=>({...d,body:e.target.value}))} rows={5} placeholder="What have you observed, tried, or read? Where exactly are you uncertain?"/></label><label>Tags<input value={draft.tags} onChange={e=>setDraft(d=>({...d,tags:e.target.value}))} placeholder="soil chemistry, experiment design"/></label><div className="upload-screen"><div><b>Add evidence or context</b><span>PDF, DOCX, PPTX, JPG, PNG, WebP, MP4, or WebM. Up to 5 files.</span></div><label className="upload-button">Choose files<input type="file" multiple accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.webp,.mp4,.webm" onChange={e=>screenUploads(e.target.files)} /></label>{pendingFiles.map((f,i)=><div className={`upload-row ${f.status}`} key={`${f.name}_${i}`}><div><b>{f.name}</b><span>{(f.size/1024/1024).toFixed(1)} MB</span></div><strong>{f.status==="approved"?"Preflight passed":f.reason}</strong></div>)}{pendingFiles.length>0&&<label className="rights-check"><input type="checkbox" checked={attested} onChange={e=>setAttested(e.target.checked)}/> I have permission to share these files. They contain no exposed personal data, unsafe content, or unauthorised copyrighted material.</label>}<p>Automated demo screening checks format, size, post context, and filenames. Production release also requires server-side malware scanning and media moderation.</p></div><button className="publish-thread" onClick={create} disabled={screening||pendingFiles.some(f=>f.status==="rejected")||(pendingFiles.length&&!attested)}>{screening?"Screening post…":"Submit for screening"}</button></div>}<div className="thread-list">{shown.map(t=><article className={`thread-row ${t.reported?"reported":""}`} key={t.id} onClick={()=>setSelected(t.id)}><div className="thread-anchor"><span>{t.anchorType}</span>{t.anchorTitle}</div><h2>{t.title}</h2><p>{t.body}</p><div className="thread-row-foot"><div className="thread-author"><b>{t.author}</b><span>{t.role}</span></div><div>{t.attachments?.length?`${t.attachments.length} attachments / `:""}{t.replies?.length||0} responses / {t.useful||0} useful</div></div>{t.reported&&<div className="moderation-note">Queued for moderation review in this demo.</div>}</article>)}</div></div>;
}

const PROJECT_TYPES=[
  {id:"self-study",name:"Self-study",desc:"Build durable understanding around a subject"},
  {id:"passion",name:"Passion project",desc:"Turn curiosity into something you can make or test"},
  {id:"workshop",name:"Workshop",desc:"Design a learning experience for other people"},
  {id:"forum",name:"Forum or gathering",desc:"Convene a focused exchange around a real question"},
  {id:"career",name:"Career plan",desc:"Develop evidence, skills, and relationships toward a direction"},
];
function ProjectWizard({T,onCancel,onCreate,busy}){
  const[step,setStep]=useState(0);const[data,setData]=useState({type:"",name:"",goal:"",duration:"4 weeks",difficulty:"balanced",resources:"",milestones:true});
  const set=(k,v)=>setData(d=>({...d,[k]:v}));const valid=[data.type,data.name.trim()&&data.goal.trim(),data.duration][step];
  return <div className="project-wizard"><div className="wizard-progress"><span style={{width:`${((step+1)/3)*100}%`}}/></div><div className="reader-kicker">NEW PROJECT / {step+1} OF 3</div>{step===0&&<><h2>What kind of journey is this?</h2><p>Choose the closest shape. You can change it later.</p><div className="project-type-grid">{PROJECT_TYPES.map(t=><button key={t.id} className={data.type===t.id?"selected":""} onClick={()=>set("type",t.id)}><b>{t.name}</b><span>{t.desc}</span></button>)}</div></>}{step===1&&<><h2>What do you want to become capable of?</h2><p>Name the outcome in your own words. Mycel will plan backward from it.</p><label>Project name<input value={data.name} onChange={e=>set("name",e.target.value)} placeholder="e.g. A field guide to soil phosphorus"/></label><label>End goal<textarea value={data.goal} onChange={e=>set("goal",e.target.value)} placeholder="By the end, I want to be able to…" rows={5}/></label></>}{step===2&&<><h2>Shape a realistic path.</h2><p>These details help Mycel avoid giving you a generic plan.</p><div className="wizard-fields"><label>Time horizon<select value={data.duration} onChange={e=>set("duration",e.target.value)}><option>1 week</option><option>2 weeks</option><option>4 weeks</option><option>8 weeks</option><option>One semester</option><option>Open-ended</option></select></label><label>Challenge level<select value={data.difficulty} onChange={e=>set("difficulty",e.target.value)}><option value="gentle">Gentle</option><option value="balanced">Balanced</option><option value="ambitious">Ambitious</option></select></label></div><label>Resources, equipment, or constraints<textarea value={data.resources} onChange={e=>set("resources",e.target.value)} placeholder="Equipment available, weekly hours, deadlines, people who can help…" rows={4}/></label><label className="check-row"><input type="checkbox" checked={data.milestones} onChange={e=>set("milestones",e.target.checked)}/> Draft a milestone map and today’s first steps</label></>}<div className="wizard-actions"><button onClick={step?()=>setStep(s=>s-1):onCancel}>Back</button>{step<2?<button className="primary" disabled={!valid} onClick={()=>setStep(s=>s+1)}>Continue</button>:<button className="primary" disabled={busy} onClick={()=>onCreate(data)}>{busy?"Growing the project…":"Create project"}</button>}</div></div>;
}

function ConnectTabContent({T,notes,setNotes,deadlines,setDeadlines,addDeadline,setup,projects:projectsProp,setProjects:setProjectsProp,tasks,setTasks,docs}){
  // Lightweight Projects: group notes by topic. Supports the core loop --
  // notes in the same project can be connected across units. No milestones/tasks/files/social.
  const[_projects,_setProjects]=useState([]);
  const projects=projectsProp||_projects;
  const setProjectsBase=setProjectsProp||_setProjects;
  const[activeProject,setActiveProject]=useState(null);
  const[showNew,setShowNew]=useState(false);
  const[creating,setCreating]=useState(false);
  const[thought,setThought]=useState("");const[milestone,setMilestone]=useState("");const[busyCapture,setBusyCapture]=useState("");const[urgency,setUrgency]=useState("this-week");const[planBusy,setPlanBusy]=useState(false);
  const[startingPoint,setStartingPoint]=useState("");const[planDraft,setPlanDraft]=useState([]);const[planResources,setPlanResources]=useState([]);const[manualTask,setManualTask]=useState({text:"",description:"",due:"",tier:1,effort:"30 min",notes:""});
  const[projectInput,setProjectInput]=useState("");const[projectBusy,setProjectBusy]=useState(false);const[completionReflection,setCompletionReflection]=useState("");const[showComplete,setShowComplete]=useState(false);
  const db=window.storage;

  useEffect(()=>{
    if(!projectsProp){(async()=>{try{const r=await db?.get("mycel_projects");if(r?.value)_setProjects(JSON.parse(r.value));}catch{}})();}
  },[]);

  const saveProjects=async(p)=>{setProjectsBase(p);try{await db?.set("mycel_projects",JSON.stringify(p));}catch{}};

  const createProject=async(data)=>{
    setCreating(true);let map=[];let firstTasks=[];
    if(data.milestones){try{const result=await callAI([{role:"user",content:`Create a milestone map for this learner project. Type: ${data.type}. Name: ${data.name}. Goal: ${data.goal}. Duration: ${data.duration}. Difficulty: ${data.difficulty}. Resources and constraints: ${data.resources||"not specified"}. Make 3-6 outcome-based milestones and 1-3 small actions for today. JSON only: {"milestones":[{"title":"","description":"","successSignal":""}],"todayTasks":["action"]}`}],"You are Mycel, a learning companion that plans for understanding and capable action, not task volume.",900);const parsed=JSON.parse(result.replace(/```json?|```/g,"").trim());map=parsed.milestones||[];firstTasks=parsed.todayTasks||[];}catch{map=[{title:"Clarify the question",description:"Define what a successful outcome will let you explain, make, or decide.",successSignal:"You can state the project question and evidence of success."},{title:"Build and test",description:"Work through the central mechanism or prototype.",successSignal:"You have evidence from practice, observation, or feedback."},{title:"Synthesize",description:"Connect what you found and communicate it in your own words.",successSignal:"Someone else can understand the result and your reasoning."}];firstTasks=["Write the project question in one sentence","List what you already know and what you need to find out"];}}
    const id=`proj_${Date.now()}`;const global=firstTasks.map((text,i)=>({id:`pt_${Date.now()}_${i}`,text,due:new Date().toISOString().slice(0,10),tier:1,done:false,projectId:id,projectName:data.name}));const p={id,name:data.name.trim(),type:data.type,goal:data.goal.trim(),duration:data.duration,difficulty:data.difficulty,resources:data.resources,createdAt:new Date().toISOString(),noteIds:[],docIds:[],thoughts:[],tasks:global.map(t=>t.id),milestone:data.goal,milestones:map.map((m,i)=>({...m,id:`ms_${Date.now()}_${i}`,status:i===0?"active":"upcoming"})),status:"active",chat:[],progressLog:[]};
    const allTasks=[...(tasks||[]),...global];setTasks(allTasks);await db.set("mycel_tk7",allTasks);await saveProjects([...projects,p]);setShowNew(false);setActiveProject(p);setCreating(false);
  };

  const F2=F||{mono:"'DM Mono',monospace"};

  // Project detail: show notes assigned to this project + ability to add existing notes
  if(activeProject){
    const proj=projects.find(p=>p.id===activeProject.id)||activeProject;
    const projNotes=notes.filter(n=>(proj.noteIds||[]).includes(n.id));
    const otherNotes=notes.filter(n=>!(proj.noteIds||[]).includes(n.id));
    const projDocs=(docs||[]).filter(d=>(proj.docIds||[]).includes(d.id));const otherDocs=(docs||[]).filter(d=>!(proj.docIds||[]).includes(d.id));
    const projTasks=(tasks||[]).filter(t=>t.projectId===proj.id);const doneCount=projTasks.filter(t=>t.done).length;const progress=projTasks.length?Math.round(doneCount/projTasks.length*100):0;
    const assign=async(noteId)=>{
      const updated=projects.map(p=>p.id===proj.id?{...p,noteIds:[...(p.noteIds||[]),noteId]}:p);
      await saveProjects(updated);setActiveProject(updated.find(p=>p.id===proj.id));
    };
    const unassign=async(noteId)=>{
      const updated=projects.map(p=>p.id===proj.id?{...p,noteIds:(p.noteIds||[]).filter(i=>i!==noteId)}:p);
      await saveProjects(updated);setActiveProject(updated.find(p=>p.id===proj.id));
    };
    const updateProject=async changes=>{const updated=projects.map(p=>p.id===proj.id?{...p,...changes}:p);await saveProjects(updated);setActiveProject(updated.find(p=>p.id===proj.id));};
    const addThought=async()=>{if(!thought.trim())return;await updateProject({thoughts:[...(proj.thoughts||[]),{id:`th_${Date.now()}`,text:thought.trim(),createdAt:new Date().toISOString()}]});setThought("");};
    const pushTasks=async items=>{const global=(items||[]).map((x,i)=>({id:`pt_${Date.now()}_${i}`,text:x.text||x,description:x.description||"",due:x.due||new Date(Date.now()+(i+1)*86400000).toISOString().slice(0,10),tier:x.tier||1,effort:x.effort||"",notes:x.notes||"",why:x.why||"",done:false,projectId:proj.id,projectName:proj.name}));const all=[...(tasks||[]),...global];setTasks(all);await db.set("mycel_tk7",all);await updateProject({tasks:[...(proj.tasks||[]),...global.map(t=>t.id)]});};
    const addBusy=async()=>{if(!busyCapture.trim())return;const days=urgency==="today"?0:urgency==="tomorrow"?1:5;await pushTasks([{text:busyCapture.trim(),due:new Date(Date.now()+days*86400000).toISOString().slice(0,10),tier:urgency==="today"?1:2}]);setBusyCapture("");};
    const generatePlan=async span=>{const goal=milestone.trim()||proj.goal||proj.milestone;if(!goal)return;setPlanBusy(true);try{const result=await callAI([{role:"user",content:`Project: ${proj.name}\nDesired outcome: ${goal}\nWhere the learner is now: ${startingPoint||"unknown -- begin with a diagnostic task"}\nExisting project context: ${proj.goal}\nResources and constraints: ${proj.resources||"not specified"}\nCreate a realistic ${span} learning/research plan. Tasks must produce understanding, evidence, practice, or a useful artifact. Suggest at most 3 reputable, directly relevant learning resources; prefer official documentation, universities, and open educational material. JSON only: {"tasks":[{"text":"clear action","description":"what to do","why":"how it advances the outcome","dueOffset":0,"tier":1,"effort":"30 min"}],"resources":[{"title":"","url":"https://...","reason":""}]}. Maximum ${span==="1-day"?4:7} tasks.`}],"You are Mycel, a calm project companion. Adapt to the learner's current level and do not assume expertise.",1100);const parsed=JSON.parse(result.replace(/```json?|```/g,"").trim());setPlanDraft((parsed.tasks||[]).map(t=>({...t,due:new Date(Date.now()+(t.dueOffset||0)*86400000).toISOString().slice(0,10)})));setPlanResources(parsed.resources||[]);}catch{setPlanDraft([{text:`Clarify your current level for: ${goal}`,description:"Write what you can already do, where you get stuck, and one example that tests your current understanding.",why:"A useful plan needs a truthful starting point.",due:new Date().toISOString().slice(0,10),tier:1,effort:"20 min"}]);setPlanResources([]);}setPlanBusy(false);};
    const approvePlan=async()=>{await updateProject({milestone:milestone.trim()||proj.milestone||proj.goal,recommendedResources:[...(proj.recommendedResources||[]),...planResources]});await pushTasks(planDraft);setPlanDraft([]);setPlanResources([]);setMilestone("");setStartingPoint("");};
    const addManualTask=async()=>{if(!manualTask.text.trim())return;await pushTasks([{...manualTask,due:manualTask.due||new Date().toISOString().slice(0,10)}]);setManualTask({text:"",description:"",due:"",tier:1,effort:"30 min",notes:""});};
    const toggleProjectTask=async id=>{const next=(tasks||[]).map(t=>t.id===id?{...t,done:!t.done}:t);setTasks(next);await db.set("mycel_tk7",next);};
    const shareProject=()=>{const data={name:proj.name,milestone:proj.milestone,thoughts:proj.thoughts||[],notes:projNotes.map(n=>({title:n.title,text:n.text,unit:n.unit}))};const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));a.download=`${proj.name.replace(/[^a-z0-9]+/gi,"-").toLowerCase()}-mycel-project.json`;a.click();URL.revokeObjectURL(a.href);};
    const attachDoc=async id=>updateProject({docIds:[...(proj.docIds||[]),id]});
    const setMilestoneStatus=async(id,status)=>updateProject({milestones:(proj.milestones||[]).map(m=>m.id===id?{...m,status}:m),progressLog:[...(proj.progressLog||[]),{id:`log_${Date.now()}`,text:`Milestone marked ${status}`,createdAt:new Date().toISOString()}]});
    const askProject=async()=>{if(!projectInput.trim()||projectBusy)return;const user={id:`pc_${Date.now()}`,role:"user",content:projectInput.trim()};const history=[...(proj.chat||[]),user];setProjectInput("");setProjectBusy(true);await updateProject({chat:history});const context=`PROJECT TYPE: ${proj.type}\nGOAL: ${proj.goal}\nDURATION: ${proj.duration}\nDIFFICULTY: ${proj.difficulty}\nAVAILABLE RESOURCES OR EQUIPMENT: ${proj.resources||"not specified"}\nMILESTONES: ${(proj.milestones||[]).map(m=>`${m.title} (${m.status})`).join("; ")}\nTHOUGHTS: ${(proj.thoughts||[]).slice(-8).map(t=>t.text).join("; ")}\nNOTES: ${projNotes.slice(-6).map(n=>n.text).join("\n").slice(0,6000)}\nDOCUMENTS: ${projDocs.map(d=>d.name+": "+d.text?.slice(0,1200)).join("\n").slice(0,5000)}`;try{const answer=await callAI(history.slice(-10).map(m=>({role:m.role,content:m.content})),`You are the dedicated Mycel companion inside ${proj.name}. You already know this project context:\n${context}\nHelp the learner reason and act. Use available equipment and constraints. If a safe, useful answer genuinely requires missing duration, difficulty, materials, or risk information, ask only the smallest necessary follow-up. Do not repeat setup questions already answered. End with one concrete next move when appropriate.`,1000);await updateProject({chat:[...history,{id:`pc_${Date.now()+1}`,role:"assistant",content:answer}]});}catch{await updateProject({chat:[...history,{id:`pc_${Date.now()+1}`,role:"assistant",content:"I could not reach the AI service. Your question is saved here, so you can return to it when the connection is available."}]});}setProjectBusy(false);};
    const completeProject=async()=>{if(!completionReflection.trim())return;await updateProject({status:"complete",completedAt:new Date().toISOString(),completionReflection:completionReflection.trim(),milestones:(proj.milestones||[]).map(m=>({...m,status:"complete"}))});setShowComplete(false);setCompletionReflection("");};
    return(<div>
      <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:16}}><button onClick={()=>setActiveProject(null)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:7,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer"}}>Back to projects</button><button onClick={shareProject} style={{background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:7,padding:"5px 12px",fontSize:12,color:T.sg,cursor:"pointer"}}>Share project pack</button></div>
      <div className="project-detail-head"><div><div className="project-type-label">{PROJECT_TYPES.find(t=>t.id===proj.type)?.name||"Project"} / {proj.status||"active"}</div><div style={{fontFamily:F.display,fontSize:30,color:T.ink,marginBottom:5}}>{proj.name}</div><p>{proj.goal||"A space for connected work and reflection."}</p></div><div className="project-progress-ring"><b>{progress}%</b><span>{doneCount}/{projTasks.length} tasks</span></div></div>
      <div className="project-progress-track"><span style={{width:`${progress}%`}}/></div>

      {(proj.milestones||[]).length>0&&<section className="milestone-map"><div className="section-row"><div><div className="reader-kicker">MILESTONE MAP</div><h3>The path, not a rigid sequence</h3></div>{proj.status!=="complete"&&<button onClick={()=>setShowComplete(true)}>Complete project</button>}</div>{proj.milestones.map((m,i)=><div className={`milestone-row ${m.status}`} key={m.id}><button onClick={()=>setMilestoneStatus(m.id,m.status==="complete"?"active":"complete")} aria-label={`Mark ${m.title} ${m.status==="complete"?"active":"complete"}`}>{m.status==="complete"?"✓":i+1}</button><div><b>{m.title}</b><p>{m.description}</p>{m.successSignal&&<small>Evidence of progress: {m.successSignal}</small>}</div><span>{m.status}</span></div>)}</section>}

      {projTasks.length>0&&<section className="project-task-list"><div className="reader-kicker">PROJECT TASKS</div><h3>Work currently in motion</h3>{projTasks.map(t=><div className={`project-task-row ${t.done?"done":""}`} key={t.id}><button onClick={()=>toggleProjectTask(t.id)} aria-label={t.done?"Mark incomplete":"Mark complete"}>{t.done?"✓":""}</button><div><b>{t.text}</b>{t.description&&<p>{t.description}</p>}<small>{[t.due&&`Due ${t.due}`,t.effort,t.why].filter(Boolean).join(" / ")}</small>{t.notes&&<em>{t.notes}</em>}</div><span>T{t.tier||1}</span></div>)}</section>}

      <section className="project-ai"><div className="project-ai-head"><div><div className="reader-kicker">PROJECT COMPANION</div><h3>Already holding the whole context</h3></div><span>{projDocs.length} sources / {projNotes.length} notes</span></div><div className="project-chat">{!(proj.chat||[]).length&&<p className="project-ai-empty">Ask about a design decision, experiment, source, next milestone, or where to focus. You do not need to explain the project again.</p>}{(proj.chat||[]).slice(-8).map(m=><div className={`project-message ${m.role}`} key={m.id}>{m.content}</div>)}{projectBusy&&<div className="project-message assistant">Thinking with your project…</div>}</div><div className="project-chat-input"><textarea value={projectInput} onChange={e=>setProjectInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();askProject();}}} placeholder="What are you trying to work through right now?" rows={2}/><button onClick={askProject} disabled={!projectInput.trim()||projectBusy}>Ask</button></div></section>

      <section className="outcome-planner"><div className="reader-kicker">OUTCOME PLANNER</div><div className="planner-head"><div><h3>{proj.milestone||proj.goal||"Choose the next meaningful outcome"}</h3><p>Mycel drafts a plan from your current ability and project context. Nothing becomes a task until you approve it.</p></div></div><div className="planner-inputs"><label>What do you want to become capable of?<textarea value={milestone} onChange={e=>setMilestone(e.target.value)} placeholder="e.g. Become confident using Python for data analysis" rows={3}/></label><label>Where are you now?<textarea value={startingPoint} onChange={e=>setStartingPoint(e.target.value)} placeholder="What can you already do? Where do you get stuck? What have you tried?" rows={3}/></label></div><div className="project-actions plan-buttons"><button onClick={()=>generatePlan("1-day")} disabled={planBusy}>{planBusy?"Drafting…":"Draft one-day plan"}</button><button onClick={()=>generatePlan("1-week")} disabled={planBusy}>{planBusy?"Drafting…":"Draft one-week plan"}</button></div>{planDraft.length>0&&<div className="plan-preview"><div className="preview-head"><div><div className="reader-kicker">PLAN PREVIEW</div><h4>Review before adding anything</h4></div><button onClick={()=>{setPlanDraft([]);setPlanResources([]);}}>Discard</button></div>{planDraft.map((t,i)=><div className="preview-task" key={i}><div><b>{t.text}</b><p>{t.description}</p>{t.why&&<small>Why this matters: {t.why}</small>}</div><span>{t.effort||""}<br/>{t.due}</span></div>)}{planResources.length>0&&<div className="preview-resources"><div className="reader-kicker">SUGGESTED RESOURCES</div>{planResources.map((r,i)=><a href={r.url} target="_blank" rel="noreferrer" key={i}><b>{r.title}</b><span>{r.reason}</span></a>)}</div>}<button className="approve-plan" onClick={approvePlan}>Approve and add to Project + Daily</button></div>}</section>

      <div className="project-companion-grid"><section className="manual-task"><div className="reader-kicker">ADD A PROJECT TASK</div><h3>Capture the work with enough context</h3><input value={manualTask.text} onChange={e=>setManualTask(t=>({...t,text:e.target.value}))} placeholder="Task title"/><textarea value={manualTask.description} onChange={e=>setManualTask(t=>({...t,description:e.target.value}))} placeholder="What needs to be done, and what would done look like?" rows={3}/><div className="manual-task-fields"><input type="date" value={manualTask.due} onChange={e=>setManualTask(t=>({...t,due:e.target.value}))}/><select value={manualTask.tier} onChange={e=>setManualTask(t=>({...t,tier:+e.target.value}))}><option value={1}>Core priority</option><option value={2}>Applied</option><option value={3}>Extended</option></select><input value={manualTask.effort} onChange={e=>setManualTask(t=>({...t,effort:e.target.value}))} placeholder="Estimated effort"/></div><textarea value={manualTask.notes} onChange={e=>setManualTask(t=>({...t,notes:e.target.value}))} placeholder="Links, materials, dependencies, or notes" rows={2}/><button onClick={addManualTask} disabled={!manualTask.text.trim()}>Add to Project + Daily</button></section><section className="project-companion busy-window"><div className="reader-kicker">BUSY WINDOW</div><h3>Drop it here. Organize it later.</h3><textarea value={busyCapture} onChange={e=>setBusyCapture(e.target.value)} placeholder="Describe the task in whatever words you have time for…" rows={5}/><div className="project-actions"><select value={urgency} onChange={e=>setUrgency(e.target.value)}><option value="today">Today</option><option value="tomorrow">Tomorrow</option><option value="this-week">This week</option></select><button onClick={addBusy}>Add to Daily</button></div></section></div>
      <section className="thought-stream"><div className="reader-kicker">THINK ALOUD</div><textarea value={thought} onChange={e=>setThought(e.target.value)} placeholder="A question, observation, doubt, or connection…" rows={3}/><button onClick={addThought}>Keep this thought</button>{[...(proj.thoughts||[])].reverse().slice(0,5).map(t=><p key={t.id}>{t.text}</p>)}</section>

      <section className="project-sources"><div className="reader-kicker">PROJECT SOURCES</div><h3>Documents this project can think with</h3>{projDocs.map(d=><div className="source-row" key={d.id}><b>{d.name}</b><span>{d.kind||"reading"}</span></div>)}{(proj.recommendedResources||[]).map((r,i)=><a className="resource-row" href={r.url} target="_blank" rel="noreferrer" key={`${r.url}_${i}`}><b>{r.title}</b><span>{r.reason}</span></a>)}{otherDocs.length>0&&<select defaultValue="" onChange={e=>{if(e.target.value)attachDoc(e.target.value);e.target.value="";}}><option value="">Link a library document…</option>{otherDocs.map(d=><option value={d.id} key={d.id}>{d.name}</option>)}</select>}{!docs?.length&&<p>Add readings in the Library, then link them here so the project companion can use them.</p>}</section>

      {projNotes.map(n=>(
        <div key={n.id} style={{marginBottom:8,padding:"12px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10}}>
          <div style={{display:"flex",justifyContent:"space-between",gap:8,marginBottom:4}}>
            <span style={{fontSize:13,fontWeight:600,color:T.ink}}>{n.title||"Note"}</span>
            <button onClick={()=>unassign(n.id)} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:11,flexShrink:0}}>remove</button>
          </div>
          <p style={{margin:0,fontSize:12,color:T.body,lineHeight:1.55,maxHeight:60,overflow:"hidden"}}>{n.text}</p>
          {n.unit&&<span style={{fontFamily:F2.mono,fontSize:8,color:T.sg,marginTop:4,display:"inline-block"}}>{n.unit}</span>}
        </div>
      ))}
      {!projNotes.length&&<div style={{padding:"30px 0",textAlign:"center",fontFamily:F2.mono,fontSize:11,color:T.faint}}>No notes yet. Add notes below to gather them here.</div>}

      {otherNotes.length>0&&<div style={{marginTop:20}}>
        <div style={{fontFamily:F2.mono,fontSize:9,color:T.muted,marginBottom:8}}>ADD A NOTE TO THIS PROJECT</div>
        {otherNotes.slice(0,8).map(n=>(
          <button key={n.id} onClick={()=>assign(n.id)} style={{display:"block",width:"100%",textAlign:"left",marginBottom:6,padding:"9px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,cursor:"pointer",fontSize:12,color:T.body}}>
            + {n.title||n.text?.slice(0,60)}
          </button>
        ))}
      </div>}
      {proj.status==="complete"&&<div className="completion-memory"><div className="reader-kicker">JOURNEY REFLECTION</div><h3>What this project changed</h3><p>{proj.completionReflection}</p></div>}
      {showComplete&&<div className="reflection-backdrop"><div className="reflection-dialog"><div className="reader-kicker">COMPLETE THE JOURNEY</div><h2>What became possible because you did this?</h2><p>Reflect on what changed in your understanding, what surprised you, and what you would carry into the next project.</p><textarea autoFocus value={completionReflection} onChange={e=>setCompletionReflection(e.target.value)} rows={6} placeholder="At the beginning I thought… Now I can… The part that changed me was…"/><div className="dialog-actions"><button className="quiet-button" onClick={()=>setShowComplete(false)}>Keep working</button><button className="primary-button" onClick={completeProject} disabled={!completionReflection.trim()}>Complete with reflection</button></div></div></div>}
    </div>);
  }

  // Project list
  return(<div>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18}}>
      <div>
        <div style={{fontFamily:F.display,fontSize:26,color:T.ink}}>Projects</div>
        <div style={{fontFamily:F2.mono,fontSize:11,color:T.muted,marginTop:2}}>Gather notes by topic, then look for the threads between them</div>
      </div>
      <button onClick={()=>setShowNew(true)} style={{background:T.am,border:"none",borderRadius:9,padding:"8px 15px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ New</button>
    </div>

    {showNew&&<ProjectWizard T={T} onCancel={()=>setShowNew(false)} onCreate={createProject} busy={creating}/>} 

    {!projects.length&&!showNew&&<div style={{padding:"50px 0",textAlign:"center"}}>
      <div style={{fontSize:14,color:T.ink,fontWeight:600,marginBottom:6}}>No projects yet</div>
      <div style={{fontFamily:F2.mono,fontSize:11,color:T.faint,maxWidth:320,margin:"0 auto",lineHeight:1.6}}>A project is a place to gather notes on one theme, then Mycel helps you see how they connect across your units.</div>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
      {projects.map(p=>{const pt=(tasks||[]).filter(t=>t.projectId===p.id),done=pt.filter(t=>t.done).length,pct=pt.length?Math.round(done/pt.length*100):0;return(
        <div key={p.id} className="project-list-card" onClick={()=>setActiveProject(p)}>
          <div className="project-card-top"><span>{PROJECT_TYPES.find(t=>t.id===p.type)?.name||"Project"}</span><small>{p.status||"active"}</small></div><div className="project-card-title">{p.name}</div><p>{p.goal||"Gathering connected work and reflection."}</p><div className="project-mini-progress"><span style={{width:`${pct}%`}}/></div><div className="project-card-meta">{pct}% journey / {(p.noteIds||[]).length} notes / {(p.docIds||[]).length} sources</div>
        </div>
      )})}
    </div>
  </div>);
}

// â”€â”€ PROFILE TAB â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function ProfileTab({T,setup,survey,streak,sessions,notes,tasks,setScreen}){
  const totalQ=sessions.reduce((a,s)=>a+(s.questions||0),0);
  const totalB=sessions.reduce((a,s)=>a+(s.branches||0),0);
  const completedTasks=tasks.filter(t=>t.done).length;
  const surveyLabels={
    goal:"Primary goal",challenge:"Main challenge",style:"Learning style",year:"Year",symbia:"Research interest"
  };
  return(<div>
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em"}}>Profile</div>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:2}}>Your learning identity and study pattern</div>
    </div>

    {/* Identity */}
    <div style={{padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:13,marginBottom:16}}>
      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
        <div style={{width:48,height:48,borderRadius:"50%",background:T.am,display:"flex",alignItems:"center",justifyContent:"center",color:"#FFF",fontSize:20,fontWeight:700}}>
          {(setup?.name||"S")[0].toUpperCase()}
        </div>
        <div>
          <div style={{fontSize:16,fontWeight:700,color:T.ink}}>{setup?.name||"Student"}</div>
          <div style={{fontFamily:F.mono,fontSize:10,color:T.muted,marginTop:2}}>{survey?.year||"Roseworthy Campus"} . {setup?.fields?.length||0} units</div>
        </div>
        <StreakRing streak={streak} T={T} size={52}/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
        {[{l:"Questions asked",v:totalQ,c:T.am},{l:"Follow-up branches",v:totalB,c:T.oc},{l:"Notes saved",v:notes.length,c:(T.net||T.sg)},{l:"Tasks completed",v:completedTasks,c:T.sg},{l:"Day streak",v:streak,c:T.am},{l:"Units enrolled",v:setup?.fields?.length||0,c:T.muted}].map(s=>(
          <div key={s.l} style={{padding:"10px",background:T.raised,borderRadius:9,textAlign:"center"}}>
            <div style={{fontSize:18,fontWeight:700,color:s.c}}>{s.v}</div>
            <div style={{fontFamily:F.mono,fontSize:8,color:T.muted,marginTop:2,lineHeight:1.2}}>{s.l}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Units */}
    <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,letterSpacing:"0.1em",marginBottom:10}}>ENROLLED UNITS</div>
    <div style={{display:"flex",flexWrap:"wrap",gap:7,marginBottom:18}}>
      {(setup?.fields||[]).map(f=>(
        <div key={f.id} style={{display:"flex",alignItems:"center",gap:7,padding:"8px 12px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9}}>
          <div><div style={{fontFamily:F.mono,fontSize:8,color:T.am}}>{f.code}</div><div style={{fontSize:11,color:T.body}}>{f.label}</div></div>
        </div>
      ))}
    </div>

    {/* Survey answers */}
    {survey&&<>
      <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,letterSpacing:"0.1em",marginBottom:10}}>LEARNING IDENTITY PROFILE</div>
      <div style={{padding:"12px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11,marginBottom:18}}>
        {Object.entries(survey).map(([k,v])=>surveyLabels[k]&&(
          <div key={k} style={{display:"flex",gap:10,padding:"6px 0",borderBottom:`1px solid ${T.d2}`}}>
            <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,width:120,flexShrink:0}}>{surveyLabels[k]}</div>
            <div style={{fontSize:12,color:T.body}}>{v}</div>
          </div>
        ))}
      </div>
    </>}

    {/* 14-day pattern */}
    <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,letterSpacing:"0.1em",marginBottom:10}}>STUDY PATTERN (14 DAYS)</div>
    <div style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11,marginBottom:18}}>
      <PatternTracker sessions={sessions} T={T}/>
    </div>

    {/* Actions */}
    <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,letterSpacing:"0.1em",marginBottom:10}}>ACCOUNT</div>
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {[
        {label:"Retake learning survey",action:()=>setScreen("survey"),color:T.body},
        {label:"Change enrolled units",action:()=>setScreen("onboard"),color:T.body},
      ].map(a=>(
        <button key={a.label} onClick={a.action} style={{padding:"10px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,fontSize:13,color:a.color,cursor:"pointer",textAlign:"left",fontFamily:F.ui}}>
          {a.label}
        </button>
      ))}
    </div>
  </div>);
}

// â”€â”€ FIRST TIME GUIDE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FirstTimeGuide({T,onClose,onStartLearn,onStartLab}){
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(22,19,12,0.7)",backdropFilter:"blur(10px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:600,padding:20}}>
      <div style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:18,width:"100%",maxWidth:520,padding:28}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
          <MycelIcon size={28} color={T.am}/>
          <div style={{fontSize:20,fontWeight:700,color:T.ink,letterSpacing:"-0.025em"}}>Welcome to Mycel</div>
        </div>
        <p style={{fontSize:14,color:T.muted,marginBottom:24,lineHeight:1.65}}>Mycel connects concepts across your units as you learn. The more you ask, the more your knowledge network grows.</p>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,letterSpacing:"0.1em",marginBottom:12}}>WHAT WOULD YOU LIKE TO DO FIRST?</div>
        <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
          {[
            {title:"Ask a question from your last lecture",sub:"Start with something you didn't fully understand today",action:onStartLearn,color:T.am},
            {title:"Prepare for an upcoming lab",sub:"Get a mechanism primer before you walk in",action:onStartLab,color:T.sg},
            {title:"Upload notes to annotate and ask about",sub:"Paste lecture notes or a reading passage",action:onClose,color:T.oc},
          ].map(o=>(
            <button key={o.title} onClick={o.action} style={{display:"block",padding:"12px 14px",background:T.raised,border:`1px solid ${T.bd}`,borderRadius:8,cursor:"pointer",textAlign:"left",transition:"all 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.amBd} onMouseLeave={e=>e.currentTarget.style.borderColor=T.bd}>
              <div>
                <div style={{fontSize:13.5,fontWeight:600,color:T.ink,marginBottom:3}}>{o.title}</div>
                <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>{o.sub}</div>
              </div>
            </button>
          ))}
        </div>
        <button onClick={onClose} style={{width:"100%",padding:"10px",background:"none",border:`1px solid ${T.bd}`,borderRadius:9,fontSize:13,color:T.muted,cursor:"pointer",fontFamily:F.ui}}>
          Skip -- I'll explore on my own
        </button>
      </div>
    </div>
  );
}

// â”€â”€ MAIN APP â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

// â”€â”€ LIVE NETWORK â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// â”€â”€ KNOWLEDGE NETWORK (full view) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// The signature element: your concepts as a living mycelium. Nodes = concepts,
// sized by how often they recur. Edges = co-occurrence. Cross-unit links glow gold.
function KnowledgeNetwork({graph,T,F,setup,onExplore}){
  const[tick,setTick]=useState(0);
  const[sel,setSel]=useState(null);
  const[dims,setDims]=useState({w:760,h:520});
  const wrapRef=useRef(null);

  useEffect(()=>{const id=setInterval(()=>setTick(t=>t+1),50);return()=>clearInterval(id);},[]);
  useEffect(()=>{
    const measure=()=>{if(wrapRef.current){const r=wrapRef.current.getBoundingClientRect();setDims({w:r.width,h:Math.max(420,Math.min(560,r.width*0.72))});}};
    measure();window.addEventListener("resize",measure);return()=>window.removeEventListener("resize",measure);
  },[]);

  const nodes=[...graph].sort((a,b)=>b.w-a.w).slice(0,24);

  if(!nodes.length)return(
    <div style={{padding:"80px 20px",textAlign:"center"}}>
      <div style={{fontSize:15,color:T.ink,fontWeight:600,marginBottom:8}}>Your knowledge network is empty</div>
      <div style={{fontFamily:F.mono,fontSize:12,color:T.muted,lineHeight:1.7,maxWidth:360,margin:"0 auto"}}>
        Every concept you explore in Learn becomes a node. Concepts that appear together grow threads between them. Ask Mycel something to plant the first node.
      </div>
    </div>
  );

  const {w,h}=dims;
  const cx=w/2,cy=h/2;
  const mx=Math.max(...nodes.map(n=>n.w),1);

  // Assign a stable unit/colour per node from its label hash (proxy until real unit tagging)
  const palette=[T.am,T.sg,T.oc,T.pu,T.gold];
  const unitOf=(label)=>{let s=0;for(const c of label)s+=c.charCodeAt(0);return s;};
  const colorOf=(label)=>palette[unitOf(label)%palette.length];

  // Position nodes: largest at centre, others on concentric rings (deterministic by index)
  const pos=nodes.map((n,i)=>{
    if(i===0)return{x:cx,y:cy};
    const ring=i<7?1:i<15?2:3;
    const inRing=i<7?i-1:i<15?i-7:i-15;
    const ringCount=ring===1?6:ring===2?8:10;
    const radius=ring*Math.min(w,h)*0.16;
    const a=(inRing/ringCount)*2*Math.PI + ring*0.6 + tick*0.0008*(ring%2?1:-1);
    return{x:cx+Math.cos(a)*radius,y:cy+Math.sin(a)*radius};
  });

  // Edges: connect each node to the centre + to its nearest higher-weight neighbour.
  // Cross-unit edges (different colour) glow gold.
  const edges=[];
  nodes.forEach((n,i)=>{
    if(i===0)return;
    const parent=Math.max(0,Math.floor((i-1)/2)); // tree-ish backbone
    const crossUnit=colorOf(n.label)!==colorOf(nodes[parent].label);
    edges.push({from:parent,to:i,crossUnit});
  });

  return(
    <div ref={wrapRef} style={{width:"100%"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-end",marginBottom:6,flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em"}}>Knowledge Network</div>
          <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:2}}>{nodes.length} concepts / gold threads are cross-unit connections</div>
        </div>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.faint}}>tap a node to explore</div>
      </div>

      <div style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:16,overflow:"hidden",position:"relative"}}>
        <svg width={w} height={h} style={{display:"block"}}>
          {/* edges */}
          {edges.map((e,i)=>{
            const a=pos[e.from],b=pos[e.to];
            const col=e.crossUnit?(T.gold||T.am):(T.net||T.sg);
            const op=e.crossUnit?"55":"22";
            return(<line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
              stroke={`${col}${op}`} strokeWidth={e.crossUnit?1.6:0.8}
              strokeDasharray={e.crossUnit?"none":"4 4"}/>);
          })}
          {/* nodes */}
          {nodes.map((n,i)=>{
            const p=pos[i];
            const rad=6+(n.w/mx)*16;
            const phase=(i*0.5+tick*0.04)%(2*Math.PI);
            const pulse=1+Math.sin(phase)*0.08;
            const col=colorOf(n.label);
            const isSel=sel===i;
            return(<g key={n.id} style={{cursor:"pointer"}} onClick={()=>setSel(isSel?null:i)}>
              <circle cx={p.x} cy={p.y} r={(rad+8)*pulse} fill={`${col}0A`}/>
              <circle cx={p.x} cy={p.y} r={rad*pulse} fill={`${col}28`}
                stroke={col} strokeWidth={isSel?2.4:1.2}
                style={{transition:"r 0.6s ease,stroke-width 0.2s ease"}}/>
              {(rad>10||isSel)&&<text x={p.x} y={p.y+rad*pulse+11} textAnchor="middle"
                style={{fontFamily:F.mono,fontSize:isSel?10:8,fill:isSel?T.ink:T.muted,fontWeight:isSel?600:400}}>
                {n.label.slice(0,16)}</text>}
            </g>);
          })}
        </svg>

        {/* Selected node detail */}
        {sel!==null&&nodes[sel]&&(
          <div style={{position:"absolute",bottom:12,left:12,right:12,padding:"12px 14px",
            background:T.sf,border:`1px solid ${colorOf(nodes[sel].label)}40`,borderRadius:12,
            display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,
            backdropFilter:"blur(8px)",animation:"fadeUp 0.25s ease"}}>
            <div>
              <div style={{fontSize:14,fontWeight:600,color:T.ink}}>{nodes[sel].label}</div>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>appeared {nodes[sel].w} {nodes[sel].w===1?"time":"times"} in your learning</div>
            </div>
            <button onClick={()=>onExplore&&onExplore(nodes[sel].label)}
              style={{background:colorOf(nodes[sel].label),border:"none",borderRadius:8,
                padding:"7px 14px",color:"#FFF",fontSize:12,fontWeight:600,cursor:"pointer",flexShrink:0}}>
              Explore this
            </button>
          </div>
        )}
      </div>

      {/* Legend / insight */}
      <div style={{marginTop:12,padding:"11px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:11}}>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:6}}>READING YOUR NETWORK</div>
        <p style={{margin:0,fontSize:12,color:T.body,lineHeight:1.6}}>
          Bigger nodes are concepts you return to most. <span style={{color:T.gold||T.am,fontWeight:600}}>Gold threads</span> link concepts from different units -- these are the cross-domain connections that turn separate facts into understanding. A dense gold web means you are thinking across your whole degree, not subject by subject.
        </p>
      </div>
    </div>
  );
}

function LiveNetwork({nodes,T,width=174,height=148}){
  const[tick,setTick]=useState(0);
  useEffect(()=>{
    const id=setInterval(()=>setTick(t=>t+1),2000);
    return()=>clearInterval(id);
  },[]);
  if(!nodes.length)return(
    <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,color:T.faint,fontFamily:F.mono,textAlign:"center",lineHeight:1.5}}>
      ask questions<br/>to grow your<br/>network
    </div>
  );
  const mx=Math.max(...nodes.map(x=>x.w),1);
  const cx=width/2;const cy=height/2;
  return(
    <svg width={width} height={height} style={{overflow:"visible"}}>
      {nodes.slice(0,10).map((n,i,arr)=>{
        const a=(i/arr.length)*2*Math.PI-Math.PI/2;
        const r=54;
        const d=n.w===mx?0:r*(0.4+0.6*(1-n.w/mx));
        const x=cx+(n.w===mx?0:Math.cos(a)*d);
        const y=cy+(n.w===mx?0:Math.sin(a)*d);
        const rad=3+(n.w/mx)*5;
        const phase=(i*0.7+tick*0.1)%(2*Math.PI);
        const pulse=1+Math.sin(phase)*0.15;
        const netColor=T.net||T.sg;
        const goldColor=T.gold||T.am;
        return(<g key={n.id}>
          {i>0&&<line x1={cx} y1={cy} x2={x} y2={y}
            stroke={n.w===mx?`${goldColor}30`:`${netColor}20`}
            strokeWidth={n.w===mx?1.2:0.6}
            strokeDasharray={n.w===mx?"none":"3 3"}/>}
          <circle cx={x} cy={y} r={(rad+5)*pulse} fill={n.w===mx?`${goldColor}08`:`${netColor}06`}/>
          <circle cx={x} cy={y} r={rad*pulse} fill={n.w===mx?`${goldColor}25`:`${netColor}18`}
            stroke={n.w===mx?goldColor:netColor} strokeWidth={0.9} style={{transition:"r 0.8s ease"}}/>
          <text x={x} y={y+rad*pulse+9} textAnchor="middle"
            style={{fontFamily:F.mono,fontSize:7.5,fill:T.muted}}>{n.label.slice(0,10)}</text>
        </g>);
      })}
      {nodes.slice(0,1).map(n=>{
        const phase=tick*0.08;
        const pulse=1+Math.sin(phase)*0.2;
        const goldColor=T.gold||T.am;
        return(<g key={`center-${n.id}`}>
          <circle cx={cx} cy={cy} r={7*pulse} fill={`${goldColor}15`}/>
          <circle cx={cx} cy={cy} r={4*pulse} fill={`${goldColor}35`} stroke={goldColor} strokeWidth={1.2}/>
        </g>);
      })}
    </svg>
  );
}

export default function Mycel(){
  const[theme,setTheme]=useState("light");
  const[ready,setReady]=useState(false);
  const[screen,setScreen]=useState("survey"); // survey|onboard|app
  const[survey,setSurvey]=useState(null);
  const[setup,setSetup]=useState(null);
  const[msgs,setMsgs]=useState([]);
  const[graph,setGraph]=useState([]);
  const[notes,setNotes]=useState([]);
  const[tasks,setTasks]=useState([]);
  const[deadlines,setDeadlines]=useState([]);
  const[projects,setProjects]=useState([]); // Research Space projects -- shown in Today
  const[streak,setStreak]=useState(0);
  const[sessions,setSessions]=useState([]);
  const[docs,setDocs]=useState([]);
  const[input,setInput]=useState("");
  const[busy,setBusy]=useState(false);
  const[noteBusy,setNoteBusy]=useState(false);
  const[hl,setHl]=useState(null);
  const[noteModal,setNoteModal]=useState(null);
  const[tab,setTab]=useState("today");
  const[labScreen,setLabScreen]=useState(null);
  const[learnMode,setLearnMode]=useState("explain"); // "explain" | "note"
  const[liveNotes,setLiveNotes]=useState([]); // accumulated note blocks for split panel
  const[showNotePanel,setShowNotePanel]=useState(false); // mobile note panel toggle
  const[studyMode,setStudyMode]=useState("library"); // "library" | "quiz" | "capture"
  const[learnSub,setLearnSub]=useState("chat"); // chat | library | quiz | capture (within Learn layer)
  const[dailyFocus,setDailyFocus]=useState(null); // {understand, connection, fromGap} AI companion suggestion
  const[focusBusy,setFocusBusy]=useState(false);
  const[quizState,setQuizState]=useState("idle"); // "idle"|"loading"|"active"|"listening"|"evaluating"|"report"
  const[quizSession,setQuizSession]=useState(null); // {questions,answers,current,startedAt}
  const[quizReport,setQuizReport]=useState(null); // generated after session
  const[isListening,setIsListening]=useState(false);
  const[transcript,setTranscript]=useState("");
  const[quizSource,setQuizSource]=useState("notes"); // "notes"|"upload"
  const[quizMode,setQuizMode]=useState("voice"); // "voice"|"mcq"
  const[mcqState,setMcqState]=useState("idle"); // idle|loading|active|report
  const[mcqSession,setMcqSession]=useState(null);
  const[mcqReport,setMcqReport]=useState(null); // null|"prelab"|"postlab"
  const[quizTab,setQuizTab]=useState("quiz");
  const[menu,setMenu]=useState(false);
  const[firstTime,setFirstTime]=useState(false);
  const[newTask,setNewTask]=useState({text:"",description:"",tier:1,due:"",unitCode:"",effort:""});
  const[showNewTask,setShowNewTask]=useState(false);
  const[calendarView,setCalendarView]=useState("week");
  const today=new Date().toISOString().slice(0,10);
  const[selDay,setSelDay]=useState(today);
  const endRef=useRef();const inpRef=useRef();
  const T=theme==="light"?L:D;

  useEffect(()=>{(async()=>{
    const h=new Date().getHours();
    const th=await db.get("mycel_theme");setTheme(th||(h>=7&&h<19?"light":"dark"));
    const sv=await db.get("mycel_sv7");const s=await db.get("mycel_s7");
    const m=await db.get("mycel_m7");const g=await db.get("mycel_g7");const n=await db.get("mycel_n7");
    const tk=await db.get("mycel_tk7");const d=await db.get("mycel_d7");const st=await db.get("mycel_st7");
    const sess=await db.get("mycel_sess7");const dc=await db.get("mycel_dc7");const pr=await db.get("mycel_projects");
    if(sv)setSurvey(sv);if(s)setSetup(s);if(m)setMsgs(m);if(g)setGraph(g);if(n)setNotes(n);
    if(tk)setTasks(tk);if(d)setDeadlines(d);if(st)setStreak(st);if(sess)setSessions(sess);if(dc)setDocs(dc);if(pr)setProjects(pr);
    if(s&&sv)setScreen("app");else if(sv&&!s)setScreen("onboard");else setScreen("survey");
    setReady(true);
  })();},[]);

  useEffect(()=>{if(tab==="learn")endRef.current?.scrollIntoView({behavior:"smooth"});},[msgs,tab]);
  const toggleTheme=async()=>{const t=theme==="light"?"dark":"light";setTheme(t);await db.set("mycel_theme",t);};
  const SP=(mode)=>buildSys(setup?.fields||[],graph,setup?.name,survey,mode||learnMode);

  // Companion entry point: AI reads recent notes + knowledge graph + quiz gaps,
  // suggests one thing to understand today + one cross-unit connection to explore.
  const genDailyFocus=async()=>{
    setFocusBusy(true);
    if(!AI_ENABLED){setDailyFocus({understand:"Choose one question from your latest reading or project that you cannot yet explain in your own words.",connection:"",why:""});setFocusBusy(false);return;}
    const recentNotes=notes.slice(-12).map(n=>n.title||n.text?.slice(0,60)).filter(Boolean).join("; ");
    const topConcepts=[...graph].sort((a,b)=>b.w-a.w).slice(0,10).map(n=>n.label).join(", ");
    const units=(setup?.fields||[]).map(f=>`${f.code} (${f.label})`).join(", ");
    let lastGap="";
    try{const r=await window.storage?.get("mycel_last_gap");if(r?.value)lastGap=r.value;}catch{}
    const prompt=`You are Mycel, a learning companion for ${setup?.name||"a student"} studying ${units||"agricultural science"}.

Their recent study topics: ${recentNotes||"nothing yet -- they are just starting"}
Concepts in their knowledge network: ${topConcepts||"none yet"}
${lastGap?"Gap from their last quiz: "+lastGap:""}

Suggest a focus for today. Be specific to THEIR content, not generic. If they have no notes yet, suggest a welcoming starting point.

Respond ONLY in this exact JSON:
{"understand":"One specific concept or question worth understanding today, phrased as an inviting prompt","connection":"One cross-unit connection between two things they are learning that they may not have noticed yet -- name both units/concepts","why":"One short sentence on why this connection matters for real agricultural practice"}`;
    try{
      const res=await fetch(API_URL,{method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({model:"claude-haiku-4-5-20251001",max_tokens:400,
          messages:[{role:"user",content:prompt}]})});
      const data=await res.json();
      const parsed=JSON.parse((data.content?.[0]?.text||"{}").replace(/```json?|```/g,"").trim());
      setDailyFocus(parsed);
    }catch{setDailyFocus({understand:"What did you find most confusing in your last lecture? Start there.",connection:"",why:""});}
    setFocusBusy(false);
  };


  const addToGraph=useCallback((text)=>{
    const cs=extractC(text);
    setGraph(prev=>{const up=[...prev];cs.forEach(c=>{const i=up.findIndex(n=>n.label===c);if(i>=0)up[i]={...up[i],w:up[i].w+1};else up.push({id:`${c}-${Date.now()}-${Math.random()}`,label:c,w:1});});return up.slice(-50);});
  },[]);

  const handleSurvey=async(ans)=>{setSurvey(ans);await db.set("mycel_sv7",ans);setScreen("onboard");};
  const handleSetup=async(data)=>{
    setSetup(data);await db.set("mycel_s7",data);
    const sg=survey?.symbia==="Yes, very much"?" I noticed you're interested in soil restoration, which is exactly where Mycel and Symbia connect most deeply.":"";
    const w={id:Date.now(),role:"assistant",content:`Hi${data.name?" "+data.name:""}! I know your units: ${data.fields.slice(0,3).map(f=>f.code).join(", ")}${data.fields.length>3?` +${data.fields.length-3}`:""}.${sg}\n\nHighlight any part of my answers to branch a follow-up from exactly that point.\n\nWhat do you want to understand?`};
    setMsgs([w]);await db.set("mycel_m7",[w]);setScreen("app");setFirstTime(true);
  };

  const send=async(text,isBranch=false,hlCtx=null)=>{
    if(!text.trim()||busy)return;
    setInput("");setHl(null);
    const um={id:Date.now(),role:"user",content:hlCtx?`On: "${hlCtx}"\n\n${text}`:text,hlCtx,branch:isBranch};
    const nm=[...msgs,um];setMsgs(nm);setBusy(true);
    addToGraph(text);
    const aiId=Date.now()+1;
    // Add streaming message placeholder
    setMsgs(p=>[...p.filter(m=>m.id!==aiId),{id:aiId,role:"assistant",content:"",streaming:true}]);
    let acc="";
    const topics=extractC(text);
    try{
      await streamAI(
        nm.map(m=>({role:m.role,content:m.content})),
        SP(learnMode),
        (token)=>{
          acc+=token;
          setMsgs(p=>p.map(m=>m.id===aiId?{...m,content:acc}:m));
        },
        ()=>{
          const hasCross=/(CHEM|BIOL|SOIL|AGRIC|PLNT|STAT)/.test(acc)&&acc.toLowerCase().includes("connect");
          setMsgs(p=>p.map(m=>m.id===aiId?{...m,content:acc,streaming:false,crossUnit:hasCross}:m));
          addToGraph(acc);
          const tod=sessions.find(s=>s.date===today);
          const upSess=tod?sessions.map(s=>s.date===today?{...s,questions:s.questions+1,branches:s.branches+(isBranch?1:0),topics:[...new Set([...(s.topics||[]),...topics])]}:s):[...sessions,{date:today,questions:1,branches:isBranch?1:0,topics}];
          setSessions(upSess);
          const finalMsgs=[...nm,{id:aiId,role:"assistant",content:acc,streaming:false,crossUnit:hasCross}];
          db.set("mycel_m7",finalMsgs.slice(-70));db.set("mycel_g7",graph);db.set("mycel_sess7",upSess.slice(-60));
          setBusy(false);setTimeout(()=>inpRef.current?.focus(),50);
        }
      );
    }catch{
      setMsgs(p=>p.map(m=>m.id===aiId?{...m,content:"AI is not connected yet. Features that need AI are paused until the /api/chat proxy is running.",streaming:false}:m));
      setBusy(false);
    }
  };

  const genNote=async(msg,req="",mode="single")=>{
    setNoteBusy(true);if(!noteModal)setNoteModal({text:"",msgId:msg.id,mode});
    try{
      let p;
      if(mode==="session"){
        // Synthesize entire conversation so far
        const allAI=msgs.filter(m=>m.role==="assistant"&&m.content);
        const sessionContent=allAI.map((m,i)=>`[Exchange ${i+1}]\n${m.content}`).join("\n\n---\n\n");
        p=`Create comprehensive structured notes synthesizing this entire study session for an Adelaide Agricultural Science student.\n\nThe student has been exploring a topic across multiple exchanges. Identify the core topic, synthesize all concepts discussed, and create a reference note they can use for revision.\n\nFull session:\n${sessionContent}\n\nFormat as:\n## [Main Topic Title]\n\n### Key Concepts\n- **[Term]**: definition and mechanism\n\n### How It Works (Mechanism)\n Step-by-step explanation\n\n### Cross-Unit Connections\n- [Unit A] connects to [Unit B] because...\n\n### Common Exam Mistakes\n- ...\n\n### Practice Questions\n1. ...\n2. ...`;
      } else if(req){
        p=`Regenerate note with this adjustment: ${req}\n\nOriginal content:\n${msg.content}`;
      } else {
        // Single message note
        p=`Create structured reference notes for an Adelaide AgSci student from this explanation:\n\n${msg.content}\n\nFormat:\n## [Concept Title]\nCONCEPT: one-sentence definition\nMECHANISM: step-by-step biological/chemical process\nCROSS-UNIT LINK: which other unit does this appear in and how\nCOMMON EXAM MISTAKE: the most common misconception\nPRACTICE QUESTION: one application question`;
      }
      const r=await callAI([{role:"user",content:p}],SP("note"));
      setNoteModal({text:r,msgId:msg.id,mode});
    }catch{setNoteModal({text:"AI is not connected yet. Features that need AI are paused until the /api/chat proxy is running.",msgId:msg?.id,mode:"single"});}
    finally{setNoteBusy(false);}
  };

  const saveNote=async(text,meta={})=>{
    const nn=[...notes,{id:Date.now(),text,createdAt:new Date().toISOString(),msgId:noteModal?.msgId,...meta}];
    setNotes(nn);
    if(noteModal?.msgId)setMsgs(p=>p.map(m=>m.id===noteModal.msgId?{...m,savedNote:text}:m));
    await db.set("mycel_n7",nn);setNoteModal(null);
  };

  const saveNoteFromLab=async(note)=>{
    const nn=[...notes,{id:Date.now(),text:note.text,title:note.title,template:note.template,createdAt:new Date().toISOString()}];
    setNotes(nn);await db.set("mycel_n7",nn);
  };

  const toggleTask=async(id)=>{const up=tasks.map(t=>t.id===id?{...t,done:!t.done}:t);setTasks(up);await db.set("mycel_tk7",up);if(up.find(t=>t.id===id)?.done){const ns=streak+1;setStreak(ns);await db.set("mycel_st7",ns);}};
  const addTask=async()=>{if(!newTask.text.trim())return;const t={...newTask,id:`t_${Date.now()}`,done:false};const up=[...tasks,t];setTasks(up);await db.set("mycel_tk7",up);setNewTask({text:"",description:"",tier:1,due:"",unitCode:"",effort:""});setShowNewTask(false);};
  const addDeadline=async(d)=>{const up=[...deadlines,d];setDeadlines(up);await db.set("mycel_d7",up);};
  const updateDoc=async(id,changes)=>{const up=docs.map(d=>d.id===id?{...d,...changes}:d);setDocs(up);await db.set("mycel_dc7",up);};
  const uploadFile=async(e)=>{
    const file=e.target.files[0];if(!file)return;
    const lower=file.name.toLowerCase();
    const isDocx=lower.endsWith(".docx");const isPptx=lower.endsWith(".pptx");
    if(isDocx||isPptx){
      try{
        const id=`d_${Date.now()}`;const buf=await file.arrayBuffer();let text="";let pageCount=0;
        if(isDocx){
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.8.0/mammoth.browser.min.js",()=>!!window.mammoth);
          const result=await window.mammoth.extractRawText({arrayBuffer:buf});text=result.value;pageCount=null;
        }else{
          await loadScript("https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js",()=>!!window.JSZip);
          const zip=await window.JSZip.loadAsync(buf);const slides=Object.keys(zip.files).filter(n=>/^ppt\/slides\/slide\d+\.xml$/.test(n)).sort((a,b)=>(+a.match(/\d+/)[0])-(+b.match(/\d+/)[0]));pageCount=slides.length;
          for(let i=0;i<slides.length;i++){const xml=await zip.file(slides[i]).async("text");const parsed=new DOMParser().parseFromString(xml,"application/xml");text+=`\n\nSLIDE ${i+1}\n\n`+[...parsed.getElementsByTagNameNS("http://schemas.openxmlformats.org/drawingml/2006/main","t")].map(n=>n.textContent).join(" ");}
        }
        await fileStore.set(id,file);const doc={id,name:file.name,kind:isDocx?"doc":"slides",hasOriginal:true,pageCount,size:file.size,text:text.slice(0,120000).trim(),annotations:[],sessions:[],vocabulary:[],createdAt:new Date().toISOString(),openCount:0};const up=[...docs,doc];setDocs(up);await db.set("mycel_dc7",up);
      }catch{alert(`Could not extract text from this ${isDocx?"document":"slide deck"}. You can still export it as PDF and upload that version.`);}return;
    }
    const isPDF=file.type==="application/pdf"||file.name.toLowerCase().endsWith(".pdf");
    if(isPDF){
      // Load pdf.js from CDN if not present, then extract text
      try{
        if(!window.pdfjsLib){
          await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
          window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        }
        const buf=await file.arrayBuffer();
        const pdf=await window.pdfjsLib.getDocument({data:buf}).promise;
        let text="";
        const maxPages=Math.min(pdf.numPages,40);
        for(let i=1;i<=maxPages;i++){
          const page=await pdf.getPage(i);
          const tc=await page.getTextContent();
          text+=`\n\nPAGE ${i}\n\n`+tc.items.map(it=>it.str).join(" ");
        }
        const id=`d_${Date.now()}`;
        await fileStore.set(id,file);
        const doc={id,name:file.name,kind:"pdf",hasOriginal:true,pageCount:pdf.numPages,size:file.size,text:text.slice(0,120000).trim(),annotations:[],sessions:[],createdAt:new Date().toISOString(),openCount:0};
        const up=[...docs,doc];setDocs(up);await db.set("mycel_dc7",up);
      }catch(err){alert("Could not read this PDF. It may be scanned images rather than text. Try copying the text and using Paste instead.");}
      return;
    }
    const reader=new FileReader();
    reader.onload=async(ev)=>{const doc={id:`d_${Date.now()}`,name:file.name,kind:"text",text:(ev.target.result||"").slice(0,120000),annotations:[],sessions:[],createdAt:new Date().toISOString(),openCount:0};const up=[...docs,doc];setDocs(up);await db.set("mycel_dc7",up);};
    reader.readAsText(file);
  };
  const deleteDoc=async(id)=>{const up=docs.filter(d=>d.id!==id);setDocs(up);await db.set("mycel_dc7",up);await fileStore.del(id).catch(()=>{});};

  if(!ready)return(<div style={{background:L.bg,minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:16}}><style>{FONTS}</style><img src="/mycel-logo-dark.png" alt="Mycel" style={{height:72,width:"auto",objectFit:"contain",animation:"pulse 1.6s ease-in-out infinite"}} onError={(e)=>{e.target.style.display="none";e.target.nextSibling.style.display="block";}}/><div style={{display:"none"}}><MycelIcon size={44} color={L.am}/></div><div style={{fontFamily:"'Fraunces',Georgia,serif",fontSize:26,color:L.ink,letterSpacing:"-0.01em"}}>Mycel</div></div>);
  if(screen==="survey")return(<><style>{FONTS+gCSS(L)}</style><SurveyScreen onDone={handleSurvey} T={L}/></>);
  if(screen==="onboard")return(<><style>{FONTS+gCSS(L)}</style><OnboardScreen onDone={handleSetup} T={L}/></>);

  // Lab screens rendered full-screen over everything
  if(labScreen==="prelab")return(<><style>{FONTS+gCSS(T)}</style><PreLabScreen T={T} setup={setup} graph={graph} survey={survey} onClose={()=>setLabScreen(null)} onSaveNote={(note)=>{saveNoteFromLab(note);setLabScreen(null);}}/></>);
  if(labScreen==="postlab")return(<><style>{FONTS+gCSS(T)}</style><PostLabScreen T={T} setup={setup} graph={graph} survey={survey} notes={notes} onClose={()=>setLabScreen(null)} onSaveNote={(note)=>{saveNoteFromLab(note);setLabScreen(null);}}/></>);

  const topNodes=[...graph].sort((a,b)=>b.w-a.w);
  // Flatten all Research Space tasks across all projects, tagged by project
  const todayTasks=[
    ...tasks.filter(t=>t.due===selDay||(!t.due&&selDay===today)),
    ...deadlines.filter(d=>d.due===selDay).map(d=>({...d,text:d.title,tier:1,source:"canvas"})),
  ];
  // THREE-LAYER ARCHITECTURE: Daily (entry point), Learn (chat+library+quiz+capture), Commons (community+research+profile)
  const NAV=[{id:"today",l:"Daily"},{id:"learn",l:"Learn"},{id:"connect",l:"Projects"},{id:"commons",l:"Commons"}];

  return(
    <div className="mycel-shell" style={{background:T.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:F.ui}}>
      <style>{FONTS+gCSS(T)}</style>

      {/* HEADER */}
      <div className="mycel-header" style={{borderBottom:`1px solid ${T.bd}`,padding:"10px 18px",background:T.sf,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Logo T={T} size={20}/>
        <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}} className="hide-mobile">
          {NAV.map(n=>(<button key={n.id} onClick={()=>setTab(n.id)} style={{background:tab===n.id?T.amBg:"none",border:`1px solid ${tab===n.id?T.amBd:"transparent"}`,borderRadius:8,padding:"7px 14px",fontSize:13,color:tab===n.id?T.am:T.body,cursor:"pointer",fontWeight:tab===n.id?700:500}}>{n.l}</button>))}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {!AI_ENABLED&&<span className="core-mode-badge" title="AI features are disabled for this deployment">Core mode</span>}
          {/* Lab mode quick buttons */}
          <div style={{display:"flex",gap:4}} className="hide-mobile">
            <button onClick={()=>setLabScreen("prelab")} style={{background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10,padding:"6px 12px",fontFamily:F.mono,fontSize:9,color:T.sg,cursor:"pointer"}}>Pre-lab</button>
            <button onClick={()=>setLabScreen("postlab")} style={{background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:10,padding:"6px 12px",fontFamily:F.mono,fontSize:9,color:T.oc,cursor:"pointer"}}>Post-lab</button>
          </div>
          <StreakRing streak={streak} T={T} size={36}/>
          <button onClick={toggleTheme} title="Toggle Theme" style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,padding:"6px 11px",fontFamily:F.mono,fontSize:10,color:T.muted,cursor:"pointer"}}>{theme==="light"?"Dark":"Light"}</button>
          <div onClick={()=>setMenu(v=>!v)} style={{width:32,height:32,borderRadius:"50%",background:`linear-gradient(135deg, ${T.am}, ${T.sg})`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#FFF",fontSize:13,fontWeight:800,position:"relative",flexShrink:0,boxShadow:T.shadowSoft}}>
            {(setup?.name||"S")[0].toUpperCase()}
            {menu&&<div style={{position:"absolute",top:36,right:0,background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,padding:6,minWidth:180,boxShadow:"0 16px 48px -12px rgba(20,16,10,0.3)",zIndex:100,textAlign:"left"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.bdS}`}}><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{setup?.name||"Student"}</div><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>{streak} day streak</div></div>
              <div onClick={()=>{setTab("profile");setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>View profile</div>
              <div onClick={()=>{setScreen("survey");setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>Retake survey</div>
              <div onClick={()=>{setScreen("onboard");setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>Change units</div>
              {window.mycelAuth&&<div onClick={async()=>{await window.mycelAuth.signOut();window.location.reload();}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>Sign out</div>}
              <div onClick={async()=>{setMsgs([]);setGraph([]);setNotes([]);setTasks([]);setDeadlines([]);setDocs([]);setStreak(0);setSessions([]);await Promise.all(["mycel_m7","mycel_g7","mycel_n7","mycel_tk7","mycel_d7","mycel_dc7","mycel_st7","mycel_sess7"].map(k=>db.set(k,null)));setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.ru,cursor:"pointer",borderRadius:8}}>Clear session</div>
            </div>}
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="mob-nav mycel-header" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:T.sf,borderTop:`1px solid ${T.bd}`,padding:"7px 0",zIndex:50,flexDirection:"row"}}>
        {NAV.map(n=>(<button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,background:"none",border:"none",padding:"8px 2px",fontSize:10,color:tab===n.id?T.am:T.muted,cursor:"pointer",fontWeight:tab===n.id?800:500}}>{n.l}</button>))}
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden",height:"calc(100vh - 48px)"}}>
        {/* SIDEBAR */}
        <div className="hide-mobile mycel-sidebar" style={{width:214,borderRight:`1px solid ${T.bd}`,background:T.sf,overflowY:"auto",flexShrink:0,padding:"16px 14px"}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.faint,letterSpacing:"0.2em",marginBottom:9}}>UNITS</div>
          {(setup?.fields||[]).map(f=>(<div key={f.id} style={{padding:"7px 0",borderBottom:`1px solid ${T.d2}`}}><div style={{fontFamily:F.mono,fontSize:8,color:T.am,marginBottom:2}}>{f.code}</div><div style={{fontSize:12,color:T.body,lineHeight:1.25}}>{f.label}</div></div>))}
          <div style={{height:1,background:T.bd,margin:"14px 0"}}/>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.faint,letterSpacing:"0.2em",marginBottom:8}}>Knowledge Network</div>
          <LiveNetwork nodes={topNodes} T={T} width={174} height={148}/>
          <div style={{height:1,background:T.bd,margin:"14px 0"}}/>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.faint,letterSpacing:"0.2em",marginBottom:8}}>Study Pattern</div>
          <PatternTracker sessions={sessions} T={T}/>
        </div>

        {/* MAIN CONTENT */}
        <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0}}>

          {/* TODAY */}
          {tab==="today"&&(<div className="mycel-page" style={{flex:1,overflowY:"auto",padding:"24px 22px 32px",maxWidth:820,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>

            {/* â”€â”€ COMPANION ENTRY POINT â”€â”€ */}
            {selDay===today&&(()=>{
              const hr=new Date().getHours();
              const greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
              const prompt=hr<12?"What do you want to understand today?":hr<18?"What are you working through right now?":"What clicked for you today?";
              return(
                <div style={{marginBottom:24,animation:"fadeUp 0.5s ease"}}>
                  <div style={{fontFamily:F.mono,fontSize:10,color:T.am,letterSpacing:"0.14em",marginBottom:6}}>{greet.toUpperCase()}{setup?.name?", "+setup.name.toUpperCase():""}</div>
                  <div style={{fontFamily:F.display,fontSize:36,fontWeight:470,color:T.ink,letterSpacing:"0",lineHeight:1.08,marginBottom:18,maxWidth:640}}>{prompt}</div>

                  {!dailyFocus&&!focusBusy&&(
                    <button onClick={genDailyFocus}
                      className="mycel-hero-thread"
                      style={{background:`linear-gradient(135deg, ${T.amBg}, ${T.card})`,border:`1px solid ${T.amBd}`,borderRadius:18,
                        padding:"20px 22px",width:"100%",textAlign:"left",cursor:"pointer",display:"flex",
                        alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:T.shadow}}>
                      <div>
                        <div style={{fontSize:15.5,fontWeight:800,color:T.am,marginBottom:4}}>Show Me Where to Focus Today</div>
                        <div style={{fontSize:13,color:T.muted,lineHeight:1.5}}>Mycel reads your notes and finds a connection worth exploring.</div>
                      </div>
                      <span style={{fontSize:18,color:T.am,flexShrink:0,fontFamily:F.mono}}>Go</span>
                    </button>
                  )}

                  {focusBusy&&(
                    <div style={{padding:"24px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,textAlign:"center"}}>
                      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:12}}>Reading your knowledge network...</div>
                      <div style={{display:"flex",gap:6,justifyContent:"center"}}>{[0,1,2].map(i=><div key={i} style={{width:7,height:7,borderRadius:"50%",background:T.am,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}</div>
                    </div>
                  )}

                  {dailyFocus&&(
                    <div style={{animation:"growIn 0.4s ease"}}>
                      {/* Cross-unit connection -- THE HERO. This is Mycel's identity. */}
                      {dailyFocus.connection&&(
                        <div className="mycel-hero-thread" style={{padding:"24px 26px",background:`linear-gradient(135deg, ${(T.nwm||T.oc)}14, ${(T.gold||T.am)}10)`,
                          border:`1px solid ${(T.nwm||T.oc)}40`,borderRadius:20,marginBottom:12,
                          position:"relative",overflow:"hidden",boxShadow:T.shadow}}>
                          {/* mycelium thread motif -- two nodes connected by living threads */}
                          <svg width="100%" height="100%" viewBox="0 0 400 200" preserveAspectRatio="none" style={{position:"absolute",inset:0,opacity:0.10,pointerEvents:"none"}}>
                            <path d="M40,40 C140,60 180,120 360,150" stroke={T.nwm||T.oc} strokeWidth="1.2" fill="none"/>
                            <path d="M40,40 C120,90 200,80 360,150" stroke={T.nwm||T.oc} strokeWidth="0.8" fill="none"/>
                            <path d="M120,180 C180,120 220,90 320,30" stroke={T.nwm||T.oc} strokeWidth="0.8" fill="none"/>
                            <circle cx="40" cy="40" r="5" fill={T.nwm||T.oc}/>
                            <circle cx="360" cy="150" r="5" fill={T.nwm||T.oc}/>
                            <circle cx="320" cy="30" r="3" fill={T.nwm||T.oc}/>
                            <circle cx="120" cy="180" r="3" fill={T.nwm||T.oc}/>
                          </svg>
                          <div style={{position:"relative"}}>
                            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:10}}>
                              <span style={{width:7,height:7,borderRadius:"50%",background:T.nwm||T.oc,display:"inline-block"}}/>
                              <div style={{fontFamily:F.mono,fontSize:9,color:T.nwm||T.oc,letterSpacing:"0.1em"}}>A CONNECTION YOU MAY NOT HAVE NOTICED</div>
                            </div>
                            <p style={{margin:"0 0 10px",fontFamily:F.display,fontSize:23,color:T.ink,lineHeight:1.28}}>{dailyFocus.connection}</p>
                            {dailyFocus.why&&<p style={{margin:"0 0 16px",fontSize:13,color:T.muted,lineHeight:1.65}}>{dailyFocus.why}</p>}
                            <button className="mycel-button-primary" onClick={()=>{setTab("learn");setLearnSub("chat");setInput&&setInput("Help me understand this connection: "+dailyFocus.connection);}}
                              style={{background:T.nwm||T.oc,border:"none",borderRadius:10,padding:"10px 18px",
                                color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:T.shadowSoft}}>Explore This Connection</button>
                          </div>
                        </div>
                      )}
                      {/* Understand today -- supporting */}
                      <div className="mycel-card" style={{padding:"17px 19px",background:T.card,border:`1px solid ${T.bd}`,
                        borderLeft:`3px solid ${T.am}`,borderRadius:16,marginBottom:12,boxShadow:T.shadowSoft}}>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
                          <span style={{width:7,height:7,borderRadius:"50%",background:T.am,display:"inline-block"}}/>
                          <div style={{fontFamily:F.mono,fontSize:9,color:T.am,letterSpacing:"0.1em"}}>UNDERSTAND TODAY</div>
                        </div>
                        <p style={{margin:"0 0 12px",fontSize:14.5,color:T.ink,lineHeight:1.6}}>{dailyFocus.understand}</p>
                        <button onClick={()=>{setTab("learn");setLearnSub("chat");}}
                          style={{background:"none",border:`1px solid ${T.amBd}`,borderRadius:10,padding:"7px 15px",
                            color:T.am,fontSize:12.5,fontWeight:600,cursor:"pointer"}}>Start in Learn</button>
                      </div>
                      <button onClick={genDailyFocus} style={{background:"none",border:"none",
                        fontFamily:F.mono,fontSize:10,color:T.muted,cursor:"pointer",padding:"4px 0"}}>Suggest Something Else</button>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* â”€â”€ SCHEDULE (secondary) â”€â”€ */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontSize:16,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>{selDay===today?"Your day":"Tasks for "+selDay}</div><div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:2}}>{new Date(selDay+"T12:00:00").toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}</div></div>
              <div style={{display:"flex",gap:7,alignItems:"center"}}><button onClick={()=>setCalendarView(v=>v==="week"?"month":"week")} style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,padding:"8px 12px",color:T.body,fontSize:12,cursor:"pointer"}}>{calendarView==="week"?"Month view":"Week view"}</button><StreakRing streak={streak} T={T} size={44}/><button onClick={()=>setShowNewTask(v=>!v)} style={{background:T.am,border:"none",borderRadius:10,padding:"8px 16px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Task</button></div>
            </div>
            {calendarView==="week"?<CalStrip tasks={tasks} deadlines={deadlines} today={today} selDay={selDay} onSel={setSelDay} T={T}/>:<MonthCalendar tasks={tasks} deadlines={deadlines} selDay={selDay} onSel={setSelDay} T={T}/>} 
            {showNewTask&&<div style={{margin:"14px 0",padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:10}}>NEW TASK</div>
              <input value={newTask.text} onChange={e=>setNewTask(p=>({...p,text:e.target.value}))} placeholder="Task description..." style={{width:"100%",padding:"9px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
              <textarea value={newTask.description} onChange={e=>setNewTask(p=>({...p,description:e.target.value}))} placeholder="More context, success criteria, or dependencies..." rows={2} style={{width:"100%",padding:"9px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:7,color:T.ink,fontSize:12,outline:"none",resize:"vertical",marginBottom:8}}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <select value={newTask.tier} onChange={e=>setNewTask(p=>({...p,tier:+e.target.value}))} style={{padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none",cursor:"pointer"}}><option value={1}>T1 . core</option><option value={2}>T2 . applied</option><option value={3}>T3 . extended</option></select>
                <input value={newTask.unitCode} onChange={e=>setNewTask(p=>({...p,unitCode:e.target.value}))} placeholder="Unit code" style={{width:110,padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none"}}/>
                <input value={newTask.due} onChange={e=>setNewTask(p=>({...p,due:e.target.value}))} type="date" style={{padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none"}}/>
                <input value={newTask.effort} onChange={e=>setNewTask(p=>({...p,effort:e.target.value}))} placeholder="Effort, e.g. 45 min" style={{width:140,padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none"}}/>
                <button onClick={addTask} style={{background:T.am,border:"none",borderRadius:9,padding:"8px 16px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>Add</button>
              </div>
            </div>}
            {todayTasks.length===0?<div className="empty-state" style={{fontSize:14,color:T.muted}}>No tasks yet. Add one tiny next step when you know what needs moving.</div>:(
              [1,2,3].map(tier=>{const ts=todayTasks.filter(t=>t.tier===tier);if(!ts.length)return null;const color=tc(T,tier);return(<div key={tier}><div style={{fontFamily:F.mono,fontSize:9,color,letterSpacing:"0.15em",margin:"16px 0 8px"}}>{tl(tier).toUpperCase()}</div>{ts.map(t=><TaskCard key={t.id} task={t} onToggle={toggleTask} T={T}/>)}</div>);})
            )}
            {deadlines.length>0&&selDay===today&&<div style={{marginTop:20}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.ru,letterSpacing:"0.15em",marginBottom:10}}>UPCOMING DEADLINES</div>
              {deadlines.sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4).map(d=>(<div key={d.id} style={{padding:"9px 12px",background:T.card,border:`1px solid ${T.ruBd}`,borderRadius:9,marginBottom:7,display:"flex",alignItems:"center",gap:10}}><div style={{width:6,height:6,borderRadius:"50%",background:T.ru,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.ink}}>{d.title}</div>{d.unitCode&&<div style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>{d.unitCode}</div>}</div><div style={{fontFamily:F.mono,fontSize:11,color:T.ru}}>{d.due}</div></div>))}
            </div>}
          </div>)}

          {/* LEARN LAYER -- chat + library + quiz + capture consolidated */}
          {tab==="learn"&&(<>
            {/* â”€â”€ LEARN SUB-NAV â”€â”€ */}
            <div className="mycel-subnav" style={{padding:"9px 18px",background:T.sf,borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:7,flexWrap:"wrap"}}>
              {[{id:"chat",l:"Chat"},{id:"network",l:"Network"},{id:"library",l:"Library"},{id:"quiz",l:"Voice Quiz"},{id:"capture",l:"Capture"}].map(s=>(
                <button key={s.id} onClick={()=>{setLearnSub(s.id);if(s.id!=="chat")setStudyMode(s.id);}}
                  style={{padding:"7px 13px",background:learnSub===s.id?T.am:T.card,
                    border:`1px solid ${learnSub===s.id?T.am:T.bd}`,borderRadius:10,fontSize:12,
                    fontWeight:learnSub===s.id?700:500,color:learnSub===s.id?"#FFF":T.muted,
                    cursor:"pointer"}}>
                  {s.l}
                </button>
              ))}
              <div style={{flex:1}}/>
              <span style={{fontFamily:F.mono,fontSize:8,color:T.faint}} className="hide-mobile">one space to learn, review, and capture</span>
            </div>

            {/* CHAT SUB-MODE */}
            {learnSub==="chat"&&(<>
            {/* â”€â”€ MODE TOOLBAR â”€â”€ */}
            <div className="mycel-subnav" style={{padding:"8px 18px",background:T.sf,borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {/* Mode toggle */}
              <div style={{display:"flex",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,padding:2,gap:1}}>
                {[{id:"explain",label:"Explain"},{id:"note",label:"Note"}].map(m=>(
                  <button key={m.id} onClick={()=>setLearnMode(m.id)}
                    style={{padding:"4px 12px",background:learnMode===m.id?T.am:"transparent",border:"none",borderRadius:7,
                      fontSize:11,fontWeight:learnMode===m.id?700:400,
                      color:learnMode===m.id?"#FFF":T.muted,cursor:"pointer",
                      transition:"all 0.12s"}}>
                    {m.label}
                  </button>
                ))}
              </div>
              <div style={{fontFamily:F.mono,fontSize:8,color:T.faint}}>
                {learnMode==="explain"?"breaks down what you don't understand":"generates structured reference notes"}
              </div>
              {/* Desktop: show/hide note panel */}
              {liveNotes.length>0&&<button onClick={()=>setShowNotePanel(p=>!p)}
                className="hide-mobile"
                style={{marginLeft:"auto",padding:"4px 11px",background:showNotePanel?T.sgBg:T.card,
                  border:`1px solid ${showNotePanel?T.sgBd:T.bd}`,borderRadius:7,fontSize:11,
                  color:showNotePanel?T.sg:T.muted,cursor:"pointer"}}>
                {showNotePanel?"Hide notes":"Notes"} ({liveNotes.length})
              </button>}
              {/* Mobile: note panel toggle */}
              {liveNotes.length>0&&<button onClick={()=>setShowNotePanel(p=>!p)}
                style={{marginLeft:"auto",padding:"4px 11px",background:showNotePanel?T.sgBg:T.card,
                  border:`1px solid ${showNotePanel?T.sgBd:T.bd}`,borderRadius:7,fontSize:11,
                  color:showNotePanel?T.sg:T.muted,cursor:"pointer",display:"block"}}
                className="mob-note-btn">
                Notes ({liveNotes.length})
              </button>}
            </div>

            {/* â”€â”€ HIGHLIGHT BANNER â”€â”€ */}
            {hl&&<div style={{padding:"8px 18px",background:T.ocBg,borderBottom:`1px solid ${T.ocBd}`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:2,height:18,background:T.oc,borderRadius:1}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:F.mono,fontSize:8,color:T.oc,marginBottom:2}}>Branching from</div>
                <div style={{fontSize:12,color:T.body,fontStyle:"italic"}}>"{hl.slice(0,100)}{hl.length>100?"...":""}"</div>
              </div>
              <button onClick={()=>setHl(null)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18}}>x</button>
            </div>}

            {/* â”€â”€ SPLIT LAYOUT: chat + notes panel â”€â”€ */}
            <div style={{flex:1,display:"flex",overflow:"hidden",minHeight:0}}>

              {/* Chat column */}
              <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden",minWidth:0}}>
                <div style={{flex:1,overflowY:"auto",padding:"20px 20px 0",maxWidth:showNotePanel?700:800,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
                  {msgs.map(m=>(
                    <ChatMessage key={m.id} m={m} T={T} setHl={setHl} genNote={genNote}
                      onAddToNotes={(text)=>setLiveNotes(prev=>[...prev,{id:Date.now(),text,mode:learnMode}])}/>
                  ))}
                  {busy&&!msgs.find(m=>m.streaming)&&(
                    <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:20}}>
                      <MycelIcon size={18} color={T.am}/>
                      <div style={{display:"flex",gap:4}}>
                        {[0,1,2].map(i=><div key={i} style={{width:5,height:5,borderRadius:"50%",background:T.am,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}
                      </div>
                    </div>
                  )}
                  <div ref={endRef} style={{height:24}}/>
                </div>

                {/* Input bar */}
                <div style={{borderTop:`1px solid ${T.bd}`,padding:"11px 18px",background:T.sf}}>
                  <div style={{maxWidth:showNotePanel?700:800,margin:"0 auto",display:"flex",gap:9,alignItems:"flex-end"}}>
                    <textarea ref={inpRef} value={input} onChange={e=>setInput(e.target.value)}
                      onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send(input,!!hl,hl);}}}
                      placeholder={learnMode==="note"?"Ask what to take notes on...":"What don't you understand?"}
                      rows={1} style={{flex:1,background:T.card,border:`1px solid ${hl?T.ocBd:T.bd}`,
                        borderRadius:12,color:T.ink,fontSize:14.5,padding:"11px 15px",
                        outline:"none",resize:"none",lineHeight:1.6,maxHeight:140,overflowY:"auto"}}/>
                    <button onClick={()=>send(input,!!hl,hl)} disabled={!input.trim()||busy}
                      style={{background:input.trim()&&!busy?T.am:T.raised,border:"none",borderRadius:12,
                        padding:"11px 22px",color:input.trim()&&!busy?"#FFF":T.faint,
                        fontSize:14,fontWeight:600,cursor:input.trim()&&!busy?"pointer":"not-allowed",flexShrink:0}}>
                      {learnMode==="note"?"Note":"Ask"}
                    </button>
                  </div>
                  <div style={{maxWidth:showNotePanel?700:800,margin:"5px auto 0",fontFamily:F.mono,fontSize:9,color:T.faint}}>
                    {learnMode==="explain"?"Explain mode: breaking down what you do not understand":"Note mode: generating structured reference notes"} . Select text to branch
                  </div>
                </div>
              </div>

              {/* Notes panel -- desktop split or mobile overlay */}
              {showNotePanel&&(
                <div className="hide-mobile" style={{width:340,borderLeft:`1px solid ${T.bd}`,background:T.sf,
                  display:"flex",flexDirection:"column",flexShrink:0,overflow:"hidden"}}>
                  <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div>
                      <div style={{fontSize:12,fontWeight:700,color:T.ink}}>Live notes</div>
                      <div style={{fontFamily:F.mono,fontSize:8,color:T.muted,marginTop:1}}>{liveNotes.length} blocks accumulated</div>
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button onClick={()=>{
                        const full=liveNotes.map(n=>n.text).join("\n\n---\n\n");
                        const blob=new Blob([full],{type:"text/plain"});
                        const a=document.createElement("a");a.href=URL.createObjectURL(blob);
                        a.download="mycel-notes.txt";a.click();
                      }} style={{padding:"3px 8px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:6,fontSize:10,color:T.sg,cursor:"pointer"}}>Export</button>
                      <button onClick={()=>setLiveNotes([])} style={{padding:"3px 8px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:6,fontSize:10,color:T.muted,cursor:"pointer"}}>Clear</button>
                    </div>
                  </div>
                  <div style={{flex:1,overflowY:"auto",padding:12}}>
                    {liveNotes.length===0&&<div style={{padding:"40px 0",textAlign:"center",fontSize:12,color:T.faint,fontFamily:F.mono}}>Notes will appear here as you learn</div>}
                    {liveNotes.map((n,i)=>(
                      <div key={n.id} style={{marginBottom:10,padding:"10px 12px",background:T.card,
                        border:`1px solid ${n.mode==="note"?T.sgBd:T.amBd}`,borderRadius:9,
                        borderLeft:`3px solid ${n.mode==="note"?T.sg:T.am}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontFamily:F.mono,fontSize:8,color:n.mode==="note"?T.sg:T.am}}>
                            {n.mode==="note"?"NOTE":"BREAKDOWN"} {i+1}
                          </span>
                          <button onClick={()=>setLiveNotes(prev=>prev.filter(x=>x.id!==n.id))}
                            style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:14,lineHeight:1}}>x</button>
                        </div>
                        <div style={{fontSize:11,color:T.body,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile note panel overlay */}
            {showNotePanel&&(
              <div style={{position:"fixed",inset:0,background:"rgba(14,10,6,0.8)",backdropFilter:"blur(8px)",
                zIndex:300,display:"flex",flexDirection:"column"}}
                className="mob-overlay">
                <div style={{background:T.sf,flex:1,margin:"60px 0 0",borderRadius:"20px 20px 0 0",
                  display:"flex",flexDirection:"column",overflow:"hidden"}}>
                  <div style={{padding:"14px 18px",borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                    <div style={{fontSize:14,fontWeight:700,color:T.ink}}>Live notes ({liveNotes.length})</div>
                    <button onClick={()=>setShowNotePanel(false)} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>x</button>
                  </div>
                  <div style={{flex:1,overflowY:"auto",padding:16}}>
                    {liveNotes.map((n,i)=>(
                      <div key={n.id} style={{marginBottom:10,padding:"10px 12px",background:T.card,
                        border:`1px solid ${n.mode==="note"?T.sgBd:T.amBd}`,borderRadius:9,
                        borderLeft:`3px solid ${n.mode==="note"?T.sg:T.am}`}}>
                        <div style={{fontFamily:F.mono,fontSize:8,color:n.mode==="note"?T.sg:T.am,marginBottom:5}}>
                          {n.mode==="note"?"NOTE":"BREAKDOWN"} {i+1}
                        </div>
                        <div style={{fontSize:12,color:T.body,lineHeight:1.7,whiteSpace:"pre-wrap"}}>{n.text}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{padding:"10px 16px",borderTop:`1px solid ${T.bd}`,display:"flex",gap:8}}>
                    <button onClick={()=>{
                      const full=liveNotes.map(n=>n.text).join("\n\n---\n\n");
                      const blob=new Blob([full],{type:"text/plain"});
                      const a=document.createElement("a");a.href=URL.createObjectURL(blob);
                      a.download="mycel-notes.txt";a.click();
                    }} style={{flex:1,padding:"10px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10,fontSize:13,color:T.sg,cursor:"pointer",fontWeight:600}}>Export notes</button>
                    <button onClick={()=>setLiveNotes([])} style={{padding:"10px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,fontSize:13,color:T.muted,cursor:"pointer"}}>Clear</button>
                  </div>
                </div>
              </div>
            )}
          </>)}
          {/* end CHAT sub-mode */}
          </>)}
          {/* end LEARN layer wrapper for chat; sub-modes below are siblings */}
          {/* NETWORK SUB-MODE -- the signature mycelium view */}
          {tab==="learn"&&learnSub==="network"&&<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:860,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
            <KnowledgeNetwork graph={graph} T={T} F={F} setup={setup}
              onExplore={(concept)=>{setLearnSub("chat");setInput("Help me understand "+concept+" and how it connects to my other units");}}/>
          </div>}
          {tab==="learn"&&learnSub==="library"&&<div className="mycel-page" style={{flex:1,overflowY:"auto",padding:"24px 22px 32px",maxWidth:820,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div><div style={{fontFamily:F.display,fontSize:28,fontWeight:480,color:T.ink,letterSpacing:"0"}}>Library</div><div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:3}}>Upload, read, annotate, and save reflections</div></div>
                <label className="mycel-button-primary" style={{background:T.am,border:"none",borderRadius:10,padding:"9px 17px",color:"#FFF",fontSize:13,fontWeight:700,cursor:"pointer",boxShadow:T.shadowSoft}}>Upload<input type="file" accept=".txt,.md,.csv,.pdf,.docx,.pptx" onChange={uploadFile} style={{display:"none"}}/></label>
              </div>
              <div style={{padding:"12px 15px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:12,marginBottom:16,fontSize:13,color:T.body,lineHeight:1.6}}>
                Upload a <strong>PDF</strong>, <strong>Word document</strong>, <strong>PowerPoint deck</strong>, or text file. Mycel creates a selectable study view while keeping the original file in your library. Scanned image-only PDFs still need pasted text.
              </div>
              {!docs.length&&<div className="empty-state" style={{fontSize:14,color:T.muted}}>Your library is empty. Add one reading or paste a passage, then use highlights to ask questions or save reflections.</div>}
              {docs.map(doc=><PDFViewer key={doc.id} doc={doc} onDelete={deleteDoc} onUpdate={updateDoc} T={T} sysPrompt={SP()}/>)}
              <div className="mycel-card" style={{marginTop:20,padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:14}}>
                <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:8}}>Paste text directly</div>
                <PasteArea T={T} onSave={async(name,text)=>{const doc={id:`d_${Date.now()}`,name,text:text.slice(0,25000),annotations:[]};const up=[...docs,doc];setDocs(up);await db.set("mycel_dc7",up);}}/>
              </div>
          </div>}

          {/* CAPTURE SUB-MODE (within Learn layer) */}
          {tab==="learn"&&learnSub==="capture"&&<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:760,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
            <QuickCapture T={T} F={F} notes={notes} setNotes={setNotes} projects={projects} setup={setup}/>
          </div>}

          {/* VOICE QUIZ SUB-MODE (within Learn layer) */}
          {tab==="learn"&&learnSub==="quiz"&&<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:760,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
            <VoiceQuiz
              T={T} F={F}
              notes={notes}
              docs={docs}
              setup={setup}
              survey={survey}
              SP={SP}
              graph={graph} addToGraph={addToGraph}
              quizState={quizState} setQuizState={setQuizState}
              quizSession={quizSession} setQuizSession={setQuizSession}
              quizReport={quizReport} setQuizReport={setQuizReport}
              isListening={isListening} setIsListening={setIsListening}
              transcript={transcript} setTranscript={setTranscript}
              quizSource={quizSource} setQuizSource={setQuizSource}
              quizMode={quizMode} setQuizMode={setQuizMode}
              mcqState={mcqState} setMcqState={setMcqState}
              mcqSession={mcqSession} setMcqSession={setMcqSession}
              mcqReport={mcqReport} setMcqReport={setMcqReport}
              setTab={setTab} setLearnSub={setLearnSub} setInput={setInput}
            />
          </div>}

                    {/* CONNECT TAB -- exchange + comms */}
          {tab==="connect"&&<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:760,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
            <ConnectTabContent T={T} notes={notes} setNotes={setNotes} deadlines={deadlines} setDeadlines={setDeadlines} addDeadline={addDeadline} setup={setup} projects={projects} setProjects={setProjects} tasks={tasks} setTasks={setTasks} docs={docs}/>
          </div>}

          {tab==="commons"&&<div style={{flex:1,overflowY:"auto",padding:"24px 22px 40px",maxWidth:900,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
            <RelationalLayer T={T} projects={projects} docs={docs} setup={setup}/>
          </div>}

          {/* PROFILE TAB */}
          {tab==="profile"&&<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:760,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
            <ProfileTab T={T} setup={setup} survey={survey} streak={streak} sessions={sessions} notes={notes} tasks={tasks} setScreen={setScreen}/>
          </div>}

        </div>
      </div>

      {/* FIRST TIME GUIDE */}
      {firstTime&&<FirstTimeGuide T={T} onClose={()=>setFirstTime(false)} onStartLearn={()=>{setTab("learn");setFirstTime(false);}} onStartLab={()=>{setLabScreen("prelab");setFirstTime(false);}}/>}

      {/* NOTE MODAL */}
      {noteModal&&<div style={{position:"fixed",inset:0,background:"rgba(20,16,10,0.65)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500,padding:16}}>
        <div style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:16,width:"100%",maxWidth:660,display:"flex",flexDirection:"column",maxHeight:"90vh"}}>
          <div style={{padding:"13px 18px",borderBottom:`1px solid ${T.bd}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><MycelIcon size={16} color={T.am}/><span style={{fontFamily:F.mono,fontSize:10,color:T.am}}>Generated note</span></div>
            <button onClick={()=>setNoteModal(null)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>x</button>
          </div>
          {noteBusy?<div style={{padding:60,textAlign:"center",fontFamily:F.mono,fontSize:11,color:T.muted}}>Composing...</div>
            :<NoteEdit note={noteModal.text} onSave={saveNote} onClose={()=>setNoteModal(null)} onCustom={async req=>genNote({id:noteModal.msgId,content:msgs.find(m=>m.id===noteModal.msgId)?.content||""},req)} T={T}/>}
        </div>
      </div>}
    </div>
  );
}
