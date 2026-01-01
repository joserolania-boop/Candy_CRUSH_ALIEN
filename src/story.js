// Story campaign system - handles narrative scenes and progression
const Story = {
  scenes: {
    intro: {
      title: 'First Contact',
      act: 0,
      narrative: `The stars are dark today. 
A great ship approaches Earth. 
We don't know their intent, but we have one advantage: 
an ancient magic hidden in crystallized candy.

Only you can wield it.
Match, create, combine—
your power is our hope.`,
      actors: [
        { id: 'earth', asset: 'earth_silhouette.svg', x: 50, y: 80, scale: 4, anim: 'float' },
        { id: 'ship', asset: 'spaceship_v2.svg', x: 50, y: 30, scale: 2.5, anim: 'descend' },
        { id: 'crystal1', asset: 'candy_crystal.svg', x: 20, y: 20, scale: 0.8, anim: 'twinkle' },
        { id: 'crystal2', asset: 'candy_crystal.svg', x: 80, y: 40, scale: 0.6, anim: 'twinkle' },
        { id: 'crystal3', asset: 'candy_crystal.svg', x: 30, y: 60, scale: 0.7, anim: 'twinkle' }
      ]
    },
    lvl2: {
      title: 'The Singularity',
      act: 1,
      narrative: `Sensors are picking up strange probes.
They are scanning our cities, looking for something.
We must intercept them before they transmit our coordinates.

Use the candy magic to disrupt their signals!`,
      actors: [
        { id: 'city', asset: 'city_skyline.svg', x: 50, y: 90, scale: 3, anim: 'none' },
        { id: 'probe1', asset: 'probe_drone.svg', x: 20, y: 40, scale: 1, anim: 'scan' },
        { id: 'probe2', asset: 'probe_drone.svg', x: 50, y: 30, scale: 0.8, anim: 'scan' },
        { id: 'probe3', asset: 'probe_drone.svg', x: 80, y: 45, scale: 1.2, anim: 'scan' },
        { id: 'defense', asset: 'spaceship_side.svg', x: -10, y: 50, scale: 1, anim: 'fly-across' }
      ]
    },
    lvl3: {
      title: 'Hyper-Jump',
      act: 1,
      narrative: `They're retreating! 
We've engaged the hyper-drive to follow them.
The space-time continuum is warping around us.

Keep the energy levels stable with your matches!`,
      actors: [{ id: 'ship', asset: 'spaceship_side.svg', x: 50, y: 50, scale: 1.2, anim: 'strafe' }]
    },
    lvl4: {
      title: 'Quantum Realm',
      act: 1,
      narrative: `We've entered a sub-atomic dimension.
Physics don't work the same here.
The candies are vibrating with quantum energy.

Master the chaos to move forward!`,
      actors: [{ id: 'astro', asset: 'astronaut.svg', x: 50, y: 50, scale: 1.5, anim: 'float' }]
    },
    lvl5: {
      title: 'Inferno Core',
      act: 1,
      narrative: `The heat is unbearable. 
We're approaching a binary star system.
The alien trail leads straight into the fire.

Cool down the systems with powerful combos!`,
      actors: [{ id: 'ufo', asset: 'ufo_v2.svg', x: 50, y: 30, scale: 1.2, anim: 'shake' }]
    },
    act1: {
      title: 'Wave One - Supernova Blast',
      act: 1,
      narrative: `The first wave of the alien fleet is here!
They're not just probes anymore—these are warships.

Stand your ground. The defense of Earth begins now!`,
      animation: 'wave_attack'
    },
    lvl7: {
      title: 'Alien Outpost',
      act: 2,
      narrative: `We've found a hidden base on the dark side of the moon.
It's a staging ground for a full-scale invasion.

Infiltrate their perimeter and take out their scouts!`,
      actors: [{ id: 'base', asset: 'structure.svg', x: 50, y: 60, scale: 2, anim: 'glow' }]
    },
    lvl8: {
      title: 'Event Horizon',
      act: 2,
      narrative: `A massive black hole is pulling everything in.
The aliens are using its gravity to slingshot their fleet.

Don't let the void consume you!`,
      actors: [{ id: 'ship', asset: 'spaceship_v2.svg', x: 30, y: 40, scale: 1, anim: 'descend' }]
    },
    lvl9: {
      title: 'Warp Tunnel',
      act: 2,
      narrative: `We're inside their transport network.
Everything is moving at impossible speeds.

Stay focused. One wrong move and we're lost in space!`,
      actors: [{ id: 'ufo', asset: 'ufo_side.svg', x: 50, y: 50, scale: 1.5, anim: 'fly-across' }]
    },
    lvl10: {
      title: 'Void Echoes',
      act: 2,
      narrative: `The silence here is deafening.
But wait... do you hear that?
A voice... calling from the darkness.

Is someone—or something—trying to talk to us?`,
      actors: [{ id: 'astro', asset: 'astronaut_side.svg', x: 50, y: 70, scale: 1.2, anim: 'walk' }]
    },
    act2: {
      title: 'Operation Base Assault',
      act: 2,
      narrative: `This is it. The main command center.
If we take this down, we stop the invasion.

All units, engage!`,
      animation: 'base_attack'
    },
    lvl12: {
      title: 'Fortified Base',
      act: 3,
      narrative: `Their shields are too strong for conventional weapons.
Only the pure energy of candy magic can pierce them.

Break through their defenses!`,
      actors: [{ id: 'base', asset: 'structure_side.svg', x: 50, y: 50, scale: 2.5, anim: 'shake' }]
    },
    lvl13: {
      title: 'Maximum Firepower',
      act: 3,
      narrative: `They're throwing everything they have at us.
The sky is filled with plasma fire.

Unleash your full power!`,
      actors: [{ id: 'ufo', asset: 'ufo_v2.svg', x: 80, y: 30, scale: 1, anim: 'float-delayed' }]
    },
    lvl14: {
      title: 'Strategic Victory',
      act: 3,
      narrative: `We've captured one of their high-ranking officers.
He's not fighting back. He looks... terrified.

What is he so afraid of?`,
      actors: [{ id: 'ufo', asset: 'ufo.svg', x: 50, y: 50, scale: 1.5, anim: 'jump' }]
    },
    lvl15: {
      title: 'Precision Bombing',
      act: 3,
      narrative: `We need to disable their main reactor.
A single, well-placed explosion should do it.

Aim for the core!`,
      actors: [{ id: 'ship', asset: 'spaceship.svg', x: 50, y: 30, scale: 1.8, anim: 'descend' }]
    },
    act3: {
      title: 'The Archaeological Discovery',
      act: 3,
      narrative: `Deep beneath the base, we found ancient ruins.
They're older than the aliens... older than humanity.

The truth is finally coming to light.`,
      animation: 'artifact_glow'
    },
    lvl17: {
      title: 'Deep Excavation',
      act: 4,
      narrative: `The records speak of 'The Devourer'.
A cosmic entity that eats entire galaxies.
The aliens weren't invading us... they were running from IT.

We've been fighting the wrong enemy.`,
      actors: [{ id: 'astro', asset: 'astronaut_high.svg', x: 50, y: 50, scale: 1.5, anim: 'float' }]
    },
    lvl18: {
      title: 'Full Potential',
      act: 4,
      narrative: `The candy magic isn't just a weapon.
It's a key. A way to harmonize with the universe.

Unlock your true potential!`,
      actors: [{ id: 'artifact', asset: 'structure.svg', x: 50, y: 50, scale: 2, anim: 'glow' }]
    },
    lvl19: {
      title: 'Ancient Knowledge',
      act: 4,
      narrative: `We've learned to translate their language.
They're asking for help. They want to join forces.

Will you extend the hand of friendship?`,
      actors: [{ id: 'ufo', asset: 'ufo_v2.svg', x: 30, y: 50, scale: 1.2, anim: 'float' }, { id: 'astro', asset: 'astronaut_v2.svg', x: 70, y: 50, scale: 1.2, anim: 'float-delayed' }]
    },
    lvl20: {
      title: 'Master the Ruins',
      act: 4,
      narrative: `We need to activate the ancient defense system.
It requires a massive amount of magical energy.

Prepare the ritual!`,
      actors: [{ id: 'base', asset: 'structure_side.svg', x: 50, y: 60, scale: 2, anim: 'shake' }]
    },
    act4: {
      title: 'The Alliance Forged',
      act: 4,
      narrative: `Humans and Aliens, standing together.
Two worlds, one goal: survival.

The Devourer is coming. We are ready.`,
      animation: 'alliance'
    },
    lvl22: {
      title: 'Shared Sacrifice',
      act: 5,
      narrative: `The Devourer's shadow is falling over the sun.
Many have already fallen. 

We must hold the line, no matter the cost!`,
      actors: [{ id: 'ship', asset: 'spaceship_side.svg', x: 20, y: 40, scale: 1.2, anim: 'strafe' }]
    },
    lvl23: {
      title: 'Combined Might',
      act: 5,
      narrative: `Our combined fleets are launching a final assault.
Magic and technology, working as one.

For the future of the galaxy!`,
      actors: [{ id: 'ufo', asset: 'ufo_side.svg', x: 30, y: 30, scale: 1, anim: 'fly-across' }, { id: 'ship', asset: 'spaceship_v2.svg', x: 70, y: 70, scale: 1, anim: 'fly-across-reverse' }]
    },
    lvl24: {
      title: 'United Strength',
      act: 5,
      narrative: `We're pushing it back! 
The darkness is receding. 
One last push and we can end this forever!

Give it everything you've got!`,
      actors: [{ id: 'astro', asset: 'astronaut_v2.svg', x: 50, y: 50, scale: 2, anim: 'jump' }]
    },
    victory: {
      title: 'The Final Victory',
      act: 5,
      narrative: `The Devourer is gone. 
The stars are bright once more.
A new era of peace has begun between our peoples.

You are the hero of two worlds.`,
      animation: 'victory'
    }
  },

  // Show a story scene fullscreen
  showScene: function(checkpointId) {
    console.log('[Story] Showing scene:', checkpointId);
    const scene = this.scenes[checkpointId];
    if (!scene) {
      console.warn('[Story] Scene not found:', checkpointId);
      return Promise.resolve();
    }

    const seenScenes = JSON.parse(localStorage.getItem('candy_seen_stories') || '{}');
    seenScenes[checkpointId] = true;
    localStorage.setItem('candy_seen_stories', JSON.stringify(seenScenes));

    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.id = 'story-overlay-container';
    overlay.className = 'story-overlay retro-ps1';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: #000;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      overflow: hidden;
      gap: 10px;
      padding: 20px;
      color: white;
      opacity: 1;
      transition: opacity 0.5s ease;
    `;
    document.body.classList.add('story-active');

    // Add Skip Button
    const btnSkip = document.createElement('button');
    btnSkip.textContent = 'SKIP >>';
    btnSkip.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(0,0,0,0.5);
      color: rgba(255,255,255,0.5);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 5px 10px;
      font-family: 'Courier New', monospace;
      font-size: 0.8em;
      cursor: pointer;
      z-index: 1000;
    `;
    overlay.appendChild(btnSkip);

    // Add Dithering/Scanline Overlay
    const scanlines = document.createElement('div');
    scanlines.className = 'ps1-scanlines';
    overlay.appendChild(scanlines);

    const starfield = Story.createStarfield();
    overlay.appendChild(starfield);

    const animContainer = document.createElement('div');
    animContainer.className = 'actor-stage';
    animContainer.style.cssText = `
      position: relative;
      width: 100%;
      max-width: 800px;
      height: 400px;
      z-index: 10;
      perspective: 1000px;
    `;
    
    if (scene.actors) {
      scene.actors.forEach(actor => {
        const el = document.createElement('img');
        el.src = `assets/images/${actor.asset}`;
        el.className = `actor actor-${actor.anim}`;
        el.style.cssText = `
          position: absolute;
          left: ${actor.x}%;
          top: ${actor.y}%;
          transform: translate(-50%, -50%) scale(${actor.scale});
          width: 120px;
          height: auto;
          image-rendering: pixelated;
          filter: drop-shadow(0 0 10px rgba(255,255,255,0.3));
        `;
        animContainer.appendChild(el);
      });
    } else {
      Story.playAnimation(scene.animation, animContainer);
    }
    
    overlay.appendChild(animContainer);

    const textBox = document.createElement('div');
    textBox.className = 'retro-text-box';
    textBox.style.cssText = `
      background: rgba(0, 0, 20, 0.9);
      border: 4px solid #444;
      border-top-color: #888;
      border-left-color: #888;
      padding: 20px;
      max-width: 700px;
      width: 90%;
      text-align: left;
      animation: slide-in-up 0.5s steps(5);
      z-index: 10;
      position: relative;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 1.5em;
      font-weight: bold;
      color: #00ffcc;
      margin-bottom: 15px;
      text-transform: uppercase;
      letter-spacing: 2px;
    `;
    title.textContent = `> ${scene.title}`;
    textBox.appendChild(title);

    const narrative = document.createElement('div');
    narrative.className = 'typewriter-text';
    narrative.style.cssText = `
      font-family: 'Courier New', monospace;
      font-size: 1.1em;
      color: #fff;
      line-height: 1.6;
      white-space: pre-wrap;
      margin-bottom: 25px;
      min-height: 100px;
    `;
    
    // Typewriter effect
    let i = 0;
    const text = scene.narrative;
    narrative.textContent = '';
    const type = () => {
      if (i < text.length) {
        narrative.textContent += text.charAt(i);
        i++;
        setTimeout(type, 30);
      }
    };
    setTimeout(type, 600);
    
    textBox.appendChild(narrative);

    const btnContinue = document.createElement('button');
    btnContinue.textContent = 'PRESS START';
    btnContinue.className = 'ps1-btn';
    btnContinue.style.cssText = `
      background: #222;
      color: #fff;
      border: 3px solid #666;
      padding: 10px 30px;
      font-family: 'Courier New', monospace;
      font-size: 1em;
      cursor: pointer;
      display: block;
      margin: 0 auto;
      animation: blink 1s steps(2) infinite;
    `;

    const scenePromise = new Promise((resolve) => {
      const removeScene = () => {
        if(overlay.dataset.closed === '1') return;
        overlay.dataset.closed = '1';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.3s steps(3)';
        setTimeout(() => {
          overlay.remove();
          document.body.classList.remove('story-active');
          resolve();
        }, 300);
      };

      btnContinue.onclick = () => removeScene();
      btnSkip.onclick = () => removeScene();
      textBox.appendChild(btnContinue);
      overlay.appendChild(textBox);
      document.body.appendChild(overlay);
    });

    if (!document.querySelector('style[data-story-animations]')) {
      const style = document.createElement('style');
      style.setAttribute('data-story-animations', '1');
      style.textContent = `
        .ps1-scanlines {
          position: absolute;
          inset: 0;
          background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), 
                      linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)),
                      url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAYAAACp8Z5+AAAAIklEQVQIW2NkQAKrVq36zwjjgzhhYWGMMAEYB8iBchBKoBwAENQH6jzS2j0AAAAASUVORK5CYII=");
          background-size: 100% 4px, 3px 100%, 4px 4px;
          pointer-events: none;
          z-index: 100;
          opacity: 0.4;
        }
        .retro-ps1 {
          filter: contrast(1.2) brightness(0.9) saturate(1.1);
        }
        @keyframes blink {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes descend {
          from { transform: translate(-50%, -200%) scale(2); }
          to { transform: translate(-50%, -50%) scale(2); }
        }
        @keyframes float {
          0%, 100% { transform: translate(-50%, -50%) translateY(0); }
          50% { transform: translate(-50%, -50%) translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translate(-50%, -50%) translateY(-10px); }
          50% { transform: translate(-50%, -50%) translateY(10px); }
        }
        @keyframes fly-across {
          from { left: -20%; }
          to { left: 120%; }
        }
        @keyframes fly-across-reverse {
          from { left: 120%; }
          to { left: -20%; }
        }
        @keyframes walk {
          0%, 100% { transform: translate(-50%, -50%) rotate(-5deg); }
          50% { transform: translate(-50%, -50%) rotate(5deg) translateY(-5px); }
        }
        @keyframes shake {
          0%, 100% { transform: translate(-50%, -50%) rotate(0); }
          25% { transform: translate(-50%, -50%) rotate(2deg); }
          75% { transform: translate(-50%, -50%) rotate(-2deg); }
        }
        @keyframes strafe {
          0%, 100% { left: 20%; }
          50% { left: 30%; }
        }
        @keyframes glow {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 10px #00ffcc); }
          50% { filter: brightness(1.5) drop-shadow(0 0 30px #00ffcc); }
        }
        @keyframes jump {
          0%, 100% { transform: translate(-50%, -50%) scale(1.5); }
          50% { transform: translate(-50%, -50%) scale(1.5) translateY(-40px); }
        }
        @keyframes scan {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 5px #ff0000); }
          50% { filter: brightness(1.5) drop-shadow(0 0 15px #ff0000); }
        }
        @keyframes twinkle-actor {
          0%, 100% { opacity: 0.4; filter: brightness(0.8) blur(1px); }
          50% { opacity: 1; filter: brightness(1.2) blur(0px); }
        }
        @keyframes slide-in-up {
          from { transform: translateY(100px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .actor-none { animation: none; }
        .actor-scan { animation: scan 1s infinite; }
        .actor-twinkle { animation: twinkle-actor 2s infinite; }
        .actor-descend { animation: descend 3s ease-out forwards; }
        .actor-float { animation: float 3s ease-in-out infinite; }
        .actor-float-delayed { animation: float-delayed 3.5s ease-in-out infinite; }
        .actor-fly-across { animation: fly-across 8s linear infinite; }
        .actor-fly-across-reverse { animation: fly-across-reverse 10s linear infinite; }
        .actor-walk { animation: walk 0.5s ease-in-out infinite; }
        .actor-shake { animation: shake 0.2s infinite; }
        .actor-strafe { animation: strafe 4s ease-in-out infinite; }
        .actor-glow { animation: glow 2s infinite; }
        .actor-jump { animation: jump 0.6s ease-out infinite; }
      `;
      document.head.appendChild(style);
    }

    return scenePromise;
  },

  // Create starfield background
  createStarfield: function() {
    const canvas = document.createElement('canvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      z-index: 0;
    `;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(10, 14, 39, 0.8)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    for (let i = 0; i < 150; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      const size = Math.random() * 1.5;
      const brightness = Math.random() * 0.7 + 0.3;

      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw some larger stars (distant galaxies)
    ctx.fillStyle = 'rgba(200, 150, 255, 0.3)';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, Math.random() * 30 + 20, 0, Math.PI * 2);
      ctx.fill();
    }

    return canvas;
  },

  // Play animation based on type
  playAnimation: function(type, container) {
    switch (type) {
      case 'intro':
        Story.animIntro(container);
        break;
      case 'wave_attack':
        Story.animWaveAttack(container);
        break;
      case 'base_attack':
        Story.animBaseAttack(container);
        break;
      case 'artifact_glow':
        Story.animArtifactGlow(container);
        break;
      case 'alliance':
        Story.animAlliance(container);
        break;
      case 'victory':
        Story.animVictory(container);
        break;
      default:
        container.textContent = '✨ Story Scene ✨';
    }
  },

  // Animation: Mothership descending with dramatic entrance
  animIntro: function(container) {
    const svg = Story.createSVG(600, 300);
    svg.style.filter = 'drop-shadow(0 0 20px rgba(100, 200, 255, 0.8))';

    // Animated starfield
    for (let i = 0; i < 20; i++) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', Math.random() * 600);
      star.setAttribute('cy', Math.random() * 300);
      star.setAttribute('r', Math.random() * 1.5 + 0.5);
      star.setAttribute('fill', '#fff');
      star.setAttribute('opacity', Math.random() * 0.6 + 0.2);
      star.setAttribute('style', `animation: twinkle ${2 + Math.random() * 3}s ease-in-out infinite; animation-delay: ${Math.random() * 2}s;`);
      svg.appendChild(star);
    }

    // Energy beams from space
    for (let i = 0; i < 3; i++) {
      const beam = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      beam.setAttribute('x1', 150 + i * 150);
      beam.setAttribute('y1', '-50');
      beam.setAttribute('x2', 150 + i * 150);
      beam.setAttribute('y2', '350');
      beam.setAttribute('stroke', '#00ff88');
      beam.setAttribute('stroke-width', '2');
      beam.setAttribute('opacity', '0');
      beam.setAttribute('style', `animation: beam-flash 2s ease-in-out infinite; animation-delay: ${i * 0.5}s;`);
      svg.appendChild(beam);
    }

    // Main Mothership - Large detailed vessel
    const shipGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    shipGroup.setAttribute('style', 'animation: intro-descend 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; filter: drop-shadow(0 0 15px rgba(100, 200, 255, 0.9));');

    // Main hull
    const hull = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    hull.setAttribute('cx', '300');
    hull.setAttribute('cy', '-100');
    hull.setAttribute('rx', '80');
    hull.setAttribute('ry', '50');
    hull.setAttribute('fill', '#6dd5ff');
    hull.setAttribute('opacity', '0.9');
    shipGroup.appendChild(hull);

    // Hull outline
    const hullStroke = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    hullStroke.setAttribute('cx', '300');
    hullStroke.setAttribute('cy', '-100');
    hullStroke.setAttribute('rx', '80');
    hullStroke.setAttribute('ry', '50');
    hullStroke.setAttribute('fill', 'none');
    hullStroke.setAttribute('stroke', '#00a8e8');
    hullStroke.setAttribute('stroke-width', '3');
    hullStroke.setAttribute('style', 'animation: glow-pulse 1.5s ease-in-out infinite;');
    shipGroup.appendChild(hullStroke);

    // Side engines
    for (let side = -1; side <= 1; side += 2) {
      const engine = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      engine.setAttribute('x', 300 + side * 90);
      engine.setAttribute('y', '-90');
      engine.setAttribute('width', '15');
      engine.setAttribute('height', '40');
      engine.setAttribute('fill', '#00ff88');
      engine.setAttribute('opacity', '0.7');
      engine.setAttribute('rx', '3');
      shipGroup.appendChild(engine);

      // Engine glow
      const engineGlow = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      engineGlow.setAttribute('x', 300 + side * 90);
      engineGlow.setAttribute('y', '-90');
      engineGlow.setAttribute('width', '15');
      engineGlow.setAttribute('height', '40');
      engineGlow.setAttribute('fill', 'none');
      engineGlow.setAttribute('stroke', '#00ff88');
      engineGlow.setAttribute('stroke-width', '2');
      engineGlow.setAttribute('rx', '3');
      engineGlow.setAttribute('style', 'animation: engine-pulse 0.8s ease-in-out infinite;');
      shipGroup.appendChild(engineGlow);
    }

    // Center antenna/spire
    const antenna = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    antenna.setAttribute('x1', '300');
    antenna.setAttribute('y1', '-160');
    antenna.setAttribute('x2', '300');
    antenna.setAttribute('y2', '-100');
    antenna.setAttribute('stroke', '#ffdd00');
    antenna.setAttribute('stroke-width', '3');
    antenna.setAttribute('style', 'animation: antenna-spark 1.2s ease-in-out infinite;');
    shipGroup.appendChild(antenna);

    // Portholes
    for (let i = 0; i < 5; i++) {
      const porthole = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      porthole.setAttribute('cx', 260 + i * 16);
      porthole.setAttribute('cy', '-100');
      porthole.setAttribute('r', '3');
      porthole.setAttribute('fill', '#ffdd00');
      porthole.setAttribute('style', `animation: blink 1.5s ease-in-out infinite; animation-delay: ${i * 0.2}s;`);
      shipGroup.appendChild(porthole);
    }

    // Plasma trail below ship
    const trail = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    trail.setAttribute('d', 'M 290 -40 Q 280 20 300 80 Q 320 20 310 -40');
    trail.setAttribute('fill', 'none');
    trail.setAttribute('stroke', '#6dd5ff');
    trail.setAttribute('stroke-width', '8');
    trail.setAttribute('opacity', '0.3');
    trail.setAttribute('filter', 'blur(2px)');
    trail.setAttribute('style', 'animation: trail-pulse 2s ease-in-out infinite;');
    shipGroup.appendChild(trail);

    svg.appendChild(shipGroup);

    const heroGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    heroGroup.setAttribute('transform', 'translate(280, 180)');

    const humanBody = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    humanBody.setAttribute('cx', '0');
    humanBody.setAttribute('cy', '0');
    humanBody.setAttribute('r', '10');
    humanBody.setAttribute('fill', '#ffe4cd');
    humanBody.setAttribute('stroke', '#ffb347');
    humanBody.setAttribute('stroke-width', '2');
    humanBody.setAttribute('style', 'animation: char-pulse 2s ease-in-out infinite;');
    heroGroup.appendChild(humanBody);

    const humanArmor = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    humanArmor.setAttribute('x', '-6');
    humanArmor.setAttribute('y', '8');
    humanArmor.setAttribute('width', '12');
    humanArmor.setAttribute('height', '18');
    humanArmor.setAttribute('rx', '4');
    humanArmor.setAttribute('fill', '#6dd5ff');
    humanArmor.setAttribute('opacity', '0.8');
    heroGroup.appendChild(humanArmor);

    const alienBody = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    alienBody.setAttribute('cx', '30');
    alienBody.setAttribute('cy', '-2');
    alienBody.setAttribute('rx', '8');
    alienBody.setAttribute('ry', '12');
    alienBody.setAttribute('fill', '#ff6b9d');
    alienBody.setAttribute('style', 'animation: alien-glow 2.4s ease-in-out infinite;');
    heroGroup.appendChild(alienBody);

    const alienEyes = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    alienEyes.setAttribute('cx', '28');
    alienEyes.setAttribute('cy', '-6');
    alienEyes.setAttribute('r', '2');
    alienEyes.setAttribute('fill', '#fff');
    heroGroup.appendChild(alienEyes);

    svg.appendChild(heroGroup);

    // Add CSS animations if not present
    if (!document.querySelector('style[data-intro-animations]')) {
      const style = document.createElement('style');
      style.setAttribute('data-intro-animations', '1');
      style.textContent = `
        @keyframes intro-descend {
          0% { transform: translateY(-200px) scale(0.5); opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { transform: translateY(0px) scale(1); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
        @keyframes beam-flash {
          0% { opacity: 0; }
          20% { opacity: 0.8; }
          40% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes engine-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes antenna-spark {
          0%, 100% { stroke-width: 3; opacity: 1; }
          50% { stroke-width: 5; opacity: 0.7; }
        }
        @keyframes blink {
          0%, 90%, 100% { opacity: 1; }
          95% { opacity: 0.2; }
        }
        @keyframes trail-pulse {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes char-pulse {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1.05); }
        }
        @keyframes alien-glow {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(svg);
  },

  // Animation: Alien fighters attacking
  animWaveAttack: function(container) {
    const svg = Story.createSVG(600, 300);
    svg.style.filter = 'drop-shadow(0 0 20px rgba(255, 100, 157, 0.6))';

    // Earth/landscape
    const landscape = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    landscape.setAttribute('d', 'M 0 200 Q 150 180 300 190 T 600 200 L 600 300 L 0 300 Z');
    landscape.setAttribute('fill', '#1a4d2e');
    landscape.setAttribute('opacity', '0.6');
    svg.appendChild(landscape);

    // City lights (buildings)
    for (let i = 0; i < 6; i++) {
      const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      building.setAttribute('x', 30 + i * 100);
      building.setAttribute('y', '160');
      building.setAttribute('width', '50');
      building.setAttribute('height', '60');
      building.setAttribute('fill', '#ffdd88');
      building.setAttribute('opacity', '0.7');
      svg.appendChild(building);

      // Windows
      for (let j = 0; j < 3; j++) {
        for (let k = 0; k < 2; k++) {
          const window = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
          window.setAttribute('x', 38 + i * 100 + k * 12);
          window.setAttribute('y', 168 + j * 12);
          window.setAttribute('width', '6');
          window.setAttribute('height', '6');
          window.setAttribute('fill', '#fff');
          window.setAttribute('style', `animation: building-blink ${1 + Math.random()}s ease-in-out infinite;`);
          svg.appendChild(window);
        }
      }
    }

    // Defense shield (dome)
    const shield = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    shield.setAttribute('cx', '300');
    shield.setAttribute('cy', '180');
    shield.setAttribute('rx', '150');
    shield.setAttribute('ry', '80');
    shield.setAttribute('fill', 'none');
    shield.setAttribute('stroke', '#00ff88');
    shield.setAttribute('stroke-width', '3');
    shield.setAttribute('opacity', '0.6');
    shield.setAttribute('style', 'animation: shield-pulse 1.5s ease-in-out infinite;');
    svg.appendChild(shield);

    // Alien fighters attacking
    for (let i = 0; i < 4; i++) {
      const fighterGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      fighterGroup.setAttribute('style', `animation: attack-dive ${2}s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.5}s infinite;`);

      // Fighter body
      const fighter = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      fighter.setAttribute('points', `${100 + i * 130},50 ${120 + i * 130},80 ${80 + i * 130},80`);
      fighter.setAttribute('fill', '#ff6b9d');
      fighterGroup.appendChild(fighter);

      // Fighter glow
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      glow.setAttribute('points', `${100 + i * 130},50 ${120 + i * 130},80 ${80 + i * 130},80`);
      glow.setAttribute('fill', 'none');
      glow.setAttribute('stroke', '#ff1493');
      glow.setAttribute('stroke-width', '2');
      glow.setAttribute('style', 'animation: fighter-glow 1s ease-in-out infinite;');
      fighterGroup.appendChild(glow);

      svg.appendChild(fighterGroup);
    }

    const defenderGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    defenderGroup.setAttribute('transform', 'translate(120, 230)');

    const soldier = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    soldier.setAttribute('x', '-6');
    soldier.setAttribute('y', '-10');
    soldier.setAttribute('width', '12');
    soldier.setAttribute('height', '22');
    soldier.setAttribute('rx', '4');
    soldier.setAttribute('fill', '#00ff88');
    soldier.setAttribute('style', 'animation: defender-pulse 1.6s ease-in-out infinite;');
    defenderGroup.appendChild(soldier);

    const helmet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    helmet.setAttribute('cx', '0');
    helmet.setAttribute('cy', '-16');
    helmet.setAttribute('r', '7');
    helmet.setAttribute('fill', '#1b1f3d');
    helmet.setAttribute('stroke', '#00ff88');
    helmet.setAttribute('stroke-width', '2');
    defenderGroup.appendChild(helmet);

    const companion = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    companion.setAttribute('x', '40');
    companion.setAttribute('y', '-8');
    companion.setAttribute('width', '12');
    companion.setAttribute('height', '18');
    companion.setAttribute('rx', '3');
    companion.setAttribute('fill', '#ff6b9d');
    companion.setAttribute('style', 'animation: defender-pulse 1.8s ease-in-out infinite reverse;');
    defenderGroup.appendChild(companion);

    svg.appendChild(defenderGroup);

    // Energy blasts (candy power)
    for (let i = 0; i < 8; i++) {
      const blast = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      blast.setAttribute('cx', 150 + Math.random() * 300);
      blast.setAttribute('cy', '80');
      blast.setAttribute('r', '6');
      blast.setAttribute('fill', '#ffdd00');
      blast.setAttribute('style', `animation: blast-up ${1.2}s ease-out ${i * 0.25}s infinite; filter: drop-shadow(0 0 8px rgba(255, 221, 0, 0.8));`);
      svg.appendChild(blast);
    }

    // Explosion effects
    for (let i = 0; i < 6; i++) {
      const explosion = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      explosion.setAttribute('cx', 150 + Math.random() * 300);
      explosion.setAttribute('cy', '120');
      explosion.setAttribute('r', '1');
      explosion.setAttribute('fill', '#ff6b9d');
      explosion.setAttribute('style', `animation: explosion-burst ${1.5}s ease-out ${i * 0.3}s infinite;`);
      svg.appendChild(explosion);
    }

    // Add animation styles
    if (!document.querySelector('style[data-wave-anims]')) {
      const style = document.createElement('style');
      style.setAttribute('data-wave-anims', '1');
      style.textContent = `
        @keyframes attack-dive {
          0% { transform: translateY(-100px) scaleY(0.8); opacity: 1; }
          70% { opacity: 1; }
          100% { transform: translateY(150px) scaleY(0.8); opacity: 0; }
        }
        @keyframes fighter-glow {
          0%, 100% { stroke-width: 2; opacity: 0.5; }
          50% { stroke-width: 3; opacity: 1; }
        }
        @keyframes blast-up {
          0% { transform: translateY(100px); opacity: 1; }
          100% { transform: translateY(-150px); opacity: 0; }
        }
        @keyframes explosion-burst {
          0% { r: 1; opacity: 1; }
          100% { r: 30; opacity: 0; }
        }
        @keyframes shield-pulse {
          0%, 100% { opacity: 0.4; stroke-width: 3; }
          50% { opacity: 0.9; stroke-width: 5; }
        }
        @keyframes building-blink {
          0%, 90%, 100% { opacity: 0.8; }
          95% { opacity: 0.1; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(svg);
  },

  // Animation: Base explosion
  animBaseAttack: function(container) {
    const svg = Story.createSVG(600, 320);
    svg.style.filter = 'drop-shadow(0 0 25px rgba(255, 120, 40, 0.6))';

    const sky = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sky.setAttribute('x', '0');
    sky.setAttribute('y', '0');
    sky.setAttribute('width', '600');
    sky.setAttribute('height', '320');
    sky.setAttribute('fill', '#03122a');
    svg.appendChild(sky);

    const horizon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    horizon.setAttribute('d', 'M0 220 Q 200 170 320 210 T 600 220 L600 320 L0 320 Z');
    horizon.setAttribute('fill', '#0a2b1a');
    horizon.setAttribute('opacity', '0.95');
    svg.appendChild(horizon);

    // Main base complex
    const base = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    base.setAttribute('points', '200,220 400,220 430,260 170,260');
    base.setAttribute('fill', '#1b1f3d');
    svg.appendChild(base);

    const baseGlow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    baseGlow.setAttribute('cx', '300');
    baseGlow.setAttribute('cy', '240');
    baseGlow.setAttribute('rx', '150');
    baseGlow.setAttribute('ry', '50');
    baseGlow.setAttribute('fill', 'none');
    baseGlow.setAttribute('stroke', '#ff6b9d');
    baseGlow.setAttribute('stroke-width', '6');
    baseGlow.setAttribute('opacity', '0.5');
    baseGlow.setAttribute('style', 'animation: base-glow 2s ease-in-out infinite;');
    svg.appendChild(baseGlow);

    const energyCore = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    energyCore.setAttribute('cx', '300');
    energyCore.setAttribute('cy', '230');
    energyCore.setAttribute('r', '20');
    energyCore.setAttribute('fill', '#ffdd99');
    energyCore.setAttribute('style', 'mix-blend-mode: screen; animation: core-shimmer 1.6s ease-in-out infinite;');
    svg.appendChild(energyCore);

    // Shockwaves
    for (let i = 0; i < 4; i++) {
      const shock = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      shock.setAttribute('cx', '300');
      shock.setAttribute('cy', '230');
      shock.setAttribute('r', `${30 + i * 30}`);
      shock.setAttribute('fill', 'none');
      shock.setAttribute('stroke', '#ffd966');
      shock.setAttribute('stroke-width', '2');
      shock.setAttribute('opacity', '0.8');
      shock.setAttribute('style', `animation: shockwave 2.2s ease-out ${i * 0.4}s infinite;`);
      svg.appendChild(shock);
    }

    // Incoming missiles
    for (let i = 0; i < 5; i++) {
      const missile = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      missile.setAttribute('x1', `${40 + i * 100}`);
      missile.setAttribute('y1', `${-20}`);
      missile.setAttribute('x2', `${260 + i * 40}`);
      missile.setAttribute('y2', `${180 + Math.random() * 30}`);
      missile.setAttribute('stroke', '#ff9359');
      missile.setAttribute('stroke-width', '3');
      missile.setAttribute('opacity', '0.8');
      missile.setAttribute('style', `animation: missile-trail 1.6s ease-in ${i * 0.2}s infinite;`);
      svg.appendChild(missile);
    }

    // Defense drones circling
    for (let i = 0; i < 3; i++) {
      const drone = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      drone.setAttribute('cx', '300');
      drone.setAttribute('cy', '180');
      drone.setAttribute('r', '8');
      drone.setAttribute('fill', '#00ff88');
      drone.setAttribute('style', `animation: drone-orbit 3s linear ${i * 0.4}s infinite;`);
      svg.appendChild(drone);
    }

    // Turret beams
    const turretBeam = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    turretBeam.setAttribute('d', 'M 330 190 C 360 140 440 120 470 60');
    turretBeam.setAttribute('stroke', '#00ff88');
    turretBeam.setAttribute('stroke-width', '4');
    turretBeam.setAttribute('fill', 'none');
    turretBeam.setAttribute('opacity', '0.5');
    turretBeam.setAttribute('style', 'animation: turret-beam 1.8s ease-in-out infinite;');
    svg.appendChild(turretBeam);

    if (!document.querySelector('style[data-base-attack-anims]')) {
      const style = document.createElement('style');
      style.setAttribute('data-base-attack-anims', '1');
      style.textContent = `
        @keyframes base-glow {
          0%, 100% { stroke-width: 4; opacity: 0.4; }
          50% { stroke-width: 8; opacity: 0.8; }
        }
        @keyframes core-shimmer {
          0%, 100% { transform: translateY(0); opacity: 0.8; }
          50% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes shockwave {
          0% { stroke-width: 2; opacity: 0.9; transform: scale(0.2); }
          70% { stroke-width: 2; opacity: 0.3; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        @keyframes missile-trail {
          0% { stroke-dasharray: 0 40; opacity: 1; }
          60% { stroke-dasharray: 30 10; opacity: 0.7; }
          100% { stroke-dasharray: 60 0; opacity: 0; }
        }
        @keyframes drone-orbit {
          0% { transform: rotate(0deg) translateX(70px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(70px) rotate(-360deg); }
        }
        @keyframes turret-beam {
          0% { stroke-width: 1; opacity: 0.3; }
          50% { stroke-width: 5; opacity: 1; }
          100% { stroke-width: 1; opacity: 0.3; }
        }
        @keyframes defender-pulse {
          0%, 100% { transform: scale(0.95); opacity: 0.6; }
          50% { transform: scale(1.05); opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(svg);
  },

  // Animation: Artifact glowing
  animArtifactGlow: function(container) {
    const svg = Story.createSVG(520, 320);
    svg.style.filter = 'drop-shadow(0 0 20px rgba(255, 0, 255, 0.7))';

    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const grad = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
    grad.setAttribute('id', 'artifactGradient');
    grad.setAttribute('cx', '50%');
    grad.setAttribute('cy', '50%');
    grad.setAttribute('r', '50%');
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#0c0a2f');
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#05030d');
    grad.appendChild(stop1);
    grad.appendChild(stop2);
    defs.appendChild(grad);
    svg.appendChild(defs);

    const aura = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    aura.setAttribute('x', '0');
    aura.setAttribute('y', '0');
    aura.setAttribute('width', '520');
    aura.setAttribute('height', '320');
    aura.setAttribute('fill', 'url(#artifactGradient)');
    svg.appendChild(aura);

    const artifact = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    artifact.setAttribute('d', 'M260,80 L320,160 L260,240 L200,160 Z');
    artifact.setAttribute('fill', '#ff00ff');
    artifact.setAttribute('filter', 'drop-shadow(0 0 12px rgba(255, 0, 255, 0.9))');
    artifact.setAttribute('style', 'animation: artifact-pulse 2.2s ease-in-out infinite;');
    svg.appendChild(artifact);

    const halo = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    halo.setAttribute('cx', '260');
    halo.setAttribute('cy', '160');
    halo.setAttribute('rx', '50');
    halo.setAttribute('ry', '20');
    halo.setAttribute('fill', 'none');
    halo.setAttribute('stroke', '#ff99ff');
    halo.setAttribute('stroke-width', '3');
    halo.setAttribute('opacity', '0.6');
    halo.setAttribute('style', 'animation: halo-spin 3s linear infinite;');
    svg.appendChild(halo);

    for (let i = 0; i < 8; i++) {
      const shard = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const angle = (i * 45) * Math.PI / 180;
      const x = 260 + Math.cos(angle) * 90;
      const y = 160 + Math.sin(angle) * 40;
      shard.setAttribute('points', `${x},${y} ${x + 10},${y + 4} ${x - 8},${y - 4}`);
      shard.setAttribute('fill', '#ff6b9d');
      shard.setAttribute('opacity', '0.8');
      shard.setAttribute('style', `animation: shard-orbit 4s linear ${i * 0.2}s infinite; transform-origin: 260px 160px;`);
      svg.appendChild(shard);
    }

    for (let i = 0; i < 12; i++) {
      const ray = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const angle = (i * 30) * Math.PI / 180;
      const x1 = 260 + Math.cos(angle) * 30;
      const y1 = 160 + Math.sin(angle) * 30;
      const x2 = 260 + Math.cos(angle) * 120;
      const y2 = 160 + Math.sin(angle) * 80;
      ray.setAttribute('x1', x1);
      ray.setAttribute('y1', y1);
      ray.setAttribute('x2', x2);
      ray.setAttribute('y2', y2);
      ray.setAttribute('stroke', '#ffc0ff');
      ray.setAttribute('stroke-width', '2');
      ray.setAttribute('opacity', '0.5');
      ray.setAttribute('style', `animation: ray-burst 2.5s ease-in-out ${(i % 4) * 0.15}s infinite;`);
      svg.appendChild(ray);
    }

    if (!document.querySelector('style[data-artifact-anims]')) {
      const style = document.createElement('style');
      style.setAttribute('data-artifact-anims', '1');
      style.textContent = `
        @keyframes artifact-pulse {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1.1); }
        }
        @keyframes halo-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes shard-orbit {
          0% { transform: rotate(0); opacity: 0.8; }
          50% { opacity: 0.3; }
          100% { transform: rotate(360deg); opacity: 0.8; }
        }
        @keyframes ray-burst {
          0% { stroke-width: 2; opacity: 0.4; }
          50% { stroke-width: 4; opacity: 1; }
          100% { stroke-width: 2; opacity: 0.2; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(svg);
  },

  // Animation: Peace and alliance
  animAlliance: function(container) {
    const svg = Story.createSVG(600, 320);
    svg.style.filter = 'drop-shadow(0 0 25px rgba(0, 255, 136, 0.7))';

    const sky = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sky.setAttribute('x', '0');
    sky.setAttribute('y', '0');
    sky.setAttribute('width', '600');
    sky.setAttribute('height', '320');
    sky.setAttribute('fill', '#040b1d');
    svg.appendChild(sky);

    for (let i = 0; i < 5; i++) {
      const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      glow.setAttribute('cx', `${120 + i * 100}`);
      glow.setAttribute('cy', `${70 + (i % 2) * 10}`);
      glow.setAttribute('r', `${15 + i * 4}`);
      glow.setAttribute('fill', '#00ff88');
      glow.setAttribute('opacity', '0.15');
      glow.setAttribute('style', `animation: star-pulse 4s ease-in-out ${i * 0.3}s infinite;`);
      svg.appendChild(glow);
    }

    const humanShip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    humanShip.setAttribute('style', 'animation: ship-glide 6s ease-in-out infinite;');
    const humanHull = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    humanHull.setAttribute('cx', '180');
    humanHull.setAttribute('cy', '200');
    humanHull.setAttribute('rx', '70');
    humanHull.setAttribute('ry', '30');
    humanHull.setAttribute('fill', '#6dd5ff');
    humanHull.setAttribute('opacity', '0.8');
    humanShip.appendChild(humanHull);
    const humanGlow = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    humanGlow.setAttribute('cx', '180');
    humanGlow.setAttribute('cy', '200');
    humanGlow.setAttribute('rx', '70');
    humanGlow.setAttribute('ry', '30');
    humanGlow.setAttribute('fill', 'none');
    humanGlow.setAttribute('stroke', '#00ff88');
    humanGlow.setAttribute('stroke-width', '4');
    humanGlow.setAttribute('style', 'animation: hull-flare 3s ease-in-out infinite;');
    humanShip.appendChild(humanGlow);
    svg.appendChild(humanShip);

    const alienShip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    alienShip.setAttribute('style', 'animation: ship-glide 5s ease-in-out infinite reverse;');
    const alienHull = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    alienHull.setAttribute('d', 'M420 190 C 400 160 480 140 520 180 L520 210 Q 485 240 420 210 Z');
    alienHull.setAttribute('fill', '#ff6b9d');
    alienHull.setAttribute('opacity', '0.8');
    alienShip.appendChild(alienHull);
    const alienAura = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    alienAura.setAttribute('cx', '470');
    alienAura.setAttribute('cy', '200');
    alienAura.setAttribute('rx', '65');
    alienAura.setAttribute('ry', '25');
    alienAura.setAttribute('fill', 'none');
    alienAura.setAttribute('stroke', '#ffdd88');
    alienAura.setAttribute('stroke-width', '3');
    alienAura.setAttribute('style', 'animation: hull-flare 2.4s ease-in-out infinite alternate;');
    alienShip.appendChild(alienAura);
    svg.appendChild(alienShip);

    const handshakeBridge = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    handshakeBridge.setAttribute('d', 'M 250 210 Q 300 130 350 210');
    handshakeBridge.setAttribute('stroke', '#00ff88');
    handshakeBridge.setAttribute('stroke-width', '3');
    handshakeBridge.setAttribute('fill', 'none');
    handshakeBridge.setAttribute('style', 'animation: bridge-beam 2.4s ease-in-out infinite;');
    svg.appendChild(handshakeBridge);

    for (let i = 0; i < 6; i++) {
      const spark = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      spark.setAttribute('cx', `${280 + Math.random() * 40}`);
      spark.setAttribute('cy', `${210 + Math.random() * 10}`);
      spark.setAttribute('r', '5');
      spark.setAttribute('fill', '#ffffff');
      spark.setAttribute('style', `animation: spark-rise 3s ease-in-out ${i * 0.15}s infinite; opacity: 0.8;`);
      svg.appendChild(spark);
    }

    const handshakePulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    handshakePulse.setAttribute('cx', '300');
    handshakePulse.setAttribute('cy', '210');
    handshakePulse.setAttribute('r', '18');
    handshakePulse.setAttribute('fill', 'none');
    handshakePulse.setAttribute('stroke', '#00ff88');
    handshakePulse.setAttribute('stroke-width', '4');
    handshakePulse.setAttribute('style', 'animation: handshake-pulse 2.2s ease-in-out infinite;');
    svg.appendChild(handshakePulse);

    if (!document.querySelector('style[data-alliance-anims]')) {
      const style = document.createElement('style');
      style.setAttribute('data-alliance-anims', '1');
      style.textContent = `
        @keyframes ship-glide {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes hull-flare {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes bridge-beam {
          0% { stroke-dasharray: 5 20; }
          40% { stroke-dasharray: 40 0; }
          100% { stroke-dasharray: 5 20; }
        }
        @keyframes spark-rise {
          0% { transform: translateY(0); opacity: 0.8; }
          100% { transform: translateY(-30px); opacity: 0; }
        }
        @keyframes handshake-pulse {
          0% { transform: scale(0.9); opacity: 0.6; }
          50% { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(0.9); opacity: 0.6; }
        }
        @keyframes star-pulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.35; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(svg);
  },

  // Animation: Final victory
  animVictory: function(container) {
    const svg = Story.createSVG(600, 320);
    svg.style.filter = 'drop-shadow(0 0 25px rgba(255, 215, 130, 0.7))';

    const sky = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    sky.setAttribute('x', '0');
    sky.setAttribute('y', '0');
    sky.setAttribute('width', '600');
    sky.setAttribute('height', '320');
    sky.setAttribute('fill', '#04051d');
    svg.appendChild(sky);

    for (let i = 0; i < 6; i++) {
      const star = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      star.setAttribute('cx', `${60 + i * 90}`);
      star.setAttribute('cy', `${40 + (i % 2) * 30}`);
      star.setAttribute('r', `${3 + i}`);
      star.setAttribute('fill', '#fff4bb');
      star.setAttribute('opacity', '0.4');
      star.setAttribute('style', `animation: star-flicker ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite;`);
      svg.appendChild(star);
    }

    const ribbon = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    ribbon.setAttribute('d', 'M 120 260 Q 260 180 420 260');
    ribbon.setAttribute('stroke', '#ffdd88');
    ribbon.setAttribute('stroke-width', '16');
    ribbon.setAttribute('fill', 'none');
    ribbon.setAttribute('opacity', '0.35');
    ribbon.setAttribute('style', 'animation: ribbon-wave 4s ease-in-out infinite;');
    svg.appendChild(ribbon);

    const emblem = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const hub = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    hub.setAttribute('cx', '300');
    hub.setAttribute('cy', '160');
    hub.setAttribute('r', '28');
    hub.setAttribute('fill', '#fff4aa');
    hub.setAttribute('opacity', '0.95');
    hub.setAttribute('style', 'animation: hub-breath 2.4s ease-in-out infinite;');
    emblem.appendChild(hub);

    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('cx', '300');
    ring.setAttribute('cy', '160');
    ring.setAttribute('r', '60');
    ring.setAttribute('fill', 'none');
    ring.setAttribute('stroke', '#ff8a50');
    ring.setAttribute('stroke-width', '4');
    ring.setAttribute('style', 'animation: ring-spin 7s linear infinite;');
    emblem.appendChild(ring);

    const burst = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    burst.setAttribute('cx', '300');
    burst.setAttribute('cy', '160');
    burst.setAttribute('r', '12');
    burst.setAttribute('fill', 'none');
    burst.setAttribute('stroke', '#00ff88');
    burst.setAttribute('stroke-width', '3');
    burst.setAttribute('style', 'animation: burst-pulse 1.8s ease-in-out infinite;');
    emblem.appendChild(burst);

    svg.appendChild(emblem);

    for (let i = 0; i < 10; i++) {
      const confetti = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      confetti.setAttribute('x', `${Math.random() * 600}`);
      confetti.setAttribute('y', `${Math.random() * 120}`);
      confetti.setAttribute('width', '6');
      confetti.setAttribute('height', '18');
      confetti.setAttribute('fill', '#ffdd88');
      confetti.setAttribute('style', `animation: confetti-fall 2.6s ease-in-out ${i * 0.15}s infinite; transform-origin: center;`);
      svg.appendChild(confetti);
    }

    if (!document.querySelector('style[data-victory-anims]')) {
      const style = document.createElement('style');
      style.setAttribute('data-victory-anims', '1');
      style.textContent = `
        @keyframes star-flicker {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 0.7; }
        }
        @keyframes ribbon-wave {
          0%, 100% { stroke-width: 12; }
          50% { stroke-width: 20; }
        }
        @keyframes hub-breath {
          0%, 100% { transform: scale(0.95); }
          50% { transform: scale(1.1); }
        }
        @keyframes ring-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes burst-pulse {
          0% { transform: scale(0.7); opacity: 0.8; }
          50% { transform: scale(1.8); opacity: 0; }
          100% { transform: scale(0.7); opacity: 0.8; }
        }
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotateZ(0deg); opacity: 1; }
          100% { transform: translateY(80px) rotateZ(45deg); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    container.appendChild(svg);
  },

  // Helper: Create SVG element
  createSVG: function(width, height) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.style.cssText = 'filter: drop-shadow(0 0 10px rgba(100, 200, 255, 0.5));';
    return svg;
  }
};

export default Story;
