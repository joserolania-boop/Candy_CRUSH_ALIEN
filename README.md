# Candy Crush Alien — Prototype

Proyecto mínimo para prototipar un juego Match-3 con tema alienígena.

Arranque rápido (opciones):

- Usando la extensión **Live Server** de VS Code: abrir `index.html` y pulsar "Go Live".
- Usando Python (PowerShell):

```powershell
# Sitúate en la carpeta del proyecto y ejecuta:
cd 'C:\Users\Admin\OneDrive\Escritorio\MCP SERVER\Candy Crush Alien'
python -m http.server 8000
# Luego abre http://localhost:8000 in your browser
```

- Usando `http-server` (Node.js):

```powershell
npm install -g http-server
cd 'C:\Users\Admin\OneDrive\Escritorio\MCP SERVER\Candy Crush Alien'
http-server -p 8000
```

Qué contiene esta fase:
- `index.html` — página principal del prototipo.
- `styles.css` — estilos básicos.
- `src/game.js` — bootstrap mínimo: al pulsar `Start` se renderiza un tablero 9×9 de emojis.

Siguiente: tras confirmar, implementaré la Fase 3 (renderizado del grid definitivo y swapping interactivo) en pequeños pasos, manteniendo la vista previa funcional en todo momento.
