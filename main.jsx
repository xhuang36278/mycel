import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import Mycel from "./App.jsx";
import { authConfigured, mycelAuth } from "./auth.js";
import "./auth.css";

const storageKey = "mycel-browser-storage";

function readStore() {
  try {
    return JSON.parse(window.localStorage.getItem(storageKey) || "{}");
  } catch {
    return {};
  }
}

function writeStore(store) {
  window.localStorage.setItem(storageKey, JSON.stringify(store));
}

if (!window.storage) {
  window.storage = {
    async get(key) {
      const store = readStore();
      const scoped = window.__mycelUserId ? `${window.__mycelUserId}:${key}` : key;
      return scoped in store ? { value: store[scoped] } : null;
    },
    async set(key, value) {
      const store = readStore();
      const scoped = window.__mycelUserId ? `${window.__mycelUserId}:${key}` : key;
      if (value === null || value === undefined) delete store[scoped];
      else store[scoped] = value;
      writeStore(store);
    },
  };
}

function AuthScreen({ onAuthenticated }) {
  const [mode, setMode] = useState("signin");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const submit = async (event) => {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    try {
      const data = mode === "signup" ? await mycelAuth.signUp(form.email, form.password, form.name) : await mycelAuth.signIn(form.email, form.password);
      if (data?.user && !data?.access_token) setMessage("Check your email to confirm your account, then sign in.");
      else onAuthenticated(data);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };
  return <main className="auth-page"><section className="auth-panel"><img src="/mycel-logo-dark.png?v=official-1" alt="Mycel"/><h1>{mode === "signin" ? "Welcome back" : "Grow your learning network"}</h1><p>{mode === "signin" ? "Sign in to continue your projects, readings, and reflections." : "Create your private Mycel workspace."}</p><form onSubmit={submit}>{mode === "signup" && <label>Name<input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} required autoComplete="name"/></label>}<label>Email<input type="email" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} required autoComplete="email"/></label><label>Password<input type="password" minLength="8" value={form.password} onChange={e=>setForm(f=>({...f,password:e.target.value}))} required autoComplete={mode === "signup" ? "new-password" : "current-password"}/></label>{error&&<div className="auth-error">{error}</div>}{message&&<div className="auth-message">{message}</div>}<button disabled={busy}>{busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button></form><button className="auth-switch" onClick={()=>{setMode(m=>m==="signin"?"signup":"signin");setError("");setMessage("");}}>{mode === "signin" ? "New to Mycel? Create an account" : "Already have an account? Sign in"}</button></section></main>;
}

function Root() {
  const [session, setSession] = useState(authConfigured ? undefined : null);
  useEffect(() => { if (authConfigured) mycelAuth.session().then(setSession); }, []);
  const accept = data => { window.__mycelUserId = data?.user?.id || data?.user_id; window.mycelAuth = mycelAuth; setSession(data); };
  useEffect(() => { if (session?.user) { window.__mycelUserId = session.user.id; window.mycelAuth = mycelAuth; } }, [session]);
  if (session === undefined) return <div className="auth-loading">Loading Mycel…</div>;
  if (authConfigured && !session) return <AuthScreen onAuthenticated={accept}/>;
  return <Mycel/>;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);

if ("serviceWorker" in navigator && import.meta.env.PROD) {
  window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {}));
}
