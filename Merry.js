class Merry extends GameObject {
  constructor(x, y) {
    super(x, y, 32, 52);
    this.name = 'Merry';
    this.animTimer = 0;
    this.glowIntensity = 0;
    this.visible = false;
    this.fadeIn = 0;
    this.hairSway = 0;
  }

  update(dt) {
    this.animTimer += dt;
    this.glowIntensity = 0.5 + Math.sin(this.animTimer * 1.5) * 0.3;
    this.hairSway = Math.sin(this.animTimer * 2) * 0.05;
    if (this.visible && this.fadeIn < 1) {
      this.fadeIn = Math.min(1, this.fadeIn + dt * 0.5);
    }
  }

  draw(ctx) {
    if (!this.visible) return;
    ctx.save();
    ctx.globalAlpha = this.fadeIn;

    const cx = this.x + this.width / 2;
    const by = this.y + this.height;

    // Warm glow around Merry
    const grd = ctx.createRadialGradient(cx, by - 26, 5, cx, by - 26, 60);
    grd.addColorStop(0, `rgba(244, 217, 160, ${0.3 * this.glowIntensity})`);
    grd.addColorStop(1, 'rgba(244, 217, 160, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cx - 60, by - 86, 120, 120);

    // Body - green polo shirt
    ctx.fillStyle = '#2a5a3a';
    ctx.beginPath();
    ctx.moveTo(cx - 10, by - 30);
    ctx.lineTo(cx + 10, by - 30);
    ctx.lineTo(cx + 12, by - 6);
    ctx.lineTo(cx - 12, by - 6);
    ctx.closePath();
    ctx.fill();

    // Collar
    ctx.fillStyle = '#1a4a2a';
    ctx.beginPath();
    ctx.moveTo(cx - 5, by - 30);
    ctx.lineTo(cx, by - 26);
    ctx.lineTo(cx + 5, by - 30);
    ctx.closePath();
    ctx.fill();

    // Arms
    ctx.fillStyle = '#2a5a3a';
    ctx.fillRect(cx - 16, by - 28, 6, 16);
    ctx.fillRect(cx + 10, by - 28, 6, 16);

    // Hands
    ctx.fillStyle = '#dbb89a';
    ctx.beginPath();
    ctx.arc(cx - 13, by - 11, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 13, by - 11, 3, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(cx - 8, by - 6, 6, 8);
    ctx.fillRect(cx + 2, by - 6, 6, 8);

    // Shoes
    ctx.fillStyle = '#555';
    ctx.fillRect(cx - 9, by + 1, 8, 3);
    ctx.fillRect(cx + 1, by + 1, 8, 3);

    // Head
    ctx.fillStyle = '#dbb89a';
    ctx.beginPath();
    ctx.ellipse(cx, by - 38, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair (brown, tied up style)
    ctx.save();
    ctx.rotate(this.hairSway);
    ctx.fillStyle = '#5a3a2a';
    ctx.beginPath();
    ctx.ellipse(cx, by - 44, 11, 8, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Side hair
    ctx.fillRect(cx - 11, by - 44, 3, 12);
    ctx.fillRect(cx + 8, by - 44, 3, 12);
    // Top bun
    ctx.beginPath();
    ctx.arc(cx, by - 50, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Eyes
    ctx.fillStyle = '#3a2a1a';
    ctx.beginPath();
    ctx.ellipse(cx - 4, by - 38, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, by - 38, 1.5, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 3.5, by - 39, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4.5, by - 39, 0.6, 0, Math.PI * 2);
    ctx.fill();

    // Mouth (warm smile)
    ctx.strokeStyle = '#a5736a';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(cx, by - 34, 3, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();

    // Blush
    ctx.fillStyle = 'rgba(220, 140, 140, 0.35)';
    ctx.beginPath();
    ctx.ellipse(cx - 7, by - 35, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 7, by - 35, 3, 1.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}