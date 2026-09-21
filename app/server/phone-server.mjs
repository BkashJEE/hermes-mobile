import fs from 'node:fs';
import path from 'node:path';
const fail=(message,status)=>Object.assign(Error(message),{status});
export const cookieName='__Host-hermes_mobile';
export function boundary(req,origin){const u=new URL(origin);if(req.headers.host!==u.host||req.headers['x-hermes-mobile']!=='1'||(req.headers.origin&&req.headers.origin!==origin)||(req.headers['sec-fetch-site']&&!['same-origin','none'].includes(req.headers['sec-fetch-site'])))throw fail('Request origin rejected.',403);}
export async function bodyFor(req){if(req.method!=='POST')return {};if(!(req.headers['content-type']||'').startsWith('application/json'))throw fail('Expected JSON.',415);let size=0,parts=[];for await(const part of req){size+=part.length;if(size>24000)throw fail('Request too large.',413);parts.push(part);}let b;try{b=JSON.parse(Buffer.concat(parts).toString());}catch{throw fail('Invalid JSON.',400);}if(!b||Array.isArray(b)||typeof b!=='object')throw fail('Invalid JSON object.',400);return b;}
const json=(res,data,status=200)=>{res.statusCode=status;res.setHeader('Content-Type','application/json');res.end(JSON.stringify(data));};
const tokenFor=req=>(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
const cookie=token=>`${cookieName}=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${token?2592000:0}`;
function headers(res){res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');}
export function localPairingHandler({devices,origin,port=4186}){return async(req,res)=>{headers(res);try{boundary(req,`http://127.0.0.1:${port}`);const b=await bodyFor(req);const route=new URL(req.url,'http://localhost').pathname;
  if(req.method==='GET'&&route==='/')return json(res,{origin,devices:devices.list()});
  if(req.method==='POST'&&route==='/code'){if(!origin)throw fail('Phone access is not configured on this host.',503);return json(res,{...devices.mint(),origin});}
  if(req.method==='POST'&&route==='/revoke'&&typeof b.id==='string')return json(res,devices.revoke(b.id));
  throw fail('Unknown pairing route.',404);
}catch(e){json(res,{error:e.status?e.message:'Pairing service unavailable.'},e.status||500);}};}
export function phoneHandler({devices,dispatch,origin,staticDir}){
  if(!/^https:\/\/[a-z0-9.-]+\.ts\.net(?::\d+)?$/.test(origin||''))throw Error('Phone origin must be an exact HTTPS Tailscale hostname.');
  return async(req,res)=>{headers(res);res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'");
    try{if(req.headers.host!==new URL(origin).host)throw fail('Unknown host.',403);
      const route=new URL(req.url,origin).pathname;
      if(route.startsWith('/api/')){boundary(req,origin);if(!['GET','POST'].includes(req.method))throw fail('Method not allowed.',405);const b=await bodyFor(req);
        if(route==='/api/device/pair'&&req.method==='POST'){const result=devices.pair(b.code,b.name);res.setHeader('Set-Cookie',cookie(result.token));return json(res,{device:result.device});}
        const device=devices.authenticate(tokenFor(req));if(!device)throw fail('Pair this device to connect to Hermes.',401);
        if(route==='/api/device/session'&&req.method==='GET')return json(res,{device});
        if(route==='/api/device/logout'&&req.method==='POST'){devices.revoke(device.id);res.setHeader('Set-Cookie',cookie(''));return json(res,{ok:true});}
        if(route.startsWith('/api/mobile/'))return json(res,await dispatch(req.method,route.slice('/api/mobile'.length),b));
        throw fail('Unknown API route.',404);
      }
      if(!['GET','HEAD'].includes(req.method))throw fail('Method not allowed.',405);
      const name=route==='/'?'/phone.html':decodeURIComponent(route);
      if(!/^\/(?:phone\.html|hermes-emblem\.png|assets\/[a-zA-Z0-9_.-]+)$/.test(name))throw fail('Not found.',404);
      const file=path.join(staticDir,name);if(!fs.existsSync(file)||!fs.statSync(file).isFile())throw fail('Build the phone app on the host first.',404);
      const types={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
      res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);
    }catch(e){json(res,{error:e.status?e.message:'The host could not complete this request.'},e.status||500);}
  };
}
