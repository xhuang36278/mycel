import React, { useState, useEffect, useRef, useCallback } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=DM+Mono:ital,wght@0,400;0,500;1,400&family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,300..600,50,0;1,9..144,300..500,50,1&display=swap');`;

// ── TOKENS ─────────────────────────────────────────────────────────────────────
const L = {
  bg:"#EFE9DC",sf:"#FAF6EE",card:"#FFFFFF",raised:"#E8E1D3",d2:"#DFD8CA",
  bd:"#D4CCB9",bdS:"#E2DACE",
  ink:"#2A2620",body:"#4A453B",muted:"#7A7264",faint:"#A8A192",
  am:"#A06B2E",amBg:"#A06B2E10",amBd:"#A06B2E24",
  sg:"#5A7A48",sgBg:"#5A7A4810",sgBd:"#5A7A4826",
  oc:"#3A7E8C",ocBg:"#3A7E8C10",ocBd:"#3A7E8C26",
  ru:"#8A3E22",ruBg:"#8A3E2210",ruBd:"#8A3E2226",
  pu:"#5A4488",puBg:"#5A448810",puBd:"#5A448826",
  net:"#5A7A48",netBg:"#5A7A4810",netBd:"#5A7A4828",
  gold:"#BC9438",goldBg:"#BC943812",goldBd:"#BC943830",
  thr:"#A06B2E30",nwm:"#3A7E8C",
  shadow:"0 2px 12px -4px rgba(74,53,28,0.10),0 1px 3px -1px rgba(74,53,28,0.06)",
  shadowSoft:"0 1px 6px -2px rgba(74,53,28,0.08)",
};
const D = {
  bg:"#100D08",sf:"#16130C",card:"#1C1810",raised:"#221E14",d2:"#1A1610",
  bd:"#2A2418",bdS:"#221E14",
  ink:"#E8E2D4",body:"#BAB29C",muted:"#726B5E",faint:"#403A30",
  am:"#C99456",amBg:"#C9945614",amBd:"#C994562C",
  sg:"#7EA876",sgBg:"#7EA87614",sgBd:"#7EA8762C",
  oc:"#5E9CA8",ocBg:"#5E9CA814",ocBd:"#5E9CA82C",
  ru:"#C05C3A",ruBg:"#C05C3A14",ruBd:"#C05C3A2C",
  pu:"#8A6CC0",puBg:"#8A6CC014",puBd:"#8A6CC02C",
  net:"#7EA876",netBg:"#7EA87614",netBd:"#7EA8762C",
  gold:"#D4AC48",goldBg:"#D4AC4814",goldBd:"#D4AC4830",
  thr:"#C9945638",nwm:"#5E9CA8",
  shadow:"0 2px 14px -4px rgba(0,0,0,0.40),0 1px 3px -1px rgba(0,0,0,0.30)",
  shadowSoft:"0 1px 8px -2px rgba(0,0,0,0.30)",
};
const F={ui:"'Inter',system-ui,sans-serif",mono:"'DM Mono',monospace",display:"'Fraunces',Georgia,serif"};
// All AI calls go through the Vercel proxy (/api/chat) which holds the API key server-side.
// On localhost without the proxy running, AI features will show a connection error -- expected.
const API_URL="/api/chat";
// Spacing scale -- use these instead of ad-hoc values for vertical rhythm
const SP={xs:4,sm:8,md:12,lg:16,xl:24,xxl:32};
const tc=(T,t)=>t===1?T.am:t===2?T.oc:T.sg;
const tl=t=>t===1?"T1 . core":t===2?"T2 . applied":"T3 . extended";

