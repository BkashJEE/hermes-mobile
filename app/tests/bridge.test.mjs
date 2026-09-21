import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import http from 'node:http';
import { once } from 'node:events';
import { createBridge, localBase, discover } from '../server/bridge.mjs';
const key='fixture-secret-not-real';
function fixture(t) {
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'hermes-mobile-test-'));
  fs.writeFileSync(path.join(dir,'.env'),`API_SERVER_KEY=${key}\n`);
  fs.writeFileSync(path.join(dir,'gateway_state.json'),JSON.stringify({platforms:{api_server:{state:'connected',listener_base:'http://127.0.0.1:9999'}}}));
  const seen=[],runs=new Map();let loseResponse=false;
  const fetcher=async(url,opts)=>{
    assert.equal(opts.headers.Authorization,`Bearer ${key}`);assert.equal(opts.redirect,'error');
    const p=new URL(url).pathname;seen.push({p,opts});
    if(p==='/v1/capabilities')return Response.json({model:'fixture',features:{run_submission:true,run_status:true,runs_idempotency:{supported:true},run_stop:true,run_approval_response:true}});
    if(p==='/v1/runs'&&opts.method==='POST'){
      const k=opts.headers['Idempotency-Key'];
      if(!runs.has(k))runs.set(k,{run_id:'run_'+k,status:'running',session_id:JSON.parse(opts.body).session_id});
      if(loseResponse){loseResponse=false;throw Error('response lost after acceptance');}
      return Response.json(runs.get(k));
    }
    const r=[...runs.values()].find(r=>p.includes(r.run_id));
    if(r){if(p.endsWith('/stop'))r.status='stopping';if(p.endsWith('/approval')){r.status='running';delete r.approval;}return Response.json(r);}
    return Response.json({error:'not found'},{status:404});
  };
  const bridge=createBridge({root:dir,stateDir:path.join(dir,'state'),fetcher});
  t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));
  return {bridge,dir,seen,runs,lose:()=>{loseResponse=true;}};
}
const message=(id='11111111-1111-4111-8111-111111111111')=>({requestId:id,profileId:'default',input:'fixture check',tracked:true});
test('loopback discovery rejects remote and credential-bearing upstreams',t=>{
  for(const v of ['http://evil.test:9999','http://127.0.0.1:9999/path','http://a:b@127.0.0.1:9999','https://127.0.0.1:9999','http://127.0.0.1:99/?token=x'])assert.equal(localBase(v),null);
  assert.equal(localBase('http://127.0.0.1:9999'),'http://127.0.0.1:9999');
  const f=fixture(t);assert.equal(discover(f.dir)[0].id,'default');
});
test('public inventory never returns credentials or upstream addresses',async t=>{
  const {bridge}=fixture(t);const result=await bridge.dispatch('GET','/profiles');assert.equal(result.profiles[0].connected,true);assert.equal(JSON.stringify(result).includes(key),false);assert.equal(JSON.stringify(result).includes('9999'),false);
});
test('lost acceptance and repeated sends reuse the same durable identity',async t=>{
  const f=fixture(t);f.lose();await assert.rejects(f.bridge.dispatch('POST','/messages',message()));
  const replay=await f.bridge.dispatch('POST','/messages',message());
  const again=await f.bridge.dispatch('POST','/messages',message());
  assert.equal(replay.runId,again.runId);assert.equal(f.runs.size,1);
  const recovered=createBridge({root:f.dir,stateDir:path.join(f.dir,'state'),fetcher:async()=>Response.json({status:'completed',output:'fixture result'})});
  const state=await recovered.dispatch('GET','/runs');assert.equal(state.runs[0].output,'fixture result');
  assert.equal(fs.statSync(path.join(f.dir,'state/runs.json')).mode&0o777,0o600);
});
test('request identity cannot be reused for changed content or profile',async t=>{
  const f=fixture(t);await f.bridge.dispatch('POST','/messages',message());
  await assert.rejects(f.bridge.dispatch('POST','/messages',{...message(),input:'changed'}),{status:409});
  await assert.rejects(f.bridge.dispatch('POST','/messages',{...message(),profileId:'other'}),{status:409});
});
test('concurrent same-key submissions launch one upstream call',async t=>{
  const f=fixture(t);await Promise.all([f.bridge.dispatch('POST','/messages',message()),f.bridge.dispatch('POST','/messages',message())]);
  assert.equal(f.seen.filter(s=>s.p==='/v1/runs').length,1);
});
test('approval is exact-request, once or deny only; stop stays stopping',async t=>{
  const f=fixture(t);const r=await f.bridge.dispatch('POST','/messages',message());const upstream=f.runs.values().next().value;
  upstream.status='waiting_for_approval';upstream.approval={request_id:'request-1',command:'fixture command'};
  await assert.rejects(f.bridge.dispatch('POST',`/runs/${r.id}/approval`,{requestId:'wrong',choice:'once'}),{status:409});
  await assert.rejects(f.bridge.dispatch('POST',`/runs/${r.id}/approval`,{requestId:'request-1',choice:'always'}),{status:409});
  await f.bridge.dispatch('POST',`/runs/${r.id}/approval`,{requestId:'request-1',choice:'once'});
  assert.equal(JSON.parse(f.seen.at(-2).opts.body).request_id,'request-1');
  const stopped=await f.bridge.dispatch('POST',`/runs/${r.id}/stop`,{});assert.equal(stopped.status,'stopping');
});
test('HTTP boundary rejects missing header, foreign origin and host, unknown routes',async t=>{
  const f=fixture(t);const server=http.createServer(f.bridge.handler);server.listen(0,'127.0.0.1');await once(server,'listening');t.after(()=>server.close());const url=`http://127.0.0.1:${server.address().port}`;
  const request=headers=>new Promise((resolve,reject)=>{http.get(url+'/profiles',{headers},res=>{res.resume();res.on('end',()=>resolve({status:res.statusCode}));}).on('error',reject);});
  assert.equal((await request({Host:'127.0.0.1:4186'})).status,403);
  assert.equal((await request({Host:'127.0.0.1:4186','X-Hermes-Mobile':'1',Origin:'https://evil.test'})).status,403);
  assert.equal((await request({Host:'evil.test:4186','X-Hermes-Mobile':'1'})).status,403);
  assert.equal((await request({Host:'127.0.0.1:4186','X-Hermes-Mobile':'1',Origin:'http://127.0.0.1:4186'})).status,200);
  await assert.rejects(f.bridge.dispatch('POST','/anything',{}),{status:404});
});
test('a second request cannot start in the same unfinished conversation',async t=>{
  const f=fixture(t);const first=await f.bridge.dispatch('POST','/messages',message());
  await assert.rejects(f.bridge.dispatch('POST','/messages',{...message('22222222-2222-4222-8222-222222222222'),sessionId:first.sessionId}),{status:409});assert.equal(f.runs.size,1);
});
test('connection loss preserves last known run state and exposes uncertainty',async t=>{
  const f=fixture(t);await f.bridge.dispatch('POST','/messages',message());
  const offline=createBridge({root:f.dir,stateDir:path.join(f.dir,'state'),fetcher:async()=>{throw Error('offline');}});
  const result=await offline.dispatch('GET','/runs');assert.equal(result.runs[0].status,'running');assert.ok(result.runs[0].connectionError);
  await assert.rejects(offline.dispatch('POST',`/runs/${message().requestId}/stop`,{}),{status:409});
});
