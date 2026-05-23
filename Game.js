const PLAYER_DATA_DEFAULTS = {
  highScore: 0,
  fragmentsCollected: 0,
  gameCompleted: false,
  leaderboard: [{ field: 'fragmentsCollected', label: 'Fragments Found' }]
};

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.entities = [];
    this.scrollX = 0;
    this.scrollY = 0;
    this.lastTime = 0;
    this.state = 'title';
    this.keys = {};
    this.mobileInput = { left: false, right: false, jump: false, interact: false, meow: false };
    this.isMobile = 'ontouchstart' in window || window.innerWidth < 768;

    // World dimensions
    this.worldWidth = 3200;
    this.worldHeight = 600;
    this.groundY = 460;

    // Camera
    this.cameraX = 0;
    this.cameraY = 0;
    this.cameraTargetX = 0;
    this.cameraTargetY = 0;

    // Rain
    this.raindrops = [];
    this.rainIntensity = 1.0;

    // Fog particles
    this.fogParticles = [];

    // Floating particles
    this.floatingParticles = [];

    // Dialogue system
    this.dialogueQueue = [];
    this.dialogueActive = false;
    this.dialogueTimer = 0;
    this.dialogueCharIndex = 0;
    this.currentDialogueText = '';
    this.fullDialogueText = '';

    // Collectibles
    this.fragmentsCollected = 0;
    this.totalFragments = 5;

    // Interaction
    this.nearInteractable = null;

    // Reunion state
    this.reunionTriggered = false;
    this.reunionTimer = 0;
    this.endingPhase = 0;

    // Parallax layers
    this.parallaxStars = [];
    for (let i = 0; i < 60; i++) {
      this.parallaxStars.push({
        x: Math.random() * this.worldWidth * 1.5,
        y: Math.random() * 200,
        size: Math.random() * 1.5 + 0.3,
        twinkle: Math.random() * Math.PI * 2
      });
    }

    // Letter content
    this.letterText = `Dear Merrylou,

I've been sitting here trying to find the right words, and honestly, I don't think any words could ever be enough. But I want to try.

From the very first moment you came into my life, something shifted. Not dramatically, not like the movies — just quietly, like the sun finding its way through curtains in the morning. You made everything feel a little warmer, a little safer, a little more like home.

I think about the small things the most. The way you laugh when you're trying not to. The way you get quiet when you're thinking about something important. The way you make even ordinary days feel like something worth remembering.

You probably don't know this, but there are times I just look at you and feel this overwhelming wave of gratitude — that somehow, out of everyone in the world, I get to know you. I get to hear your voice. I get to be near you.

I miss you even when you're not far. That's the strange part. It's not about distance. It's about this feeling that wherever you are is where I want to be.

You make me feel safe in a way I didn't know I needed. Like I can be imperfect and still be enough. Like I don't have to perform or pretend. With you, I can just breathe.

I hope you know how special you are. Not because of what you do, but because of who you are. Your kindness, your softness, your strength — they make the world better. They make my world better.

I don't know what the future holds. But if I could choose one thing, it would be this: more time with you. More quiet mornings, more shared silences, more of your warmth beside me.

You are my favorite feeling, Merrylou. And I will keep finding my way back to you — always.

With all the love I have,
Bin 🐱`;

    this.setup();
    this.setupInput();
    this.setupResize();
    this.initRain();
    this.initFog();
    this.initFloatingParticles();
    this.start();
  }

  setup() {
    // Create Bin (player)
    this.player = new Bin(120, this.groundY - 24);
    this.entities.push(this.player);

    // Create Merry (at end of level)
    this.merry = new Merry(2950, this.groundY - 52);
    this.entities.push(this.merry);

    // Ground platforms
    this.platforms = [];
    this.addPlatform(0, this.groundY, 800, 140, 'ground');
    this.addPlatform(850, this.groundY, 400, 140, 'ground');
    this.addPlatform(1300, this.groundY, 600, 140, 'ground');
    this.addPlatform(1950, this.groundY, 500, 140, 'ground');
    this.addPlatform(2500, this.groundY, 700, 140, 'ground');

    // Rooftop platforms (for climbing)
    this.addPlatform(300, this.groundY - 60, 80, 10, 'rooftop');
    this.addPlatform(420, this.groundY - 110, 80, 10, 'rooftop');
    this.addPlatform(1050, this.groundY - 50, 70, 10, 'rooftop');
    this.addPlatform(1600, this.groundY - 70, 90, 10, 'rooftop');
    this.addPlatform(2100, this.groundY - 55, 80, 10, 'rooftop');

    // Buildings (background decoration + collision)
    this.addPlatform(50, this.groundY - 150, 80, 150, 'building');
    this.addPlatform(500, this.groundY - 200, 100, 200, 'building');
    this.addPlatform(900, this.groundY - 120, 70, 120, 'building');
    this.addPlatform(1400, this.groundY - 180, 90, 180, 'building');
    this.addPlatform(1700, this.groundY - 140, 80, 140, 'building');
    this.addPlatform(2200, this.groundY - 160, 100, 160, 'building');
    this.addPlatform(2700, this.groundY - 130, 85, 130, 'building');

    // Lamps
    this.lamps = [];
    const lampPositions = [200, 480, 750, 1000, 1350, 1550, 1800, 2050, 2400, 2650, 2900];
    for (let lx of lampPositions) {
      const lamp = new Lamp(lx, this.groundY - 50, 50);
      this.lamps.push(lamp);
      this.entities.push(lamp);
    }

    // Memory spots with dialogue
    this.memorySpots = [];
    this.addMemory(350, this.groundY - 30, [
      "*A faint warmth lingers here...*",
      "You remember the first time you saw her smile.",
      "It felt like the whole world got a little brighter."
    ], false);

    this.addMemory(420, this.groundY - 140, [
      "*The wind carries a familiar scent...*",
      "She always smelled like home.",
      "Like safety. Like belonging."
    ], false);

    this.addMemory(1100, this.groundY - 30, [
      "*Raindrops on a window...*",
      "You used to watch the rain together.",
      "She'd say the drops were racing,",
      "and she'd always cheer for the smallest one."
    ], false);

    this.addMemory(1650, this.groundY - 100, [
      "*A gentle echo...*",
      "Her laugh. You could never forget it.",
      "The way it made everything else disappear.",
      "You'd give anything to hear it right now."
    ], false);

    this.addMemory(2150, this.groundY - 30, [
      "*Something warm glows here...*",
      "A memory of quiet evenings.",
      "Her hand reaching down to pet you.",
      "'I'm so glad you're here, Bin.'"
    ], false);

    // The special letter
    this.addMemory(2450, this.groundY - 30, null, true);

    // Emotional fragments
    this.fragments = [];
    this.addFragment(300, this.groundY - 90, "Warmth");
    this.addFragment(1060, this.groundY - 70, "Comfort");
    this.addFragment(1620, this.groundY - 90, "Longing");
    this.addFragment(2120, this.groundY - 80, "Hope");
    this.addFragment(2680, this.groundY - 40, "Love");
  }

  addPlatform(x, y, w, h, type) {
    const p = new Platform(x, y, w, h, type);
    this.platforms.push(p);
    this.entities.push(p);
  }

  addMemory(x, y, dialogue, isLetter) {
    const m = new MemorySpot(x, y, dialogue, isLetter);
    this.memorySpots.push(m);
    this.entities.push(m);
  }

  addFragment(x, y, text) {
    const f = new Fragment(x, y, text);
    this.fragments.push(f);
    this.entities.push(f);
  }

  initRain() {
    this.raindrops = [];
    for (let i = 0; i < 300; i++) {
      this.raindrops.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        speed: 300 + Math.random() * 200,
        length: 6 + Math.random() * 8,
        opacity: 0.1 + Math.random() * 0.25
      });
    }
  }

  initFog() {
    this.fogParticles = [];
    for (let i = 0; i < 20; i++) {
      this.fogParticles.push({
        x: Math.random() * this.worldWidth,
        y: this.groundY - 40 + Math.random() * 60,
        width: 80 + Math.random() * 120,
        height: 20 + Math.random() * 30,
        speed: 5 + Math.random() * 15,
        opacity: 0.03 + Math.random() * 0.06
      });
    }
  }

  initFloatingParticles() {
    this.floatingParticles = [];
    for (let i = 0; i < 30; i++) {
      this.floatingParticles.push({
        x: Math.random() * this.worldWidth,
        y: Math.random() * this.worldHeight,
        size: 1 + Math.random() * 2,
        speedY: -8 - Math.random() * 12,
        drift: Math.random() * Math.PI * 2,
        opacity: 0.2 + Math.random() * 0.4
      });
    }
  }

  setupInput() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'KeyE' || e.code === 'Space') {
        this.handleInteract();
      }
      if (e.code === 'KeyQ') {
        this.handleMeow();
      }
    });
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Start button
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        this.state = 'playing';
        document.getElementById('startScreen').style.display = 'none';
        this.showDialogue([
          "*The rain falls softly on the empty streets...*",
          "Bin opens his eyes. The night is cold.",
          "Somewhere out there, Merrylou is waiting.",
          "He has to find her."
        ]);
      });
    }

    // Close letter button
    const closeLetterBtn = document.getElementById('closeLetterBtn');
    if (closeLetterBtn) {
      closeLetterBtn.addEventListener('click', () => {
        document.getElementById('letterOverlay').style.display = 'none';
        this.dialogueActive = false;
      });
    }

    // FIX: always set up mobile controls — touch events work on any device,
    // and the visibility is controlled separately by setupResize().
    this.setupMobileControls();
  }

  setupMobileControls() {
    // FIX: bind touch events unconditionally so they work even if isMobile
    // was false at construction time but becomes true after a resize.
    const updateMobileVisibility = () => {
      const show = 'ontouchstart' in window || window.innerWidth < 768;
      document.getElementById('mobileControls').style.display = show ? 'flex' : 'none';
    };
    updateMobileVisibility();

    const addTouchEvents = (id, key) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      // Remove any previous listeners by cloning (safe for fresh setup)
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.mobileInput[key] = true;
      }, { passive: false });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        this.mobileInput[key] = false;
      }, { passive: false });
      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        this.mobileInput[key] = false;
      }, { passive: false });
    };

    addTouchEvents('btnLeft', 'left');
    addTouchEvents('btnRight', 'right');
    addTouchEvents('btnJump', 'jump');

    const btnInteract = document.getElementById('btnInteract');
    if (btnInteract) {
      btnInteract.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleInteract();
      }, { passive: false });
    }

    const btnMeow = document.getElementById('btnMeow');
    if (btnMeow) {
      btnMeow.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleMeow();
      }, { passive: false });
    }
  }

  handleInteract() {
    if (this.state === 'title') return;

    if (this.dialogueActive) {
      this.advanceDialogue();
      return;
    }

    if (this.nearInteractable) {
      if (this.nearInteractable instanceof MemorySpot && !this.nearInteractable.collected) {
        this.nearInteractable.collected = true;
        if (this.nearInteractable.isLetter) {
          this.showLetter();
        } else {
          this.showDialogue(this.nearInteractable.dialogue);
        }
      } else if (this.nearInteractable instanceof Fragment && !this.nearInteractable.collected) {
        this.nearInteractable.collected = true;
        this.fragmentsCollected++;
        document.getElementById('fragmentCount').textContent = `✦ ${this.fragmentsCollected} / ${this.totalFragments}`;
        this.showDialogue([`*You found a fragment of ${this.nearInteractable.memoryText}*`]);
      }
    }
  }

  handleMeow() {
    if (this.state !== 'playing') return;
    if (!this.dialogueActive) {
      this.player.meow();
    }
  }

  showDialogue(texts) {
    this.dialogueQueue = texts.slice();
    this.dialogueActive = true;
    this.dialogueCharIndex = 0;
    this.dialogueTimer = 0;
    this.fullDialogueText = this.dialogueQueue.shift();
    this.currentDialogueText = '';
    document.getElementById('dialogueBox').style.display = 'block';
    document.getElementById('dialogueText').textContent = '';
  }

  advanceDialogue() {
    if (this.currentDialogueText.length < this.fullDialogueText.length) {
      this.currentDialogueText = this.fullDialogueText;
      document.getElementById('dialogueText').textContent = this.currentDialogueText;
      return;
    }

    if (this.dialogueQueue.length > 0) {
      this.fullDialogueText = this.dialogueQueue.shift();
      this.currentDialogueText = '';
      this.dialogueCharIndex = 0;
      this.dialogueTimer = 0;
    } else {
      this.dialogueActive = false;
      document.getElementById('dialogueBox').style.display = 'none';
    }
  }

  showLetter() {
    this.dialogueActive = true;
    document.getElementById('letterBody').innerText = this.letterText;
    document.getElementById('letterOverlay').style.display = 'flex';
  }

  setupResize() {
    const fit = () => {
      const dpr = window.devicePixelRatio || 1;
      const r = this.canvas.getBoundingClientRect();
      if (r.width <= 0 || r.height <= 0) return;
      this.canvas.width = Math.floor(r.width * dpr);
      this.canvas.height = Math.floor(r.height * dpr);
      // FIX: update isMobile and mobile controls visibility on every resize
      this.isMobile = 'ontouchstart' in window || window.innerWidth < 768;
      document.getElementById('mobileControls').style.display = this.isMobile ? 'flex' : 'none';
    };
    window.addEventListener('resize', fit);
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(fit).observe(this.canvas);
    fit();
  }

  screenToWorld(canvasX, canvasY) {
    return { x: canvasX + this.cameraX, y: canvasY + this.cameraY };
  }

  worldToScreen(worldX, worldY) {
    return { x: worldX - this.cameraX, y: worldY - this.cameraY };
  }

  getObjectAt(canvasX, canvasY) {
    const world = this.screenToWorld(canvasX, canvasY);
    for (const entity of this.entities) {
      const b = entity.getBounds();
      if (world.x >= b.x && world.x <= b.x + b.width &&
          world.y >= b.y && world.y <= b.y + b.height) {
        return entity;
      }
    }
    return null;
  }

  update(dt) {
    if (dt > 0.1) dt = 0.1;

    if (this.state === 'title') return;
    if (this.state !== 'playing' && this.state !== 'reunion') return;

    // Update dialogue typewriter
    if (this.dialogueActive && document.getElementById('letterOverlay').style.display === 'none') {
      this.dialogueTimer += dt;
      if (this.dialogueTimer > 0.03 && this.dialogueCharIndex < this.fullDialogueText.length) {
        this.dialogueTimer = 0;
        this.dialogueCharIndex++;
        this.currentDialogueText = this.fullDialogueText.substring(0, this.dialogueCharIndex);
        document.getElementById('dialogueText').textContent = this.currentDialogueText;
      }
    }

    // Player movement (skip if dialogue active)
    if (!this.dialogueActive) {
      const left = this.keys['ArrowLeft'] || this.keys['KeyA'] || this.mobileInput.left;
      const right = this.keys['ArrowRight'] || this.keys['KeyD'] || this.mobileInput.right;
      const jump = this.keys['ArrowUp'] || this.keys['KeyW'] || this.keys['Space'] || this.mobileInput.jump;

      this.player.vx = 0;
      if (left) this.player.vx = -this.player.speed;
      if (right) this.player.vx = this.player.speed;

      if (jump && this.player.grounded) {
        this.player.vy = this.player.jumpForce;
        this.player.grounded = false;
      }
    } else {
      this.player.vx = 0;
    }

    // Update player
    this.player.update(dt);

    // Platform collision
    this.player.grounded = false;
    for (let p of this.platforms) {
      if (p.type === 'building') continue;
      const pb = this.player.getBounds();
      const plb = p.getBounds();

      if (pb.x + pb.width > plb.x && pb.x < plb.x + plb.width) {
        if (pb.y + pb.height > plb.y && pb.y + pb.height < plb.y + plb.height && this.player.vy >= 0) {
          this.player.y = plb.y - this.player.height;
          this.player.vy = 0;
          this.player.grounded = true;
        }
      }
    }

    // Keep player in bounds
    if (this.player.x < 0) this.player.x = 0;
    if (this.player.x > this.worldWidth - this.player.width) this.player.x = this.worldWidth - this.player.width;
    if (this.player.y > this.groundY + 100) {
      this.player.y = this.groundY - this.player.height;
      this.player.vy = 0;
      this.player.grounded = true;
    }

    // Check interactions
    this.nearInteractable = null;
    const interactPrompt = document.getElementById('interactPrompt');

    for (let m of this.memorySpots) {
      if (m.collected) continue;
      const dist = Math.abs((this.player.x + this.player.width / 2) - (m.x + m.width / 2)) +
                   Math.abs((this.player.y + this.player.height / 2) - (m.y + m.height / 2));
      if (dist < 50) {
        this.nearInteractable = m;
        break;
      }
    }

    if (!this.nearInteractable) {
      for (let f of this.fragments) {
        if (f.collected) continue;
        const dist = Math.abs((this.player.x + this.player.width / 2) - (f.x + f.width / 2)) +
                     Math.abs((this.player.y + this.player.height / 2) - (f.y + f.height / 2));
        if (dist < 40) {
          this.nearInteractable = f;
          break;
        }
      }
    }

    if (this.nearInteractable && !this.dialogueActive) {
      interactPrompt.style.display = 'block';
    } else {
      interactPrompt.style.display = 'none';
    }

    // Check reunion trigger
    if (!this.reunionTriggered && this.player.x > 2880) {
      this.triggerReunion();
    }

    // Update reunion
    if (this.state === 'reunion') {
      this.reunionTimer += dt;
      this.updateReunion(dt);
    }

    // Update entities
    for (let e of this.entities) {
      if (e !== this.player) e.update(dt);
    }

    // Rain
    this.updateRain(dt);
    this.updateFog(dt);
    this.updateFloatingParticles(dt);

    // Camera
    this.updateCamera(dt);

    // Meow prompt
    const meowPrompt = document.getElementById('meowPrompt');
    if (meowPrompt) meowPrompt.style.display = this.dialogueActive ? 'none' : 'block';
  }

  updateCamera(dt) {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    this.cameraTargetX = this.player.x + this.player.width / 2 - cw / 2;
    this.cameraTargetY = this.player.y + this.player.height / 2 - ch / 2 + 50;

    this.cameraTargetX = Math.max(0, Math.min(this.cameraTargetX, this.worldWidth - cw));
    this.cameraTargetY = Math.max(-100, Math.min(this.cameraTargetY, this.worldHeight - ch));

    this.cameraX += (this.cameraTargetX - this.cameraX) * 3 * dt;
    this.cameraY += (this.cameraTargetY - this.cameraY) * 3 * dt;
    this.scrollX = this.cameraX;
    this.scrollY = this.cameraY;
  }

  updateRain(dt) {
    for (let r of this.raindrops) {
      r.y += r.speed * dt * this.rainIntensity;
      r.x -= 30 * dt;
      if (r.y > this.worldHeight) {
        r.y = -20;
        r.x = Math.random() * this.worldWidth;
      }
      if (r.x < 0) r.x = this.worldWidth;
    }
  }

  updateFog(dt) {
    for (let f of this.fogParticles) {
      f.x += f.speed * dt;
      if (f.x > this.worldWidth + f.width) {
        f.x = -f.width;
      }
    }
  }

  updateFloatingParticles(dt) {
    for (let p of this.floatingParticles) {
      p.y += p.speedY * dt;
      p.drift += dt;
      p.x += Math.sin(p.drift) * 10 * dt;
      if (p.y < -20) {
        p.y = this.worldHeight + 10;
        p.x = Math.random() * this.worldWidth;
      }
    }
  }

  triggerReunion() {
    this.reunionTriggered = true;
    this.state = 'reunion';
    this.reunionTimer = 0;
    this.endingPhase = 0;
    this.merry.visible = true;
    this.player.vx = 0;
    document.getElementById('interactPrompt').style.display = 'none';
  }

  updateReunion(dt) {
    // Slow walk to Merry
    if (this.endingPhase === 0) {
      if (this.player.x < 2920) {
        this.player.vx = 40;
        this.player.update(dt);
      } else {
        this.player.vx = 0;
        this.endingPhase = 1;
        this.reunionTimer = 0;
      }
      // Slow rain stop
      this.rainIntensity = Math.max(0, this.rainIntensity - dt * 0.3);
    }

    if (this.endingPhase === 1 && this.reunionTimer > 2) {
      this.endingPhase = 2;
      this.reunionTimer = 0;
      const overlay = document.getElementById('reunionOverlay');
      overlay.style.display = 'flex';
      setTimeout(() => overlay.classList.add('active'), 100);
    }

    if (this.endingPhase === 2 && this.reunionTimer > 2) {
      this.endingPhase = 3;
      document.getElementById('reunionText').innerHTML =
        `<p style="margin-bottom:16px;">Bin found Merrylou.</p>
         <p style="margin-bottom:16px; opacity:0.8;">Under the warm glow of the streetlights,</p>
         <p style="margin-bottom:16px; opacity:0.7;">the rain slowly faded away.</p>
         <p style="margin-bottom:24px; opacity:0.6;">And for the first time tonight,</p>
         <p style="font-size:1.6rem; margin-bottom:32px;">everything felt like home.</p>
         <p style="opacity:0.5; font-size:0.9rem; margin-top: 20px;">✦ Fragments collected: ${this.fragmentsCollected} / ${this.totalFragments} ✦</p>`;
    }

    // Continue fading rain
    this.rainIntensity = Math.max(0, this.rainIntensity - dt * 0.15);
  }

  draw() {
    this.ctx.save();
    const cw = this.canvas.width;
    const ch = this.canvas.height;

    // Clear
    this.ctx.fillStyle = '#0a0a18';
    this.ctx.fillRect(0, 0, cw, ch);

    if (this.state === 'title') {
      this.drawTitleBackground();
      this.ctx.restore();
      return;
    }

    // Draw sky gradient
    const skyGrd = this.ctx.createLinearGradient(0, 0, 0, ch);
    skyGrd.addColorStop(0, '#050510');
    skyGrd.addColorStop(0.4, '#0a0a20');
    skyGrd.addColorStop(0.8, '#121230');
    skyGrd.addColorStop(1, '#1a1a3a');
    this.ctx.fillStyle = skyGrd;
    this.ctx.fillRect(0, 0, cw, ch);

    // Stars (parallax)
    for (let s of this.parallaxStars) {
      const sx = s.x - this.cameraX * 0.1;
      const sy = s.y;
      s.twinkle += 0.02;
      const alpha = 0.3 + Math.sin(s.twinkle) * 0.3;
      this.ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
      this.ctx.fillRect(sx, sy, s.size, s.size);
    }

    // Far buildings (parallax)
    this.drawFarBuildings();

    // Apply camera
    this.ctx.save();
    this.ctx.translate(-this.cameraX, -this.cameraY);

    // Draw platforms
    for (let p of this.platforms) p.draw(this.ctx);

    // Draw puddles
    this.drawPuddles();

    // Draw lamps
    for (let l of this.lamps) l.draw(this.ctx);

    // Draw memory spots
    for (let m of this.memorySpots) m.draw(this.ctx);

    // Draw fragments
    for (let f of this.fragments) f.draw(this.ctx);

    // Draw Merry
    this.merry.draw(this.ctx);

    // Draw player
    this.player.draw(this.ctx);

    // Draw fog
    for (let f of this.fogParticles) {
      this.ctx.fillStyle = `rgba(100, 120, 160, ${f.opacity})`;
      this.ctx.beginPath();
      this.ctx.ellipse(f.x + f.width / 2, f.y + f.height / 2, f.width / 2, f.height / 2, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw rain
    this.drawRain();

    // Floating particles
    for (let p of this.floatingParticles) {
      this.ctx.fillStyle = `rgba(244, 217, 160, ${p.opacity * 0.3})`;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();

    // Vignette
    this.drawVignette();

    this.ctx.restore();
  }

  drawTitleBackground() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const time = Date.now() * 0.001;

    // Soft animated background
    const skyGrd = this.ctx.createLinearGradient(0, 0, 0, ch);
    skyGrd.addColorStop(0, '#050510');
    skyGrd.addColorStop(1, '#1a1a3a');
    this.ctx.fillStyle = skyGrd;
    this.ctx.fillRect(0, 0, cw, ch);

    // Animated stars
    for (let i = 0; i < 30; i++) {
      const x = (Math.sin(i * 7.3) * 0.5 + 0.5) * cw;
      const y = (Math.cos(i * 11.1) * 0.5 + 0.5) * ch * 0.6;
      const alpha = 0.3 + Math.sin(time + i) * 0.3;
      this.ctx.fillStyle = `rgba(200, 210, 255, ${alpha})`;
      this.ctx.fillRect(x, y, 1.5, 1.5);
    }

    // Subtle rain on title
    this.ctx.strokeStyle = 'rgba(150, 170, 200, 0.15)';
    this.ctx.lineWidth = 0.5;
    for (let i = 0; i < 50; i++) {
      const rx = (i * 67 + time * 30) % cw;
      const ry = (i * 43 + time * 200) % ch;
      this.ctx.beginPath();
      this.ctx.moveTo(rx, ry);
      this.ctx.lineTo(rx - 2, ry + 8);
      this.ctx.stroke();
    }
  }

  drawFarBuildings() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const parallax = this.cameraX * 0.3;

    this.ctx.fillStyle = '#0e0e1e';
    const buildingData = [
      [100, 120], [250, 180], [400, 140], [550, 200], [700, 160],
      [850, 190], [1000, 130], [1150, 170], [1300, 150], [1450, 180]
    ];

    for (let [bx, bh] of buildingData) {
      const sx = bx - parallax;
      const sy = ch - bh - 60;
      this.ctx.fillRect(sx, sy, 60, bh + 60);

      // Dim windows
      this.ctx.fillStyle = 'rgba(244, 200, 100, 0.08)';
      for (let wy = sy + 10; wy < sy + bh; wy += 18) {
        for (let wx = sx + 5; wx < sx + 55; wx += 14) {
          if (Math.sin(wx * 0.3 + wy * 0.5) > 0.3) {
            this.ctx.fillRect(wx, wy, 8, 10);
          }
        }
      }
      this.ctx.fillStyle = '#0e0e1e';
    }
  }

  drawPuddles() {
    const puddlePositions = [180, 400, 700, 950, 1200, 1500, 1800, 2100, 2400, 2700];
    for (let px of puddlePositions) {
      const pw = 30 + Math.sin(px * 0.1) * 15;
      const py = this.groundY;

      // Puddle base
      this.ctx.fillStyle = 'rgba(40, 50, 80, 0.4)';
      this.ctx.beginPath();
      this.ctx.ellipse(px, py + 2, pw / 2, 3, 0, 0, Math.PI * 2);
      this.ctx.fill();

      // Reflection ripple
      const ripple = Math.sin(Date.now() * 0.003 + px) * 2;
      this.ctx.strokeStyle = 'rgba(150, 180, 220, 0.15)';
      this.ctx.lineWidth = 0.5;
      this.ctx.beginPath();
      this.ctx.ellipse(px, py + 2, pw / 3 + ripple, 2, 0, 0, Math.PI * 2);
      this.ctx.stroke();

      // Light reflection from nearby lamps
      this.ctx.fillStyle = 'rgba(255, 220, 140, 0.06)';
      this.ctx.beginPath();
      this.ctx.ellipse(px, py + 1, pw / 4, 2, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }

  drawRain() {
    if (this.rainIntensity <= 0) return;
    this.ctx.strokeStyle = `rgba(150, 170, 220, ${0.2 * this.rainIntensity})`;
    this.ctx.lineWidth = 0.5;
    for (let r of this.raindrops) {
      this.ctx.beginPath();
      this.ctx.moveTo(r.x, r.y);
      this.ctx.lineTo(r.x - 2, r.y + r.length);
      this.ctx.stroke();
    }
  }

  drawVignette() {
    const cw = this.canvas.width;
    const ch = this.canvas.height;
    const grd = this.ctx.createRadialGradient(cw / 2, ch / 2, cw * 0.25, cw / 2, ch / 2, cw * 0.7);
    grd.addColorStop(0, 'rgba(0,0,0,0)');
    grd.addColorStop(1, 'rgba(0,0,0,0.5)');
    this.ctx.fillStyle = grd;
    this.ctx.fillRect(0, 0, cw, ch);
  }

  async savePlayerData() {
    if (window.SaveData && this.playerData) {
      this.playerData.fragmentsCollected = this.fragmentsCollected;
      await SaveData.setPlayerData(this.playerData);
    }
  }

  async start() {
    if (window.SaveData) {
      this.playerData = await SaveData.getPlayerData(PLAYER_DATA_DEFAULTS);
      this.fragmentsCollected = this.playerData.fragmentsCollected || 0;
      document.getElementById('fragmentCount').textContent = `\u2726 ${this.fragmentsCollected} / ${this.totalFragments}`;
    }
    const gameLoop = (timestamp) => {
      const dt = (timestamp - this.lastTime) / 1000;
      this.lastTime = timestamp;
      this.update(dt);
      this.draw();
      requestAnimationFrame(gameLoop);
    };
    requestAnimationFrame(gameLoop);
  }
}