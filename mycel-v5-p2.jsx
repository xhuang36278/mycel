
  const all=[...NOTE_TPLS,...custom];

  if(creating)return(
    <div>
      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:16}}>
        <button onClick={()=>setCreating(false)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer"}}>Back</button>
        <div style={{fontSize:16,fontWeight:700,color:T.ink}}>Create template</div>
      </div>
      {[{f:"name",l:"Name",ph:"Template name"},{f:"icon",l:"Icon",ph:"Emoji"},{f:"desc",l:"Description",ph:"What is this template for?"}].map(({f,l,ph})=>(
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
        <div style={{fontSize:15,fontWeight:700,color:T.ink}}>{sel.icon} {sel.name}</div>
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
          <div style={{fontSize:20,marginBottom:7}}>{tpl.icon}</div>
          <div style={{fontSize:13.5,fontWeight:600,color:T.ink,marginBottom:4}}>{tpl.name}</div>
          <div style={{fontSize:12,color:T.muted,lineHeight:1.4}}>{tpl.desc}</div>
          {tpl.id?.startsWith("cx_")&&<div style={{marginTop:6,fontFamily:F.mono,fontSize:8,color:T.am}}>custom</div>}
        </div>))}
      </div>
    </div>
  );
}

// ── EXAM BUILDER ───────────────────────────────────────────────────────────────
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
          <button onClick={()=>{navigator.clipboard.writeText(`Mycel exam: ${exam.title} -- code: exam-${Date.now()}`);setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{background:T.puBg,border:`1px solid ${T.puBd}`,borderRadius:8,padding:"6px 14px",fontSize:12,color:T.pu,cursor:"pointer"}}>{copied?"Copied ✓":"Share link"}</button>
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
    <div style={{marginBottom:12}}><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>QUESTION TYPES</div><div style={{display:"flex",flexWrap:"wrap",gap:6}}>{TYPES.map(t=>(<button key={t.id} onClick={()=>toggleT(t.id)} style={{padding:"6px 12px",background:cfg.types.includes(t.id)?T.amBg:T.card,border:`1px solid ${cfg.types.includes(t.id)?T.amBd:T.bd}`,borderRadius:20,fontSize:12,color:cfg.types.includes(t.id)?T.am:T.body,cursor:"pointer",fontWeight:cfg.types.includes(t.id)?600:400}}>{cfg.types.includes(t.id)?"✓ ":""}{t.l}</button>))}</div></div>
    <div style={{marginBottom:18}}><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:7}}>SCORING</div>{SCORING.map(s=>(<div key={s.id} onClick={()=>setCfg(c=>({...c,scoring:s.id}))} style={{display:"flex",alignItems:"center",gap:10,padding:"9px 12px",background:cfg.scoring===s.id?T.amBg:T.card,border:`1px solid ${cfg.scoring===s.id?T.amBd:T.bd}`,borderRadius:9,marginBottom:6,cursor:"pointer"}}><div style={{width:14,height:14,borderRadius:"50%",border:`2px solid ${cfg.scoring===s.id?T.am:T.bd}`,background:cfg.scoring===s.id?T.am:"transparent",flexShrink:0}}/><span style={{fontSize:13,color:T.body}}>{s.l}</span></div>))}</div>
    <button onClick={generate} disabled={busy||!notes.length} style={{width:"100%",padding:"12px",background:notes.length&&!busy?T.am:T.raised,border:"none",borderRadius:11,color:notes.length&&!busy?"#FFF":T.faint,fontSize:15,fontWeight:700,cursor:notes.length&&!busy?"pointer":"not-allowed"}}>{busy?"Generating exam...":"Generate exam ->"}</button>
  </div>);
}

// ── QUICK QUIZ ─────────────────────────────────────────────────────────────────
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

