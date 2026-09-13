import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {Vehicle,scenario} from './public/simulation.js';
const root=path.resolve(fileURLToPath(new URL('./public/',import.meta.url)));
const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 const url=new URL(req.url,'http://localhost');
 if(url.pathname==='/api/scenario'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({id:scenario.id,vehicle:scenario.vehicle,engine:scenario.engine,complaint:scenario.complaint}));return;}
 if(url.pathname==='/api/health'){res.setHeader('Content-Type','application/json');res.end(JSON.stringify({ok:true,app:'AutoDiag Service Bay'}));return;}
 // Stateless replay API uses the same model as the browser. No shared user state.
 if(url.pathname==='/api/replay'&&req.method==='POST'){
  try{let body='';for await(const chunk of req){body+=chunk;if(body.length>100000)throw Error('Request too large');}const {actions=[]}=JSON.parse(body);if(!Array.isArray(actions)||actions.length>1000)throw Error('Invalid action list');const v=new Vehicle();let results=[];
  for(const a of actions){switch(a.type){case 'act':results.push(v.act(a.target,a.tool));break;case 'ignition':if(!['KEY OFF','KEY ON','CRANKING'].includes(a.key))throw Error('Invalid ignition state');results.push(v.ignition(a.key));break;case 'tick':v.tick(Math.max(0,Math.min(10000,Number(a.ms)||0)));break;case 'release':v.release();break;case 'measure':results.push(v.measure(a.mode,a.red,a.black));break;case 'scope':results.push(v.waveform(a.red,a.black));break;case 'scan':results.push(v.scan(a.page));break;case 'clear':results.push(v.clearCodes());break;case 'finish':results.push(v.finish());break;default:throw Error('Unknown action');}}
  res.setHeader('Content-Type','application/json');res.end(JSON.stringify({results,state:v.key,evidence:v.evidence,verified:v.verified,score:v.score()}));
  }catch(e){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:e.message}));}return;
 }
 try{const pathname=decodeURIComponent(url.pathname);const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));if(!file.startsWith(root+path.sep))throw Error('Invalid path');const data=await readFile(file);res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});res.end(data);}catch{res.writeHead(404);res.end('Not found');}
});
server.listen(Number(process.env.PORT)||0,'127.0.0.1',()=>console.log(`AutoDiag Service Bay http://127.0.0.1:${server.address().port}`));
