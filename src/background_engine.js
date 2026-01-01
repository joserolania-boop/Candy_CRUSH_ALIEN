/**
 * BackgroundEngine - WebGL Shader-based dynamic background
 * Provides high-definition, GPU-accelerated space effects.
 */
export class BackgroundEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.gl = this.canvas.getContext('webgl', { alpha: false, antialias: true }) || 
              this.canvas.getContext('experimental-webgl');
    if (!this.gl) {
      console.error('WebGL not supported');
      return;
    }

    this.startTime = Date.now();
    this.mouse = { x: 0.5, y: 0.5 };
    this.targetMouse = { x: 0.5, y: 0.5 };
    this.currentTheme = null;
    this.warpFactor = 0.0;
    this.targetWarpFactor = 0.0;
    this.currentMode = 'nebula';
    this.programs = {};

    this.init();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = e.clientX / window.innerWidth;
      this.targetMouse.y = 1.0 - (e.clientY / window.innerHeight);
    });
    this.resize();
    this.animate();
  }

  init() {
    const vsSource = `
      attribute vec2 position;
      void main() {
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `;

    // Common shader parts
    const commonFuncs = `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform float u_warp;
      uniform float u_glitch;
      uniform float u_pulse;

      float hash(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      vec3 spaceDust(vec2 p, float time) {
        float n = pow(noise(p * 4.0 + time * 0.1), 3.0);
        return u_color1 * n * 0.4;
      }

      vec3 applyGlitch(vec3 color, vec2 uv) {
        if (u_glitch > 0.1) {
          float g = hash(vec2(floor(uv.y * 40.0), u_time)) * u_glitch;
          if (g > 0.8) {
            return color.gbr * (1.0 + u_pulse);
          }
        }
        return color;
      }
    `;

    // 1. NEBULA SHADER
    const fsNebula = commonFuncs + `
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        p += (u_mouse - 0.5) * 0.2;
        float dist = length(p);
        
        // Dynamic Warp
        float warp = u_warp * 2.0 + u_pulse * 0.5;
        p *= 1.0 + warp * dist;

        float n = fbm(p * 0.8 + u_time * 0.05);
        float n2 = fbm(p * 1.2 - u_time * 0.08);
        
        vec3 nebula = mix(u_color1, u_color2, n);
        nebula = mix(nebula, vec3(0.0), n2 * 0.7);
        
        // Energy Pulse
        nebula *= 1.0 + sin(u_time * 3.0) * u_pulse * 0.3;
        
        float stars = pow(hash(gl_FragCoord.xy * 0.01), 1000.0) * (1.0 + u_warp * 20.0 + u_pulse * 10.0);
        vec3 dust = spaceDust(p, u_time);
        
        vec3 finalColor = nebula * 0.6 + stars + dust;
        finalColor *= 1.4 - dist * 0.7;
        
        finalColor = applyGlitch(finalColor, uv);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // 2. BLACK HOLE SHADER
    const fsBlackHole = commonFuncs + `
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        p += (u_mouse - 0.5) * 0.1;
        
        float dist = length(p);
        
        // Gravitational Lensing
        float lens = 0.18 / (dist + 0.01);
        vec2 uvWarped = p + normalize(p) * lens * (1.0 + u_warp + u_pulse);
        
        // Accretion Disk
        float angle = atan(p.y, p.x);
        float disk = smoothstep(0.45, 0.4, dist) * smoothstep(0.2, 0.25, dist);
        float noiseVal = fbm(vec2(dist * 6.0 - u_time * 3.0, angle * 4.0));
        vec3 diskColor = mix(u_color1, u_color2, noiseVal) * disk * (2.5 + u_pulse * 4.0);
        
        // Event Horizon
        float horizon = smoothstep(0.22, 0.2, dist);
        
        // Background Stars (warped)
        float stars = pow(hash(floor(uvWarped * 120.0)), 100.0) * 0.6;
        vec3 dust = spaceDust(uvWarped, u_time);
        
        vec3 finalColor = mix(diskColor, vec3(0.0), horizon) + (stars + dust) * (1.0 - horizon);
        finalColor = applyGlitch(finalColor, uv);
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    // 3. WARP TUNNEL SHADER
    const fsWarpTunnel = commonFuncs + `
      void main() {
        vec2 uv_orig = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        float angle = atan(p.y, p.x);
        float dist = length(p);
        
        float speed = 2.5 + u_warp * 20.0 + u_pulse * 8.0;
        vec2 uv = vec2(angle * 2.0 / 3.14159, 1.0 / (dist + 0.01) + u_time * speed);
        
        float n = fbm(uv * 2.5);
        vec3 tunnelColor = mix(u_color1, u_color2, n) * dist;
        
        // Light streaks
        float streaks = pow(noise(vec2(angle * 12.0, uv.y * 0.15)), 12.0) * (3.0 + u_pulse * 6.0);
        vec3 finalColor = tunnelColor + streaks * u_color1;
        finalColor += spaceDust(p, u_time) * 0.5;
        
        finalColor = applyGlitch(finalColor, uv_orig);
        gl_FragColor = vec4(finalColor * smoothstep(0.0, 0.25, dist), 1.0);
      }
    `;

    // 4. QUANTUM LATTICE SHADER
    const fsQuantum = commonFuncs + `
      mat2 rot(float a) {
        float s = sin(a), c = cos(a);
        return mat2(c, -s, s, c);
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = (gl_FragCoord.xy * 2.0 - u_resolution.xy) / min(u_resolution.y, u_resolution.x);
        p *= rot(u_time * 0.15 + u_pulse * 0.5);
        p += (u_mouse - 0.5) * 0.4;
        
        vec2 z = p;
        float it = 0.0;
        int max_it = int(9.0 + u_pulse * 5.0);
        for(int i=0; i<15; i++) {
          if (i >= max_it) break;
          z = abs(z) / dot(z,z) - (0.7 + u_warp * 0.2);
          z *= rot(u_time * 0.06);
          it += 1.0;
          if(length(z) > 5.0) break;
        }
        
        vec3 col = mix(u_color1, u_color2, sin(it * 0.4 + u_time) * 0.5 + 0.5);
        col *= 0.6 / length(z);
        col *= 1.0 + u_pulse * 0.5;
        
        col = applyGlitch(col, uv);
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    this.programs.nebula = this.createProgram(vsSource, fsNebula);
    this.programs.blackhole = this.createProgram(vsSource, fsBlackHole);
    this.programs.warp = this.createProgram(vsSource, fsWarpTunnel);
    this.programs.quantum = this.createProgram(vsSource, fsQuantum);

    this.positionBuffer = this.gl.createBuffer();
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([
      -1, -1, 1, -1, -1, 1,
      -1, 1, 1, -1, 1, 1,
    ]), this.gl.STATIC_DRAW);
  }

  createProgram(vsSource, fsSource) {
    const vs = this.loadShader(this.gl.VERTEX_SHADER, vsSource);
    const fs = this.loadShader(this.gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return null;
    const program = this.gl.createProgram();
    this.gl.attachShader(program, vs);
    this.gl.attachShader(program, fs);
    this.gl.linkProgram(program);
    
    if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
      console.error('Unable to link program:', this.gl.getProgramInfoLog(program));
      return null;
    }

    return {
      program,
      locations: {
        position: this.gl.getAttribLocation(program, 'position'),
        time: this.gl.getUniformLocation(program, 'u_time'),
        resolution: this.gl.getUniformLocation(program, 'u_resolution'),
        mouse: this.gl.getUniformLocation(program, 'u_mouse'),
        color1: this.gl.getUniformLocation(program, 'u_color1'),
        color2: this.gl.getUniformLocation(program, 'u_color2'),
        warp: this.gl.getUniformLocation(program, 'u_warp'),
        glitch: this.gl.getUniformLocation(program, 'u_glitch'),
        pulse: this.gl.getUniformLocation(program, 'u_pulse'),
      }
    };
  }

  loadShader(type, source) {
    const shader = this.gl.createShader(type);
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  setTheme(theme) {
    this.currentTheme = theme;
    if (theme.environment && this.programs[theme.environment]) {
      this.currentMode = theme.environment;
    } else {
      this.currentMode = 'nebula';
    }
    console.log('[BackgroundEngine] Mode set to:', this.currentMode);
  }

  triggerWarp(duration = 1500) {
    this.targetWarpFactor = 1.0;
    setTimeout(() => {
      this.targetWarpFactor = 0.0;
    }, duration);
  }

  triggerGlitch(duration = 500) {
    this.glitchFactor = 1.0;
    setTimeout(() => {
      this.glitchFactor = 0.0;
    }, duration);
  }

  setPulse(value) {
    this.targetPulse = value;
  }

  hexToRgb(hex) {
    if (!hex) return [1, 1, 1];
    let cleaned = hex.replace('#', '');
    if (cleaned.length === 3) {
      cleaned = cleaned.split('').map(ch => ch + ch).join('');
    }
    const num = parseInt(cleaned, 16);
    return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
  }

  animate() {
    const time = (Date.now() - this.startTime) * 0.001;
    const progObj = this.programs[this.currentMode];
    
    if (progObj) {
      this.gl.useProgram(progObj.program);

      this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
      this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
      this.warpFactor += (this.targetWarpFactor - this.warpFactor) * 0.05;
      
      this.glitchFactor = this.glitchFactor || 0;
      this.targetPulse = this.targetPulse || 0;
      this.pulseFactor = this.pulseFactor || 0;
      this.pulseFactor += (this.targetPulse - this.pulseFactor) * 0.1;

      this.gl.uniform1f(progObj.locations.time, time);
      this.gl.uniform2f(progObj.locations.resolution, this.canvas.width, this.canvas.height);
      this.gl.uniform2f(progObj.locations.mouse, this.mouse.x, this.mouse.y);
      this.gl.uniform1f(progObj.locations.warp, this.warpFactor);
      this.gl.uniform1f(progObj.locations.glitch, this.glitchFactor);
      this.gl.uniform1f(progObj.locations.pulse, this.pulseFactor);

      if (this.currentTheme) {
        const c1 = this.hexToRgb(this.currentTheme.accentColor || '#9C27B0');
        const c2 = this.hexToRgb(this.currentTheme.glowColor || '#7B1FA2');
        this.gl.uniform3f(progObj.locations.color1, c1[0], c1[1], c1[2]);
        this.gl.uniform3f(progObj.locations.color2, c2[0], c2[1], c2[2]);
      }

      this.gl.enableVertexAttribArray(progObj.locations.position);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.positionBuffer);
      this.gl.vertexAttribPointer(progObj.locations.position, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    requestAnimationFrame(() => this.animate());
  }
}