// ── DATA ───────────────────────────────────────────────────────────────────────
const UNITS=[
  {id:"agric1001",code:"AGRIC 1001",label:"Intro to agricultural science",icon:"🌾"},
  {id:"agric1002",code:"AGRIC 1002",label:"Agricultural systems",icon:"🔄"},
  {id:"soil2001",code:"SOIL 2001",label:"Soil science",icon:"🌍"},
  {id:"plnt2003",code:"PLNT 2003",label:"Plant physiology",icon:"🌱"},
  {id:"biol1003",code:"BIOL 1003",label:"Biology 1A",icon:"🧬"},
  {id:"biol1004",code:"BIOL 1004",label:"Biology 1B",icon:"🍄"},
  {id:"chem1002",code:"CHEM 1002",label:"Chemistry 1A",icon:"⚗️"},
  {id:"stat1000",code:"STAT 1000",label:"Statistics",icon:"📊"},
];

const SQ=[
  {id:"goal",q:"What's your main goal for using Mycel?",opts:["Understand my units deeply","Prepare for exams","Connect ideas across fields","Build research skills","All of the above"]},
  {id:"challenge",q:"What's your biggest study challenge right now?",opts:["Understanding mechanisms, not just facts","Connecting concepts across units","Turning notes into useful summaries","Staying consistent","Finding time to review"]},
  {id:"style",q:"How do you learn best?",opts:["Asking questions and exploring","Reading and annotating","Making notes and summaries","Testing myself","A mix of all"]},
  {id:"year",q:"What year are you in?",opts:["Year 1","Year 2","Year 3","Honours","Postgrad"]},
  {id:"symbia",q:"Are you interested in soil restoration or sustainable agriculture research?",opts:["Yes, very much","Somewhat","Not really","I don't know yet"]},
];

const NOTE_TPLS=[
  {id:"mechanism",name:"Mechanism breakdown",icon:"⚙️",desc:"How something works step by step",s:"CONCEPT:\nDEFINITION:\nMECHANISM (step by step):\nWHY IT MATTERS:\nCROSS-UNIT LINK:\nCOMMON EXAM MISTAKE:\nPRACTICE QUESTION:"},
  {id:"comparison",name:"Compare and contrast",icon:"<->",desc:"Compare two processes or concepts",s:"ITEM A:\nITEM B:\nSIMILARITIES:\nDIFFERENCES:\nWHEN EACH APPLIES:\nPRACTICE QUESTION:"},
  {id:"system",name:"System analysis",icon:"🔄",desc:"Map a biological or ecological system",s:"SYSTEM NAME:\nINPUTS:\nPROCESSES:\nOUTPUTS:\nFEEDBACK LOOPS:\nFAILURE MODES:\nREAL EXAMPLE:"},
  {id:"labprep",name:"Pre-lab primer",icon:"🧪",desc:"Prime your understanding before the lab",s:"LAB TITLE:\nCORE MECHANISM BEING TESTED:\nWHAT I EXPECT TO OBSERVE:\nWHY (THEORY):\nKEY VARIABLES:\nWHAT COULD GO WRONG:"},
  {id:"postreflect",name:"Post-lab reflection",icon:"◉",desc:"Connect observations to theory after the lab",s:"WHAT I OBSERVED:\nWHAT I EXPECTED:\nWHAT SURPRISED ME:\nMECHANISM EXPLANATION:\nCONNECTION TO THEORY:\nQUESTION THIS RAISED:"},
  {id:"symbia",name:"Symbia research note",icon:"🌱",desc:"Connect learning to soil restoration and Symbia",s:"CONCEPT:\nCONNECTION TO SOIL HEALTH:\nCONNECTION TO MYCORRHIZAL NETWORKS:\nAPPLICATION IN RESTORATION:\nGAP IN CURRENT KNOWLEDGE:\nRESEARCH QUESTION THIS RAISES:"},
];

const EMAIL_TPLS=[
  {id:"volunteer",label:"Request to volunteer in lab",icon:"🔬",fields:["supervisorName","supervisorEmail","labFocus","yourBackground"]},
  {id:"extension",label:"Request assignment extension",icon:"📅",fields:["lecturerName","unitCode","assignmentName","reason","proposedDate"]},
  {id:"meeting",label:"Request meeting with supervisor",icon:"👤",fields:["supervisorName","purpose","availability"]},
  {id:"intro",label:"Introduce yourself to a researcher",icon:"✉️",fields:["researcherName","institution","theirWork","yourProject","ask"]},
  {id:"thankyou",label:"Thank you after meeting",icon:"🙏",fields:["recipientName","meetingTopic","keyTakeaway"]},
  {id:"custom",label:"Custom email",icon:"✏️",fields:["to","subject","context","tone"]},
];

