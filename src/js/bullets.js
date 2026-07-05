let pickle = new Image();
pickle.src = 'src/images/pickle2.png';

let bulletsArray = [];

class Bullets {
  constructor(x, angle) {
    this.width = 25;
    this.height = 50;
    this.x = x;
    this.y = bigRick.y;
    this.angle = angle || 0; // radians offset from straight up
    this.baseSpeed = 10;
    this.speedX = Math.sin(this.angle) * this.baseSpeed;
    this.speedY = -Math.cos(this.angle) * this.baseSpeed;
    this.damage = bigRick.powerTimer > 0 ? 2 : 1;
    this.pierce = bigRick.pierceTimer > 0 ? 2 : 0;
    this.powered = bigRick.powerTimer > 0;
  }

  drawBullets() {
    ctx.save();
    if (this.powered) {
      ctx.shadowColor = "#ff6d00";
      ctx.shadowBlur = 14;
    }
    if (this.pierce > 0) {
      ctx.shadowColor = "#00e5ff";
      ctx.shadowBlur = 14;
    }
    ctx.drawImage(pickle, this.x, this.y, this.width, this.height);
    ctx.restore();
  }

  bulletNewPos() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  offScreen() {
    return this.y + this.height < 0 || this.x < -this.width || this.x > gameBoard.width + this.width;
  }

  removeBullets(idx, arr) {
    if (this.offScreen()) {
      arr.splice(idx, 1);
    }
  }

  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

const fireWeapon = () => {
  if (!bigRick.tryFire()) return;
  shoot.currentTime = 0;
  shoot.play();
  const centerX = bigRick.x + bigRick.width / 2;

  if (bigRick.multiShotTimer > 0) {
    const angles = [-0.28, 0, 0.28];
    angles.forEach((a) => bulletsArray.push(new Bullets(centerX - 12.5, a)));
  } else {
    bulletsArray.push(new Bullets(centerX - 12.5, 0));
  }
};

// Collision check requires BOTH edges to overlap on each axis, not just one.
const enemyHitByBullet = (arr1, arr2) => {
  for (let i = arr2.length - 1; i >= 0; i -= 1) {
    const bullet = arr2[i];
    let bulletSpent = false;
    for (let j = arr1.length - 1; j >= 0; j -= 1) {
      const enemy = arr1[j];
      if (
        bullet.bottom() > enemy.top() &&
        bullet.top() < enemy.bottom() &&
        bullet.left() < enemy.right() &&
        bullet.right() > enemy.left()
      ) {
        hitMorty.currentTime = 0;
        hitMorty.play();
        enemy.hp -= bullet.damage;
        if (enemy.hp <= 0) {
          if (enemy.kind === "splitter" && !enemy.isSplitChild) {
            splitEnemy(enemy);
          }
          onEnemyKilled(enemy);
          arr1.splice(j, 1);
        }
        if (bullet.pierce > 0) {
          bullet.pierce -= 1;
        } else {
          bulletSpent = true;
          break;
        }
      }
    }
    if (bulletSpent) {
      arr2.splice(i, 1);
    }
  }
};

const createNewBullets = () => {
  bulletsArray.forEach((element, idx) => {
    element.drawBullets();
    element.bulletNewPos();
    element.removeBullets(idx, bulletsArray);
  });
};
