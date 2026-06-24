
  useEffect(()=>{(async()=>{
    const h=new Date().getHours();
    const th=await db.get("mycel_theme");setTheme(th||(h>=7&&h<19?"light":"dark"));
    const sv=await db.get("mycel_sv7");const s=await db.get("mycel_s7");
    const m=await db.get("mycel_m7");const g=await db.get("mycel_g7");const n=await db.get("mycel_n7");
    const tk=await db.get("mycel_tk7");const d=await db.get("mycel_d7");const st=await db.get("mycel_st7");
    const sess=await db.get("mycel_sess7");const dc=await db.get("mycel_dc7");
    if(sv)setSurvey(sv);if(s)setSetup(s);if(m)setMsgs(m);if(g)setGraph(g);if(n)setNotes(n);
    if(tk)setTasks(tk);if(d)setDeadlines(d);if(st)setStreak(st);if(sess)setSessions(sess);if(dc)setDocs(dc);
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
          // Curiosity-flow: record this question as a branch in the living session map
          if(topics.length){
            setSessionMap(prev=>{
              const root=prev.length?prev[0].concept:(topics[0]||text.slice(0,40));
              const existing=new Set(prev.map(b=>b.concept.toLowerCase()));
              const adds=topics.filter(t=>!existing.has(t.toLowerCase())).map(t=>({concept:t,parent:prev.length?root:null,q:text.slice(0,60)}));
              return [...prev,...adds].slice(0,40);
            });
          }
          const finalMsgs=[...nm,{id:aiId,role:"assistant",content:acc,streaming:false,crossUnit:hasCross}];
          db.set("mycel_m7",finalMsgs.slice(-70));db.set("mycel_g7",graph);db.set("mycel_sess7",upSess.slice(-60));
          setBusy(false);setTimeout(()=>inpRef.current?.focus(),50);
        }
      );
    }catch{
      setMsgs(p=>p.map(m=>m.id===aiId?{...m,content:"Connection issue. Try again.",streaming:false}:m));
      setBusy(false);
    }
  };

  // Curiosity-flow: synthesise the whole branching session into one coherent big picture
  const buildBigPicture=async()=>{
    if(!msgs.length){return;}
    setSynthesis({busy:true,text:""});
    const convo=msgs.map(m=>`${m.role==="user"?"Student asked":"Mycel explained"}: ${m.content}`).join("\n\n").slice(0,7000);
    const branches=sessionMap.map(b=>b.concept).join(", ");
    const sys="You are Mycel. The student has been learning by following their curiosity, asking deeper and deeper into a topic across many messages. Their thread has branched and they have lost the big picture. Your job: weave the whole conversation into ONE coherent explanation of the full mechanism/concept -- how the pieces they explored fit together into a single picture. Rules: stay internally consistent (do not contradict what was explained earlier; if something needs correcting, say so explicitly). If any part is genuinely debated in the science, flag it and name the views. Prefer textbook/peer-reviewed consensus over guessing; if unsure, say so. Structure: start with the one-sentence big picture, then walk the mechanism in order, showing how each branch the student dug into slots into the whole. Keep it tight and readable, not a wall of text.";
    const prompt="Concepts the student branched into this session: "+(branches||"(none tracked)")+"\n\nThe full conversation:\n"+convo+"\n\nNow build the big picture.";
    let acc="";
    try{
      await streamAI([{role:"user",content:prompt}],sys,(t)=>{acc+=t;setSynthesis({busy:true,text:acc});},()=>{setSynthesis({busy:false,text:acc});},1600);
    }catch{
      setSynthesis({busy:false,text:"Connection issue. Try again once AI is connected."});
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
    }catch{setNoteModal({text:"Failed to generate note.",msgId:msg?.id,mode:"single"});}
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
  const addTask=async()=>{if(!newTask.text.trim())return;const t={...newTask,id:`t_${Date.now()}`,done:false};const up=[...tasks,t];setTasks(up);await db.set("mycel_tk7",up);setNewTask({text:"",tier:1,due:"",unitCode:""});setShowNewTask(false);};
  const addDeadline=async(d)=>{const up=[...deadlines,d];setDeadlines(up);await db.set("mycel_d7",up);};
  const uploadFile=async(e)=>{
    const file=e.target.files[0];if(!file)return;
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
          text+=tc.items.map(it=>it.str).join(" ")+"\n\n";
        }
        // Store the PDF bytes as base64 so we can render real pages on open.
        // Cap at ~6MB to stay within storage limits; larger PDFs fall back to text view.
        let dataUrl=null;
        if(buf.byteLength<6_000_000){
          const bytes=new Uint8Array(buf);let bin="";
          for(let i=0;i<bytes.length;i++)bin+=String.fromCharCode(bytes[i]);
          dataUrl="data:application/pdf;base64,"+btoa(bin);
        }
        const doc={id:`d_${Date.now()}`,name:file.name,text:text.slice(0,40000),annotations:[],isPDF:true,pdfData:dataUrl,numPages:pdf.numPages};
        const up=[...docs,doc];setDocs(up);await db.set("mycel_dc7",up);
      }catch(err){alert("Could not read this PDF. It may be scanned images rather than text. Try copying the text and using Paste instead.");}
      return;
    }
    const reader=new FileReader();
    reader.onload=async(ev)=>{const doc={id:`d_${Date.now()}`,name:file.name,text:(ev.target.result||"").slice(0,40000),annotations:[]};const up=[...docs,doc];setDocs(up);await db.set("mycel_dc7",up);};
    reader.readAsText(file);
  };
  const deleteDoc=async(id)=>{const up=docs.filter(d=>d.id!==id);setDocs(up);await db.set("mycel_dc7",up);};
  const updateDoc=async(id,patch)=>{const up=docs.map(d=>d.id===id?{...d,...patch}:d);setDocs(up);await db.set("mycel_dc7",up);};

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
  const NAV=[{id:"today",icon:"⊙",l:"Daily"},{id:"learn",icon:"◎",l:"Learn"},{id:"connect",icon:"▤",l:"Projects",dim:true}];

  return(
    <div style={{background:T.bg,minHeight:"100vh",display:"flex",flexDirection:"column",fontFamily:F.ui}}>
      <style>{FONTS+gCSS(T)}</style>

      {/* HEADER */}
      <div style={{borderBottom:`1px solid ${T.bd}`,padding:"9px 18px",background:T.sf,display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,position:"sticky",top:0,zIndex:50}}>
        <Logo T={T} size={20}/>
        <div style={{display:"flex",gap:3,alignItems:"center",flexWrap:"wrap"}} className="hide-mobile">
          {NAV.filter(n=>!n.dim).map(n=>(<button key={n.id} onClick={()=>setTab(n.id)} style={{background:tab===n.id?T.amBg:"none",border:`1px solid ${tab===n.id?T.amBd:"transparent"}`,borderRadius:8,padding:"5px 13px",fontSize:13,color:tab===n.id?T.am:T.body,cursor:"pointer",fontWeight:tab===n.id?600:500}}>{n.icon} {n.l}</button>))}
          <div style={{width:1,height:16,background:T.bd,margin:"0 4px"}}/>
          {NAV.filter(n=>n.dim).map(n=>(<button key={n.id} onClick={()=>setTab(n.id)} style={{background:tab===n.id?T.amBg:"none",border:`1px solid ${tab===n.id?T.amBd:"transparent"}`,borderRadius:8,padding:"5px 10px",fontSize:11.5,color:tab===n.id?T.am:T.faint,cursor:"pointer",fontWeight:400}}>{n.l}</button>))}
        </div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>
          {/* Lab mode quick buttons */}
          <div style={{display:"flex",gap:4}} className="hide-mobile">
            <button onClick={()=>setLabScreen("prelab")} style={{background:T.sgBg,border:`1px solid ${T.sgBd}`,borderRadius:8,padding:"5px 11px",fontFamily:F.mono,fontSize:9,color:T.sg,cursor:"pointer"}}>◎ Pre-lab</button>
            <button onClick={()=>setLabScreen("postlab")} style={{background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:8,padding:"5px 11px",fontFamily:F.mono,fontSize:9,color:T.oc,cursor:"pointer"}}>◉ Post-lab</button>
          </div>
          <StreakRing streak={streak} T={T} size={36}/>
          <button onClick={toggleTheme} style={{background:T.card,border:`1px solid ${T.bd}`,borderRadius:8,padding:"5px 10px",fontFamily:F.mono,fontSize:11,color:T.muted,cursor:"pointer"}}>{theme==="light"?"◐":"◑"}</button>
          <div onClick={()=>setMenu(v=>!v)} style={{width:30,height:30,borderRadius:"50%",background:T.am,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"#FFF",fontSize:13,fontWeight:700,position:"relative",flexShrink:0}}>
            {(setup?.name||"S")[0].toUpperCase()}
            {menu&&<div style={{position:"absolute",top:36,right:0,background:T.card,border:`1px solid ${T.bd}`,borderRadius:12,padding:6,minWidth:180,boxShadow:"0 16px 48px -12px rgba(20,16,10,0.3)",zIndex:100,textAlign:"left"}}>
              <div style={{padding:"8px 12px",borderBottom:`1px solid ${T.bdS}`}}><div style={{fontSize:13,fontWeight:600,color:T.ink}}>{setup?.name||"Student"}</div><div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginTop:2}}>{streak} day streak</div></div>
              <div onClick={()=>{setTab("profile");setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>View profile</div>
              <div onClick={()=>{setScreen("survey");setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>Retake survey</div>
              <div onClick={()=>{setScreen("onboard");setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.body,cursor:"pointer",borderRadius:8}}>Change units</div>
              <div onClick={async()=>{setMsgs([]);setGraph([]);setNotes([]);setTasks([]);setDeadlines([]);setDocs([]);setStreak(0);setSessions([]);setSessionMap([]);setSynthesis(null);await Promise.all(["mycel_m7","mycel_g7","mycel_n7","mycel_tk7","mycel_d7","mycel_dc7","mycel_st7","mycel_sess7"].map(k=>db.set(k,null)));setMenu(false);}} style={{padding:"8px 12px",fontSize:13,color:T.ru,cursor:"pointer",borderRadius:8}}>Clear session</div>
            </div>}
          </div>
        </div>
      </div>

      {/* MOBILE NAV */}
      <div className="mob-nav" style={{display:"none",position:"fixed",bottom:0,left:0,right:0,background:T.sf,borderTop:`1px solid ${T.bd}`,padding:"6px 0",zIndex:50,flexDirection:"row"}}>
        {NAV.slice(0,6).map(n=>(<button key={n.id} onClick={()=>setTab(n.id)} style={{flex:1,background:"none",border:"none",padding:"5px 2px",fontSize:9,color:tab===n.id?T.am:T.muted,cursor:"pointer",fontWeight:tab===n.id?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><span style={{fontSize:14}}>{n.icon}</span><span>{n.l.split(" ")[0]}</span></button>))}
      </div>

      <div style={{flex:1,display:"flex",overflow:"hidden",height:"calc(100vh - 48px)"}}>
        {/* SIDEBAR */}
        <div className="hide-mobile" style={{width:200,borderRight:`1px solid ${T.bd}`,background:T.sf,overflowY:"auto",flexShrink:0,padding:"14px 12px"}}>
          <div style={{fontFamily:F.mono,fontSize:9,color:T.faint,letterSpacing:"0.2em",marginBottom:9}}>UNITS</div>
          {(setup?.fields||[]).map(f=>(<div key={f.id} style={{display:"flex",alignItems:"center",gap:7,padding:"5px 0",borderBottom:`1px solid ${T.d2}`}}><span style={{fontSize:13}}>{f.icon}</span><div><div style={{fontFamily:F.mono,fontSize:8,color:T.am}}>{f.code}</div><div style={{fontSize:11,color:T.muted,lineHeight:1.2}}>{f.label}</div></div></div>))}
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
          {tab==="today"&&(<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:760,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>

            {/* ── COMPANION ENTRY POINT ── */}
            {selDay===today&&(()=>{
              const hr=new Date().getHours();
              const greet=hr<12?"Good morning":hr<18?"Good afternoon":"Good evening";
              const prompt=hr<12?"What do you want to understand today?":hr<18?"What are you working through right now?":"What clicked for you today?";
              return(
                <div style={{marginBottom:22,animation:"fadeUp 0.5s ease"}}>
                  <div style={{fontFamily:F.mono,fontSize:10,color:T.am,letterSpacing:"0.1em",marginBottom:4}}>{greet.toUpperCase()}{setup?.name?", "+setup.name.toUpperCase():""}</div>
                  <div style={{fontFamily:F.display,fontSize:33,fontWeight:460,color:T.ink,letterSpacing:"-0.01em",lineHeight:1.15,marginBottom:16}}>{prompt}</div>

                  {!dailyFocus&&!focusBusy&&(
                    <button onClick={genDailyFocus}
                      style={{background:`linear-gradient(135deg, ${T.amBg}, ${T.card})`,border:`1px solid ${T.amBd}`,borderRadius:16,
                        padding:"18px 20px",width:"100%",textAlign:"left",cursor:"pointer",display:"flex",
                        alignItems:"center",justifyContent:"space-between",gap:12,boxShadow:T.shadowSoft}}>
                      <div>
                        <div style={{fontSize:14.5,fontWeight:600,color:T.am,marginBottom:3}}>Show Me Where to Focus Today</div>
                        <div style={{fontFamily:F.mono,fontSize:10,color:T.muted}}>Mycel reads your notes and finds a connection worth exploring</div>
                      </div>
                      <span style={{fontSize:18,color:T.am,flexShrink:0}}>-></span>
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
                        <div style={{padding:"22px 24px",background:`linear-gradient(135deg, ${(T.nwm||T.oc)}14, ${(T.nwm||T.oc)}08)`,
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
                            <p style={{margin:"0 0 10px",fontFamily:F.display,fontSize:21,color:T.ink,lineHeight:1.35}}>{dailyFocus.connection}</p>
                            {dailyFocus.why&&<p style={{margin:"0 0 16px",fontSize:13,color:T.muted,lineHeight:1.65}}>{dailyFocus.why}</p>}
                            <button onClick={()=>{setTab("learn");setLearnSub("chat");setInput&&setInput("Help me understand this connection: "+dailyFocus.connection);}}
                              style={{background:T.nwm||T.oc,border:"none",borderRadius:10,padding:"9px 18px",
                                color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer",boxShadow:T.shadowSoft}}>Explore This Connection</button>
                          </div>
                        </div>
                      )}
                      {/* Understand today -- supporting */}
                      <div style={{padding:"16px 18px",background:T.card,border:`1px solid ${T.bd}`,
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

            {/* ── SCHEDULE (secondary) ── */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div><div style={{fontSize:16,fontWeight:700,color:T.ink,letterSpacing:"-0.02em"}}>{selDay===today?"Your day":"Tasks . "+selDay}</div><div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:2}}>{new Date(selDay+"T12:00:00").toLocaleDateString("en-AU",{weekday:"long",day:"numeric",month:"long"})}</div></div>
              <div style={{display:"flex",gap:10,alignItems:"center"}}><StreakRing streak={streak} T={T} size={44}/><button onClick={()=>setShowNewTask(v=>!v)} style={{background:T.am,border:"none",borderRadius:10,padding:"8px 16px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>+ Task</button></div>
            </div>
            <CalStrip tasks={tasks} deadlines={deadlines} today={today} selDay={selDay} onSel={setSelDay} T={T}/>
            {showNewTask&&<div style={{margin:"14px 0",padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.muted,marginBottom:10}}>NEW TASK</div>
              <input value={newTask.text} onChange={e=>setNewTask(p=>({...p,text:e.target.value}))} placeholder="Task description..." style={{width:"100%",padding:"9px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:14,outline:"none",marginBottom:10,boxSizing:"border-box"}}/>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <select value={newTask.tier} onChange={e=>setNewTask(p=>({...p,tier:+e.target.value}))} style={{padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none",cursor:"pointer"}}><option value={1}>T1 . core</option><option value={2}>T2 . applied</option><option value={3}>T3 . extended</option></select>
                <input value={newTask.unitCode} onChange={e=>setNewTask(p=>({...p,unitCode:e.target.value}))} placeholder="Unit code" style={{width:110,padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none"}}/>
                <input value={newTask.due} onChange={e=>setNewTask(p=>({...p,due:e.target.value}))} type="date" style={{padding:"8px 12px",background:T.sf,border:`1px solid ${T.bd}`,borderRadius:9,color:T.ink,fontSize:13,outline:"none"}}/>
                <button onClick={addTask} style={{background:T.am,border:"none",borderRadius:9,padding:"8px 16px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>Add</button>
              </div>
            </div>}
            {todayTasks.length===0?<div style={{padding:"40px 24px",textAlign:"center"}}><div style={{fontSize:14,color:T.ink,marginBottom:4}}>Nothing due today</div><div style={{fontSize:12.5,color:T.muted,lineHeight:1.6}}>A clear day. Add a task with "+ Task" when something comes up, or spend the time on a connection in Learn.</div></div>:(
              [1,2,3].map(tier=>{const ts=todayTasks.filter(t=>t.tier===tier);if(!ts.length)return null;const color=tc(T,tier);return(<div key={tier}><div style={{fontFamily:F.mono,fontSize:9,color,letterSpacing:"0.15em",margin:"16px 0 8px"}}>{tl(tier).toUpperCase()}</div>{ts.map(t=><TaskCard key={t.id} task={t} onToggle={toggleTask} T={T}/>)}</div>);})
            )}
            {deadlines.length>0&&selDay===today&&<div style={{marginTop:20}}>
              <div style={{fontFamily:F.mono,fontSize:9,color:T.ru,letterSpacing:"0.15em",marginBottom:10}}>UPCOMING DEADLINES</div>
              {deadlines.sort((a,b)=>a.due.localeCompare(b.due)).slice(0,4).map(d=>(<div key={d.id} style={{padding:"9px 12px",background:T.card,border:`1px solid ${T.ruBd}`,borderRadius:9,marginBottom:7,display:"flex",alignItems:"center",gap:10}}><div style={{width:6,height:6,borderRadius:"50%",background:T.ru,flexShrink:0}}/><div style={{flex:1}}><div style={{fontSize:13,fontWeight:500,color:T.ink}}>{d.title}</div>{d.unitCode&&<div style={{fontFamily:F.mono,fontSize:9,color:T.muted}}>{d.unitCode}</div>}</div><div style={{fontFamily:F.mono,fontSize:11,color:T.ru}}>{d.due}</div></div>))}
            </div>}
          </div>)}

          {/* LEARN LAYER -- chat + library + quiz + capture consolidated */}
          {tab==="learn"&&(<>
            {/* ── LEARN SUB-NAV ── */}
            <div style={{padding:"7px 18px",background:T.sf,borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:6,flexWrap:"wrap"}}>
              {[{id:"chat",icon:"◎",l:"Chat"},{id:"network",icon:"❋",l:"Network"},{id:"library",icon:"▣",l:"Library"},{id:"quiz",icon:"◉",l:"Voice Quiz"},{id:"capture",icon:"⊕",l:"Capture"}].map(s=>(
                <button key={s.id} onClick={()=>{setLearnSub(s.id);if(s.id!=="chat")setStudyMode(s.id);}}
                  style={{padding:"5px 13px",background:learnSub===s.id?T.am:T.card,
                    border:`1px solid ${learnSub===s.id?T.am:T.bd}`,borderRadius:8,fontSize:12,
                    fontWeight:learnSub===s.id?600:400,color:learnSub===s.id?"#FFF":T.muted,
                    cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <span style={{fontSize:11}}>{s.icon}</span>{s.l}
                </button>
              ))}
              <div style={{flex:1}}/>
              <span style={{fontFamily:F.mono,fontSize:8,color:T.faint}} className="hide-mobile">one space · learn, review, capture</span>
            </div>

            {/* CHAT SUB-MODE */}
            {learnSub==="chat"&&(<>
            {/* ── MODE TOOLBAR ── */}
            <div style={{padding:"6px 18px",background:T.sf,borderBottom:`1px solid ${T.bd}`,display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
              {/* Mode toggle */}
              <div style={{display:"flex",background:T.card,border:`1px solid ${T.bd}`,borderRadius:9,padding:2,gap:1}}>
                {[{id:"explain",icon:"🌱",label:"Explain"},{id:"note",icon:"✦",label:"Note"}].map(m=>(
                  <button key={m.id} onClick={()=>setLearnMode(m.id)}
                    style={{padding:"4px 12px",background:learnMode===m.id?T.am:"transparent",border:"none",borderRadius:7,
                      fontSize:11,fontWeight:learnMode===m.id?700:400,
                      color:learnMode===m.id?"#FFF":T.muted,cursor:"pointer",
                      display:"flex",alignItems:"center",gap:4,transition:"all 0.12s"}}>
                    <span style={{fontSize:12}}>{m.icon}</span>{m.label}
                  </button>
                ))}
              </div>
              <div style={{fontFamily:F.mono,fontSize:8,color:T.faint}}>
                {learnMode==="explain"?"breaks down what you don't understand":"generates structured reference notes"}
              </div>
              {/* Curiosity-flow controls: appear once a session has some depth */}
              {msgs.length>=3&&<div style={{display:"flex",gap:6,marginLeft:"auto",alignItems:"center"}}>
                {sessionMap.length>0&&<button onClick={()=>setShowMap(p=>!p)}
                  style={{padding:"4px 11px",background:showMap?`${T.nwm||T.oc}18`:T.card,border:`1px solid ${showMap?(T.nwm||T.oc):T.bd}`,borderRadius:7,
                    fontSize:11,color:showMap?(T.nwm||T.oc):T.muted,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                  <span>❋</span>{showMap?"Hide Map":"Map"} ({sessionMap.length})</button>}
                <button onClick={buildBigPicture}
                  style={{padding:"4px 13px",background:`linear-gradient(135deg, ${T.am}, ${T.am}CC)`,border:"none",borderRadius:7,
                    fontSize:11,fontWeight:600,color:"#FFF",cursor:"pointer",boxShadow:T.shadowSoft}}>Build the Big Picture</button>
              </div>}
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
                ✦ Notes ({liveNotes.length})
              </button>}
            </div>

            {/* ── LIVING MAP PANEL (curiosity-flow) ── */}
            {showMap&&sessionMap.length>0&&(
              <div style={{padding:"12px 18px",background:`${T.nwm||T.oc}0A`,borderBottom:`1px solid ${T.bd}`}}>
                <div style={{fontFamily:F.mono,fontSize:8,color:T.nwm||T.oc,marginBottom:8,letterSpacing:"0.08em"}}>THIS SESSION · WHAT YOU'VE EXPLORED</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,alignItems:"center"}}>
                  {sessionMap.map((b,i)=>(
                    <React.Fragment key={i}>
                      <span style={{padding:"4px 11px",background:i===0?(T.nwm||T.oc):T.card,
                        border:`1px solid ${i===0?(T.nwm||T.oc):T.bd}`,borderRadius:14,
                        fontSize:11,color:i===0?"#FFF":T.body,fontWeight:i===0?600:400}}>{b.concept}</span>
                      {i<sessionMap.length-1&&<span style={{color:T.faint,fontSize:10}}>·</span>}
                    </React.Fragment>
                  ))}
                </div>
                <div style={{fontFamily:F.mono,fontSize:8,color:T.faint,marginTop:8}}>The first node is your root concept. Tap Build the Big Picture to weave these together.</div>
              </div>
            )}

            {/* ── SYNTHESIS OVERLAY (Build the Big Picture) ── */}
            {synthesis&&(
              <div onClick={()=>!synthesis.busy&&setSynthesis(null)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
                <div onClick={e=>e.stopPropagation()} style={{background:T.sf,border:`1px solid ${T.bd}`,borderRadius:18,maxWidth:680,width:"100%",maxHeight:"85vh",overflowY:"auto",padding:"24px 26px",boxShadow:T.shadow}}>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <span style={{width:8,height:8,borderRadius:"50%",background:T.am,display:"inline-block"}}/>
                      <span style={{fontFamily:F.display,fontSize:21,color:T.ink}}>The Big Picture</span>
                    </div>
                    {!synthesis.busy&&<button onClick={()=>setSynthesis(null)} style={{background:"none",border:"none",fontSize:20,color:T.muted,cursor:"pointer"}}>×</button>}
                  </div>
                  {synthesis.busy&&!synthesis.text&&<div style={{padding:"30px 0",textAlign:"center",fontFamily:F.mono,fontSize:11,color:T.muted}}>Weaving your session into one picture...</div>}
                  <div style={{fontSize:14,color:T.body,lineHeight:1.75,whiteSpace:"pre-wrap"}}>{synthesis.text}{synthesis.busy&&synthesis.text&&<span style={{opacity:0.5}}>▋</span>}</div>
                  {!synthesis.busy&&synthesis.text&&<div style={{display:"flex",gap:8,marginTop:18}}>
                    <button onClick={()=>{const n={id:Date.now(),title:"Big picture: "+(sessionMap[0]?.concept||"session"),text:synthesis.text,ts:Date.now()};setNotes(p=>{const u=[...p,n];db.set("mycel_n7",u.slice(-200));return u;});setSynthesis(null);}}
                      style={{padding:"9px 16px",background:T.sg,border:"none",borderRadius:10,fontSize:13,fontWeight:600,color:"#FFF",cursor:"pointer"}}>Save to Notes</button>
                    <button onClick={()=>setSynthesis(null)} style={{padding:"9px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:10,fontSize:13,color:T.body,cursor:"pointer"}}>Close</button>
                  </div>}
                </div>
              </div>
            )}
            {hl&&<div style={{padding:"8px 18px",background:T.ocBg,borderBottom:`1px solid ${T.ocBd}`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:2,height:18,background:T.oc,borderRadius:1}}/>
              <div style={{flex:1}}>
                <div style={{fontFamily:F.mono,fontSize:8,color:T.oc,marginBottom:2}}>Branching from</div>
                <div style={{fontSize:12,color:T.body,fontStyle:"italic"}}>"{hl.slice(0,100)}{hl.length>100?"...":""}"</div>
              </div>
              <button onClick={()=>setHl(null)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:18}}>x</button>
            </div>}

            {/* ── SPLIT LAYOUT: chat + notes panel ── */}
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
                    {learnMode==="explain"?"🌱 Explain mode: breaking down what you don't understand":"✦ Note mode: generating structured reference notes"} . Select text to branch
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
                    {liveNotes.length===0&&<div style={{padding:"36px 18px",textAlign:"center"}}><div style={{fontSize:12.5,color:T.muted,lineHeight:1.6}}>As you learn, tap "Note This" on anything worth keeping. Your notes gather here, ready to turn into a quiz or a connection.</div></div>}
                    {liveNotes.map((n,i)=>(
                      <div key={n.id} style={{marginBottom:10,padding:"10px 12px",background:T.card,
                        border:`1px solid ${n.mode==="note"?T.sgBd:T.amBd}`,borderRadius:9,
                        borderLeft:`3px solid ${n.mode==="note"?T.sg:T.am}`}}>
                        <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                          <span style={{fontFamily:F.mono,fontSize:8,color:n.mode==="note"?T.sg:T.am}}>
                            {n.mode==="note"?"✦ NOTE":"🌱 BREAKDOWN"} {i+1}
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
                          {n.mode==="note"?"✦ NOTE":"🌱 BREAKDOWN"} {i+1}
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
          {tab==="learn"&&learnSub==="library"&&<div style={{flex:1,overflowY:"auto",padding:20,maxWidth:760,width:"100%",margin:"0 auto",alignSelf:"stretch"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div><div style={{fontFamily:F.display,fontSize:26,fontWeight:480,color:T.ink,letterSpacing:"-0.005em"}}>Library</div><div style={{fontFamily:F.mono,fontSize:11,color:T.muted,marginTop:2}}>Upload, read, annotate · ask Mycel or save reflections</div></div>
                <label style={{background:T.am,border:"none",borderRadius:10,padding:"8px 16px",color:"#FFF",fontSize:13,fontWeight:600,cursor:"pointer"}}>Upload<input type="file" accept=".txt,.md,.csv,.pdf" onChange={uploadFile} style={{display:"none"}}/></label>
              </div>
              <div style={{padding:"10px 14px",background:T.ocBg,border:`1px solid ${T.ocBd}`,borderRadius:10,marginBottom:16,fontSize:13,color:T.body,lineHeight:1.6}}>
                Upload a <strong>PDF</strong>, <strong>.txt</strong>, or <strong>.md</strong> file. PDFs open as real, scrollable pages you can read and highlight directly. Highlight any passage to <strong>Ask Mycel</strong> or <strong>Save a Reflection</strong>, and your annotations are saved with the document. (Scanned image-only PDFs show as pages but their text can't be selected, so paste their text instead.)
              </div>
              {!docs.length&&<div style={{padding:"56px 24px",textAlign:"center"}}>
                <div style={{fontSize:30,marginBottom:10,opacity:0.5}}>📄</div>
                <div style={{fontFamily:F.display,fontSize:18,color:T.ink,marginBottom:6}}>Your reading lives here</div>
                <div style={{fontSize:13,color:T.muted,lineHeight:1.6,maxWidth:340,margin:"0 auto"}}>Upload a paper or your lecture notes, read them as real pages, and highlight anything you want Mycel to explain or connect to your other units.</div>
              </div>}
              {docs.map(doc=><PDFViewer key={doc.id} doc={doc} onDelete={deleteDoc} onUpdate={updateDoc} T={T} sysPrompt={SP()}/>)}
              <div style={{marginTop:20,padding:"14px 16px",background:T.card,border:`1px solid ${T.bd}`,borderRadius:12}}>
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
            <ConnectTabContent T={T} notes={notes} setNotes={setNotes} deadlines={deadlines} setDeadlines={setDeadlines} addDeadline={addDeadline} setup={setup} projects={projects} setProjects={setProjects}/>
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