// ── STORAGE ────────────────────────────────────────────────────────────────────
const db={
  async get(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}},
  async set(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}},
};

// ── STREAMING AI ───────────────────────────────────────────────────────────────
async function streamAI(messages, system, onToken, onDone, max=1400){
  try{
    const res=await fetch(API_URL,{
      method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:max,system,messages,stream:true}),
    });
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
  const res=await fetch(API_URL,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:max,system,messages}),
  });
  const d=await res.json();
  return d.content?.map(b=>b.text||"").join("")||"";
}

function buildSys(fields,graph,name,survey,mode){
  const units=fields.map(f=>f.code+"("+f.label+")").join(", ");
  const top=[...graph].sort((a,b)=>b.w-a.w).slice(0,6).map(n=>n.label+"x"+n.w).join(", ");
  const sc=survey?"Learner: goal="+survey.goal+", style="+survey.style+", year="+survey.year+".":"";
  const base="You are Mycel -- AI learning companion for "+(name||"a student")+" at Adelaide University, Roseworthy Campus. Units: "+units+". Knowledge map: "+(top||"building...")+" "+sc+" Ground every answer in specific mechanism. Surface cross-unit connections. Use SA/Roseworthy context."
    +"\n\nHOW YOU TEACH (applies to every answer):"
    +"\n1. FIRST PRINCIPLES: Do not just state the conclusion. Build it up from the underlying reason. Trace a concept down to the fundamental law or physical/chemical cause it rests on, then reconstruct it from there, so the student could re-derive it themselves rather than memorise it. Make explicit what is a premise versus what is a consequence derived from it."
    +"\n2. SYSTEMATIC: Always place the concept in the larger system it belongs to -- what it connects to, what level it sits at, what it depends on and what depends on it. Show the structure, not just the fact."
    +"\n3. PLAIN LANGUAGE (no unnecessary jargon): Explain from the underlying idea in clear, intuitive language first; introduce the technical term only after the idea is understood, as a label for something already clear. A smart person with no background should be able to follow. Never hide a simple idea behind a complicated word. (This keeps explanations adaptable to non-specialist learners later.)"
    +"\n4. TRUSTWORTHY ANCHOR: Stay internally consistent; if you must revise an earlier point, say so explicitly rather than quietly contradicting it. When something is genuinely debated or uncertain in the science, say so and name the main views. Prefer textbook/peer-reviewed consensus over guessing; if unsure, say you are unsure.";
  const noteInstructions="\n\nOUTPUT FORMAT -- STRUCTURED NOTE:\n## [Topic Title]\n### 1. [Section Name]\n- **Key term**: precise definition\n- **Mechanism**: step-by-step process\n- **Why it matters**: agricultural relevance\nBold ALL key terms. Be dense and precise. End with:\n> Key takeaway: one sentence.\n> Exam trap: the most common misconception.";
  const explainInstructions="\n\nOUTPUT FORMAT -- BREAKDOWN:\nUse emoji anchors for sections. Quote the technical sentence first (in italics), then explain in plain language. Use bullets. Language: conversational (Means: / Translation: / Basically:). End with one sharp question the student must think about themselves.";
  if(mode==="note") return base+noteInstructions;
  return base+explainInstructions;
}

function extractC(t){
  const s=new Set(["this","that","what","when","where","which","with","from","into","than","then","they","your","have","does","been","more","also","will","would","could","about","after","before","these","those","their","there","other"]);
  return[...new Set(t.toLowerCase().replace(/[^a-z\s]/g," ").split(/\s+/).filter(w=>w.length>4&&!s.has(w)))].slice(0,6);
}

