class Lamp extends GameObject {
  constructor(x, y, height) {
    super(x, y, 6, height || 50);
    this.name = 'Lamp';
    this.lampHeight = height || 50;
    this.flickerTimer = Math.random() * 100;
  }

  update(dt) {
    this.flickerTimer += dt;
  }

  draw(ctx) {
    const bx = this.x + this.width / 2;
    const ty = this.y;
    const by = this.y + this.lampHeight;

    // Pole
    ctx.fillStyle = '#2a2a3a';
    ctx.fillRect(bx - 2, ty + 8, 4, this.lampHeight - 8);

    // Lamp fixture
    ctx.fillStyle = '#3a3a4a';
    ctx.fillRect(bx - 5, ty + 4, 10, 6);
    ctx.fillRect(bx - 3, ty, 6, 5);

    // Light glow
    const flicker = 0.6 + Math.sin(this.flickerTimer * 3) * 0.1 + Math.sin(this.flickerTimer * 7) * 0.05;
    const grd = ctx.createRadialGradient(bx, ty + 8, 2, bx, ty + 20, 50);
    grd.addColorStop(0, `rgba(255, 220, 140, ${flicker * 0.6})`);
    grd.addColorStop(0.4, `rgba(255, 200, 100, ${flicker * 0.2})`);
    grd.addColorStop(1, 'rgba(255, 200, 100, 0)');
    ctx.fillStyle = grd;
    ctx.fillRect(bx - 50, ty - 10, 100, 80);

    // Ground light pool
    const groundGrd = ctx.createRadialGradient(bx, by, 2, bx, by, 40);
    groundGrd.addColorStop(0, `rgba(255, 220, 140, ${flicker * 0.15})`);
    groundGrd.addColorStop(1, 'rgba(255, 220, 140, 0)');
    ctx.fillStyle = groundGrd;
    ctx.fillRect(bx - 40, by - 5, 80, 15);

    // Bulb
    ctx.fillStyle = `rgba(255, 230, 160, ${flicker})`;
    ctx.beginPath();
    ctx.arc(bx, ty + 6, 3, 0, Math.PI * 2);
    ctx.fill();
  }
}