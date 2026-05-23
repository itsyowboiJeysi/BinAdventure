class Platform extends GameObject {
  constructor(x, y, width, height, type) {
    super(x, y, width, height);
    this.name = 'Platform';
    this.type = type || 'ground';
  }

  update(dt) { }

  draw(ctx) {
    if (this.type === 'ground') {
      ctx.fillStyle = '#1a1a2e';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#2a2a3e';
      ctx.fillRect(this.x, this.y, this.width, 3);
      // Cobblestone pattern
      ctx.fillStyle = '#222238';
      for (let i = 0; i < this.width; i += 12) {
        ctx.fillRect(this.x + i, this.y + 4, 10, 6);
      }
      for (let i = 6; i < this.width; i += 12) {
        ctx.fillRect(this.x + i, this.y + 11, 10, 6);
      }
    } else if (this.type === 'building') {
      ctx.fillStyle = '#151525';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      // Windows
      for (let wy = this.y + 8; wy < this.y + this.height - 12; wy += 20) {
        for (let wx = this.x + 6; wx < this.x + this.width - 10; wx += 18) {
          const lit = Math.sin(wx * 0.1 + wy * 0.2) > 0;
          ctx.fillStyle = lit ? 'rgba(244, 200, 100, 0.4)' : 'rgba(30, 30, 50, 0.8)';
          ctx.fillRect(wx, wy, 10, 12);
          if (lit) {
            ctx.fillStyle = 'rgba(244, 200, 100, 0.1)';
            ctx.fillRect(wx - 2, wy - 2, 14, 16);
          }
        }
      }
    } else if (this.type === 'rooftop') {
      ctx.fillStyle = '#1e1e32';
      ctx.fillRect(this.x, this.y, this.width, this.height);
      ctx.fillStyle = '#2a2a42';
      ctx.fillRect(this.x - 3, this.y, this.width + 6, 4);
    } else if (this.type === 'invisible') {
      // invisible collision only
    }
  }
}