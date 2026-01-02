import { BackgroundEngine } from './background_engine.js';

let bgEngine = null;

const THEMES = [
  {
    key: 'deep_nebula',
    label: 'Deep Nebula',
    environment: 'nebula',
    bgImage: 'assets/images/backgrounds/bg_nebula.jpg',
    baseColor: '#050510',
    accentColor: '#9C27B0',
    glowColor: '#7B1FA2',
    panelColor: 'rgba(6, 10, 20, 0.4)',
    gradient: 'linear-gradient(180deg, #010112 0%, #000003 100%)'
  },
  {
    key: 'black_hole_void',
    label: 'The Singularity',
    environment: 'blackhole',
    bgImage: 'assets/images/backgrounds/bg_galaxy.jpg',
    baseColor: '#020005',
    accentColor: '#FF5722',
    glowColor: '#E64A19',
    panelColor: 'rgba(5, 2, 10, 0.4)',
    gradient: 'linear-gradient(180deg, #020005 0%, #000000 100%)'
  },
  {
    key: 'warp_speed',
    label: 'Hyper-Jump',
    environment: 'warp',
    bgImage: 'assets/images/backgrounds/bg_universe.jpg',
    baseColor: '#000510',
    accentColor: '#00E676',
    glowColor: '#00C853',
    panelColor: 'rgba(0, 10, 20, 0.4)',
    gradient: 'linear-gradient(180deg, #000510 0%, #000000 100%)'
  },
  {
    key: 'quantum_realm',
    label: 'Quantum Lattice',
    environment: 'quantum',
    bgImage: 'assets/images/backgrounds/bg_milkyway.jpg',
    baseColor: '#08000F',
    accentColor: '#00BCD4',
    glowColor: '#0097A7',
    panelColor: 'rgba(10, 0, 20, 0.4)',
    gradient: 'linear-gradient(180deg, #08000F 0%, #010006 100%)'
  },
  {
    key: 'alien_green',
    label: 'Alien Green',
    environment: 'nebula',
    bgImage: 'assets/images/backgrounds/bg_green_nebula.png',
    baseColor: '#010d08',
    accentColor: '#00E676',
    glowColor: '#00C853',
    panelColor: 'rgba(4, 15, 10, 0.4)',
    gradient: 'linear-gradient(180deg, #010d08 0%, #000204 100%)'
  },
  {
    key: 'inferno',
    label: 'Inferno',
    environment: 'blackhole',
    bgImage: 'assets/images/backgrounds/bg_cosmos.jpg',
    baseColor: '#0D0502',
    accentColor: '#FF5722',
    glowColor: '#E64A19',
    panelColor: 'rgba(5, 4, 4, 0.4)',
    gradient: 'linear-gradient(180deg, #0d0502 0%, #030100 100%)'
  },
  {
    key: 'supernova',
    label: 'Supernova',
    environment: 'nebula',
    bgImage: 'assets/images/backgrounds/bg_dark_nebula.jpg',
    baseColor: '#0A0015',
    accentColor: '#FFD700',
    glowColor: '#FFA500',
    panelColor: 'rgba(15, 0, 25, 0.4)',
    gradient: 'linear-gradient(180deg, #0A0015 0%, #000000 100%)'
  },
  {
    key: 'void_echo',
    label: 'Void Echo',
    environment: 'quantum',
    bgImage: 'assets/images/backgrounds/bg_lighthouse_space.jpg',
    baseColor: '#000000',
    accentColor: '#FFFFFF',
    glowColor: '#888888',
    panelColor: 'rgba(5, 5, 5, 0.5)',
    gradient: 'linear-gradient(180deg, #000000 0%, #050505 100%)'
  },
  {
    key: 'event_horizon',
    label: 'Event Horizon',
    environment: 'blackhole',
    bgImage: 'assets/images/backgrounds/bg_galaxy.jpg',
    baseColor: '#000000',
    accentColor: '#00FFFF',
    glowColor: '#0088FF',
    panelColor: 'rgba(0, 5, 10, 0.4)',
    gradient: 'linear-gradient(180deg, #000000 0%, #00050A 100%)'
  }
];

const THEME_MAP = THEMES.reduce((acc, theme) => {
  acc[theme.key] = theme;
  return acc;
}, {});

const STAR_POSITIONS = {
  small: ['5% 10%', '35% 35%', '70% 25%', '85% 70%'],
  mid: ['15% 75%', '60% 30%', '80% 10%', '40% 60%']
};

const getElement = (selector) => document.querySelector(selector);

