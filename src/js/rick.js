let rickImg = new Image();

const BASE_FIRE_RATE = 14;

class Rick {
  constructor(color) {
    this.color = color;
    this.width = 100;
    this.height = 100;
    this.x = gameBoard.width / 2 - this.width / 2;
    this.y = gameBoard.height - this.height;
    this.speedX = 0;
    this.speedY = 0;
    this.maxSpeed = 9;
    this.accel = 1.1;
    this.friction = 0.85;
    this.lifes = 10;
    this.maxLifes = 10;

    // power-up state
    this.shieldTimer = 0;
    this.rapidFireTimer = 0;
    this.multiShotTimer = 0;
    this.pierceTimer = 0;
    this.powerTimer = 0;

    this.fireCooldown = 0;
    this.invulnTimer = 0;

    // parry system
    this.parryWindow = 0;
    this.parryCooldown = 0;
  }

  tryParry() {
    if (this.parryCooldown > 0) return false;
    this.parryWindow = 14;
    this.parryCooldown = 55;
    return true;
  }

  drawRick() {
    if (!moveLeft && !moveRight && !moveBackward) {
      rickImg.src = 'src/images/rick.png';
    } else if (moveLeft) {
      rickImg.src = 'src/images/rick-left2.png';
    } else if (moveRight) {
      rickImg.src = 'src/images/rick-right2.png';
    } else if (moveBackward) {
      rickImg.src = 'src/images/rick-front2.png';
    }

    if (this.invulnTimer > 0 && Math.floor(frames / 4) % 2 === 0) {
      ctx.globalAlpha = 0.4;
    }
    ctx.drawImage(rickImg, this.x, this.y, this.width, this.height);
    ctx.globalAlpha = 1;

    if (this.shieldTimer > 0) {
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(80, 200, 255, 0.8)";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    if (this.parryWindow > 0) {
      ctx.beginPath();
      ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width * 0.75, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 235, 59, 0.9)";
      ctx.lineWidth = 5;
      ctx.stroke();
    }
  }

  rickNewPos() {
    this.speedX = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speedX));
    this.speedY = Math.max(-this.maxSpeed, Math.min(this.maxSpeed, this.speedY));

    this.y += this.speedY;
    if (this.y < 0) this.y = 0;
    if (this.y > gameBoard.height - this.height) this.y = gameBoard.height - this.height;

    this.x += this.speedX;
    if (this.x < 0) this.x = 0;
    if (this.x > gameBoard.width - this.width) this.x = gameBoard.width - this.width;

    if (!moveLeft && !moveRight) this.speedX *= this.friction;
    if (!moveBackward && !moveUp) this.speedY *= this.friction;
    if (Math.abs(this.speedX) < 0.1) this.speedX = 0;
    if (Math.abs(this.speedY) < 0.1) this.speedY = 0;

    if (this.shieldTimer > 0) this.shieldTimer -= 1;
    if (this.rapidFireTimer > 0) this.rapidFireTimer -= 1;
    if (this.multiShotTimer > 0) this.multiShotTimer -= 1;
    if (this.pierceTimer > 0) this.pierceTimer -= 1;
    if (this.powerTimer > 0) this.powerTimer -= 1;
    if (this.invulnTimer > 0) this.invulnTimer -= 1;
    if (this.fireCooldown > 0) this.fireCooldown -= 1;
    if (this.parryWindow > 0) this.parryWindow -= 1;
    if (this.parryCooldown > 0) this.parryCooldown -= 1;
  }

  tryFire() {
    if (this.fireCooldown > 0) return false;
    this.fireCooldown = this.rapidFireTimer > 0 ? Math.ceil(BASE_FIRE_RATE / 2.4) : BASE_FIRE_RATE;
    return true;
  }

  takeDamage(amount) {
    if (this.shieldTimer > 0 || this.invulnTimer > 0) return;
    this.lifes -= amount;
    this.invulnTimer = 45;
  }

  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

const rickHitByEnemy = (arr) => {
  for (let i = arr.length - 1; i >= 0; i -= 1) {
    const enemy = arr[i];
    if (
      enemy.bottom() > bigRick.top() &&
      enemy.top() < bigRick.bottom() &&
      enemy.left() < bigRick.right() &&
      enemy.right() > bigRick.left()
    ) {
      arr.splice(i, 1);
      bigRick.takeDamage(enemy.isBoss ? 4 : 2);
    }
  }
};
