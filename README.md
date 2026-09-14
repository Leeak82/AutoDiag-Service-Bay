# AutoDiag · Service Bay

**Live app:** https://auto-diag-service-bay.onrender.com  
**Repository:** https://github.com/Leeak82/AutoDiag-Service-Bay  
**Validated checkpoint:** 11/11 Node integration/simulation tests passing; saved desktop and 390×844 touch acceptance runs passing.

An original hands-on automotive diagnostic simulator centered on an interactive vehicle. The first work order is a 2014 Ford F-150 3.5L that cranks but will not start. Diagnose it through connected instruments, physically carry out a repair, and verify the result.

The earlier `/root/pinokio/api/Auto_Diag` contained specifications but no executable application. This implementation retains that scenario and its evidence, diagnostic-quality scoring, ordered repair, and verification requirements. It uses original SVG vehicle/tool artwork and dependency-free browser/Node code.

## Launch

Open the hosted app directly:

https://auto-diag-service-bay.onrender.com

The Render deployment uses the same application source and server as the repository and exposes `/api/health`, `/api/scenario`, and `/api/replay` publicly.

## Start locally

In Pinokio, choose **Install**, then **Start**. **Enter service bay** opens the running application. No production dependencies are downloaded.

Without Pinokio (Node 18+):

```sh
cd app
npm run setup
npm start
```

The server respects the `PORT` and `HOST` environment variables. By default it listens on all interfaces and prints a localhost URL for convenient same-device use.

**Update** pulls this launcher's configured Git upstream and reruns setup. **Reset setup** removes only the generated installation marker, never app source. Browser progress is separate; use **How to work → Start a fresh practice session** to reset a case.

## Share or clone

This repository is public, so another tester can launch the hosted app or clone it directly:

```sh
git clone https://github.com/Leeak82/AutoDiag-Service-Bay.git
cd AutoDiag-Service-Bay/app
npm run setup
npm start
```

The browser simulator is dependency-free at runtime apart from Node 18+ and can also be launched through Pinokio using the included launcher scripts. Browser progress is stored locally on each tester's device.

## Working in the bay

- Choose **Hand**, then touch the hood latch. Remove the access cover to reach the lower engine.
- **Cabin / OBD:** select Scan tool and connect its cable to the physical OBD-II port. Turn ignition ON, select DTCs, and inspect LIVE data. Hold CRANK to engage the starter; release it to stop.
- **DVOM:** select a mode, then drag red and black probes onto terminal circles. On touch screens, tap a lead and then a terminal. Connected leads remain live while changing ignition state.
- **Scope:** connect signal and ground leads, choose voltage/time scales, and crank. CKP, CMP, injector and coil control points produce state-dependent traces.
- **Test light:** connect tip and ground clip. The lamp responds to loaded circuit voltage.
- **Fuel gauge:** connect the hose to the engine-bay fuel port, then turn ignition ON.
- **Compression:** key OFF, lift coil 1, remove the plug with the 16 mm socket, remove the fuel-pump relay, attach the gauge to the bore, then crank. Reinstall everything afterward.
- **Spark tester:** key OFF, lift coil 1, attach tester to it, and place its ground clip on engine ground. Crank to observe pulses.
- **Wiring:** touch a wire to trace it. C101 and C200 latches are interactive, with accessible harness terminals. Isolate both connectors and switch key OFF for signal-wire continuity.
- Remove/install fuses and relays by hand after opening the fuse-box cover. Use the 10 mm wrench on the battery clamp.
- Repair parts through their actual latch, retaining bolt and bore. The 8 mm socket has loosen/tighten directions. Three turns remove or seat the retaining bolt. Remove a released sensor by hand; choose the replacement part to install it.
- After repair, start the engine, inspect live RPM, clear stored codes, let the engine run at least five seconds, and select DTCs to rescan. Then close the work order.

Zoom with + / − and drag empty scene space to pan. Tool tray collapses. Service information and evidence live in drawers. The browser saves progress automatically. Export the service record from Field notes.

## Model and boundaries

`app/public/simulation.js` implements Vehicle → Systems → Components → Connectors → Pins → Circuits. Scenarios inject faults; tools query the same model that determines starting, stalling, RPM, power and pressure. Conditions include healthy, failed, open circuit, short to ground, short to power, high resistance, intermittent and disconnected. Ignition states are KEY OFF, KEY ON, CRANKING, RUNNING and STALLED.

The core path includes battery voltage, P0335, cranking RPM, fuel pressure, reference voltage, ground drop, missing CKP waveform, isolated signal-wire resistance, ordered replacement, running RPM and a post-clear rescan. Evidence is earned by performed observations. Untested replacement parts and incorrect meter current connections reduce diagnostic-quality scoring. A closed job awards workshop XP and a technician rating for that attempt.

This is a simplified educational model using the user-provided nominal values and three-terminal CKP circuit. Geometry, terminal IDs, fastener sizes and access procedures are original training abstractions, **not Ford OEM service information**. Only the first scenario is implemented. Scope traces model pulse timing/amplitude rather than a full electromagnetic solver. Progression is per completed practice attempt, not a multi-scenario career.

## Programmatic API

The HTTP API is stateless. Browser sessions use their own model; API calls do not change an open player's vehicle.

- `GET /api/health` reports readiness.
- `GET /api/scenario` returns the public work order without the injected fault.
- `POST /api/replay` runs an ordered action list through a fresh copy of the same simulator.

Hosted API base:

```text
https://auto-diag-service-bay.onrender.com
```

Action types: `act` (`target`, `tool`), `ignition` (`key`), `tick` (`ms`, max 10000), `release`, `measure` (`mode`, `red`, `black`), `scope` (`red`, `black`), `scan` (`page`), `clear`, and `finish`. Measurements require actual probe IDs; manipulation actions enforce prerequisites. Response: `results`, `state`, `evidence`, `verified`, `score`.

JavaScript:

```js
const base = 'https://auto-diag-service-bay.onrender.com';
const result = await fetch(`${base}/api/replay`, {
  method: 'POST', headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({actions: [
    {type: 'ignition', key: 'KEY ON'},
    {type: 'measure', mode: 'dc', red: 'bat+', black: 'bat-'}
  ]})
}).then(r => r.json());
console.log(result.results);
```

## Tests

```sh
cd app
npm test
```

Browser acceptance tests use Playwright as an optional development tool:

```sh
npm install --no-save --package-lock=false playwright@1.55.1
npx playwright install chromium
TEST_URL=http://127.0.0.1:PORT node test/browser.mjs
TEST_URL=http://127.0.0.1:PORT node test/tools-browser.mjs
TEST_URL=http://127.0.0.1:PORT node test/mobile-layout.mjs
```

See `docs/WORKLOG.md` for launcher references, inspection findings and validation results.
