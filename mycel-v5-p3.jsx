
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

  // ── REPORT STATE ──
  if(quizState==="report"&&quizReport) return(
    <div>
      <div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em",marginBottom:4}}>Session Report</div>
      <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:20}}>{quizSession.questions.length} questions · {new Date(quizSession.startedAt).toLocaleTimeString()}</div>

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

// ── QUICK CAPTURE COMPONENT ──────────────────────────────────────────────────
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
    <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginBottom:16}}>Bring Outside Content In · Mycel Connects It to What You Already Know</div>
    <div style={{padding:"12px 14px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:11,marginBottom:18,fontSize:12.5,color:T.body,lineHeight:1.7}}>
      <strong>What This Does:</strong> Found something useful while studying: a paper, a lecture slide, a quote, an idea? Paste it here. Mycel reads it, then tells you how it connects to the concepts you are already learning in your other units, and suggests what to do with it next. It is how you turn scattered reading into connected understanding.
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


// ── CONNECT TAB CONTENT ────────────────────────────────────────────────────────
function ConnectTabContent({T,notes,setNotes,deadlines,setDeadlines,addDeadline,setup,projects:projectsProp,setProjects:setProjectsProp}){
  // Lightweight Projects: group notes by topic. Supports the core loop --
  // notes in the same project can be connected across units. No milestones/tasks/files/social.
  const[_projects,_setProjects]=useState([]);
  const projects=projectsProp||_projects;
  const setProjectsBase=setProjectsProp||_setProjects;
  const[activeProject,setActiveProject]=useState(null);
  const[showNew,setShowNew]=useState(false);
  const[newName,setNewName]=useState("");
  const db=window.storage;

  useEffect(()=>{
    if(!projectsProp){(async()=>{try{const r=await db?.get("mycel_projects");if(r?.value)_setProjects(JSON.parse(r.value));}catch{}})();}
  },[]);

  const saveProjects=async(p)=>{setProjectsBase(p);try{await db?.set("mycel_projects",JSON.stringify(p));}catch{}};

  const createProject=async()=>{
    if(!newName.trim())return;
    const p={id:`proj_${Date.now()}`,name:newName.trim(),createdAt:new Date().toISOString(),noteIds:[]};
    await saveProjects([...projects,p]);
    setNewName("");setShowNew(false);setActiveProject(p);
  };

  const F2=F||{mono:"'DM Mono',monospace"};

  // Project detail: show notes assigned to this project + ability to add existing notes
  if(activeProject){
    const proj=projects.find(p=>p.id===activeProject.id)||activeProject;
    const projNotes=notes.filter(n=>(proj.noteIds||[]).includes(n.id));
    const otherNotes=notes.filter(n=>!(proj.noteIds||[]).includes(n.id));
    const assign=async(noteId)=>{
      const updated=projects.map(p=>p.id===proj.id?{...p,noteIds:[...(p.noteIds||[]),noteId]}:p);
      await saveProjects(updated);setActiveProject(updated.find(p=>p.id===proj.id));
    };
    const unassign=async(noteId)=>{
      const updated=projects.map(p=>p.id===proj.id?{...p,noteIds:(p.noteIds||[]).filter(i=>i!==noteId)}:p);
      await saveProjects(updated);setActiveProject(updated.find(p=>p.id===proj.id));
    };
    return(<div>
      <button onClick={()=>setActiveProject(null)} style={{background:"none",border:`1px solid ${T.bd}`,borderRadius:7,padding:"5px 12px",fontSize:12,color:T.muted,cursor:"pointer",marginBottom:16}}>Back to projects</button>
      <div style={{fontFamily:F.display,fontSize:26,color:T.ink,marginBottom:4}}>{proj.name}</div>
      <div style={{fontFamily:F2.mono,fontSize:11,color:T.muted,marginBottom:20}}>{projNotes.length} notes gathered · look for connections across your units</div>

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
      {!projNotes.length&&<div style={{padding:"30px 20px",textAlign:"center",fontSize:12.5,color:T.muted,lineHeight:1.6}}>Gather notes on one theme here, then watch the threads between your units appear. Add notes below to begin.</div>}

      {otherNotes.length>0&&<div style={{marginTop:20}}>
        <div style={{fontFamily:F2.mono,fontSize:9,color:T.muted,marginBottom:8}}>ADD A NOTE TO THIS PROJECT</div>
        {otherNotes.slice(0,8).map(n=>(
          <button key={n.id} onClick={()=>assign(n.id)} style={{display:"block",width:"100%",textAlign:"left",marginBottom:6,padding:"9px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,cursor:"pointer",fontSize:12,color:T.body}}>
            + {n.title||n.text?.slice(0,60)}
          </button>
        ))}
      </div>}
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

    {showNew&&<div style={{padding:14,background:T.card,border:`1px solid ${T.amBd}`,borderRadius:11,marginBottom:16}}>
      <input value={newName} onChange={e=>setNewName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createProject()}
        placeholder="Project name (e.g. Phosphorus across my units)"
        style={{width:"100%",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:8,color:T.ink,fontSize:14,padding:"10px 12px",outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
      <div style={{display:"flex",gap:8}}>
        <button onClick={createProject} style={{flex:1,padding:"9px",background:T.am,border:"none",borderRadius:8,color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>Create</button>
        <button onClick={()=>setShowNew(false)} style={{padding:"9px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:8,color:T.muted,fontSize:13,cursor:"pointer"}}>Cancel</button>
      </div>
    </div>}

    {!projects.length&&!showNew&&<div style={{padding:"50px 0",textAlign:"center"}}>
      <div style={{fontSize:14,color:T.ink,fontWeight:600,marginBottom:6}}>No projects yet</div>
      <div style={{fontFamily:F2.mono,fontSize:11,color:T.faint,maxWidth:320,margin:"0 auto",lineHeight:1.6}}>A project is a place to gather notes on one theme, then Mycel helps you see how they connect across your units.</div>
    </div>}

    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:10}}>
      {projects.map(p=>(
        <div key={p.id} onClick={()=>setActiveProject(p)} style={{padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderLeft:`3px solid ${T.sg}`,borderRadius:11,cursor:"pointer"}}>
          <div style={{fontSize:14,fontWeight:700,color:T.ink,marginBottom:4}}>{p.name}</div>
          <div style={{fontFamily:F2.mono,fontSize:9,color:T.muted}}>{(p.noteIds||[]).length} notes</div>
        </div>
      ))}
    </div>
  </div>);
}

// ── PROFILE TAB ────────────────────────────────────────────────────────────────
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
          <span style={{fontSize:14}}>{f.icon}</span>
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

// ── FIRST TIME GUIDE ───────────────────────────────────────────────────────────
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
            {icon:"◎",title:"Ask a question from your last lecture",sub:"Start with something you didn't fully understand today",action:onStartLearn,color:T.am},
            {icon:"🧪",title:"Prepare for an upcoming lab",sub:"Get a mechanism primer before you walk in",action:onStartLab,color:T.sg},
            {icon:"▣",title:"Upload notes to annotate and ask about",sub:"Paste lecture notes or a reading passage",action:onClose,color:T.oc},
          ].map(o=>(
            <button key={o.icon} onClick={o.action} style={{display:"flex",alignItems:"flex-start",gap:12,padding:"12px 14px",background:T.raised,border:`1px solid ${T.bd}`,borderRadius:11,cursor:"pointer",textAlign:"left",transition:"all 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.borderColor=T.amBd} onMouseLeave={e=>e.currentTarget.style.borderColor=T.bd}>
              <span style={{fontSize:18,flexShrink:0,marginTop:1}}>{o.icon}</span>
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

// ── MAIN APP ───────────────────────────────────────────────────────────────────

// ── LIVE NETWORK ──────────────────────────────────────────────────────────────
// ── KNOWLEDGE NETWORK (full view) ──────────────────────────────────────────────
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
          <div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:2}}>{nodes.length} concepts · gold threads are cross-unit connections</div>
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
          Bigger nodes are concepts you return to most. <span style={{color:T.gold||T.am,fontWeight:600}}>Gold threads</span> link concepts from different units; these are the cross-domain connections that turn separate facts into understanding. A dense gold web means you are thinking across your whole degree, not subject by subject.
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
  const[sessionMap,setSessionMap]=useState([]); // curiosity-flow: branches dug into this session [{concept, parent, q}]
  const[showMap,setShowMap]=useState(false); // living map panel visibility
  const[synthesis,setSynthesis]=useState(null); // {busy, text} from "Build the Big Picture"
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
  const[newTask,setNewTask]=useState({text:"",tier:1,due:"",unitCode:""});
  const[showNewTask,setShowNewTask]=useState(false);
  const today=new Date().toISOString().slice(0,10);
  const[selDay,setSelDay]=useState(today);
  const endRef=useRef();const inpRef=useRef();
  const T=theme==="light"?L:D;
