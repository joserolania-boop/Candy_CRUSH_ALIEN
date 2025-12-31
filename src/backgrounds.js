const THEMES = [
  {
    key: 'deep_nebula',
    label: 'Deep Nebula',
    baseColor: '#050510',
    bodyGradient: 'radial-gradient(120% 120% at 20% 20%, rgba(138, 87, 255, 0.32) 0%, transparent 45%), linear-gradient(180deg, #030114 0%, #000006 100%)',
    gradient: 'radial-gradient(circle at 20% 40%, rgba(109, 78, 255, 0.45), transparent 55%), radial-gradient(circle at 80% 15%, rgba(92, 106, 255, 0.25), transparent 60%), linear-gradient(180deg, #010112 0%, #000003 100%)',
    accentColor: '#9C27B0',
    glowColor: '#7B1FA2',
    panelColor: 'rgba(6, 10, 20, 0.74)',
    starColors: ['#ffffff', '#c8d6ff', '#a89bff', '#7be6ff'],
    nebulaColors: ['#6A1B9A', '#4527A0', '#283593']
  },
  {
    key: 'alien_green',
    label: 'Alien Green',
    baseColor: '#010d08',
    bodyGradient: 'radial-gradient(120% 120% at 25% 20%, rgba(0, 200, 83, 0.25), transparent 55%), linear-gradient(180deg, #010d08 0%, #010203 100%)',
    gradient: 'radial-gradient(circle at 30% 30%, rgba(0, 230, 118, 0.35), transparent 50%), radial-gradient(circle at 70% 15%, rgba(0, 255, 183, 0.25), transparent 45%), linear-gradient(180deg, #010d08 0%, #000204 100%)',
    accentColor: '#00E676',
    glowColor: '#00C853',
    panelColor: 'rgba(4, 15, 10, 0.74)',
    starColors: ['#ffffff', '#a6ffcb', '#b2ffc7', '#00ffcc'],
    nebulaColors: ['#00C853', '#388E3C', '#1B5E20']
  },
  {
    key: 'cosmic_blue',
    label: 'Cosmic Blue',
    baseColor: '#010814',
    bodyGradient: 'radial-gradient(150% 150% at 30% 30%, rgba(3, 169, 244, 0.2), transparent 50%), linear-gradient(180deg, #010814 0%, #000313 100%)',
    gradient: 'radial-gradient(circle at 25% 25%, rgba(66, 165, 245, 0.25), transparent 55%), radial-gradient(circle at 70% 10%, rgba(33, 150, 243, 0.25), transparent 55%), linear-gradient(180deg, #010814 0%, #000414 100%)',
    accentColor: '#2196F3',
    glowColor: '#1976D2',
    panelColor: 'rgba(4, 10, 26, 0.76)',
    starColors: ['#ffffff', '#bbdefb', '#8ad4ff', '#64b5f6'],
    nebulaColors: ['#0D47A1', '#1565C0', '#1976D2']
  },
  {
    key: 'void_dark',
    label: 'Void Dark',
    baseColor: '#020202',
    bodyGradient: 'linear-gradient(180deg, #020202 0%, #000000 100%)',
    gradient: 'radial-gradient(circle at 40% 40%, rgba(66, 66, 66, 0.35), transparent 60%), radial-gradient(circle at 70% 20%, rgba(255, 255, 255, 0.12), transparent 50%), linear-gradient(180deg, #010103 0%, #000000 100%)',
    accentColor: '#607D8B',
    glowColor: '#455A64',
    panelColor: 'rgba(5, 5, 5, 0.75)',
    starColors: ['#ffffff', '#b0bec5', '#cfd8dc', '#90a4ae'],
    nebulaColors: ['#212121', '#424242', '#303030']
  },
  {
    key: 'inferno',
    label: 'Inferno',
    baseColor: '#0D0502',
    bodyGradient: 'radial-gradient(140% 140% at 70% 0%, rgba(255, 87, 34, 0.35), transparent 50%), linear-gradient(180deg, #0d0502 0%, #020000 80%)',
    gradient: 'radial-gradient(circle at 70% 15%, rgba(255, 87, 34, 0.4), transparent 40%), radial-gradient(circle at 25% 45%, rgba(255, 152, 0, 0.25), transparent 55%), linear-gradient(180deg, #0d0502 0%, #030100 100%)',
    accentColor: '#FF5722',
    glowColor: '#E64A19',
    panelColor: 'rgba(5, 4, 4, 0.8)',
    starColors: ['#ffffff', '#ffcc80', '#ffc107', '#ff8a65'],
    nebulaColors: ['#BF360C', '#E65100', '#F57C00']
  },
  {
    key: 'station_orbit',
    label: 'Station Orbit',
    baseColor: '#050814',
    bodyGradient: 'radial-gradient(140% 140% at 40% 10%, rgba(63, 81, 181, 0.25), transparent 55%), linear-gradient(180deg, #050814 0%, #00030a 100%)',
    gradient: 'radial-gradient(circle at 40% 20%, rgba(63, 81, 181, 0.35), transparent 50%), radial-gradient(circle at 80% 40%, rgba(255, 255, 255, 0.15), transparent 60%), linear-gradient(180deg, #050814 0%, #000309 100%)',
    accentColor: '#3F51B5',
    glowColor: '#303F9F',
    panelColor: 'rgba(4, 8, 16, 0.76)',
    starColors: ['#ffffff', '#e8eaf6', '#c5cae9', '#7986cb'],
    nebulaColors: ['#1A237E', '#283593', '#3949AB']
  },
  {
    key: 'aurora',
    label: 'Aurora',
    baseColor: '#021210',
    bodyGradient: 'radial-gradient(140% 140% at 50% 12%, rgba(0, 255, 255, 0.3), transparent 50%), linear-gradient(180deg, #021210 0%, #000409 100%)',
    gradient: 'radial-gradient(circle at 45% 25%, rgba(0, 255, 235, 0.35), transparent 60%), radial-gradient(circle at 70% 70%, rgba(64, 255, 196, 0.2), transparent 65%), linear-gradient(180deg, #021210 0%, #000409 100%)',
    accentColor: '#1DE9B6',
    glowColor: '#00BFA5',
    panelColor: 'rgba(5, 14, 16, 0.75)',
    starColors: ['#ffffff', '#b2dfdb', '#80cbc4', '#4dd0e1'],
    nebulaColors: ['#00897B', '#00ACC1', '#4DB6AC']
  },
  {
    key: 'galaxy_core',
    label: 'Galaxy Core',
    baseColor: '#08000F',
    bodyGradient: 'radial-gradient(140% 120% at 60% 20%, rgba(171, 71, 188, 0.3), transparent 60%), linear-gradient(180deg, #08000f 0%, #010006 100%)',
    gradient: 'radial-gradient(circle at 25% 25%, rgba(139, 27, 163, 0.4), transparent 60%), radial-gradient(circle at 80% 20%, rgba(255, 255, 255, 0.12), transparent 60%), linear-gradient(180deg, #08000F 0%, #010006 100%)',
    accentColor: '#9C27B0',
    glowColor: '#8E24AA',
    panelColor: 'rgba(4, 4, 11, 0.78)',
    starColors: ['#ffffff', '#f8bbd9', '#f3e5f5', '#c5cae9'],
    nebulaColors: ['#7B1FA2', '#8E24AA', '#9C27B0']
  },
  {
    key: 'binary_sunset',
    label: 'Binary Sunset',
    baseColor: '#0D0608',
    bodyGradient: 'radial-gradient(140% 140% at 80% 0%, rgba(255, 110, 64, 0.25), transparent 55%), linear-gradient(180deg, #0E0608 0%, #020004 100%)',
    gradient: 'radial-gradient(circle at 70% 20%, rgba(255, 110, 64, 0.4), transparent 40%), radial-gradient(circle at 20% 60%, rgba(255, 87, 34, 0.25), transparent 55%), linear-gradient(180deg, #0D0608 0%, #010103 100%)',
    accentColor: '#FF7043',
    glowColor: '#F4511E',
    panelColor: 'rgba(5, 3, 5, 0.8)',
    starColors: ['#ffffff', '#ffccbc', '#ffab91', '#ff8a65'],
    nebulaColors: ['#FF6E40', '#FF8A65', '#FFAB91']
  },
  {
    key: 'quantum_realm',
    label: 'Quantum Realm',
    baseColor: '#080410',
    bodyGradient: 'radial-gradient(150% 150% at 35% 10%, rgba(124, 77, 255, 0.28), transparent 50%), linear-gradient(180deg, #080410 0%, #02000a 100%)',
    gradient: 'radial-gradient(circle at 35% 25%, rgba(124, 77, 255, 0.4), transparent 55%), radial-gradient(circle at 80% 45%, rgba(64, 196, 255, 0.25), transparent 60%), linear-gradient(180deg, #02000a 0%, #000002 100%)',
    accentColor: '#7C4DFF',
    glowColor: '#536DFE',
    panelColor: 'rgba(4, 4, 12, 0.75)',
    starColors: ['#ffffff', '#c5cae9', '#e8eaf6', '#b388ff'],
    nebulaColors: ['#7C4DFF', '#536DFE', '#448AFF']
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
  return THEME_MAP[key] || THEMES[0];
}

export function getThemeForLevel(level) {
  const idx = Math.max(0, (level - 1) % THEMES.length);
  return THEMES[idx];
}

export function applyTheme(themeKey, opts = { crossfade: true }) {
  const theme = typeof themeKey === 'string' ? getTheme(themeKey) : themeKey;
  const bg = document.getElementById('space-bg');
  if(bg) {
    if(opts.crossfade) {
      bg.style.transition = 'background 0.9s ease';
    }
    bg.style.background = theme.gradient;
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
