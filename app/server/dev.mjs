import { createServer } from 'vite';
import { runtime } from './runtime.mjs';
const {bridge,pairing}=runtime();
const server=await createServer({server:{host:'127.0.0.1',port:4186,strictPort:true},plugins:[{name:'hermes-local-bridge',configureServer(s){s.middlewares.use('/api/mobile',bridge.handler);s.middlewares.use('/api/pairing',pairing);}}]});
await server.listen();console.log('Hermes Mobile preview: http://127.0.0.1:4186');
