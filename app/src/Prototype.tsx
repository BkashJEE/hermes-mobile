import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, ArrowUpIcon, ChatBubbleIcon, ChevronRightIcon, ClockIcon, ExclamationTriangleIcon, GearIcon, LayersIcon, MagnifyingGlassIcon, PlusIcon, ReloadIcon, StopIcon, PersonIcon, CheckIcon, Cross2Icon } from '@radix-ui/react-icons';
import { BottomSheet, KeyboardInput, KeyboardTextarea, MobileScroll, useKeyboard, useKeyboardInsets } from './app-ui';
import Pairing from './Pairing';

type Profile = { id:string; name:string; connected:boolean; reason?:string; model?:string; features:{send?:boolean;stop?:boolean;approval?:boolean;sessions?:boolean} };
type Run = { id:string;profileId:string;input:string;sessionId:string;originalSession:string;runId?:string;tracked:boolean;createdAt:number;updatedAt?:number;status:string;output:string;activity?:string;error?:string;connectionError?:string;approval?:{request_id?:string;command?:string;description?:string;tool_name?:string;reason?:string} };
type Message = {id?:string;role:string;content:string};
type Session = {id:string;title:string};
const done = (s:string) => ['completed','cancelled','failed'].includes(s);
const statusText = (s:string) => ({completed:'Completed', cancelled:'Stopped', failed:'Failed', stopping:'Stopping', waiting_for_approval:'Needs you', queued:'Queued', running:'Working', started:'Starting', submitting:'Sending', submission_unknown:'Send unconfirmed'}[s] || s);
async function api<T>(route:string, body?:unknown):Promise<T> {
  const res = await fetch('/api/mobile'+route, { method: body === undefined ? 'GET' : 'POST', headers: {'X-Hermes-Mobile':'1', ...(body === undefined ? {} : {'Content-Type':'application/json'})}, body:body === undefined ? undefined : JSON.stringify(body), signal:AbortSignal.timeout(30000) });
  const result = await res.json(); if(res.status===401)window.dispatchEvent(new Event('hermes-auth-expired')); if(!res.ok) throw new Error(result.error || 'Connection failed'); return result;
}
function stored<T>(key:string, fallback:T):T { try { return JSON.parse(sessionStorage.getItem(key)||'null') ?? fallback; } catch { return fallback; } }
function Avatar({id,small=false}:{id:string;small?:boolean}) { const icons=[PersonIcon,MagnifyingGlassIcon,LayersIcon,ChatBubbleIcon]; const Icon=icons[Array.from(id).reduce((n,c)=>n+c.charCodeAt(0),0)%icons.length];return <span className={'avatar '+(small?'small':'')}>{id==='default'?<img src="/hermes-emblem.png" alt=""/>:<Icon/>}</span>; }
export default function Prototype() {
  const keyboard=useKeyboard(); const {bottomInset}=useKeyboardInsets();
  const [tab,setTab]=useState<'agents'|'work'|'settings'>('agents');
  const [profiles,setProfiles]=useState<Profile[]>([]); const [runs,setRuns]=useState<Run[]>([]);
  const [selected,setSelected]=useState<string|null>(null); const [filter,setFilter]=useState('');
  const [sessions,setSessions]=useState<Record<string,string>>(stored('hermes.sessions',{}));
  const [drafts,setDrafts]=useState<Record<string,string>>(stored('hermes.drafts',{}));
  const [messages,setMessages]=useState<Message[]>([]); const [historyBusy,setHistoryBusy]=useState(false);
  const [error,setError]=useState(''); const [historyError,setHistoryError]=useState(''); const [loading,setLoading]=useState(true);
  const [sending,setSending]=useState(false); const [pendingSend,setPendingSend]=useState<unknown>(stored('hermes.pending',null)); const [track,setTrack]=useState(false); const [workFilter,setWorkFilter]=useState('Active');
  const [sheet,setSheet]=useState<'history'|'profile'|null>(null); const [history,setHistory]=useState<Session[]>([]);
  const [detail,setDetail]=useState<Run|null>(null); const [actionBusy,setActionBusy]=useState(false);
  const [checkedAt,setCheckedAt]=useState<number>(0); const [runsOnline,setRunsOnline]=useState(false);
  const selectedRef=useRef(selected); selectedRef.current=selected;
  const active=profiles.find(p=>p.id===selected); const sessionId=selected?sessions[selected]||'':'';
  const currentRuns=runs.filter(r=>r.profileId===selected && r.sessionId===sessionId);
  const lastRun=currentRuns[0]; const busyRun=currentRuns.find(r=>!done(r.status));
  const pending=runs.filter(r=>r.status==='waiting_for_approval');
  const refresh=useCallback(async()=>{
    const result=await Promise.allSettled([api<{profiles:Profile[];checkedAt:number}>('/profiles'),api<{runs:Run[]}>('/runs')]);
    if(result[0].status==='fulfilled'){setProfiles(result[0].value.profiles);setCheckedAt(result[0].value.checkedAt);}
    if(result[1].status==='fulfilled'){setRuns(result[1].value.runs);setRunsOnline(true);} else setRunsOnline(false);
    if(result.some(r=>r.status==='rejected'))setError('The local connection was interrupted. Displayed states may be stale.');
    setLoading(false);
  },[]);
  useEffect(()=>{ void refresh(); const interval=setInterval(()=>{if(!document.hidden)void refresh();},3500);const wake=()=>{if(!document.hidden)void refresh();};document.addEventListener('visibilitychange',wake);return()=>{clearInterval(interval);document.removeEventListener('visibilitychange',wake);};},[refresh]);
  useEffect(()=>{sessionStorage.setItem('hermes.sessions',JSON.stringify(sessions));},[sessions]);
  useEffect(()=>{sessionStorage.setItem('hermes.drafts',JSON.stringify(drafts));},[drafts]);
  const revision=currentRuns.map(r=>r.status).join('|');
  useEffect(()=>{
    let ignore=false;setMessages([]);setHistoryError('');
    if(!selected||!sessionId){setHistoryBusy(false);return;}
    setHistoryBusy(true);
    api<{messages:Message[]}>('/profiles/'+encodeURIComponent(selected)+'/sessions/'+encodeURIComponent(sessionId)).then(v=>{if(!ignore)setMessages(v.messages);}).catch(e=>{if(!ignore)setHistoryError(e.message);}).finally(()=>{if(!ignore)setHistoryBusy(false);});
    return()=>{ignore=true;};
  },[selected,sessionId,revision]);
  function navigate(next:typeof tab){keyboard.hide();setSelected(null);setTab(next);setError('');setFilter('');}
  function openAgent(id:string,sid?:string){keyboard.hide();setSelected(id);setError('');setTrack(false);if(sid)setSessions(s=>({...s,[id]:sid}));}
  function fresh(){if(!selected)return;keyboard.hide();setSessions(s=>({...s,[selected]:''}));setMessages([]);setSheet(null);setTrack(false);}
  function acceptRun(run:Run){setRuns(prev=>[run,...prev.filter(r=>r.id!==run.id)]);setSessions(s=>({...s,[run.profileId]:run.sessionId}));}
  async function send(retry?:Run){
    if((!selected&&!retry)||(!retry&&pendingSend))return;
    const id=retry?.profileId||selected!;
    const text=retry?.input||drafts[id]||'';if(!text.trim()||sending)return;
    setSending(true);setError('');keyboard.hide();
    const body=retry?{requestId:retry.id,profileId:id,input:retry.input,sessionId:retry.originalSession,tracked:retry.tracked}:{requestId:crypto.randomUUID(),profileId:id,input:text,sessionId:sessions[id]||undefined,tracked:track};
    // Keep exact acceptance identity across reloads and ambiguous network failures.
    sessionStorage.setItem('hermes.pending',JSON.stringify(body)); setPendingSend(body);
    try{const run=await api<Run>('/messages',body);acceptRun(run);setDrafts(d=>({...d,[id]:''}));sessionStorage.removeItem('hermes.pending');setPendingSend(null);}
    catch(e){setError((e as Error).message+' The saved send can be retried in Settings.');void refresh();}
    finally{setSending(false);}
  }
  async function recoverSend(){const body=stored<unknown>('hermes.pending',null);if(!body)return;setSending(true);setError('');try{const run=await api<Run>('/messages',body);acceptRun(run);setDrafts(d=>({...d,[run.profileId]:''}));sessionStorage.removeItem('hermes.pending');setPendingSend(null);openAgent(run.profileId,run.sessionId);}catch(e){setError((e as Error).message);}finally{setSending(false);}}
  async function showHistory(){if(!active)return;setSheet('history');setHistory([]);setHistoryBusy(true);setHistoryError('');try{const v=await api<{sessions:Session[]}>('/profiles/'+active.id+'/sessions');setHistory(v.sessions);}catch(e){setHistoryError((e as Error).message);}finally{setHistoryBusy(false);}}
  async function control(run:Run,action:'stop'|'approval',choice?:string){setActionBusy(true);setError('');try{const updated=await api<Run>('/runs/'+run.id+'/'+action,action==='approval'?{choice,requestId:run.approval?.request_id}:{});acceptRun(updated);setDetail(updated);}catch(e){setError((e as Error).message);}finally{setActionBusy(false);}}
  const detailRun=detail?runs.find(r=>r.id===detail.id)||detail:null;
  const online=profiles.filter(p=>p.connected).length;
  const trackedRuns=runs.filter(r=>r.tracked && (workFilter==='Done'?done(r.status):workFilter==='Needs you'?r.status==='waiting_for_approval':!done(r.status)));
  return <div className="hermes-app">
    <header className="app-header">
      {selected?<><button className="icon-button" aria-label="Back to agents" onClick={()=>navigate('agents')}><ArrowLeftIcon/></button><button className="profile-heading" onClick={()=>setSheet('profile')}><Avatar id={selected} small/><span><strong>{active?.name||selected}</strong><small>{busyRun?statusText(busyRun.status):active?.connected?'Connected to Omarchy':'Gateway offline'}</small></span></button><button className="icon-button" aria-label="Conversation history" onClick={()=>void showHistory()}><ClockIcon/></button><button className="icon-button" aria-label="New conversation" onClick={fresh}><PlusIcon/></button></>:<><img className="brand" src="/hermes-emblem.png" alt=""/><div className="heading"><h1>{tab==='agents'?'Hermes Relay':tab==='work'?'Work':'Connection'}</h1><p>{loading?'Finding your agents…':tab==='work'?'Tasks started in this app':`${online} connected · Omarchy`}</p></div><button className="icon-button" aria-label="Refresh connection" onClick={()=>{setError('');void refresh();}}><ReloadIcon/></button></>}
    </header>
    {error&&<div className="error-banner" role="alert"><span>{error}</span><button className="icon-button" aria-label="Dismiss error" onClick={()=>setError('')}><Cross2Icon/></button></div>}
    <div className={'scroll-region '+(selected?'chat-region':'')}><MobileScroll className="hermes-scroll"><main className="page-content" style={{paddingBottom:selected?112:106}}>
      {!selected&&tab==='agents'&&<>
        <div className="search"><MagnifyingGlassIcon/><KeyboardInput aria-label="Search agents" placeholder="Search your agents" value={filter} onChange={e=>setFilter(e.target.value)}/></div>
        {pending.length>0&&<button className="attention-row" onClick={()=>setDetail(pending[0])}><ExclamationTriangleIcon/><span>{pending.length} request{pending.length===1?'':'s'} need{pending.length===1?'s':''} you</span><ChevronRightIcon/></button>}
        <div className="section-label">Your agents <span>LIVE PROFILES</span></div>
        {loading&&<p className="empty">Connecting to the local Hermes gateways…</p>}
        {[...profiles].sort((a,b)=>Number(b.connected)-Number(a.connected)).filter(p=>(p.name+' '+p.id).toLowerCase().includes(filter.toLowerCase())).map(p=>{const r=runs.find(r=>r.profileId===p.id&&!done(r.status));return <button className="agent-row" key={p.id} onClick={()=>openAgent(p.id)}><Avatar id={p.id}/><span className="row-copy"><strong>{p.name}</strong><small>{r?r.input.slice(0,68):p.connected?'Open a conversation':'API gateway not running'}</small></span><span className={'state '+(r?.status==='waiting_for_approval'?'amber':p.connected?'cyan':'muted')}>{r?statusText(r.status):p.connected?'Connected':'Offline'}</span></button>;})}
        {!loading&&profiles.length===0&&<p className="empty">No Hermes profiles found on this computer.</p>}
        {!loading&&profiles.length>0&&!profiles.some(p=>(p.name+' '+p.id).toLowerCase().includes(filter.toLowerCase()))&&<p className="empty">No agents match this search.</p>}
        <p className="quiet-note">Your existing agents, on your own machine.<br/>Gateway status is separate from agent activity.</p>
      </>}
      {selected&&<>
        {Boolean(pendingSend)&&<button className="attention-row" disabled={sending} onClick={()=>void recoverSend()}><ExclamationTriangleIcon/><span>Recover unconfirmed send</span><ChevronRightIcon/></button>}{busyRun&&<button className="activity-row" onClick={()=>setDetail(busyRun)}><span className={'status-dot '+(busyRun.connectionError?'amber':'')}/><span>{busyRun.connectionError?'Connection needs checking':statusText(busyRun.status)+' on Omarchy'}</span><ChevronRightIcon/></button>}
        {!active?.connected&&<div className="notice">{active?.reason||'This profile is unavailable.'} Start its existing Hermes API gateway on the host, then refresh.</div>}
        {historyBusy&&<p className="muted">Loading conversation…</p>}
        {historyError&&<div className="notice">{historyError} {lastRun?'The local run record is shown below.':'Try another conversation or start a new one.'}</div>}
        {!historyBusy&&messages.length===0&&!lastRun&&<div className="welcome"><Avatar id={selected}/><h2>Talk to {active?.name||selected}</h2><p>Send a message to this profile’s real Hermes runtime. Its existing tools and permissions apply.</p><span className="local-label">RUNS ON OMARCHY</span></div>}
        <div className="messages" aria-live="polite">{messages.map((m,i)=><div key={m.id||i} className={'message '+m.role}>{m.role==='assistant'&&<Avatar id={selected} small/>}<p>{m.content}</p></div>)}
        {lastRun&&!messages.some(m=>m.role==='user'&&m.content===lastRun.input)&&<div className="message user"><p>{lastRun.input}</p></div>}
        {lastRun?.output&&!messages.some(m=>m.role==='assistant'&&m.content===lastRun.output)&&<div className="message assistant"><Avatar id={selected} small/><p>{lastRun.output}</p></div>}
        </div>
        {lastRun?.error&&<div className="notice">{lastRun.error}</div>}
        {busyRun?.status==='waiting_for_approval'&&<button className="attention-row" onClick={()=>setDetail(busyRun)}><ExclamationTriangleIcon/><span>Review this action</span><ChevronRightIcon/></button>}
        {busyRun?.status==='submission_unknown'&&<button className="wide-button" disabled={sending} onClick={()=>void send(busyRun)}>Recover this send</button>}
        {busyRun&&<p className="quiet-note">Runs continue on the host when you leave this screen. Final replies appear when Hermes finishes.</p>}
      </>}
      {!selected&&tab==='work'&&<><div className="segmented">{['Active','Needs you','Done'].map(f=><button key={f} aria-pressed={workFilter===f} onClick={()=>setWorkFilter(f)}>{f}</button>)}</div><div className="section-label">{workFilter==='Done'?'Recent results':'Your work'}<span>{trackedRuns.length}</span></div>{trackedRuns.map(r=><button className="task-row" key={r.id} onClick={()=>setDetail(r)}><Avatar id={r.profileId}/><span><strong>{r.input.slice(0,88)}</strong><small>{profiles.find(p=>p.id===r.profileId)?.name||r.profileId} · {r.connectionError?'Connection lost':statusText(r.status)}</small></span><ChevronRightIcon/></button>)}{trackedRuns.length===0&&<div className="welcome"><LayersIcon className="empty-icon"/><h2>{workFilter==='Done'?'No completed tasks yet':workFilter==='Needs you'?'Nothing needs your decision':'Room for your next task'}</h2><p>Open an agent and enable “Track in Work” before sending a task.</p><button className="wide-button" onClick={()=>navigate('agents')}>Choose an agent</button></div>}<p className="quiet-note">This view tracks tasks sent from Hermes Mobile. Dock tasks are not connected in this version.</p></>}
      {!selected&&tab==='settings'&&<><div className="connection-card"><span className="local-label">PRIVATE CONNECTION</span><h2>Your Omarchy machine</h2><p>{online} API gateways connected</p><p className="muted">{checkedAt?'Checked '+new Date(checkedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):'Waiting for the host'}</p></div><div className="settings-row"><strong>API keys stay on the host</strong><p>The local bridge reads each profile’s existing credentials. No keys are sent to this interface.</p></div><Pairing/><div className="settings-row"><strong>Conversation and recovery</strong><p>Hermes stores conversations. This app keeps run records on the host and drafts in this browser tab. Refreshing does not cancel work.</p></div><div className="settings-row"><strong>Current capabilities</strong><p>Profile chat, session history, tracked runs, stop and exact one-time approvals. Voice, attachments and Dock synchronization are not connected.</p></div>{Boolean(pendingSend)&&<button className="wide-button" disabled={sending} onClick={()=>void recoverSend()}>Recover unconfirmed send</button>}<button className="wide-button secondary" onClick={()=>{setError('');void refresh();}}>Check connection</button><p className="quiet-note">Community preview · Independent of Nous Research</p></>}
    </main></MobileScroll></div>
    {selected?<form className="composer" style={{bottom:bottomInset}} onSubmit={e=>{e.preventDefault();void send();}}><label className="track-toggle"><input type="checkbox" checked={track} onChange={e=>setTrack(e.target.checked)} disabled={Boolean(busyRun)}/> Track in Work</label><div className="composer-line"><KeyboardTextarea aria-label="Message" placeholder={'Message '+(active?.name||selected)+'…'} rows={1} value={drafts[selected]||''} onChange={e=>{const value=e.target.value;setDrafts(d=>({...d,[selected]:value}));}} maxLength={16000}/><button className="send-button" aria-label="Send message" type="submit" disabled={sending||Boolean(pendingSend)||Boolean(busyRun)||!active?.connected||!active?.features.send||!runsOnline||!(drafts[selected]||'').trim()}><ArrowUpIcon/></button></div></form>:<nav className="bottom-tabs" style={{bottom:bottomInset}} aria-label="Main navigation">{([['agents',ChatBubbleIcon,'Agents'],['work',LayersIcon,'Work'],['settings',GearIcon,'Settings']] as const).map(([key,Icon,label])=><button key={key} aria-current={tab===key?'page':undefined} onClick={()=>navigate(key)}><Icon/><span>{label}</span></button>)}</nav>}
    <BottomSheet open={sheet!==null} onOpenChange={open=>{if(!open)setSheet(null);}} title={sheet==='history'?'Conversations':active?.name||'Agent'} description="Connected to your local Hermes profile.">
      <div className="sheet-body">{sheet==='profile'?<><Avatar id={selected||'default'}/><h3>{active?.name}</h3><p>Profile: {active?.id}</p><p>{active?.connected?'Connected to the local Hermes gateway.':active?.reason}</p><p className="muted">Uses the profile’s configured provider, tools and model. This preview does not change its configuration.</p><button className="wide-button" onClick={()=>void showHistory()}>Open conversation history</button></>:<><button className="wide-button" onClick={fresh}><PlusIcon/> New conversation</button>{historyBusy&&<p>Loading history…</p>}{historyError&&<p role="alert">{historyError}</p>}{history.map(s=><button className="history-row" key={s.id} onClick={()=>{if(selected)openAgent(selected,s.id);setSheet(null);}}><ChatBubbleIcon/><span>{s.title}</span><ChevronRightIcon/></button>)}{!historyBusy&&!historyError&&!history.length&&<p>No previous conversations for this profile.</p>}<p className="muted">Showing up to 30 recent conversations.</p></>}</div>
    </BottomSheet>
    <BottomSheet open={detail!==null} onOpenChange={open=>{if(!open)setDetail(null);}} title={detailRun?.status==='waiting_for_approval'?'Review requested action':'Run details'} description="Current state reported by your Hermes gateway.">
      {detailRun&&<div className="sheet-body"><span className="local-label">{detailRun.profileId} · {statusText(detailRun.status)}</span><h3>{detailRun.input.slice(0,180)}</h3>{detailRun.connectionError&&<p role="alert">{detailRun.connectionError}</p>}{detailRun.approval&&<><p>Hermes is waiting for your decision on this exact request.</p><pre>{detailRun.approval.command||detailRun.approval.description||detailRun.approval.tool_name||'See Hermes on the host for action details.'}</pre>{detailRun.approval.reason&&<p>{detailRun.approval.reason}</p>}{detailRun.approval.request_id&&(detailRun.approval.command||detailRun.approval.description)&&<div className="decision-actions"><button disabled={actionBusy||!runsOnline||!!detailRun.connectionError} className="wide-button" onClick={()=>void control(detailRun,'approval','once')}><CheckIcon/> Allow once</button><button disabled={actionBusy||!runsOnline||!!detailRun.connectionError} className="wide-button secondary" onClick={()=>void control(detailRun,'approval','deny')}>Decline</button></div>}</>}{detailRun.output&&<p className="run-output">{detailRun.output}</p>}<button className="wide-button secondary" onClick={()=>{openAgent(detailRun.profileId,detailRun.sessionId);setDetail(null);}}>Open conversation</button>{!done(detailRun.status)&&detailRun.runId&&profiles.find(p=>p.id===detailRun.profileId)?.features.stop&&<button className="wide-button danger" disabled={actionBusy||!runsOnline||!!detailRun.connectionError||detailRun.status==='stopping'} onClick={()=>void control(detailRun,'stop')}><StopIcon/> {detailRun.status==='stopping'?'Stop requested':'Stop this run'}</button>}<p className="muted">A stop request takes effect when Hermes reaches a safe interruption point.</p></div>}
    </BottomSheet>
  </div>;
}
