# Project State — Candy Crush Alien (Prototype)

Fecha: 2025-12-13

Resumen rápido
- **Estado**: Prototipo jugable; motor de match-3 estable y UI funcional.
- **Trabajo reciente**: mejoras visuales del marco del tablero, sistema de "score pop" y contador de combos, y soporte para la ficha astronauta.

Cambios realizados (ficheros clave)
- `src/ui.js`: Añadido "score pop" por tile eliminado, contador de combos, lógica de animación de preview reforzada y helpers de depuración (`window.CCA_ui.forceAstronaut()` y `dumpBoard()`).
- `src/board.js`: `PALETTE` actualizado para incluir `🧑‍🚀` (aparición con la misma frecuencia que el resto).
- `styles.css`: Rediseño del `#game-root` -> acabado metálico; añadido rim-pulse y reflejo solar especular; estilos para `.score-pop` y `.combo-counter`.

Comportamiento y pruebas
- Iniciar servidor desde la carpeta del juego:
  ```powershell
  Set-Location 'C:\Users\Admin\OneDrive\Escritorio\MCP SERVER\Candy Crush Alien'
  python -m http.server 8000
  ```
- Abrir en navegador: `http://localhost:8000/Candy Crush Alien/` y recargar sin caché (Ctrl+F5).
- Validaciones rápidas:
  - Ver que el tablero se renderiza y swaps funcionan.
  - Al eliminar tiles verás pequeños popups `+N` y, en cascadas, un badge `COMBO xN`.
  - El marco del tablero debe mostrar un brillo especular blanco en la esquina superior-derecha y un rim plateado pulsatil.
  - El astronauta (`🧑‍🚀`) forma parte de la paleta y puede aparecer en tableros nuevos.

Helpers de depuración (temporal)
- `window.CCA_ui.forceAstronaut(r,c)`: fuerza una ficha `🧑‍🚀` en la casilla (r,c) 0-index; por defecto coloca en el centro.
- `window.CCA_ui.dumpBoard()`: devuelve el estado actual del tablero (array serializado).
- Nota: estos helpers son seguros y no afectan la lógica del engine; se pueden eliminar en la limpieza final.

Decisiones de diseño
- Mantener cambios locales en la UI y CSS; no se refactorizó `engine.js` ni la lógica de resolución.
- Prioricé mejoras de *feedback* visual (poca complejidad, alto impacto): pop de puntuación, combo, marco metálico.

Siguientes pasos recomendados (elige al volver)
- [ ] Revisión final: eliminar helpers `window.CCA_ui` y consolidar estilos.
- [ ] Ajustar intensidad del reflejo o color (si prefieres más blanco, magenta o cian).
- [ ] Reemplazar el astronauta por un asset SVG si quieres coherencia visual con otros sprites.
- [ ] Añadir métricas simples (contador de partidas, mayor feedback) para medir retención.

Contacto rápido
- Si quieres que haga alguno de los pasos anteriores, dime cuál y lo aplico con cambios pequeños y reversibles.

-- Fin del estado (automático)
## Project Overview

- **Project:** Candy Crush Alien (prototype)
- **What it is:** A browser-based Match-3 (Candy‑Crush style) prototype with an alien/space theme.
- **Core goal:** Provide a playable match‑3 prototype with swap/animation mechanics, power-ups, themed background visuals, particle decorations, and audio (file + synth fallback).

## Current Phase / Status

- **Phase:** Mid-development / feature completion for core gameplay and UI. Multiple visual/audio polish iterations in progress.
- **What has been done (high-level):**
  - Core match-3 engine implemented: board state, gravity, refill, match detection (horizontal & vertical), swap handling with valid-swap check.
  - Swap animation in UI with revert for invalid swaps.
  - Preview playback of phased engine snapshots (phases: match-found, after-remove, after-gravity, after-refill, etc.).
  - Power-ups implemented: striped, wrapped, colorbomb. Later changed: 4-in-a-row now creates a `bomb` power.
  - New: `bomb` power created for 4-in-a-row; activation removes bomb cell + up to 6 nearby tiles (engine + UI animation added).
  - Audio subsystem implemented with: attempt to play audio files, WebAudio synth fallback, volume/mute controls, and persistence hooks.
  - Test audio files generated and added: `assets/audio/swap.wav`, `assets/audio/match.wav`, `assets/audio/ambient.wav`.
  - Background visuals: layered starfield, nebula, milky-way, planets, sun, and particles (shooting stars, twinkles).
  - Decorations: procedural ships/asteroids/aliens/astronauts; added real SVG assets for astronaut and UFO and wired via CSS fallback.
  - HUD controls added: Start/Reset/Shuffle, audio controls (mute, volume, play music, test tone), theme selector (`#bg-theme-select`).
  - Theme selector integrated: selection persisted in `localStorage` key `candy_bg_theme`; applied at startup to `body[data-theme]` and `#space-bg[data-theme]` and available options added (Deep, Violet, Azure, Midnight, Emerald).
  - Level progression: score tracking, thresholding, `levelUp()` with overlay and confetti; small level-up sound via synth.

- **What has NOT been started / is pending:**
  - Automated tests specifically verifying the bomb power end-to-end (manual test step pending).
  - Optional UX additions: HUD toggle to enable/disable particles for performance was suggested but not implemented yet.
  - Converting `ambient.wav` to `ambient.mp3` (optional; not done).
  - Extra polish: dedicated explosion sound for bomb (not yet added), more visual explosion particles (optional enhancement).

## Agreed Design Decisions

