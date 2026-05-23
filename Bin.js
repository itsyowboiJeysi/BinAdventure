class Bin extends GameObject {
  constructor(x, y) {
    super(x, y, 28, 24);
    this.name = 'Bin';
    this.vx = 0;
    this.vy = 0;
    this.speed = 140;
    this.jumpForce = -320;
    this.gravity = 700;
    this.grounded = false;
    this.facing = 1;
    this.animFrame = 0;
    this.animTimer = 0;
    this.isWalking = false;
    this.meowing = false;
    this.meowTimer = 0;
    this.tailAngle = 0;
    this.eyeBlink = 0;
    this.blinkTimer = 0;
  }

  update(dt) {
    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    this.isWalking = Math.abs(this.vx) > 10;
    if (this.isWalking) {
      this.animTimer += dt;
      if (this.animTimer > 0.15) {
        this.animTimer = 0;
        this.animFrame = (this.animFrame + 1) % 4;
      }
    } else {
      this.animFrame = 0;
      this.animTimer = 0;
    }

    if (this.vx > 10) this.facing = 1;
    if (this.vx < -10) this.facing = -1;

    if (this.meowing) {
      this.meowTimer -= dt;
      if (this.meowTimer <= 0) this.meowing = false;
    }

    this.tailAngle = Math.sin(Date.now() * 0.003) * 0.3;
    this.blinkTimer += dt;
    if (this.blinkTimer > 3 + Math.random() * 2) {
      this.blinkTimer = 0;
      this.eyeBlink = 0.15;
    }
    if (this.eyeBlink > 0) this.eyeBlink -= dt;
  }

  meow() {
    this.meowing = true;
    this.meowTimer = 1.0;
  }

  draw(ctx) {
    ctx.save();
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    ctx.translate(cx, cy);
    // FIX: sprite is drawn facing LEFT by default (head at negative x),
    // so facing right (1) needs a horizontal flip, facing left (-1) does not.
    ctx.scale(-this.facing, 1);

    const walkBob = this.isWalking ? Math.sin(this.animFrame * Math.PI / 2) * 2 : 0;

    // Tail
    ctx.save();
    ctx.translate(12, -2);
    ctx.rotate(this.tailAngle);
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(8, -10, 6, -16);
    ctx.quadraticCurveTo(4, -10, -1, -1);
    ctx.fill();
    ctx.restore();

    // Body
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath();
    ctx.ellipse(0, 2 + walkBob, 14, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black patches on body
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(4, -2 + walkBob, 8, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Legs
    const legOffset = this.isWalking ? Math.sin(this.animFrame * Math.PI / 2) * 3 : 0;
    ctx.fillStyle = '#f5f5f0';
    ctx.fillRect(-9, 8 + walkBob, 4, 6 + legOffset);
    ctx.fillRect(-2, 8 + walkBob, 4, 6 - legOffset);
    ctx.fillRect(3, 8 + walkBob, 4, 6 + legOffset);
    ctx.fillRect(8, 8 + walkBob, 4, 6 - legOffset);

    // Paws
    ctx.fillStyle = '#eee';
    ctx.fillRect(-10, 13 + walkBob + legOffset, 6, 2);
    ctx.fillRect(-3, 13 + walkBob - legOffset, 6, 2);
    ctx.fillRect(2, 13 + walkBob + legOffset, 6, 2);
    ctx.fillRect(7, 13 + walkBob - legOffset, 6, 2);

    // Head
    ctx.fillStyle = '#f5f5f0';
    ctx.beginPath();
    ctx.ellipse(-8, -6 + walkBob, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();

    // Black head patch
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.ellipse(-8, -11 + walkBob, 8, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Ears
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.moveTo(-14, -11 + walkBob);
    ctx.lineTo(-17, -20 + walkBob);
    ctx.lineTo(-10, -13 + walkBob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2, -11 + walkBob);
    ctx.lineTo(1, -20 + walkBob);
    ctx.lineTo(-6, -13 + walkBob);
    ctx.fill();

    // Inner ears
    ctx.fillStyle = '#d4967a';
    ctx.beginPath();
    ctx.moveTo(-14, -12 + walkBob);
    ctx.lineTo(-16, -18 + walkBob);
    ctx.lineTo(-11, -13 + walkBob);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2, -12 + walkBob);
    ctx.lineTo(0, -18 + walkBob);
    ctx.lineTo(-5, -13 + walkBob);
    ctx.fill();

    // Eyes
    if (this.eyeBlink > 0) {
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(-13, -7 + walkBob, 4, 1);
      ctx.fillRect(-7, -7 + walkBob, 4, 1);
    } else {
      ctx.fillStyle = '#3a5a3a';
      ctx.beginPath();
      ctx.ellipse(-11, -6 + walkBob, 2.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-5, -6 + walkBob, 2.5, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.ellipse(-11, -6 + walkBob, 1.2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(-5, -6 + walkBob, 1.2, 1.8, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.arc(-12, -7 + walkBob, 0.7, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(-6, -7 + walkBob, 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    // Nose
    ctx.fillStyle = '#d4967a';
    ctx.beginPath();
    ctx.ellipse(-8, -2 + walkBob, 1.5, 1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Whiskers
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(-12, -3 + walkBob); ctx.lineTo(-22, -5 + walkBob);
    ctx.moveTo(-12, -2 + walkBob); ctx.lineTo(-22, -1 + walkBob);
    ctx.moveTo(-4, -3 + walkBob); ctx.lineTo(4, -5 + walkBob);
    ctx.moveTo(-4, -2 + walkBob); ctx.lineTo(4, -1 + walkBob);
    ctx.stroke();

    // Meow bubble
    if (this.meowing) {
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.beginPath();
      ctx.ellipse(-8, -28 + walkBob, 16, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#333';
      ctx.font = '8px Georgia';
      ctx.textAlign = 'center';
      ctx.fillText('Meow~', -8, -25 + walkBob);
    }

    ctx.restore();
  }
}