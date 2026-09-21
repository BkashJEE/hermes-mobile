import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import http from 'node:http';
import { createBridge } from './bridge.mjs';
import { createDevices } from './devices.mjs';
import { phoneHandler, localPairingHandler } from './phone-server.mjs';
export function runtime(){
 const stateDir=path.join(os.homedir(),'.local/state/hermes-mobile');
 let config={};try{config=JSON.parse(fs.readFileSync(path.join(stateDir,'phone.json'),'utf8'));}catch(e){if(e.code!=='ENOENT')throw e;}
 const origin=process.env.HERMES_PHONE_ORIGIN||config.origin||'';
 const bridge=createBridge({stateDir});const devices=createDevices(stateDir);
 const pairing=localPairingHandler({devices,origin});
 if(origin){const phone=http.createServer(phoneHandler({devices,dispatch:bridge.dispatch,origin,staticDir:path.resolve('dist/phone')}));phone.listen(4187,'127.0.0.1',()=>console.log('Private phone app configured at '+origin));}
 return {bridge,pairing};
}
