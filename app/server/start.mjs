import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {runtime} from './runtime.mjs';
const {bridge,pairing}=runtime();
http.createServer((req,res)=>{
 if(req.headers.host!=='127.0.0.1:4186'){res.writeHead(403).end();return;}
 const route=new URL(req.url,'http://127.0.0.1:4186').pathname;
 for(const [prefix,handler] of [['/api/mobile',bridge.handler],['/api/pairing',pairing]]){if(route===prefix||route.startsWith(prefix+'/')){req.url=req.url.slice(prefix.length)||'/';void handler(req,res);return;}}
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405).end();return;}
 let name;try{name=decodeURIComponent(route);}catch{res.writeHead(400).end();return;}
 if(name==='/')name='/index.html';const root=path.resolve('dist/client'),file=path.resolve(root,'.'+name);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2'};
 res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);
}).listen(4186,'127.0.0.1',()=>console.log('Hermes Mobile: http://127.0.0.1:4186'));
