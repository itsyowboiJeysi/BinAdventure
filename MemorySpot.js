class MemorySpot extends GameObject {
  constructor(x, y, dialogue, isLetter) {
    super(x, y, 24, 24);
    this.name = 'MemorySpot';
    this.dialogue = dialogue;
    this.isLetter = isLetter || false;
    this.collected = false;
    this.glowTimer = Math.random() * Math.PI * 2;
    this.floatOffset = 0;
    this.particles = [];
    for (let i = 0; i < 5; i++) {
      this.particles.push({
        x: Math.random() * 20 - 10,
        y: Math.random() * 20 - 10,
        speed: 0.3 + Math.random() * 0.5,
        angle: Math.random() * Math.PI * 2
      });
    }
  }

  update(dt) {
    if (this.collected) return;
    this.glowTimer += dt * 2;
    this.floatOffset = Math.sin(this.glowTimer) * 4;
    for (let p of this.particles) {
      p.angle += p.speed * dt;
      p.x = Math.cos(p.angle) * (8 + Math.sin(p.angle * 2) * 4);
      p.y = Math.sin(p.angle) * (8 + Math.cos(p.angle * 3) * 4);
    }
  }

  draw(ctx) {
    if (this.collected) return;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2 + this.floatOffset;

    // Glow
    const glowAlpha = 0.3 + Math.sin(this.glowTimer) * 0.15;
    const grd = ctx.createRadialGradient(cx, cy, 2, cx, cy, 20);
    if (this.isLetter) {
      grd.addColorStop(0, `rgba(255, 180, 180, ${glowAlpha})`);
      grd.addColorStop(1, 'rgba(255, 180, 180, 0)');
    } else {
      grd.addColorStop(0, `rgba(244, 217, 160, ${glowAlpha})`);
      grd.addColorStop(1, 'rgba(244, 217, 160, 0)');
    }
    ctx.fillStyle = grd;
    ctx.fillRect(cx - 20, cy - 20, 40, 40);

    // Particles
    for (let p of this.particles) {
      ctx.fillStyle = this.isLetter ? 'rgba(255,180,180,0.6)' : 'rgba(244,217,160,0.5)';
      ctx.beginPath();
      ctx.arc(cx + p.x, cy + p.y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Core icon
    if (this.isLetter) {
      // Letter envelope
      ctx.fillStyle = '#f4d9a0';
      ctx.fillRect(cx - 7, cy - 4, 14, 10);
      ctx.fillStyle = '#e8c88a';
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 4);
      ctx.lineTo(cx, cy + 2);
      ctx.lineTo(cx + 7, cy - 4);
      ctx.closePath();
      ctx.fill();
      // Heart seal
      ctx.fillStyle = '#d46a6a';
      ctx.beginPath();
      ctx.arc(cx - 2, cy + 1, 2, 0, Math.PI * 2);
      ctx.arc(cx + 2, cy + 1, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 2);
      ctx.lineTo(cx, cy + 5);
      ctx.lineTo(cx + 4, cy + 2);
      ctx.fill();
    } else {
      // Memory orb
      ctx.fillStyle = 'rgba(244, 217, 160, 0.9)';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(cx - 1.5, cy - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}