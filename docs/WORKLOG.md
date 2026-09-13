# Implementation record
AGENTS snapshot: Non-Negotiable Execution Workflow; Critical Pattern Lock; Mandatory Destination Resolution; Project Structure; Development Workflow; Script Requirements; Troubleshooting with Logs; Best practices 0–13.

Inspection: Auto_Diag has SPEC.md, instruction files and ENVIRONMENT only. No application source, dependencies, launcher, or logs exists. Retain the scenario, evidence/scoring principles, and repair/verification sequence from its specification. No original files are removed.

Destination: ~/.pinokio/config.json home resolves to /root/pinokio. App launcher target /root/pinokio/api/AutoDiag_sim; app code in app/.

Pre-flight (all checked before edits): source/spec and absence of logs inspected; destination verified; app type selected; no existing pinokio.js to preserve; no production dependencies required; relative app shell paths; dynamic installation/start/UI defaults; localhost auto-assigned port; daemon server; URL regex capture with input.event[1]; install/start/reset/update provided; original assets; README and API examples; generated files ignored; no stop script.

Reference lock: system/examples/mochi/start.js lines 1–43 (daemon, shell.run, event, local.set); user-mandated capture group and index 1 override the older example's index 0. mochi/pinokio.js lines 3–100 for dynamic menus. mochi/reset.js lines 1–8 for fs.rm (only generated installation marker/dependencies, never source). mochi/update.js lines 1–14 for git pull. bolt/install.js lines 13–24 for app-relative setup. PINOKIO.md sections Dynamic menu rendering (2455), shell.run (3288), fs.rm (4733).

Model scope: original educational three-terminal CKP model and nominal values from the supplied specification, not an OEM wiring/service reference.

## Validation — 2026-09-13

- Ran Pinokio install.js using pterm: setup completed without production dependencies.
- Ran start.js using pterm: daemon launched successfully. Latest launcher log shows the captured match array and local.set.url = http://127.0.0.1:45637 using input.event[1].
- Ran 11 automated Node tests: diagnostic/repair flow, physical prerequisites, polarity/ignition/circuit conditions, premature code erasure, fault-induced stall, meter fuse, waveform connections, battery/fuse/relay behavior, compression peak, explicit rescan gating, and actual HTTP page/assets/API/path validation. All pass.
- Ran full browser acceptance at 1440×1000 and 390×844 with touch enabled: physical OBD connection; P0335; held cranking and 0 RPM; battery probing; fuel gauge attachment; reference and ground probing; missing scope signal; C101/C200 isolation and 0.3 Ω continuity; socket turns, sensor removal/replacement and reconnection; start and 735 RPM; clear, wait, explicit rescan, job closure; persistence after reload. Both pass, no page errors. Desktop additionally tested dragging a red lead between actual scene terminals.
- Ran secondary-tool browser checks: illuminated test light, active CMP scope trace, connected/grounded spark tester, 165 PSI compression after coil/plug removal and relay removal, gauge peak retention, physical fuse/relay reinstatement, battery wrench and no-power behavior. Pass.
- Browser testing caught and fixed static-file root normalization (404), terminal hit areas intercepting hand interactions, and lifted-coil/plug overlap. Explicit DTC selection is required for final verification; passive scanner refresh cannot close a case.
- Chromium tested on the current ARM Linux runtime using Playwright's Ubuntu 24.04 ARM fallback browser. Android touch viewport emulation was tested; a manual Android browser session was not represented as tested.
- Dynamic launcher menu tested for new, installed, starting, ready, installing, updating and resetting states; exactly one correct default in each state. JavaScript syntax and captured URL contract validated.
- Temporary standalone test servers stopped. Pinokio-managed simulator remains running.

## Exit checklist

All applicable pre-flight items satisfied: AGENTS re-opened; destination reverified under /root/pinokio/api; existing specifications retained and source folder untouched; references cross-checked; app/ contains app code; root contains launcher/scripts/documentation; localhost random port; daemon shell; **local.set URL uses {{input.event[1]}} from the previous shell.run capture**; install/start/reset/update and dynamic menus implemented; no redundant stop script; no runtime dependencies or hidden install steps; original SVG assets; README includes use and JavaScript/Python/Curl API examples; generated installation/test/node_modules files ignored; logs checked after running; actual model, HTTP, desktop and touch interactions tested.

Update limitation: this newly created local Git workspace has no remote configured. Update script syntax/menu were checked; no upstream pull can be executed until a remote exists. No remote or publication destination was invented.
