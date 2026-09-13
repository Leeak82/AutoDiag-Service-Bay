const defs=`<defs>
<linearGradient id="steel" x2=".8" y2="1"><stop stop-color="#788c93"/><stop offset=".45" stop-color="#485c66"/><stop offset="1" stop-color="#263940"/></linearGradient>
<linearGradient id="blue" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#528390"/><stop offset=".5" stop-color="#2e5a69"/><stop offset="1" stop-color="#193d4b"/></linearGradient>
<linearGradient id="black" x2="0" y2="1"><stop stop-color="#34464d"/><stop offset="1" stop-color="#0d191e"/></linearGradient>
<linearGradient id="aluminum" x2="1" y2="1"><stop stop-color="#b7c3c4"/><stop offset=".3" stop-color="#6e868e"/><stop offset=".6" stop-color="#889c9f"/><stop offset="1" stop-color="#3a525b"/></linearGradient>
<radialGradient id="tire"><stop stop-color="#26343a"/><stop offset=".7" stop-color="#0a1418"/><stop offset="1" stop-color="#263139"/></radialGradient>
<pattern id="floor" width="85" height="85" patternUnits="userSpaceOnUse" patternTransform="skewX(-25)"><path d="M85 0H0V85" fill="none" stroke="#7b939a" stroke-opacity=".08"/></pattern>
<pattern id="mesh" width="7" height="7" patternUnits="userSpaceOnUse"><path d="M0 0H7V7" fill="none" stroke="#6b8389" stroke-opacity=".4"/></pattern>
<filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="14" stdDeviation="15" flood-opacity=".45"/></filter></defs>`;
const bolt=(x,y,r=8)=>`<g transform="translate(${x} ${y})"><path d="M${-r} 0L${-r/2} ${-r*.86}H${r/2}L${r} 0 ${r/2} ${r*.86}H${-r/2}Z" fill="url(#aluminum)" stroke="#14272e" stroke-width="2"/><circle r="${r/3}" fill="#293d45"/></g>`;
const label=(x,y,s)=>`<text x="${x}" y="${y}" class="part-label">${s}</text>`;
const hit=(id,label,body)=>`<g class="hit" data-part="${id}" tabindex="0" role="button" aria-label="${label}"><title>${label}</title>${body}</g>`;
export const coords={bay:{'bat+':[269,263],'bat-':[214,267],ground:[356,430],cmp:[584,240],injector:[571,321],coil:[432,320]},under:{ref:[430,343],sig:[490,343],gnd:[550,343],ground:[300,450]},fuses:{fuseIn:[390,313],fuseOut:[390,403],'bat-':[231,468]},wiring:{ref:[320,270],sig:[320,345],gnd:[320,420],pcm:[745,345],ground:[740,470]}};
function pin(id,x,y){return `<g class="pin-hit" data-pin="${id}" tabindex="0" role="button" aria-label="${id}"><circle class="halo" cx="${x}" cy="${y}" r="20"/><circle fill="transparent" cx="${x}" cy="${y}" r="27"/><circle class="tip" cx="${x}" cy="${y}" r="5"/></g>`;}
function bay(v){return `
<ellipse cx="496" cy="430" rx="335" ry="172" fill="#081319" opacity=".6"/>
<g filter="url(#shadow)"><path d="M204 211Q160 250 157 447L175 540 247 558 279 446 730 446 758 558 825 537 839 448Q833 250 791 211Z" fill="url(#blue)" stroke="#62828a" stroke-width="2"/>
<path d="M237 225L759 225 800 461 729 501H270L197 461Z" fill="#101e25" stroke="#385460" stroke-width="12"/>
<path d="M260 216L280 156 711 156 742 216" fill="url(#black)" stroke="#5a7680" stroke-width="4"/>
<path d="M298 177H698" stroke="#728b95" stroke-width="3"/><path d="M290 193H713" stroke="#728b95" stroke-width="2"/>
<path d="M265 237Q229 318 269 387L306 382Q278 286 316 240" fill="url(#steel)"/>
<path d="M720 238Q763 303 741 386L698 380Q733 296 690 240" fill="url(#steel)"/>
<g class="${v.rotating()?'moving-engine':''}"><path d="M385 260L516 217 623 268 617 407 510 455 378 409Z" fill="url(#steel)" stroke="#7e9297" stroke-width="2"/>
<path d="M395 268L470 243 477 387 393 411Z" fill="#253d46" stroke="#536d76" stroke-width="3"/>
<path d="M534 244L609 276 604 409 524 383Z" fill="#253d46" stroke="#536d76" stroke-width="3"/>
${[0,1,2].map(i=>`<path d="M403 ${280+i*37}L462 ${264+i*37}" stroke="#73898e" stroke-width="6"/><path d="M540 ${268+i*37}L593 ${290+i*37}" stroke="#73898e" stroke-width="6"/>${bolt(397,287+i*43)}${bolt(602,295+i*43)}`).join('')}
<path d="M485 249C487 283 463 287 465 320L486 372Q500 392 520 372L540 320C539 285 515 281 516 249" fill="url(#aluminum)" stroke="#172f3a" stroke-width="4"/>
${[0,1,2,3,4].map(i=>`<path d="M477 ${290+i*16}Q502 ${309+i*16} 530 ${290+i*16}" fill="none" stroke="#243c47" stroke-width="5"/>`).join('')}
<circle cx="502" cy="400" r="26" fill="url(#black)" stroke="#869a9f" stroke-width="4"/>
<g transform="${v.coilOut?'translate(-60 -20)':''}">${hit('coilBody','Cylinder 1 ignition coil',`<path class="outline" d="M412 290L447 280 458 312 424 326Z" fill="#243239" stroke="#819294" stroke-width="2"/>${label(364,278,v.coilOut?'COIL LIFTED':'COIL 1')}`)}</g>
${v.coilOut?hit('plug','Cylinder 1 spark plug',`<circle class="outline" cx="438" cy="311" r="15" fill="${v.plugOut?'#070e12':'#afb9ab'}" stroke="#789099"/>${label(378,345,'PLUG / BORE')}`):''}
</g>
${hit('battery','Battery negative clamp',`<path class="outline" d="M194 250L275 240 291 310 202 324Z" fill="url(#black)" stroke="#6e858d" stroke-width="2"/><path d="M207 277L274 266 280 299 213 309Z" fill="#4f6655"/><text x="222" y="293" fill="#c2d4b7" font-size="11" transform="rotate(-10 222 293)">12V AGM</text><path d="M215 267Q183 274 ${v.batteryConnected?'197 357':'162 289'}" fill="none" stroke="#0b1116" stroke-width="9"/>${label(184,233,'BATTERY')}`)}
<path d="M270 266Q326 251 319 371Q300 430 357 430" fill="none" stroke="#513d34" stroke-width="9"/>
<path d="M594 355Q660 350 660 285L699 286" fill="none" stroke="#101b20" stroke-width="37"/>
${[0,1,2,3,4,5].map(i=>`<path d="M640 ${289+i*8}L676 ${289+i*8}" stroke="#415159" stroke-width="3"/>`).join('')}
<path d="M682 240L749 256 764 327 687 319Z" fill="url(#black)" stroke="#62767f" stroke-width="2"/><path d="M696 260L737 269 745 300 700 297Z" fill="url(#mesh)"/>
${label(679,231,'AIR BOX')}
${hit('goFuses','Focus fuse box',`<path class="outline" d="M211 352L288 337 298 394 219 412Z" fill="#283943" stroke="#64777d" stroke-width="2"/><path d="M228 359L271 351 278 380 234 390Z" fill="none" stroke="#506b70"/>${label(188,435,'FUSE BOX')}`)}
<path d="M716 375L758 377 771 435 719 439Z" fill="#819b9477" stroke="#a6bcb5" stroke-width="2"/><ellipse cx="739" cy="374" rx="14" ry="6" fill="#bfbd73"/>
<path d="M308 448Q340 414 389 437L431 464 663 451" fill="none" stroke="#151f25" stroke-width="19"/><path d="M310 444Q340 410 389 433L431 460 663 447" fill="none" stroke="#49616b" stroke-width="3"/>
${hit('cover','Lower engine access cover',`<path class="outline" d="M423 462L584 455 604 491 413 498Z" fill="${v.cover?'url(#steel)':'#071217'}" stroke="#708990" stroke-width="2"/>${label(427,483,v.cover?'ACCESS COVER':'ACCESS OPEN')}`)}
<path d="M203 479L262 507 740 507 800 479 789 519 734 549H264L210 522Z" fill="url(#aluminum)" stroke="#8fa2a7" stroke-width="2"/>
<path d="M287 516H714V548H287Z" fill="#172a32" stroke="#597784" stroke-width="2"/><path d="M295 526H707M295 537H707" stroke="#9caaac" stroke-width="4"/>
<path d="M197 475L252 496 256 523 207 503Z M801 475L746 496 742 523 791 503Z" fill="#e1dcaf" opacity=".65"/>
${v.hood?hit('hood','Lower hood',`<path class="outline" d="M261 215L249 125Q494 62 750 125L739 215Z" fill="url(#blue)" stroke="#73939b" stroke-width="2"/><path d="M279 190L279 140Q501 98 720 140L720 190Z" fill="#183540" stroke="#375968" stroke-width="4"/><path d="M320 149L375 183H620L680 149" stroke="#4f7480" stroke-width="8" fill="none"/>${label(437,152,'HOOD RAISED')}`):hit('hood','Open hood latch',`<path class="outline" d="M253 218Q501 184 753 218L808 480Q502 557 191 480Z" fill="url(#blue)" stroke="#70959f" stroke-width="3"/><path d="M315 245L282 465M686 245L717 465" stroke="#628996" stroke-width="3"/><path d="M344 237Q500 215 657 237" fill="none" stroke="#71949c" stroke-width="2"/>${label(425,396,'PULL HOOD LATCH')}<path d="M476 462H526V476H476Z" fill="#132d36" stroke="#abd58a" stroke-width="2"/>`)}
</g>`;}
function under(v){return `<ellipse cx="497" cy="452" rx="306" ry="134" fill="#07131a" opacity=".6"/><g filter="url(#shadow)">
<path d="M223 215L366 155 672 170 786 293 715 526 309 538 201 393Z" fill="url(#steel)" stroke="#728a92" stroke-width="3"/>
<path d="M283 212L367 187 651 198 733 284 683 482 346 494 247 381Z" fill="url(#black)" stroke="#344e5a" stroke-width="4"/>
<path d="M273 250L328 232 346 463 287 439Z" fill="url(#aluminum)"/><path d="M627 235L681 255 663 456 614 469Z" fill="url(#aluminum)"/>
${[0,1,2,3,4,5].map(i=>`<path d="M350 ${220+i*43}L609 ${233+i*42}" stroke="#47616b" stroke-width="10"/>${bolt(292,260+i*30)}${bolt(657,274+i*29)}`).join('')}
<path d="M195 475Q440 555 784 473L794 508Q450 590 185 513Z" fill="url(#steel)" stroke="#6f8792" stroke-width="3"/>
<path d="M346 184L335 134 640 134 669 199" fill="none" stroke="#12222b" stroke-width="30"/>
<path d="M490 280Q490 224 583 238L744 211" fill="none" stroke="#14202a" stroke-width="23"/>
<path d="M488 279Q488 222 583 236L744 209" fill="none" stroke="#697269" stroke-width="3" stroke-dasharray="3 5"/>
${hit('sensor','Crankshaft position sensor body',v.components.ckp.installed?`<path class="outline" d="M474 371L528 371 541 407 519 454 482 454 463 413Z" fill="url(#black)" stroke="#869798" stroke-width="3"/><path d="M487 443V468H514V443" fill="#777e6c" stroke="#a5ac94"/><path d="M513 401H567V426H525" fill="url(#steel)"/>${label(394,506,'CRANKSHAFT POSITION SENSOR')}`:`<ellipse class="outline" cx="500" cy="431" rx="30" ry="24" fill="#060c10" stroke="#86908a" stroke-width="4"/>${label(399,506,'SENSOR BORE · EMPTY')}`)}
${hit('bolt','CKP retaining bolt',`<circle class="outline" cx="554" cy="414" r="23" fill="#445964" stroke="#536e76"/>${v.bolt>0?bolt(554,414,13):'<circle cx="554" cy="414" r="8" fill="#0a1922"/>'}<text x="583" y="420" class="part-label">${v.bolt===0?'BOLT OUT':v.bolt===3?'8 mm':`${v.bolt}/3`}</text>`)}
${hit('connector','C101 connector latch',`<path class="outline" d="M397 283H582L589 ${v.connectors.ckp.connected?'369':'333'}H390Z" fill="url(#black)" stroke="#82958e" stroke-width="3"/><path d="M453 285V271H522V285" fill="#bf996d" stroke="#e0bd83" stroke-width="2"/><path d="M401 308H578" stroke="#687e78" stroke-width="3"/>${label(398,258,`C101 · ${v.connectors.ckp.connected?'CONNECTED / BACKPROBE':'UNPLUGGED / HARNESS'}`)}`)}
${['1 REF','2 SIG','3 GND'].map((s,i)=>`<text x="${410+i*60}" y="389" class="small-label">${s}</text>`).join('')}
${bolt(300,450,13)}${label(227,492,'G101 GROUND')}
${v.cover?hit('cover','Remove lower access cover',`<path class="outline" d="M245 205L671 215 731 466 299 500 232 385Z" fill="url(#steel)" stroke="#8b9d9e" stroke-width="3"/>${[0,1,2,3,4].map(i=>`<path d="M308 ${265+i*34}L644 ${278+i*32}" stroke="#263e47" stroke-width="11"/>`).join('')}${label(353,439,'LIFT OFF ACCESS COVER')}`):''}
${!v.hood?`<rect x="205" y="170" width="580" height="360" rx="25" fill="#15262beb"/>${label(306,353,'OPEN HOOD FROM THE ENGINE BAY FIRST')}`:''}</g>`;}
function interior(v){return `<g filter="url(#shadow)"><path d="M143 192Q500 72 857 192L820 395 173 394Z" fill="url(#black)" stroke="#5d747e" stroke-width="3"/><path d="M171 193Q500 100 829 193L813 248H190Z" fill="#0c2028" stroke="#3b626d" stroke-width="4"/><path d="M560 238H701L722 402H545Z" fill="#42555f" stroke="#859394" stroke-width="2"/><rect x="576" y="256" width="110" height="70" rx="6" fill="#0b1b22"/><text x="594" y="293" font-family="monospace" font-size="12" fill="#afc8b7">AUTO DIAG</text>${[0,1,2].map(i=>`<circle cx="${580+i*44}" cy="353" r="14" fill="#132b36" stroke="#9aa5a0" stroke-width="3"/>`).join('')}
<path d="M214 263Q337 226 456 264L483 347 204 347Z" fill="#07161d" stroke="#516b76" stroke-width="5"/>
${[282,390].map(x=>`<circle cx="${x}" cy="296" r="31" fill="#172e38" stroke="#6e8490" stroke-width="2"/><path d="M${x-23} 300A24 24 0 1 1 ${x+23} 300" fill="none" stroke="#d2dcd4" stroke-width="2"/><path d="M${x} 296l${v.rotating()?18:-17} -15" stroke="#e9ac71" stroke-width="3"/>`).join('')}
<circle cx="337" cy="360" r="105" fill="none" stroke="#081319" stroke-width="32"/><circle cx="337" cy="360" r="106" fill="none" stroke="#53616a" stroke-width="2"/><path d="M246 339L315 344 318 367 257 386M426 339L359 344 353 367 418 386M323 456L324 373H349L354 456" fill="#384d59" stroke="#6b7b7f" stroke-width="3"/><ellipse cx="337" cy="357" rx="42" ry="31" fill="url(#black)" stroke="#718387" stroke-width="3"/>
<path d="M180 412L258 460 466 453 502 405 529 556H183Z" fill="#182931" stroke="#3c535d" stroke-width="3"/><path d="M552 407L718 412 744 565H558Z" fill="url(#steel)"/><path d="M618 471L630 431" stroke="#0a1921" stroke-width="15"/><ellipse cx="631" cy="430" rx="18" ry="13" fill="#14242b" stroke="#829396" stroke-width="2"/>
${hit('obd','OBD-II diagnostic port',`<path class="outline" d="M283 472H410L399 520H294Z" fill="${v.obd?'#536965':'#080f15'}" stroke="${v.obd?'#bddf99':'#a8b6a3'}" stroke-width="4"/>${Array.from({length:16},(_,i)=>`<rect x="${299+(i%8)*12}" y="${483+Math.floor(i/8)*16}" width="5" height="7" fill="#bdc090"/>`).join('')}${v.obd?'<path d="M346 517Q323 558 449 603" fill="none" stroke="#0a141a" stroke-width="16"/><path d="M346 517Q323 558 449 603" fill="none" stroke="#425961" stroke-width="3"/>':''}${label(286,552,v.obd?'OBD-II · CONNECTED':'OBD-II · 16 PIN')}`)}
</g>`;}
function fuses(v){return `<g filter="url(#shadow)"><path d="M261 167H731L764 491 246 509Z" fill="url(#black)" stroke="#7b8d91" stroke-width="4"/><path d="M287 199H706L733 464 276 479Z" fill="#111f27" stroke="#3b5560" stroke-width="5"/>
${Array.from({length:12},(_,i)=>{let x=320+i%4*57,y=235+Math.floor(i/4)*66;return `<rect x="${x}" y="${y}" width="30" height="40" rx="4" fill="${['#a37949','#785d72','#55799c','#748651'][i%4]}" stroke="#9aab9b"/><text x="${x+7}" y="${y+25}" font-size="10" fill="#ddd9b6">${[10,15,20][i%3]}</text>`;}).join('')}
${hit('fuse','F27 engine management fuse',`<rect class="outline" x="364" y="336" width="53" height="46" rx="5" fill="${v.components.fuse.installed?'#be9560':'#050e13'}" stroke="#c7c2a1" stroke-width="2"/><text x="374" y="365" font-size="14" fill="#f5e5ae">${v.components.fuse.installed?'15A':'OUT'}</text>${label(355,437,'F27 / PCM')}`)}
${hit('relay','Fuel pump relay',`<rect class="outline" x="573" y="310" width="113" height="100" rx="8" fill="${v.components.relay.installed?'url(#steel)':'#050e13'}" stroke="#a5b3a5" stroke-width="2"/><path d="M599 332H658V375H599Z" fill="none" stroke="#a1b0a4"/><text x="611" y="360" fill="#bdcbb7" font-size="13">${v.components.relay.installed?'R07':'OUT'}</text>${label(566,437,'FUEL PUMP')}`)}
<path d="M390 313V330M390 389V403" stroke="#d2c18a" stroke-width="5"/>
${hit('fuseCover','Fuse box lid',v.fuseCover?`<path class="outline" d="M263 167H731L766 491 246 509Z" fill="url(#black)" stroke="#96a5a5" stroke-width="3"/><path d="M303 220H690L707 447H286Z" fill="none" stroke="#465f69" stroke-width="5"/><path d="M365 292H628V375H365Z" fill="#243b44" stroke="#5b727c"/>${label(398,337,'RELEASE COVER')}`:`<path class="outline" d="M762 186L830 198 854 454 785 474Z" fill="url(#black)" stroke="#869894" stroke-width="2"/>${label(771,500,'LID')}`)}
${bolt(231,468,12)}${label(159,501,'GROUND')}
</g>`;}
function wiring(v){return `<g><text x="211" y="166" fill="#a9b8b7" font-family="monospace" font-size="13">ENGINE MANAGEMENT / CKP CIRCUIT</text><text x="211" y="189" class="small-label">SIMULATED SERVICE SCHEMATIC · CONNECTOR HARNESS SIDE</text>
<rect x="217" y="228" width="82" height="227" rx="9" fill="url(#black)" stroke="#749192" stroke-width="2"/>
${hit('connector','C101 connector latch',`<path class="outline" d="M239 238H276V444H239Z" fill="#526569" stroke="#b8c6b8"/><text x="231" y="214" class="part-label">C101</text><text x="226" y="479" class="small-label">${v.connectors.ckp.connected?'CONNECTED':'UNPLUGGED'}</text>`)}
<rect x="768" y="229" width="87" height="226" rx="10" fill="url(#steel)" stroke="#748d90" stroke-width="2"/>
${hit('pcmConnector','C200 PCM connector latch',`<path class="outline" d="M780 245H834V442H780Z" fill="#2d454c" stroke="#b8c6b8"/><text x="777" y="214" class="part-label">C200</text><text x="772" y="481" class="small-label">${v.connectors.pcm.connected?'CONNECTED':'UNPLUGGED'}</text>`)}
<path class="wire" data-wire="reference" d="M300 270H768" stroke="#d6b671" stroke-width="6"/>
<path class="wire" data-wire="signal" d="M300 345H768" stroke="#90bfae" stroke-width="6"/>
<path class="wire" data-wire="sensorGround" d="M300 420H740V470" stroke="#91a7bd" stroke-width="6"/>
${label(404,250,'1 · 5V REFERENCE')}${label(404,325,'2 · CKP SIGNAL → PCM 21')}${label(404,401,'3 · LOW REFERENCE')}
<path d="M719 482H761M725 491H755M732 499H748" stroke="#bdc8b9" stroke-width="3"/>
<text x="211" y="532" class="small-label">Trace a wire to select it. Place probes on the actual terminal circles.</text><text x="211" y="551" class="small-label">Resistance: KEY OFF, C101 and C200 disconnected. No automatic fault highlighting.</text>
</g>`;}
export function drawScene(view,v){let body={bay,under,interior,fuses,wiring}[view](v);let points=coords[view]||{};if(view==='bay'&&!v.hood||view==='under'&&(!v.hood||v.cover)||view==='fuses'&&v.fuseCover)points={};return defs+`<rect width="1000" height="650" fill="url(#floor)"/><path d="M121 574H831M146 588H859" stroke="#b5af7330" stroke-width="2"/><text x="170" y="601" font-size="10" letter-spacing="4" fill="#7e959b66" font-family="monospace">AUTO DIAG / SERVICE BAY 01</text>`+body+Object.entries(points).map(([id,p])=>pin(id,...p)).join('')+(view==='bay'&&v.hood?hit('fuelPort','Fuel rail service connection',`<g transform="translate(565 384)"><circle class="outline" r="17" fill="#536666" stroke="#c7dba6" stroke-width="2"/><circle r="6" fill="#c5b779"/></g>${label(579,397,'FUEL PORT')}`):'');}
