export const STATES = ['KEY OFF','KEY ON','CRANKING','RUNNING','STALLED'];
export const CONDITIONS = ['healthy','failed','open circuit','short to ground','short to power','high resistance','intermittent','disconnected'];
export const scenario = {id:'f150-ckp-01',vehicle:'2014 Ford F-150',engine:'3.5L V6',complaint:'Truck stalled once yesterday. This morning the engine cranks normally but will not start.',faults:[{target:'ckp',condition:'failed'}]};
export const pins = {
  'bat+':{label:'Battery +',circuit:'battery'},'bat-':{label:'Battery −',circuit:'ground'},
  ground:{label:'Engine ground G101',circuit:'ground'},
  ref:{label:'C101 · 1 · 5V REF',circuit:'reference',side:'harness'},
  sig:{label:'C101 · 2 · CKP SIG',circuit:'signal',side:'harness'},
  gnd:{label:'C101 · 3 · LOW REF',circuit:'sensorGround',side:'harness'},
  pcm:{label:'C200 · 21 · CKP input',circuit:'signal',side:'pcm'},
  cmp:{label:'CMP signal backprobe',circuit:'cam'},
  injector:{label:'Injector control backprobe',circuit:'injector'},
  coil:{label:'Coil control backprobe',circuit:'ignition'},
  fuseIn:{label:'F27 supply',circuit:'battery'},fuseOut:{label:'F27 output',circuit:'fused'}
};
export class Circuit {
  constructor(id,condition='healthy'){this.id=id;this.condition=condition;}
  conducts(t=0){return !['failed','open circuit','disconnected'].includes(this.condition) && !(this.condition==='intermittent' && Math.floor(t/1200)%2===0);}
  voltage(nominal,battery,t){if(this.condition==='short to ground')return 0;if(this.condition==='short to power')return battery;if(!this.conducts(t))return null;return this.condition==='high resistance'?nominal*0.35:nominal;}
  resistance(t){return this.conducts(t)?(this.condition==='high resistance'?180:0.3):Infinity;}
}
export class Component {constructor(id,condition='healthy'){this.id=id;this.condition=condition;this.installed=true;}}
export class Connector {constructor(id,pinIds){this.id=id;this.pins=pinIds;this.connected=true;}}
export class Vehicle {
  constructor(saved){
    this.systems={power:['battery','fuse','relay'],engine:['ckp','cmp','coil','plug'],management:['pcm']};
    this.components=Object.fromEntries(['battery','ckp','cmp','coil','plug','pcm','fuse','relay'].map(id=>[id,new Component(id)]));
    this.connectors={ckp:new Connector('C101',['ref','sig','gnd']),pcm:new Connector('C200',['pcm'])};
    this.circuits=Object.fromEntries(['battery','ground','reference','signal','sensorGround','cam','injector','ignition','fused'].map(id=>[id,new Circuit(id)]));
    this.key='KEY OFF';this.hood=false;this.cover=true;this.fuseCover=true;this.bolt=3;this.boltDirection="loosen";this.compressionPeak=0;this.obd=false;this.batteryConnected=true;
    this.coilOut=false;this.plugOut=false;this.dtc=true;this.time=0;this.crankTime=0;this.runTime=0;this.clearRun=0;this.cleared=false;this.verified=false;this.complete=false;
    this.evidence={};this.history=[];this.penalties=0;this.replacements=0;this.meterFuse=true;
    for(const f of scenario.faults)this.components[f.target].condition=f.condition;
    if(saved){Object.assign(this,saved);for(const [k,v]of Object.entries(this.circuits))this.circuits[k]=Object.assign(new Circuit(k),v);}
  }
  note(id,text){if(!this.evidence[id]){this.evidence[id]=text;this.history.push(text);}}
  log(text){this.history.push(text);this.history=this.history.slice(-80);return text;}
  powered(){return this.key!=='KEY OFF' && this.batteryConnected && this.components.fuse.installed;}
  rotating(){return this.key==='CRANKING'||this.key==='RUNNING';}
  battery(){return this.key==='CRANKING'?10.65:this.key==='RUNNING'?14.2:12.56;}
  sensorOK(){const c=this.components.ckp;return c.installed && this.bolt===3 && new Circuit('ckp',c.condition).conducts(this.time) && !['short to ground','short to power','high resistance'].includes(c.condition) && this.connectors.ckp.connected && this.connectors.pcm.connected && this.circuits.signal.conducts(this.time) && !['short to ground','short to power'].includes(this.circuits.signal.condition) && (this.voltage('ref')??0)>4.5 && (this.voltage('gnd')??10)<0.1;}
  rpm(){return this.rotating()&&this.sensorOK()?this.key==='RUNNING'?735:210:0;}
  fuel(){return this.powered()&&this.components.relay.installed?42:0;}
  canRun(){return this.sensorOK()&&this.fuel()>30&&!this.coilOut&&!this.plugOut;}
  voltage(pin){
    if(!pins[pin])return null;
    const circuit=this.circuits[pins[pin].circuit],b=this.battery();
    let n=0;
    switch(pins[pin].circuit){
      case 'battery': n=b;break;
      case 'ground': n=0;break;
      case 'reference': n=this.powered()&&this.connectors.pcm.connected?5.02:0;break;
      case 'sensorGround': n=this.powered()?0.04:0;break;
      case 'signal': n=this.rotating() && this.components.ckp.condition==='healthy' && this.components.ckp.installed && this.connectors.ckp.connected && this.powered()?2.5:0;break;
      case 'cam': n=this.rotating()&&this.powered()?2.5:0;break;
      case 'injector':case 'ignition':n=this.rotating()&&this.rpm()>0?6:0;break;
      case 'fused':n=this.components.fuse.installed?b:0;break;
    }
    return circuit.voltage(n,b,this.time);
  }
  resistance(a,b){
    if(a===b)return 0.1;
    if(['sig','pcm'].includes(a)&&['sig','pcm'].includes(b))return !this.connectors.ckp.connected&&!this.connectors.pcm.connected?this.circuits.signal.resistance(this.time):null;
    if(['ground','bat-','gnd'].includes(a)&&['ground','bat-','gnd'].includes(b))return this.circuits.sensorGround.resistance(this.time);
    if(['fuseIn','fuseOut'].includes(a)&&['fuseIn','fuseOut'].includes(b))return this.components.fuse.installed?0.1:Infinity;
    return Infinity;
  }
  measure(mode,red,black,record=true){
    if(!red||!black)return {text:'— — —',value:null,unit:mode==='ohm'?'Ω':'V',detail:'Connect both leads'};
    const a=this.voltage(red),b=this.voltage(black);let value,unit='V',detail='';
    if(mode==='amps'){
      if(!this.meterFuse)return {text:'FUSE',value:null,unit:'A',detail:'Meter current-input fuse is open'};
      if(Math.abs((a??0)-(b??0))>0.5){this.meterFuse=false;this.penalties+=5;return {text:'FUSE',value:null,unit:'A',detail:'Parallel current connection opened the meter fuse'};}
      return {text:'0.00',value:0,unit:'A',detail:'Current mode requires a series circuit'};
    }
    if(mode==='ohm'||mode==='continuity'){
      unit='Ω';if(this.key!=='KEY OFF')return {text:'LIVE',value:null,unit,detail:'Switch KEY OFF before resistance testing'};
      value=this.resistance(red,black);if(value===null)return {text:'ISOLATE',value:null,unit,detail:'Disconnect C101 and C200 to isolate the signal wire'};
      if(value<1 && [red,black].includes('sig') && [red,black].includes('pcm')&&record)this.note('continuity',`C101/2 → C200/21: ${value.toFixed(1)} Ω, isolated signal wire`);
      detail=mode==='continuity'&&value<10?'Continuous tone':'Resistance';
    }else{
      value=a===null||b===null?null:a-b;
      if(mode==='ac')value=value===null?null:this.rotating()&&['sig','cmp'].includes(red)&&Math.abs(value)>1?2.48:0;
      if(record&&value!==null){
        if(red==='bat+'&&black==='bat-'&&mode==='dc')this.note(this.key==='CRANKING'?'batteryCrank':'battery',`Battery: ${value.toFixed(2)} V${this.key==='CRANKING'?' during crank':''}`);
        if(red==='ref'&&['ground','bat-'].includes(black)&&value>4.5&&mode==='dc')this.note('reference',`C101/1 reference: ${value.toFixed(2)} V, key on`);
        if(red==='gnd'&&['ground','bat-'].includes(black)&&this.powered()&&mode==='dc')this.note('ground',`C101/3 ground drop: ${value.toFixed(2)} V`);
        if(red==='sig'&&['gnd','ground','bat-'].includes(black)&&this.rotating()&&mode==='ac')this.note(value<0.1?'signal':'signalRestored',`CKP signal: ${value.toFixed(2)} V AC during ${this.key.toLowerCase()}`);
      }
    }
    return {text:value===null?'OL':Number.isFinite(value)?value.toFixed(unit==='Ω'?1:2):'OL',value,unit,detail};
  }
  waveform(red,black){
    if(!red||!black||!['ground','gnd','bat-'].includes(black))return {active:false,connected:false,hz:0,peak:0};
    const voltage=this.voltage(red);const active=this.rotating() && this.powered() && voltage>0.2 && ['sig','cmp','injector','coil'].includes(red);
    const rpm=red==='cmp'?this.rotating()?this.key==='RUNNING'?735:210:0:this.rpm();
    if(red==='sig'&&this.rotating())this.note(active?'signalRestored':'signal',active?'CKP waveform restored during rotation':'CKP signal flat during crank; scope grounded');
    return {active,connected:true,hz:active?rpm/60*(red==='sig'?35:red==='cmp'?3:0.5):0,peak:active?['coil','injector'].includes(red)?12:5:0};
  }
  scan(page,record=true){
    if(!this.obd||!this.powered()||!this.connectors.pcm.connected)return {connected:false};
    if(page==='codes'&&record){
      if(this.dtc)this.note('dtc','P0335 — Crankshaft position sensor A circuit');
      if(!this.dtc&&this.cleared&&this.runTime-this.clearRun>=5000&&this.key==='RUNNING'&&this.evidence.rpmRestored){this.verified=true;this.note('verified','Engine running, RPM verified, P0335 did not return after clearing and rescan');}
    }
    if(record&&page==='live'&&this.key==='CRANKING'&&this.rpm()===0)this.note('rpm','Engine turns normally; scanner reports 0 RPM');
    if(record&&page==='live'&&this.key==='RUNNING'&&this.rpm()>600)this.note('rpmRestored',`Engine idling; scanner reports ${this.rpm()} RPM`);
    return {connected:true,dtc:this.dtc,rpm:this.rpm(),battery:this.battery(),fuel:this.fuel(),ready:this.verified};
  }
  clearCodes(){if(!this.scan('').connected)return 'Connect scanner and switch ignition on';this.dtc=false;this.cleared=true;this.clearRun=this.runTime;this.verified=false;return this.log('DTC memory cleared. Run engine for 5 seconds, inspect live RPM and rescan.');}
  ignition(key){
    if(key==='KEY OFF'){this.key=key;this.crankTime=0;return 'Ignition off';}
    if(!this.batteryConnected)return 'Battery disconnected';
    if(key==='CRANKING'){
      if(this.key==='RUNNING')return 'Engine already running';
      if(this.plugOut&&this.components.relay.installed)return 'Remove fuel pump relay before cranking with spark plug removed';
      this.crankTime=0;this.note('complaint','Starter turns engine normally');
    }
    if(!(this.key==='RUNNING'&&key==='KEY ON'))this.key=key;return key==='CRANKING'?'Starter engaged — release CRANK to return key':'Ignition on';
  }
  release(){if(this.key==='CRANKING')this.key=this.canRun()&&this.crankTime>=1200?'RUNNING':'KEY ON';}
  tick(dt){this.time+=dt;if(this.key==='CRANKING'){this.crankTime+=dt;if(!this.sensorOK())this.dtc=true;if(this.canRun()&&this.crankTime>=1400){this.key='RUNNING';this.runTime=0;}else if(this.crankTime>10000)this.release();}if(this.key==='RUNNING'){this.runTime+=dt;if(!this.canRun()){this.key='STALLED';this.dtc=!this.sensorOK()||this.dtc;this.verified=false;}}}
  act(target,tool){
    const off=this.key==='KEY OFF';
    if(target==='hood'){if(tool!=='hand')return 'Use your hand on the hood latch';this.hood=!this.hood;return this.log(this.hood?'Hood raised':'Hood lowered');}
    if(target==='obd'){if(tool!=='scanner')return 'Select scan tool, then plug its cable into this port';this.obd=!this.obd;return this.log(this.obd?'OBD-II cable seated':'OBD-II cable unplugged');}
    if(target==='cover'){if(!this.hood)return 'Open hood first';if(tool!=='hand')return 'Lift the access cover by hand';this.cover=!this.cover;return this.log(this.cover?'Access cover fitted':'Lower access area exposed');}
    if(target==='fuseCover'){if(tool!=='hand')return 'Use your hand to release the cover';this.fuseCover=!this.fuseCover;return this.log('Fuse box cover '+(this.fuseCover?'closed':'opened'));}
    if(['connector','pcmConnector','bolt','sensor','fuse','relay','battery','coilBody','plug'].includes(target)&&!off)return 'Turn ignition OFF before disconnecting or removing parts';
    if(['connector','bolt','sensor'].includes(target)&&(!this.hood||this.cover))return 'Open the hood and remove the access cover first';
    if(target==='connector'||target==='pcmConnector'){if(tool!=='hand')return 'Use your hand to release the connector latch';const c=this.connectors[target==='connector'?'ckp':'pcm'];c.connected=!c.connected;return this.log(`${c.id} ${c.connected?'reconnected':'disconnected'}`);}
    if(target==='bolt'){
      if(tool!=='socket8')return 'The retaining bolt needs an 8 mm socket';
      if(this.connectors.ckp.connected)return 'Disconnect C101 before working on the retaining bolt';
      if(!this.components.ckp.installed)return 'Install the sensor before fitting its bolt';
      this.bolt=Math.max(0,Math.min(3,this.bolt+(this.boltDirection==='tighten'?1:-1)));
      return this.log(this.bolt===0?'Retaining bolt removed':this.bolt===3?'Retaining bolt seated':`Ratchet turned · ${this.boltDirection==='tighten'?this.bolt:3-this.bolt}/3`);
    }
    if(target==='sensor'){
      if(this.connectors.ckp.connected)return 'Release C101 connector first';
      if(this.bolt>0)return 'Remove retaining bolt with the 8 mm socket';
      if(this.components.ckp.installed){if(tool!=='hand')return 'Pull the sensor out by hand';this.components.ckp.installed=false;return this.log('Sensor removed from bore');}
      if(tool!=='replacement')return 'Choose a replacement sensor from the parts tray';
      const proof=['reference','ground','signal','continuity'].filter(x=>this.evidence[x]).length;
      if(proof<4)this.penalties+= (4-proof)*5;
      this.components.ckp.installed=true;this.components.ckp.condition='healthy';this.boltDirection='tighten';this.replacements++;this.verified=false;return this.log('Replacement sensor seated; install retaining bolt');
    }
    if(target==='fuse'||target==='relay'){if(this.fuseCover)return 'Release fuse box cover first';if(tool!=='hand')return 'Pull this part by hand';this.components[target].installed=!this.components[target].installed;return this.log(`${target==='fuse'?'F27':'Fuel pump relay'} ${this.components[target].installed?'installed':'removed'}`);}
    if(target==='battery'){if(tool!=='wrench10')return 'Use a 10 mm wrench on the negative clamp';this.batteryConnected=!this.batteryConnected;return this.log(`Battery negative ${this.batteryConnected?'connected':'disconnected'}`);}
    if(target==='coilBody'){if(tool!=='hand')return 'Lift the cylinder 1 coil by hand';this.coilOut=!this.coilOut;return this.log(this.coilOut?'Cylinder 1 coil lifted':'Cylinder 1 coil seated');}
    if(target==='plug'){if(!this.coilOut)return 'Lift cylinder 1 coil first';if(tool!=='socket16')return 'Use a 16 mm spark-plug socket';this.plugOut=!this.plugOut;return this.log(this.plugOut?'Spark plug removed':'Spark plug installed');}
    return 'Select a tool and work on a terminal or fastener';
  }
  pressure(kind,attached){
    if(!attached)return null;
    if(kind==='fuel'){const value=this.fuel();if(value>30)this.note('fuel',`Fuel rail pressure: ${value} PSI, key on`);return value;}
    if(this.key==='CRANKING'&&this.plugOut&&!this.components.relay.installed){this.compressionPeak=Math.max(this.compressionPeak,Math.min(165,this.crankTime/18));if(this.compressionPeak>=165)this.note('compression','Cylinder 1 compression: 165 PSI while cranking, fuel disabled');}
    return this.compressionPeak;
  }
  spark(attached,ground){const connected=attached&&['ground','gnd','bat-'].includes(ground);if(!connected)return null;const active=this.rotating()&&this.rpm()>0;if(this.rotating())this.note('spark',active?'Spark pulses present during crank':'No spark during crank');return active;}
  score(){return Math.max(0,Math.min(100,Object.keys(this.evidence).filter(x=>!['batteryCrank','signalRestored'].includes(x)).length*7+(this.verified?23:0)-this.penalties));}
  finish(){if(!this.verified||this.key!=='RUNNING'||!this.canRun()||this.dtc)return 'Start engine, observe live RPM, clear DTCs, run 5 seconds and rescan before closing the order';this.complete=true;return this.log('Repair verified · Work order closed');}
}