// ── LOGO ───────────────────────────────────────────────────────────────────────
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
  const isDark=T.bg==="#100D08";
  const src=isDark?"/mycel-logo-light.png":"/mycel-logo-dark.png";
  return(
    <div style={{display:"flex",alignItems:"center",gap:9}}>
      <img src={src} alt="Mycel" style={{height:size*1.5,width:"auto",objectFit:"contain",display:"block"}}
        onError={(e)=>{e.target.style.display="none";e.target.nextSibling.style.display="flex";}}/>
      <span style={{display:"none"}}><MycelIcon size={size} color={T.am}/></span>
      <span style={{fontFamily:F.ui,fontSize:size*0.95,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>Mycel</span>
    </div>
  );
}

// ── SURVEY ─────────────────────────────────────────────────────────────────────
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

// ── ONBOARD ────────────────────────────────────────────────────────────────────
function OnboardScreen({onDone,T}){
  const[sel,setSel]=useState([]);const[name,setName]=useState("");const[search,setSearch]=useState("");const[custom,setCustom]=useState([]);
  const toggle=f=>setSel(p=>p.find(x=>x.id===f.id)?p.filter(x=>x.id!==f.id):[...p,f]);
  const all=[...UNITS,...custom];
  const results=search.trim()?all.filter(f=>f.label.toLowerCase().includes(search.toLowerCase())||f.code.toLowerCase().includes(search.toLowerCase())):[];
  const addC=()=>{if(!search.trim())return;const f={id:`cx_${Date.now()}`,code:search.trim().toUpperCase().slice(0,10),label:search.trim().toLowerCase(),icon:"✦"};setCustom(p=>[...p,f]);toggle(f);setSearch("");};
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
            {results.slice(0,5).map(f=>(<div key={f.id} onClick={()=>{toggle(f);setSearch("");}} style={{padding:"8px 12px",borderRadius:7,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=T.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><span>{f.icon}</span><span style={{fontSize:13,color:T.ink}}>{f.label}</span></div>))}
            <div onClick={addC} style={{padding:"8px 12px",borderRadius:7,cursor:"pointer",display:"flex",gap:8,alignItems:"center"}} onMouseEnter={e=>e.currentTarget.style.background=T.raised} onMouseLeave={e=>e.currentTarget.style.background="transparent"}><span style={{color:T.am,fontWeight:700}}>+</span><span style={{fontSize:13,color:T.am}}>Add "{search.trim()}"</span></div>
          </div>}
        </div>
        {sel.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:14}}>{sel.map(f=>(<div key={f.id} onClick={()=>toggle(f)} style={{display:"flex",alignItems:"center",gap:6,padding:"5px 10px",background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:20,cursor:"pointer"}}><span style={{fontSize:12}}>{f.icon}</span><span style={{fontSize:12,fontWeight:500,color:T.ink}}>{f.code}</span><span style={{color:T.am,fontWeight:700}}>x</span></div>))}</div>}
        <div style={{fontFamily:F.mono,fontSize:9,color:T.faint,letterSpacing:"0.2em",marginBottom:10}}>ROSEWORTHY UNITS</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7,marginBottom:22}}>
          {UNITS.map(f=>{const on=sel.find(x=>x.id===f.id);return(<div key={f.id} onClick={()=>toggle(f)} style={{padding:"10px 12px",background:on?T.amBg:T.card,border:`1px solid ${on?T.amBd:T.bd}`,borderRadius:10,cursor:"pointer",transition:"all 0.1s"}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:13}}>{f.icon}</span><span style={{fontFamily:F.mono,fontSize:9,color:on?T.am:T.muted}}>{f.code}</span>{on&&<span style={{marginLeft:"auto",color:T.am,fontWeight:700}}>✓</span>}</div>
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


// ── STREAK ─────────────────────────────────────────────────────────────────────
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

// ── PATTERN TRACKER ────────────────────────────────────────────────────────────
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

// ── TASK CARD ──────────────────────────────────────────────────────────────────
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
          <span style={{fontFamily:F.mono,fontSize:9,padding:"1px 7px",background:`${color}15`,border:`1px solid ${color}28`,borderRadius:20,color}}>{tl(task.tier)}</span>
          {task.unitCode&&<span style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>{task.unitCode}</span>}
        </div>
        {task.due&&<div style={{fontFamily:F.mono,fontSize:10,color:T.muted,marginTop:3}}>Due {task.due}</div>}
      </div>
      {task.source==="canvas"&&<span style={{fontFamily:F.mono,fontSize:8,padding:"1px 6px",background:T.puBg,border:`1px solid ${T.puBd}`,borderRadius:5,color:T.pu}}>Canvas</span>}
    </div>
  </div>);
}

// ── CALENDAR STRIP ─────────────────────────────────────────────────────────────
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

// ── PRE-LAB SCREEN ─────────────────────────────────────────────────────────────
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
          <span style={{fontSize:16}}>◎</span>
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
              {[{icon:"◎",t:"Mechanism first",d:"Understand what's actually happening at the molecular or cellular level"},
                {icon:"⊙",t:"Predict then observe",d:"Form a prediction before you enter. It makes your observations 10x more meaningful."},
                {icon:"✦",t:"Save your primer",d:"Your pre-lab notes are saved and become the foundation for your post-lab reflection"},
              ].map(f=>(<div key={f.t} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{color:T.sg,fontSize:16,marginTop:2,flexShrink:0}}>{f.icon}</span>
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
            <div style={{fontFamily:F.mono,fontSize:10,color:T.sg,marginBottom:12,letterSpacing:"0.1em"}}>GENERATING PRIMER · {labName}</div>
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
              <div style={{fontFamily:F.mono,fontSize:9,color:T.sg,marginBottom:8}}>YOUR PRIMER · {labName}</div>
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

// ── POST-LAB SCREEN ────────────────────────────────────────────────────────────
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
        <div style={{width:32,height:32,borderRadius:8,background:T.ocBg,border:`1px solid ${T.ocBd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16}}>◉</span></div>
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
            {saved&&<div style={{marginTop:16,padding:"12px 14px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10,fontSize:13,color:T.sg,fontWeight:600}}>✓ Saved to your notes</div>}
          </div>
        )}
      </div>
    </div>
  );
}


// ── PDF VIEWER ─────────────────────────────────────────────────────────────────
function PDFViewer({doc,onDelete,onUpdate,T,sysPrompt}){
  const[open,setOpen]=useState(false);const[sel,setSel]=useState("");const[mode,setMode]=useState("ask");
  const[askQ,setAskQ]=useState("");const[reflTxt,setReflTxt]=useState("");
  const[streamText,setStreamText]=useState("");const[sBusy,setSBusy]=useState(false);
  const[anns,setAnns]=useState(doc.annotations||[]);const[showAnns,setShowAnns]=useState(false);
  // Persist annotations back to the document store whenever they change
  useEffect(()=>{if(onUpdate&&anns!==doc.annotations)onUpdate(doc.id,{annotations:anns});},[anns]);
  const[view,setView]=useState(doc.pdfData?"pages":"text"); // pages = real rendered PDF, text = extracted
  const[pageNum,setPageNum]=useState(1);const[numPages,setNumPages]=useState(doc.numPages||1);
  const[rendering,setRendering]=useState(false);const[pageHls,setPageHls]=useState({}); // {pageNum:[{text}]}
  const canvasRef=useRef(null);const pdfRef=useRef(null);const textLayerRef=useRef(null);

  // Render a PDF page to canvas + a selectable text layer over it
  const renderPage=useCallback(async(n)=>{
    if(!doc.pdfData||!canvasRef.current)return;
    setRendering(true);
    try{
      if(!window.pdfjsLib){
        await new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";s.onload=res;s.onerror=rej;document.head.appendChild(s);});
        window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
      }
      if(!pdfRef.current){
        const raw=atob(doc.pdfData.split(",")[1]);const arr=new Uint8Array(raw.length);
        for(let i=0;i<raw.length;i++)arr[i]=raw.charCodeAt(i);
        pdfRef.current=await window.pdfjsLib.getDocument({data:arr}).promise;
        setNumPages(pdfRef.current.numPages);
      }
      const page=await pdfRef.current.getPage(n);
      const vp=page.getViewport({scale:1.4});
      const cv=canvasRef.current;const ctx=cv.getContext("2d");
      cv.width=vp.width;cv.height=vp.height;
      await page.render({canvasContext:ctx,viewport:vp}).promise;
      // Build a lightweight text layer for selection
      if(textLayerRef.current){
        const tc=await page.getTextContent();
        textLayerRef.current.innerHTML="";
        textLayerRef.current.style.width=vp.width+"px";textLayerRef.current.style.height=vp.height+"px";
        tc.items.forEach(it=>{
          const sp=document.createElement("span");sp.textContent=it.str;
          const tx=window.pdfjsLib.Util.transform(vp.transform,it.transform);
          sp.style.cssText=`position:absolute;left:${tx[4]}px;top:${tx[5]-it.height*1.4}px;font-size:${Math.abs(it.height*1.4)}px;color:transparent;cursor:text;white-space:pre;`;
          textLayerRef.current.appendChild(sp);
        });
      }
    }catch(e){setView("text");}
    setRendering(false);
  },[doc.pdfData]);

  useEffect(()=>{if(open&&view==="pages"&&doc.pdfData){renderPage(pageNum);}},[open,view,pageNum,renderPage,doc.pdfData]);

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
        setAnns(p=>[...p,ann]);setSBusy(false);
      }),600
    );
  };

  const saveAsk=()=>{
    const ann={id:`a_${Date.now()}`,text:sel,type:"question",content:`Q: ${askQ||"explanation"}\nA: ${streamText}`,createdAt:new Date().toISOString()};
    setAnns(p=>[...p,ann]);setSel("");setStreamText("");setAskQ("");
  };

  return(
    <div style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,marginBottom:10,overflow:"hidden"}}>
      <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10,cursor:"pointer"}} onClick={()=>setOpen(v=>!v)}>
        <div style={{width:36,height:36,borderRadius:8,background:T.ruBg,border:`1px solid ${T.ruBd}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><span style={{fontSize:16}}>📄</span></div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{fontSize:13.5,fontWeight:600,color:T.ink,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{doc.name}</div>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>{anns.length} annotation{anns.length!==1?"s":""} . {((doc.text?.length||0)/1000).toFixed(0)}k chars</div>
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {anns.length>0&&<button onClick={e=>{e.stopPropagation();setShowAnns(v=>!v);}} style={{background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:6,padding:"3px 9px",fontFamily:F.mono,fontSize:8,color:T.am,cursor:"pointer"}}>{anns.length} saved</button>}
          <span style={{fontFamily:F.mono,fontSize:11,color:T.muted}}>{open?"^":"v"}</span>
          <button onClick={e=>{e.stopPropagation();onDelete(doc.id);}} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:16,padding:"0 4px"}}>x</button>
        </div>
      </div>
      {showAnns&&anns.length>0&&<div style={{borderTop:`1px solid ${T.bd}`,padding:"10px 14px",background:T.sf}}>
        <div style={{fontFamily:F.mono,fontSize:9,color:T.am,marginBottom:8}}>Saved annotations</div>
        {anns.map(a=>(<div key={a.id} style={{padding:"9px 12px",background:T.card,border:`1px solid ${a.type==="reflection"?T.sgBd:T.amBd}`,borderRadius:9,marginBottom:7}}>
          <div style={{display:"flex",gap:8,marginBottom:5}}>
            <span style={{fontFamily:F.mono,fontSize:8,padding:"1px 7px",background:a.type==="reflection"?T.sgBg:T.amBg,borderRadius:6,color:a.type==="reflection"?T.sg:T.am}}>{a.type}</span>
            <span style={{fontFamily:F.mono,fontSize:9,color:T.faint}}>{a.createdAt?.slice(0,10)}</span>
          </div>
          <div style={{fontSize:12,color:T.muted,fontStyle:"italic",marginBottom:5}}>"{a.text?.slice(0,100)}..."</div>
          <div style={{fontSize:13,color:T.body,lineHeight:1.7}}>{a.content}</div>
          {a.aiCheck&&<div style={{marginTop:7,padding:"7px 10px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:7}}>
            <div style={{fontFamily:F.mono,fontSize:8,color:T.sg,marginBottom:3}}>Mycel check</div>
            <div style={{fontSize:12,color:T.body,lineHeight:1.6}}>{a.aiCheck}</div>
          </div>}
        </div>))}
      </div>}
      {open&&<div style={{borderTop:`1px solid ${T.bd}`}}>
        {/* View toggle: real pages vs extracted text */}
        {doc.pdfData&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"8px 14px",background:T.raised,borderBottom:`1px solid ${T.bd}`}}>
          <div style={{display:"flex",background:T.card,border:`1px solid ${T.bd}`,borderRadius:8,padding:2}}>
            {[{id:"pages",l:"Pages"},{id:"text",l:"Text"}].map(v=>(
              <button key={v.id} onClick={()=>setView(v.id)} style={{padding:"4px 12px",background:view===v.id?T.am:"transparent",border:"none",borderRadius:6,fontSize:11,fontWeight:view===v.id?600:400,color:view===v.id?"#FFF":T.muted,cursor:"pointer"}}>{v.l}</button>
            ))}
          </div>
          {view==="pages"&&<div style={{display:"flex",alignItems:"center",gap:8,marginLeft:"auto"}}>
            <button onClick={()=>setPageNum(p=>Math.max(1,p-1))} disabled={pageNum<=1} style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:6,padding:"3px 10px",color:pageNum<=1?T.faint:T.body,cursor:pageNum<=1?"default":"pointer",fontSize:12}}>‹</button>
            <span style={{fontFamily:F.mono,fontSize:10,color:T.muted}}>{pageNum} / {numPages}</span>
            <button onClick={()=>setPageNum(p=>Math.min(numPages,p+1))} disabled={pageNum>=numPages} style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:6,padding:"3px 10px",color:pageNum>=numPages?T.faint:T.body,cursor:pageNum>=numPages?"default":"pointer",fontSize:12}}>›</button>
          </div>}
        </div>}

        {/* PAGES VIEW: real rendered PDF page with selectable text layer */}
        {view==="pages"&&doc.pdfData?(
          <div onMouseUp={handleUp} style={{maxHeight:480,overflowY:"auto",padding:"14px",background:T.sf,display:"flex",justifyContent:"center"}}>
            <div style={{position:"relative",display:"inline-block"}}>
              <canvas ref={canvasRef} style={{display:"block",borderRadius:6,boxShadow:T.shadow,maxWidth:"100%",height:"auto"}}/>
              <div ref={textLayerRef} style={{position:"absolute",inset:0,overflow:"hidden",lineHeight:1,userSelect:"text"}}/>
              {rendering&&<div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",background:`${T.sf}CC`,fontFamily:F.mono,fontSize:11,color:T.muted}}>Rendering page...</div>}
            </div>
          </div>
        ):(
          <div onMouseUp={handleUp} style={{maxHeight:340,overflowY:"auto",padding:"14px 16px",fontSize:13.5,lineHeight:1.9,color:T.body,whiteSpace:"pre-wrap",cursor:"text",userSelect:"text",background:T.sf,fontFamily:F.ui}}>
            {doc.text||"No text content found in this file."}
          </div>
        )}
        {sel&&<div style={{padding:"12px 14px",background:T.raised,borderTop:`1px solid ${T.bd}`}}>
          <div style={{fontSize:12,color:T.muted,fontStyle:"italic",marginBottom:10,padding:"5px 10px",background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:6,lineHeight:1.5}}>Selected: "{sel.slice(0,120)}{sel.length>120?"...":""}"</div>
          <div style={{display:"flex",gap:6,marginBottom:10}}>
            {["ask","reflect"].map(m=>(<button key={m} onClick={()=>setMode(m)} style={{padding:"5px 14px",background:mode===m?T.amBg:"none",border:`1px solid ${mode===m?T.amBd:T.bd}`,borderRadius:8,fontSize:12,color:mode===m?T.am:T.muted,cursor:"pointer",fontWeight:mode===m?600:400}}>{m==="ask"?"Ask Mycel":"Save reflection"}</button>))}
            <button onClick={()=>setSel("")} style={{marginLeft:"auto",background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:16}}>x</button>
          </div>
          {mode==="ask"&&<div style={{display:"flex",gap:8}}>
            <input value={askQ} onChange={e=>setAskQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()} placeholder="What does this mean? How does it connect to..." style={{flex:1,background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13.5,padding:"9px 13px",outline:"none"}}/>
            <button onClick={ask} disabled={sBusy} style={{background:T.am,border:"none",borderRadius:9,padding:"9px 18px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>{sBusy?"...":"Ask"}</button>
          </div>}
          {mode==="reflect"&&<div>
            <textarea value={reflTxt} onChange={e=>setReflTxt(e.target.value)} placeholder="Write your understanding. Mycel will check it and surface what you might be missing..." rows={3} style={{width:"100%",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13.5,padding:"9px 13px",outline:"none",resize:"vertical",lineHeight:1.7,boxSizing:"border-box",marginBottom:8}}/>
            <button onClick={saveRefl} disabled={sBusy||!reflTxt.trim()} style={{background:reflTxt.trim()&&!sBusy?T.sg:T.raised,border:"none",borderRadius:9,padding:"9px 18px",color:reflTxt.trim()&&!sBusy?"#FFF":T.faint,fontSize:13,fontWeight:600,cursor:reflTxt.trim()&&!sBusy?"pointer":"not-allowed"}}>{sBusy?"Checking...":"Save and validate"}</button>
          </div>}
          {streamText&&<div style={{marginTop:10,padding:"12px 14px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10}}>
            <div style={{fontFamily:F.mono,fontSize:8,color:T.am,marginBottom:5}}>Mycel</div>
            <div style={{fontSize:13.5,color:T.ink,lineHeight:1.85,whiteSpace:"pre-wrap"}}>
              {streamText}
              {sBusy&&<span style={{display:"inline-block",width:2,height:16,background:T.am,marginLeft:2,animation:"blink 0.8s step-end infinite",verticalAlign:"text-bottom"}}/>}
            </div>
            {!sBusy&&mode==="ask"&&<button onClick={saveAsk} style={{marginTop:8,background:T.amBg,border:`1px solid ${T.amBd}`,borderRadius:7,padding:"5px 12px",fontSize:11.5,color:T.am,cursor:"pointer"}}>Save annotation</button>}
          </div>}
        </div>}
      </div>}
    </div>
  );
}

// ── NOTE TEMPLATES ─────────────────────────────────────────────────────────────
function NoteTemplates({T,onUse}){
  const[sel,setSel]=useState(null);
  const[filled,setFilled]=useState("");
  const[custom,setCustom]=useState([]);
  const[creating,setCreating]=useState(false);
  const[newTpl,setNewTpl]=useState({name:"",icon:"✦",desc:"",s:""});
  const[msg,setMsg]=useState("");

  // Keep filled state independent from sel so it doesn't reset
  const handleSelect=(tpl)=>{setSel(tpl);setFilled(tpl.s);};

  const saveCustom=()=>{
    if(!newTpl.name||!newTpl.s)return;
    setCustom(p=>[...p,{id:`cx_${Date.now()}`,...newTpl}]);
    setCreating(false);setNewTpl({name:"",icon:"✦",desc:"",s:""});
  };