function hexToRgba(hex, alpha = 1) {
  if(!hex) return `rgba(255,255,255,${alpha})`;
  let cleaned = hex.replace('#', '');
  if(cleaned.length === 3) {
    cleaned = cleaned.split('').map(ch => ch + ch).join('');
  }
  const num = parseInt(cleaned, 16);
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function buildStarGradient(theme, layerKey) {
  const positions = STAR_POSITIONS[layerKey] || STAR_POSITIONS.small;
  const colors = theme.starColors && theme.starColors.length ? theme.starColors : ['#ffffff', '#a9b3ff', '#8ee6ff', '#f7b0ff'];
  return colors.map((color, index) => `radial-gradient(1px 1px at ${positions[index % positions.length]}, ${hexToRgba(color, 0.9)} 0.45px, transparent 0.7px)`).join(', ');
}

function updateStarLayers(theme) {
  const smallLayer = getElement('#space-bg .stars-small');
  const midLayer = getElement('#space-bg .stars-mid');
  if(smallLayer) {
    smallLayer.style.backgroundImage = buildStarGradient(theme, 'small');
  }
  if(midLayer) {
    midLayer.style.backgroundImage = buildStarGradient(theme, 'mid');
  }
}

function updateNebula(theme) {
  const neb1 = getElement('#space-bg .nebula.neb1');
  const neb2 = getElement('#space-bg .nebula.neb2');
  const [first = theme.accentColor, second = theme.glowColor, third = theme.glowColor] = theme.nebulaColors || [];
  if(neb1) {
    neb1.style.background = `radial-gradient(circle at 25% 35%, ${hexToRgba(first, 0.45)}, transparent 55%), radial-gradient(circle at 70% 45%, ${hexToRgba(second, 0.3)}, transparent 65%), radial-gradient(circle at 60% 60%, ${hexToRgba(third, 0.2)}, transparent 70%)`;
  }
  if(neb2) {
    neb2.style.background = `radial-gradient(circle at 70% 20%, ${hexToRgba(second, 0.35)}, transparent 55%), radial-gradient(circle at 30% 70%, ${hexToRgba(first, 0.25)}, transparent 60%), radial-gradient(circle at 50% 40%, ${hexToRgba(third, 0.22)}, transparent 70%)`;
  }
}

function updateMilkyWay(theme) {
  const milky = getElement('#space-bg .milkyway');
  if(milky) {
    milky.style.background = `linear-gradient(90deg, ${hexToRgba(theme.glowColor, 0.3)} 0%, ${hexToRgba(theme.accentColor, 0.25)} 30%, transparent 65%)`;
  }
}

function updateSun(theme) {
  const suns = document.querySelectorAll('#space-bg .sun');
  suns.forEach((sun, idx) => {
    sun.style.background = `radial-gradient(circle at 30% 30%, ${hexToRgba(theme.glowColor, 0.65)}, ${hexToRgba(theme.accentColor, 0.12)} 45%, transparent 70%)`;
    sun.style.boxShadow = `0 0 140px ${hexToRgba(theme.glowColor, 0.45)}, inset 0 12px 40px ${hexToRgba(theme.glowColor, 0.15)}`;
    sun.style.filter = 'blur(0.6px)';
    if(idx === 1) {
      sun.style.opacity = '0.65';
    }
  });
}

export function getTheme(key) {
  return THEMES.find(t => t.key === key) || THEMES[0];
}

export function getThemeForLevel(level) {
  const idx = Math.max(0, (level - 1) % THEMES.length);
  return THEMES[idx];
}

export function applyTheme(themeKey, opts = { crossfade: true }) {
  console.log('[backgrounds.js] applyTheme called with:', themeKey, opts);
  const theme = typeof themeKey === 'string' ? getTheme(themeKey) : themeKey;
  
  /* 
  // Disabling WebGL engine to use high-quality static images as requested
  if (!bgEngine) {
    bgEngine = new BackgroundEngine('bg-canvas');
    const bgEl = document.getElementById('space-bg');
    if (bgEl) bgEl.classList.add('webgl-active');
    document.body.classList.add('webgl-active');
    document.documentElement.classList.add('webgl-active');
  }
  if (bgEngine) {
    bgEngine.setTheme(theme);
    if (opts.warp) {
      bgEngine.triggerWarp();
    }
    if (opts.glitch) {
      bgEngine.triggerGlitch();
    }
    if (typeof opts.pulse !== 'undefined') {
      bgEngine.setPulse(opts.pulse);
    }
  }
  */

  const bg = document.getElementById('space-bg');
  if(bg) {
    if(opts.crossfade) {
      bg.style.transition = 'background 0.9s ease, background-image 0.9s ease';
    }
    if (theme.bgImage) {
      bg.style.backgroundImage = `url(${theme.bgImage})`;
      bg.style.backgroundSize = 'cover';
      bg.style.backgroundPosition = 'center';
    } else {
      bg.style.background = theme.gradient;
    }
    bg.setAttribute('data-theme', theme.key);
  }
  if(theme.bodyGradient) {
    document.body.style.background = theme.bodyGradient;
  }
  updateStarLayers(theme);
  updateNebula(theme);
  updateMilkyWay(theme);
  updateSun(theme);
  document.documentElement.style.setProperty('--space-bg-base', theme.baseColor);
  document.documentElement.style.setProperty('--space-bg-accent', theme.accentColor);
  document.documentElement.style.setProperty('--space-bg-panel', theme.panelColor);
  document.documentElement.style.setProperty('--space-bg-glow', theme.glowColor);
  return theme;
}

export function getThemeList() {
  return [...THEMES];
}// Lightweight backgrounds manager
// Responsibilities:
// - Decide which concept to show for a given level
// - Apply the concept by toggling `data-concept` on `#space-bg`
// - Provide a simple deterministic selection algorithm to avoid surprises

export function pickConceptForLevel(level){
  // deterministic mapping for reproducibility: use a simple multiplier
  const idx = (level * 997) % 3; // 0..2
  return ['concept-a','concept-b','concept-c'][idx];
}

export function applyConcept(concept, opts={ crossfade:true }){
  const bg = document.getElementById('space-bg');
  if(!bg) return null;
  try{
    const prev = bg.getAttribute('data-concept');
    if(prev === concept) return concept;
    if(opts.crossfade){
      // apply quickly by updating attribute; CSS handles opacity transitions
      bg.setAttribute('data-concept', concept);
    } else {
      bg.setAttribute('data-concept', concept);
    }
    return concept;
  }catch(e){ console.warn('applyConcept failed', e); return null; }
}

export function setBackgroundForLevel(level, opts={ crossfade:true }){
  const c = pickConceptForLevel(level);
  return applyConcept(c, opts);
}

// Optional: expose a simple API to get next concept (round-robin)
export function nextConcept(current){
  const list = ['concept-a','concept-b','concept-c'];
  const i = Math.max(0, list.indexOf(current));
  return list[(i+1) % list.length];
}