// ── CHAT MESSAGE ───────────────────────────────────────────────────────────────
function ChatMessage({m,T,setHl,genNote,onAddToNotes}){
  const isAI=m.role==="assistant";const[hov,setHov]=useState(false);
  const[added,setAdded]=useState(false);
  const crossUnitSf=m.crossUnit&&!m.streaming?"'Fraunces', Georgia, serif":"inherit";
  return(<div style={{marginBottom:m.branch?12:24,paddingLeft:isAI?0:"14%",position:"relative"}} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}>
    {m.branch&&<div style={{position:"absolute",left:3,top:-12,bottom:0,width:2,background:T.thr,borderRadius:1}}/>}
    {isAI&&<div style={{display:"flex",alignItems:"center",gap:7,marginBottom:6}}>
      <img src={T.bg==="#100D08"?"/mycel-logo-light.png":"/mycel-logo-dark.png"} alt="" style={{height:15,width:"auto",objectFit:"contain"}} onError={(e)=>{e.target.style.display="none";e.target.nextSibling.style.display="inline-block";}}/>
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
          {added?"✓ added to panel":"+ live notes"}
        </button>}
      </div>}
    </div>
    {m.savedNote&&<div style={{marginTop:8,padding:"10px 13px",background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:10}}><div style={{fontFamily:F.mono,fontSize:8,color:T.sg,marginBottom:5}}>✦ Saved note</div><div style={{fontSize:13,color:T.body,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{m.savedNote}</div></div>}
  </div>);
}

// ── NOTE EDIT MODAL ────────────────────────────────────────────────────────────
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
body,button,input,textarea{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;}
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
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important;}}
`;}



// ── VOICE QUIZ COMPONENT ──────────────────────────────────────────────────────
function VoiceQuiz({T,F,notes,docs,setup,survey,SP,graph,addToGraph,quizState,setQuizState,quizSession,setQuizSession,quizReport,setQuizReport,isListening,setIsListening,transcript,setTranscript,quizSource,setQuizSource,quizMode,setQuizMode,mcqState,setMcqState,mcqSession,setMcqSession,mcqReport,setMcqReport,setTab,setLearnSub,setInput}){
  const [currentAnswer,setCurrentAnswer]=useState("");
  const [evalResult,setEvalResult]=useState(null);
  const [error,setError]=useState("");
  const recognitionRef=useRef(null);

  // ── Speech recognition setup ──
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

  // ── Source content for quiz ──
  const getSourceContent=()=>{
    if(quizSource==="notes"){
      return notes.slice(-20).map(n=>`[${n.unit||"General"}] ${n.title||""}: ${n.body||""}`).join("\n\n");
    }
    return docs.slice(-3).map(d=>`[${d.name}]\n${d.text.slice(0,3000)}`).join("\n\n---\n\n");
  };

  // ── Generate adaptive question set ──
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
    }catch(e){setError("Could not generate quiz. Try again.");setQuizState("idle");}
  };

  // ── Submit answer and evaluate ──
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

  // ── Advance to next question or generate report ──
  const nextQuestion=()=>{
    const next=quizSession.current+1;
    if(next>=quizSession.questions.length){generateReport();}
    else{setQuizSession(s=>({...s,current:next}));setCurrentAnswer("");setTranscript("");setEvalResult(null);}
  };

  // ── Generate final report ──
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

  // ── MCQ MODE: connection-focused multiple choice ──────────────────────────────
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

  // ── MODE TOGGLE (shown on idle) ──
  const ModeToggle=()=>(
    <div style={{display:"flex",gap:6,marginBottom:20,background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,padding:4,width:"fit-content"}}>
      {[{id:"voice",l:"Voice Quiz"},{id:"mcq",l:"Connection MCQ"}].map(m=>(
        <button key={m.id} onClick={()=>setQuizMode(m.id)}
          style={{padding:"7px 16px",background:quizMode===m.id?T.am:"transparent",border:"none",borderRadius:9,
            fontSize:12.5,fontWeight:quizMode===m.id?600:400,color:quizMode===m.id?"#FFF":T.muted,cursor:"pointer"}}>{m.l}</button>
      ))}
    </div>
  );

  // ── MCQ RENDER (when mode is mcq) ──
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

  // ── IDLE STATE ──
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

  // ── LOADING STATE ──
  if(quizState==="loading") return(
    <div style={{padding:"80px 0",textAlign:"center"}}>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:16}}>Preparing your questions...</div>
      <div style={{display:"flex",gap:6,justifyContent:"center"}}>
        {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:T.am,animation:`pulse 1.2s ease ${i*0.2}s infinite`}}/>)}
      </div>
    </div>
  );

  // ── ACTIVE QUIZ STATE ──
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