- **Gameplay mechanics & rules:**
  - Standard Match-3 rules: swap adjacent tiles, matches of 3 or more in a row/column remove tiles.
  - Swaps animate visually; invalid swaps revert with animation.
  - Phased engine: engine produces snapshots/phases which the UI plays back for animations.
  - Power-ups and creation rules:
    - 3-in-a-row -> normal removal.
    - 4-in-a-row -> create a `bomb` power (design decision replacing previous striped power creation for 4s).
    - T / L (cross) patterns -> create a `wrapped` power.
    - 5-or-more -> create a `colorbomb` power.
  - Power activation behaviors (engine side):
    - `bomb` activation: removes the bomb cell plus up to 6 nearby tiles (orthogonals prioritized, then diagonals).
    - `wrapped` activation: removes a 3x3 block centered on the wrapped power.
    - `striped` activation: removes a full row or column depending on orientation.
    - `colorbomb` activation: removes all tiles of a given value or interacts with other powers per engine logic.

- **UI & UX decisions:**
  - Use CSS animations for swap, remove, priming (bomb pulse), confetti, and decorative elements.
  - Background theme selector available in HUD; applying a theme sets `data-theme` on `body` and `#space-bg` for layered CSS control.
  - Decorations run procedurally; astronaut and UFO visuals use inline SVG assets for higher fidelity.
  - LocalStorage used to persist audio and theme preferences.

- **Non-negotiable constraints:**
  - Must run in a modern browser served over HTTP(S) (ES module imports require a server). Local `python -m http.server` has been used for development.
  - Avoid external proprietary assets — SVGs created locally and WAVs generated for testing.

## Technical Decisions

- **Tech stack:**
  - Frontend: plain HTML, CSS, vanilla ES modules (JavaScript).
  - Audio: WebAudio API for synth fallback; HTML Audio elements used when audio files exist.
  - Assets (images/audio): stored under `assets/` (e.g., `assets/audio/*.wav`, `assets/images/*.svg`).

- **Project structure (key files/modules):**
  - `index.html` — main shell, HUD, background container (`#space-bg`) and theme selector.
  - `styles.css` — all visual styles, animations, theme overrides.
  - `src/board.js` — board initialization, tile utilities.
  - `src/engine.js` — match detection, resolve phases, power-up creation and activation (now includes `activateBomb`).
  - `src/ui.js` — rendering board DOM, input handling, swap animation, preview player, and new bomb animation handling.
  - `src/sound.js` — audio initialization, playBackground, playSwap/playMatch/testTone, volume/mute and persistence.
  - `src/particles.js` — shooting stars and twinkles.
  - `src/decorations.js` — procedural decorations (ships, asteroids, UFOs, astronauts spawning logic).
  - `make_test_audio.py` — script used to generate test WAV audio files.

- **Development approach / preview:**
  - Serve the project locally (example used: `python -m http.server 8000`) to allow ES module imports and audio loading.
  - Iterative, in-repo edits with quick reloads to test behavior.

- **Tooling assumptions:**
  - Modern browser for testing (supports ES modules, WebAudio API).
  - Local Python available for simple HTTP server (used during development).

## AI Working Rules (agreed / clarified in this conversation)

- The AI will act as an expert coding assistant and pair programmer for this repo: concise, direct, and collaborative.
- Practical collaboration rules (explicit in the conversation):
  - Work incrementally, provide short preambles before tool/file changes, and report progress after batches of edits.
  - Use the in-workspace TODO list mechanism to track multi-step changes and mark completed steps.
  - Make minimal, focused edits; preserve style and APIs unless change is required.
  - When editing files, apply patches using repository tools (edits were performed via patches during this session).

## Open Questions / Pending Decisions

- Particle toggle in HUD: a toggle control to enable/disable particles for performance was suggested but not implemented. Confirm whether to add.
- Explosion audio: a dedicated bomb explosion sound was suggested but not yet added. Confirm whether to create/add a WAV and wire `Sound.playBomb()`.
- Convert `ambient.wav` to `ambient.mp3`: optional and not executed; requires ffmpeg or offline conversion.
- Exact bomb neighbor-selection policy (currently: bomb cell + up to 6 neighbors prioritizing orthogonals then diagonals). Confirm if you prefer a different pattern (e.g., radius-2 blast, or include diagonals first).

## Next Exact Step

- Manual test: start the local server and perform a gameplay test to verify bomb creation and activation end-to-end:
  - Start the server (example): `python -m http.server 8000` in the `Candy Crush Alien` folder.
  - Open the game in a modern browser, create a 4-in-a-row to produce a `bomb` power, then activate it and observe that up to 6 surrounding tiles are removed and that the UI shows the prime+explosion animation.

- If the manual test passes, next dev tasks are optional (pick one): add explosion sound, add particle toggle control, or polish explosion visuals.

---

Files changed or added in this session (quick reference):
- `index.html` — HUD theme selector added, duplicate volume input removed.
- `styles.css` — theme overrides, theme-select styling, bomb styles, SVG-based decoration styles, and various visual tweaks.
- `src/game.js` — theme binding (load/persist) and `#space-bg` theme application.
- `src/engine.js` — added `activateBomb`, changed 4-in-a-row to create `bomb`, included power-activation metadata in phases.
- `src/ui.js` — bomb activation preview animation handling.
- `src/particles.js` — added earlier (particles module used for shooting stars/twinkles).
- `assets/images/astronaut.svg`, `assets/images/ufo.svg` — new SVG assets.
- `assets/audio/*.wav` — test audio files created earlier (`swap.wav`, `match.wav`, `ambient.wav`).

If you want I can run a scripted check (simulate a board state that yields a 4-in-a-row and step through engine phases) and report the exact phase snapshots and DOM-class effects, or I can wait for you to run the manual browser check. Which do you prefer?
