import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
export function createDevices(stateDir, now = Date.now) {
  fs.mkdirSync(stateDir, {recursive:true, mode:0o700});
  const file=path.join(stateDir,'devices.json');
  const read=()=>{try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return {devices:[],pairing:null};throw e;}};
  const save=s=>{fs.writeFileSync(file+'.tmp',JSON.stringify(s),{mode:0o600});fs.renameSync(file+'.tmp',file);};
  const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
  const publicDevice=({hash:_,...d})=>d;
  return {
    mint(){const s=read(),code=String(crypto.randomInt(1000000)).padStart(6,'0');s.pairing={hash:hash(code),expires:now()+600000,attempts:0};save(s);return {code,expires:s.pairing.expires};},
    pair(code,name){const s=read(),p=s.pairing; if(!p||p.expires<=now()||p.attempts>=8)throw Object.assign(Error('Invalid or expired pairing code. Generate a new code on your computer.'),{status:403});
      p.attempts++; const valid=typeof code==='string'&&/^\d{6}$/.test(code)&&crypto.timingSafeEqual(Buffer.from(hash(code)),Buffer.from(p.hash));
      if(!valid){if(p.attempts>=8)s.pairing=null;save(s);throw Object.assign(Error('Invalid or expired pairing code.'),{status:403});}
      const token=crypto.randomBytes(32).toString('hex');const device={id:crypto.randomUUID(),name:typeof name==='string'?name.trim().slice(0,60)||'Phone':'Phone',created:now(),expires:now()+30*86400000,hash:hash(token)};
      s.devices.push(device);s.pairing=null;save(s);return {token,device:publicDevice(device)};
    },
    authenticate(token){if(typeof token!=='string'||!/^[a-f0-9]{64}$/.test(token))return null;const d=read().devices.find(d=>d.hash===hash(token)&&d.expires>now());return d?publicDevice(d):null;},
    list(){return read().devices.filter(d=>d.expires>now()).map(publicDevice);},
    revoke(id){const s=read();s.devices=s.devices.filter(d=>d.id!==id);save(s);return {ok:true};}
  };
}
