import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Mycel from "./App.jsx";
import { authConfigured, mycelAuth } from "./auth.js";
import { adoptLocalData, createMycelStorage } from "./storage.js";
import "./auth.css";

if (!window.storage) window.storage = createMycelStorage();

function LandingPage({onEnter}) {
  return <main className="public-site"><nav className="public-nav"><a href="#top" className="public-brand"><img src="/mycel-logo-dark.png" alt=""/><b>Mycel</b></a><div><a href="#mission">Mission</a><a href="#functions">Functions</a><a href="#community">Community</a><button onClick={onEnter}>Sign in</button></div></nav>
    <section className="public-hero" id="top"><div className="public-hero-mark"><img src="/mycel-logo-dark.png" alt="Mycel tree growing from an open book"/></div><p className="public-eyebrow">A symbiotic learning ecosystem</p><h1>Keep your curiosity alive.</h1><p className="public-lead">Mycel helps learners connect questions, sources, projects, experiments, and people into understanding that keeps growing.</p><div className="public-actions"><button onClick={onEnter}>Start using Mycel</button><a href="#mission">Why Mycel exists</a></div></section>
    <section className="public-band" id="mission"><div><span>Mission</span><h2>Learning should grow through connection, not pressure.</h2></div><p>Mycel is being built for people who want to understand deeply, remain curious on difficult days, and learn with others without turning education into a feed, leaderboard, or productivity contest.</p></section>
    <section className="public-section" id="functions"><div className="public-section-head"><span>What grows here</span><h2>One learning journey, connected end to end.</h2></div><div className="public-grid">{[{t:"Read and think",d:"Annotate sources, keep vocabulary, reflect, and turn uncertainty into questions."},{t:"Develop projects",d:"Hold goals, evidence, milestones, documents, and decisions in one evolving space."},{t:"Learn through practice",d:"Prepare for labs, test understanding, and see how questions form a study pattern."},{t:"Study together",d:"Join anchored discussions and live sessions where confusion can be seen and explained."}].map(x=><article key={x.t}><h3>{x.t}</h3><p>{x.d}</p></article>)}</div></section>
    <section className="public-band community" id="community"><div><span>Community</span><h2>Build the relational layer of learning.</h2></div><div className="community-links"><article><h3>Events and activities</h3><p>Free study sessions, project exchanges, reading circles, workshops, and community experiments.</p><button onClick={onEnter}>Explore Live Study</button></article><article><h3>Join the team</h3><p>We welcome educators, learners, researchers, designers, facilitators, and community builders.</p><button onClick={onEnter}>Join through Mycel</button></article><article><h3>Support the work</h3><p>Help keep community learning spaces accessible and independent as Mycel develops.</p><button onClick={onEnter}>Support options coming soon</button></article></div></section>
    <footer><div className="public-brand"><img src="/mycel-logo-dark.png" alt=""/><b>Mycel</b></div><p>Understanding grows between things.</p><button onClick={onEnter}>Enter Mycel</button></footer>
  </main>;
}

function AuthScreen({ onAuthenticated, onLocalAccess }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = async event => {
    event.preventDefault();setBusy(true);setError("");setMessage("");
    try {
      const data=mode==="signup"?await mycelAuth.signUp(form.email,form.password,form.name):await mycelAuth.signIn(form.email,form.password);
      if(data?.user&&!data?.access_token)setMessage("Check your email to confirm your account, then sign in.");
      else onAuthenticated(data);
    } catch(err) {
      setError(/rate limit/i.test(err.message)?"Supabase has temporarily paused confirmation emails. You can continue on this device now, or try account creation again later.":err.message);
    }
    setBusy(false);
  };
  return <main className="auth-page"><section className="auth-panel">
    <img src="/mycel-logo-dark.png?v=official-1" alt="Mycel"/>
    <h1>{mode==="signin"?"Welcome back":"Grow your learning network"}</h1>
    <p>{mode==="signin"?"Sign in to continue your projects, readings, and reflections.":"Create your private Mycel workspace."}</p>
    <form onSubmit={submit}>
      {mode==="signup"&&<label>Name<input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required autoComplete="name"/></label>}
      <label>Email<input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required autoComplete="email"/></label>
      <label>Password<input type="password" minLength="8" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required autoComplete={mode==="signup"?"new-password":"current-password"}/></label>
      {error&&<div className="auth-error">{error}</div>}{message&&<div className="auth-message">{message}</div>}
      <button disabled={busy}>{busy?"Please wait...":mode==="signin"?"Sign in":"Create account"}</button>
    </form>
    <button className="auth-switch" onClick={()=>{setMode(m=>m==="signin"?"signup":"signin");setError("");setMessage("");}}>{mode==="signin"?"New to Mycel? Create an account":"Already have an account? Sign in"}</button>
    <div className="auth-divider"><span>or</span></div>
    <button className="auth-local" onClick={onLocalAccess}>Continue on this device</button>
    <p className="auth-local-note">No email required. Your work stays in this browser until you connect an account.</p>
  </section></main>;
}

function Root() {
  const localAccess=localStorage.getItem("mycel-local-access")==="true";
  const [session,setSession]=useState(localAccess?{local:true}:authConfigured?undefined:null);
  const [entry,setEntry]=useState("landing");
  useEffect(()=>{if(authConfigured&&!localAccess)mycelAuth.session().then(data=>{if(data?.user){adoptLocalData(data.user.id);window.__mycelUserId=data.user.id;window.mycelAuth=mycelAuth;}setSession(data);});},[]);
  const accept=data=>{const userId=data?.user?.id||data?.user_id;adoptLocalData(userId);window.__mycelUserId=userId;window.mycelAuth=mycelAuth;setSession(data);};
  const enterLocal=()=>{localStorage.setItem("mycel-local-access","true");setSession({local:true});};
  useEffect(()=>{if(session?.user){adoptLocalData(session.user.id);window.__mycelUserId=session.user.id;window.mycelAuth=mycelAuth;}else if(session?.local){window.__mycelUserId=undefined;window.mycelAuth={signOut:async()=>localStorage.removeItem("mycel-local-access")};}},[session]);
  if(session===undefined)return <div className="auth-loading">Loading Mycel...</div>;
  if(new URLSearchParams(window.location.search).get("public")==="1"&&entry==="landing")return <LandingPage onEnter={()=>{window.history.replaceState({},"","/");setEntry("auth");}}/>;
  if(!session&&entry==="landing")return <LandingPage onEnter={()=>authConfigured?setEntry("auth"):enterLocal()}/>;
  if(authConfigured&&!session)return <AuthScreen onAuthenticated={accept} onLocalAccess={enterLocal}/>;
  return <Mycel/>;
}

createRoot(document.getElementById("root")).render(<React.StrictMode><Root/></React.StrictMode>);

if("serviceWorker" in navigator&&import.meta.env.PROD){window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));}
