import test from 'node:test';import assert from 'node:assert/strict';import {spawn} from 'node:child_process';import {once} from 'node:events';
test('real HTTP server serves UI, modules, safe paths and shared-model API',async()=>{
 const child=spawn(process.execPath,['server.mjs'],{cwd:new URL('../',import.meta.url),env:{...process.env,PORT:'0'},stdio:['ignore','pipe','pipe']});
 try{
 const base=await new Promise((resolve,reject)=>{child.stdout.on('data',d=>{const m=String(d).match(/http:\/\/127.0.0.1:\d+/);if(m)resolve(m[0]);});child.once('error',reject);child.once('exit',c=>reject(Error('server exited '+c)));});
 const html=await fetch(base);assert.equal(html.status,200);assert.match(await html.text(),/Interactive vehicle service bay/);
 for(const file of ['ui.js','simulation.js','scene.js','style.css']){const r=await fetch(base+'/'+file);assert.equal(r.status,200,file);assert.ok((await r.text()).length>100);}
 assert.equal((await fetch(base+'/missing')).status,404);assert.equal((await fetch(base+'/%2e%2e%2fserver.mjs')).status,404);
 const scenario=await (await fetch(base+'/api/scenario')).json();assert.equal(scenario.vehicle,'2014 Ford F-150');assert.equal(scenario.faults,undefined);
 const replay=await (await fetch(base+'/api/replay',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({actions:[{type:'ignition',key:'KEY ON'},{type:'measure',mode:'dc',red:'ref',black:'ground'}]})})).json();assert.equal(replay.results[1].value,5.02);
 const invalid=await fetch(base+'/api/replay',{method:'POST',body:JSON.stringify({actions:[{type:'ignition',key:'RUNNING'}]})});assert.equal(invalid.status,400);
 }finally{child.kill();await once(child,'exit');}
});
