class Fragment extends GameObject {
  constructor(x, y, memoryText) {
    super(x, y, 16, 16);
    this.name = 'Fragment';
    this.memoryText = memoryText;
    this.collected = false;
    this.glowTimer = Math.random() * Math.PI * 2;
    this.floatOffset = 0;
  }

  update(dt) {
    if (this.collected) return;
    this.glowTimer += dt * 3;
    this.floatOffset = Math.sin(this.glowTimer) * 3;
  }

  draw(ctx) {
    if (this.collected) return;
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2 + this.floatOffset;

    // Sparkle glow
    const alpha = 0.4 + Math.sin(this.glowTimer) * 0.2;
    const grd = ctx.createRadialGradient(cx, cy, 1, cx, cy, 14);
    grd.addColorStop(0, `rgba(180, 220, 255, ${alpha})`);
    grd.addColorStop(1, 'rgba(180, 220, 255, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cx - 14, cy - 14, 28, 28);

    // Star shape
    ctx.fillStyle = `rgba(200, 230, 255, ${0.8 + Math.sin(this.glowTimer) * 0.2})`;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.glowTimer * 0.3);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.fillRect(-1, -5, 2, 10);
    }
    ctx.restore();

    // Center
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx, cy, 2, 0, Math.PI * 2);
    ctx.fill();
  }
}