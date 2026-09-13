import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
await mkdir('test-results',{recursive:true});
const browser=await chromium.launch({headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu']});
const report=[];
try{
for(const mobile of [false,true]){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:1});
 const p=await context.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.setDefaultTimeout(15000);
 const click=async(s)=>{await p.locator(s).scrollIntoViewIfNeeded();await (mobile?p.locator(s).tap():p.locator(s).click());};
 const tool=async(id)=>click(`[data-tool="${id}"]`);
 const view=async(id)=>click(`[data-view="${id}"]`);
 const part=async(id)=>click(`[data-part="${id}"] .outline`);
 const lead=async(c,id)=>{await click(`[data-lead="${c}"]`);await click(`[data-pin="${id}"] .tip`);};
 const waitText=async(s,text)=>{await p.waitForFunction(({s,text})=>document.querySelector(s)?.textContent.includes(text),{s,text});};
 const crank=async(ms,check)=>{await p.locator('#crank').scrollIntoViewIfNeeded();let box=await p.locator('#crank').boundingBox();await p.mouse.move(box.x+box.width/2,box.y+box.height/2);await p.mouse.down();await p.waitForTimeout(ms);if(check)await check();await p.mouse.up();};
 await p.goto(process.env.TEST_URL||'http://127.0.0.1:34575');
 await p.screenshot({path:`test-results/${mobile?'mobile':'desktop'}-arrival.png`,fullPage:true});
 await click('#orderButton');assert.match(await p.locator('#drawerContent').innerText(),/stalled once yesterday/);await click('#closeDrawer');
 await part('hood');await part('cover');
 await p.screenshot({path:`test-results/${mobile?'mobile':'desktop'}-bay.png`,fullPage:true});
 await tool('scanner');await view('interior');await part('obd');await click('#keyOn');await click('[data-page="codes"]');await waitText('#scannerScreen','P0335');
 await click('[data-page="live"]');await crank(650,()=>waitText('#rpmValue','0 RPM'));
 await tool('dvom');await view('bay');await lead('black','bat-');await lead('red','bat+');await waitText('#reading','12.56');
 if(!mobile){const from=await p.locator('[data-lead="red"]').boundingBox(),to=await p.locator('[data-pin="ground"] .tip').boundingBox();await p.mouse.move(from.x+from.width/2,from.y+from.height/2);await p.mouse.down();await p.mouse.move(to.x+to.width/2,to.y+to.height/2,{steps:20});await p.mouse.up();await waitText('#redWhere','G101');await lead('red','bat+');}
 await tool('fuel');await part('fuelPort');await waitText('#gaugeReading','42 PSI');
 await tool('dvom');await view('under');await lead('black','ground');await lead('red','ref');await waitText('#reading','5.02');await lead('red','gnd');await waitText('#reading','0.04');
 await tool('scope');await lead('black','ground');await lead('red','sig');await crank(650,()=>waitText('#scopeReading','0.0 V peak'));
 await p.screenshot({path:`test-results/${mobile?'mobile':'desktop'}-scope.png`,fullPage:true});
 await click('#keyOff');await tool('hand');await part('connector');await view('wiring');await part('pcmConnector');
 await tool('dvom');await p.locator('#mode').selectOption('ohm');await lead('red','sig');await lead('black','pcm');await waitText('#reading','0.3');
 await p.screenshot({path:`test-results/${mobile?'mobile':'desktop'}-continuity.png`,fullPage:true});
 await tool('hand');await part('pcmConnector');await view('under');await tool('socket8');await part('bolt');await part('bolt');await part('bolt');
 await tool('hand');await part('sensor');await tool('replacement');await part('sensor');await tool('socket8');await part('bolt');await part('bolt');await part('bolt');await tool('hand');await part('connector');
 await tool('scanner');await click('[data-page="live"]');await crank(1900);await waitText('#engineState','RUNNING');await waitText('#rpmValue','735 RPM');
 await click('#clearCodes');await p.waitForTimeout(5300);await click('[data-page="codes"]');await waitText('#scannerScreen','Repair verified');
 await click('#orderButton');await click('#finish');await waitText('#drawerContent','JOB COMPLETE');
 const evidence=await p.locator('#drawerContent').innerText();for(const text of ['P0335','0 RPM','5.02','0.04','0.3 Ω','42 PSI','735 RPM','CKP signal flat'])assert.ok(evidence.includes(text),text);
 await p.screenshot({path:`test-results/${mobile?'mobile':'desktop'}-complete.png`,fullPage:true});
 assert.deepEqual(errors,[]);
 assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'No horizontal page overflow');
 await click('#closeDrawer');await p.reload();await waitText('#engineState','RUNNING');await click('#orderButton');assert.match(await p.locator('#drawerContent').innerText(),/Closed/);
 report.push({viewport:mobile?'390x844 touch':'1440x1000 desktop',result:'PASS',steps:'Physical OBD, cranking, battery, fuel pressure, red/black probes, reference/ground, scope, isolated continuity, socket repair, running RPM, clear and explicit rescan, complete order, persistence',errors});
 console.log(JSON.stringify(report.at(-1)));await context.close();
}
await writeFile('test-results/acceptance.json',JSON.stringify(report,null,2));
}finally{await browser.close();}
