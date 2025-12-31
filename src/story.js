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
      animation: 'intro'
    },
    act1: {
      title: 'Wave One - First Contact',
      act: 1,
      narrative: `The aliens are attacking our cities!
Use your magic to defend!

Every combination of candies is a blast of protective energy!

Stand strong—we're counting on you!`,
      animation: 'wave_attack'
    },
    act2: {
      title: 'Operation Counter-Strike',
      act: 2,
      narrative: `We're counterattacking their bases!
The military is with us.

Stay focused. Together, magic and science will prevail!

Destroy their forward positions!`,
      animation: 'base_attack'
    },
    act3: {
      title: 'The Artifact Discovery',
      act: 3,
      narrative: `Wait... these artifacts...
I think I understand.

The aliens... they're not our enemy.
They were fleeing.
Running from something in the void...

This changes everything.`,
      animation: 'artifact_glow'
    },
    act4: {
      title: 'Alliance Forged',
      act: 4,
      narrative: `They call it 'The Devourer.'
An ancient force that consumes worlds.

Humans and aliens—united by candy magic—
we must stand against it.

Are you ready for the final battle?`,
      animation: 'alliance'
    },
    victory: {
      title: 'Victory!',
      act: 5,
      narrative: `The Devourer is defeated!
The worlds are safe.

Humans and aliens now stand together,
defending each other against the darkness.

You did it. You saved us all.`,
      animation: 'victory'
    }
  },

  // Show a story scene fullscreen
  showScene: function(checkpointId) {
    const scene = this.scenes[checkpointId];
    if (!scene) {
      console.warn('[Story] Scene not found:', checkpointId);
      return Promise.resolve();
    }

    const seenScenes = JSON.parse(localStorage.getItem('candy_seen_stories') || '{}');
    const autoAdvance = !seenScenes[checkpointId];
    seenScenes[checkpointId] = true;
    localStorage.setItem('candy_seen_stories', JSON.stringify(seenScenes));

    // Create fullscreen overlay
    const overlay = document.createElement('div');
    overlay.className = 'story-overlay';
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: linear-gradient(180deg, rgba(2,5,20,1) 0%, rgba(6,8,25,0.96) 60%, rgba(0,0,0,1) 100%);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      overflow: hidden;
      gap: 30px;
      padding: 40px;
    `;
    document.body.classList.add('story-active');

    const starfield = Story.createStarfield();
    overlay.appendChild(starfield);

    const animContainer = document.createElement('div');
    animContainer.style.cssText = `
      position: relative;
      width: 100%;
      max-width: 600px;
      height: 200px;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    `;
    Story.playAnimation(scene.animation, animContainer);
    overlay.appendChild(animContainer);

    const textBox = document.createElement('div');
    textBox.style.cssText = `
      background: rgba(8, 16, 40, 0.95);
      border: 2px solid rgba(109, 213, 255, 0.6);
      border-radius: 12px;
      padding: 30px;
      max-width: 700px;
      text-align: center;
      backdrop-filter: blur(12px);
      animation: slide-in-up 0.8s ease-out;
      box-shadow: 0 0 40px rgba(10, 20, 60, 0.8);
      z-index: 10;
    `;

    const title = document.createElement('div');
    title.style.cssText = `
      font-size: 1.8em;
      font-weight: bold;
      color: #fff;
      margin-bottom: 20px;
      text-shadow: 0 0 20px rgba(100, 200, 255, 0.6);
    `;
    title.textContent = scene.title;
    textBox.appendChild(title);

    const narrative = document.createElement('div');
    narrative.style.cssText = `
      font-size: 1.1em;
      color: #dfe9ff;
      line-height: 1.8;
      white-space: pre-wrap;
      font-family: 'Georgia', serif;
      margin-bottom: 30px;
    `;
    narrative.textContent = scene.narrative;
    textBox.appendChild(narrative);

    const btnContinue = document.createElement('button');
    btnContinue.textContent = autoAdvance ? 'Continue' : '▶ Continue';
    btnContinue.style.cssText = `
      background: linear-gradient(135deg, #6dd5ff, #00a8e8);
      color: #020c1a;
      border: none;
      padding: 12px 40px;
      border-radius: 8px;
      font-size: 1.1em;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
      box-shadow: 0 0 20px rgba(100, 200, 255, 0.5);
    `;
    btnContinue.onmouseover = () => {
      btnContinue.style.transform = 'scale(1.05)';
      btnContinue.style.boxShadow = '0 0 30px rgba(100, 200, 255, 0.85)';
    };
    btnContinue.onmouseout = () => {
      btnContinue.style.transform = 'scale(1)';
      btnContinue.style.boxShadow = '0 0 20px rgba(100, 200, 255, 0.5)';
    };

    const scenePromise = new Promise((resolve) => {
      const removeScene = () => {
        if(overlay.dataset.closed === '1') return;
        overlay.dataset.closed = '1';
        overlay.style.opacity = '0';
        overlay.style.transition = 'opacity 0.5s ease-out';
        setTimeout(() => {
          overlay.remove();
          document.body.classList.remove('story-active');
          resolve();
        }, 500);
      };

      btnContinue.onclick = () => removeScene();
      textBox.appendChild(btnContinue);
      overlay.appendChild(textBox);
      document.body.appendChild(overlay);

      if(autoAdvance) {
        const timer = setTimeout(removeScene, 3600);
        overlay.addEventListener('transitionend', () => clearTimeout(timer));
      }
    });

    if (!document.querySelector('style[data-story-animations]')) {
      const style = document.createElement('style');
      style.setAttribute('data-story-animations', '1');
      style.textContent = `
        @keyframes slide-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes glow-pulse {
          0%, 100% { box-shadow: 0 0 20px rgba(100, 200, 255, 0.6); }
          50% { box-shadow: 0 0 40px rgba(100, 200, 255, 1); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
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
    shipGroup.setAttribute('style', 'animation: descend 4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; filter: drop-shadow(0 0 15px rgba(100, 200, 255, 0.9));');

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
        @keyframes descend {
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
