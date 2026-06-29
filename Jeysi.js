class Jeysi extends GameObject {
  constructor(x, y) {
    super(x, y, 32, 52);
    this.name = 'Jeysi';
    this.animTimer = 0;
    this.glowIntensity = 0;
    this.visible = false;
    this.fadeIn = 0;
    this.hairBounce = 0;
    this.waveTimer = 0;
    this.waving = false;
  }

  update(dt) {
    this.animTimer += dt;
    this.glowIntensity = 0.5 + Math.sin(this.animTimer * 1.8) * 0.3;
    this.hairBounce = Math.sin(this.animTimer * 2.5) * 0.04;
    this.waveTimer += dt;
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

    // Warm pink/lavender glow around Jeysi
    const grd = ctx.createRadialGradient(cx, by - 26, 5, cx, by - 26, 55);
    grd.addColorStop(0, `rgba(220, 180, 240, ${0.3 * this.glowIntensity})`);
    grd.addColorStop(1, 'rgba(220, 180, 240, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(cx - 60, by - 86, 120, 120);

    // Body - lavender hoodie / casual top
    ctx.fillStyle = '#7a6abf';
    ctx.beginPath();
    ctx.moveTo(cx - 10, by - 30);
    ctx.lineTo(cx + 10, by - 30);
    ctx.lineTo(cx + 13, by - 6);
    ctx.lineTo(cx - 13, by - 6);
    ctx.closePath();
    ctx.fill();

    // Hoodie pocket
    ctx.fillStyle = '#6a5aaf';
    ctx.beginPath();
    ctx.roundRect(cx - 6, by - 18, 12, 8, 2);
    ctx.fill();

    // Arms
    ctx.fillStyle = '#7a6abf';
    ctx.fillRect(cx - 16, by - 28, 6, 15);
    ctx.fillRect(cx + 10, by - 28, 6, 15);

    // Waving hand (right arm lifted)
    const waveAngle = Math.sin(this.waveTimer * 4) * 0.4;
    ctx.save();
    ctx.translate(cx + 13, by - 22);
    ctx.rotate(-0.6 + waveAngle);
    ctx.fillStyle = '#7a6abf';
    ctx.fillRect(0, -8, 6, 10);
    ctx.fillStyle = '#e8c8a0';
    ctx.beginPath();
    ctx.arc(3, -8, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Left hand (resting)
    ctx.fillStyle = '#e8c8a0';
    ctx.beginPath();
    ctx.arc(cx - 13, by - 13, 3, 0, Math.PI * 2);
    ctx.fill();

    // Skirt / pants — soft lilac
    ctx.fillStyle = '#9b8fd4';
    ctx.beginPath();
    ctx.moveTo(cx - 10, by - 6);
    ctx.lineTo(cx + 10, by - 6);
    ctx.lineTo(cx + 8, by + 2);
    ctx.lineTo(cx - 8, by + 2);
    ctx.closePath();
    ctx.fill();

    // Legs
    ctx.fillStyle = '#3a3a5a';
    ctx.fillRect(cx - 7, by - 4, 5, 7);
    ctx.fillRect(cx + 2, by - 4, 5, 7);

    // Shoes — little boots
    ctx.fillStyle = '#4a3060';
    ctx.fillRect(cx - 8, by + 2, 7, 3);
    ctx.fillRect(cx + 1, by + 2, 7, 3);

    // Head
    ctx.fillStyle = '#e8c8a0';
    ctx.beginPath();
    ctx.ellipse(cx, by - 38, 10, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Hair — long, dark, wavy with highlights
    ctx.save();
    
    ctx.fillStyle = '#2a1a0a';
    // Top hair
    ctx.beginPath();
    ctx.ellipse(cx, by - 45, 11, 7, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    // Long hair left side
    ctx.beginPath();
    ctx.moveTo(cx - 11, by - 44);
    ctx.quadraticCurveTo(cx - 15, by - 28, cx - 12, by - 20);
    ctx.quadraticCurveTo(cx - 9, by - 14, cx - 13, by - 10);
    ctx.lineTo(cx - 8, by - 10);
    ctx.quadraticCurveTo(cx - 6, by - 20, cx - 8, by - 30);
    ctx.lineTo(cx - 8, by - 44);
    ctx.closePath();
    ctx.fill();
    // Long hair right side
    ctx.beginPath();
    ctx.moveTo(cx + 11, by - 44);
    ctx.quadraticCurveTo(cx + 15, by - 28, cx + 12, by - 20);
    ctx.quadraticCurveTo(cx + 9, by - 14, cx + 13, by - 10);
    ctx.lineTo(cx + 8, by - 10);
    ctx.quadraticCurveTo(cx + 6, by - 20, cx + 8, by - 30);
    ctx.lineTo(cx + 8, by - 44);
    ctx.closePath();
    ctx.fill();
    // Hair highlight streak
    ctx.fillStyle = 'rgba(120, 80, 40, 0.5)';
    ctx.beginPath();
    ctx.moveTo(cx - 4, by - 49);
    ctx.quadraticCurveTo(cx - 3, by - 38, cx - 5, by - 30);
    ctx.lineTo(cx - 3, by - 30);
    ctx.quadraticCurveTo(cx - 1, by - 38, cx - 2, by - 49);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Small hair clip / pin on left
    ctx.fillStyle = '#e060a0';
    ctx.beginPath();
    ctx.arc(cx - 8, by - 47, 2, 0, Math.PI * 2);
    ctx.fill();

    // Eyes — lively, expressive
    ctx.fillStyle = '#3a2010';
    ctx.beginPath();
    ctx.ellipse(cx - 4, by - 38, 1.8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 4, by - 38, 1.8, 2.2, 0, 0, Math.PI * 2);
    ctx.fill();
    // Eye shine
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(cx - 3.2, by - 39.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 4.8, by - 39.2, 0.7, 0, Math.PI * 2);
    ctx.fill();
    // Extra sparkle
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.beginPath();
    ctx.arc(cx - 4.5, by - 37.2, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Eyebrows — slightly arched, friendly
    ctx.strokeStyle = '#2a1a0a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx - 4, by - 41, 3, Math.PI + 0.3, Math.PI * 2 - 0.3);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx + 4, by - 41, 3, Math.PI + 0.3, Math.PI * 2 - 0.3);
    ctx.stroke();

    // Nose — small
    ctx.fillStyle = '#c8a080';
    ctx.beginPath();
    ctx.ellipse(cx, by - 33.5, 1.2, 0.8, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mouth — bright cheerful smile
    ctx.strokeStyle = '#c07060';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, by - 31, 3.5, 0.05 * Math.PI, 0.95 * Math.PI);
    ctx.stroke();

    // Blush — more vibrant
    ctx.fillStyle = 'rgba(240, 120, 160, 0.3)';
    ctx.beginPath();
    ctx.ellipse(cx - 7.5, by - 34, 3.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 7.5, by - 34, 3.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}