let enemiesArray = [];
let bossBulletsArray = [];
let activeBoss = null;
let lastBossScoreThreshold = 0;

const MORTY_SPRITES = [
  'pocket-morty.png', 'evil-morty.png', 'wizard-morty.png', 'spooky-morty.png',
  'punk-morty.png', 'renegade-morty.png', 'animatronic-morty.png', 'spliced-morty.png',
  'pizza-morty.png', 'dracula-morty.png', 'ghost-morty.png', 'angry-morty.png',
];
const BOSS_SPRITE = 'evil-morty.png';

// Enemy "kinds" give the regular spawns distinct strategic identities.
const ENEMY_KINDS = {
  normal:   { hp: 1, sizeMult: 1,    speedMult: 1,    scoreValue: 5,  tint: null,      chance: 0.45 },
  fast:     { hp: 1, sizeMult: 0.8,  speedMult: 1.8,  scoreValue: 8,  tint: "#29b6f6", chance: 0.25 },
  tank:     { hp: 4, sizeMult: 1.35, speedMult: 0.65, scoreValue: 15, tint: "#8d6e63", chance: 0.2 },
  splitter: { hp: 2, sizeMult: 1,    speedMult: 1,    scoreValue: 10, tint: "#ab47bc", chance: 0.1 },
};

const pickEnemyKind = () => {
  const roll = Math.random();
  let cumulative = 0;
  for (const key of Object.keys(ENEMY_KINDS)) {
    cumulative += ENEMY_KINDS[key].chance;
    if (roll <= cumulative) return key;
  }
  return "normal";
};

class Enemies {
  constructor(difficulty, forcedKind, x) {
    this.spriteIdx = Math.floor(Math.random() * MORTY_SPRITES.length);
    this.kind = forcedKind || pickEnemyKind();
    const def = ENEMY_KINDS[this.kind];
    this.width = 70 * def.sizeMult;
    this.height = 80 * def.sizeMult;
    this.x = x !== undefined ? x : Math.floor(Math.random() * (gameBoard.width - this.width));
    this.y = 0;
    this.hp = def.hp;
    this.maxHp = def.hp;
    this.scoreValue = def.scoreValue;
    this.tint = def.tint;
    this.isBoss = false;
    this.isSplitChild = false;

    this.zigzag = this.kind === "fast" ? Math.random() < 0.6 : Math.random() < 0.25;
    this.zigzagAmp = 1.5 + Math.random() * 2;
    this.zigzagFreq = 0.03 + Math.random() * 0.03;
    this.birthFrame = frames;

    const baseSpeed = (1 + Math.floor(Math.random() * 4)) * def.speedMult;
    this.speedY = baseSpeed + Math.floor(difficulty * 0.4);
  }

  drawEnemies() {
    const img = new Image();
    img.src = 'src/images/' + MORTY_SPRITES[this.spriteIdx];
    this.y += this.speedY;
    if (this.zigzag) {
      this.x += Math.sin((frames - this.birthFrame) * this.zigzagFreq) * this.zigzagAmp;
      this.x = Math.max(0, Math.min(gameBoard.width - this.width, this.x));
    }

    ctx.save();
    if (this.tint) {
      ctx.shadowColor = this.tint;
      ctx.shadowBlur = 12;
    }
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
    ctx.restore();

    if (this.maxHp > 1) {
      ctx.fillStyle = "black";
      ctx.fillRect(this.x, this.y - 8, this.width, 5);
      ctx.fillStyle = this.tint || "lime";
      ctx.fillRect(this.x, this.y - 8, this.width * (this.hp / this.maxHp), 5);
    }
  }

  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

class Boss {
  constructor(difficulty) {
    this.width = 140;
    this.height = 150;
    this.x = gameBoard.width / 2 - this.width / 2;
    this.y = -this.height;
    this.hoverY = 40;
    this.maxHp = 16 + Math.floor(difficulty * 5);
    this.hp = this.maxHp;
    this.scoreValue = 150;
    this.isBoss = true;
    this.dir = 1;
    this.speed = 1.6 + difficulty * 0.1;
    this.fireCooldown = 100;
    this.phase = "entering"; // entering -> hovering
  }

  drawEnemies() {
    const img = new Image();
    img.src = 'src/images/' + BOSS_SPRITE;

    if (this.phase === "entering") {
      this.y += 2;
      if (this.y >= this.hoverY) {
        this.y = this.hoverY;
        this.phase = "hovering";
      }
    } else {
      this.x += this.speed * this.dir;
      if (this.x <= 0 || this.x + this.width >= gameBoard.width) {
        this.dir *= -1;
      }
      this.fireCooldown -= 1;
      if (this.fireCooldown <= 0) {
        this.fireCooldown = 95;
        this.shootPattern();
      }
    }

    ctx.save();
    ctx.shadowColor = "red";
    ctx.shadowBlur = 20;
    ctx.drawImage(img, this.x, this.y, this.width, this.height);
    ctx.restore();

    // health bar
    ctx.fillStyle = "black";
    ctx.fillRect(this.x, this.y - 14, this.width, 8);
    ctx.fillStyle = "red";
    ctx.fillRect(this.x, this.y - 14, this.width * Math.max(0, this.hp / this.maxHp), 8);
    ctx.fillStyle = "white";
    ctx.font = "14px Ricks, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("BOSS MORTY", this.x + this.width / 2, this.y - 20);
    ctx.textAlign = "left";
  }

  shootPattern() {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height;
    const targetX = bigRick.x + bigRick.width / 2;
    const targetY = bigRick.y;
    const baseAngle = Math.atan2(targetX - cx, targetY - cy);
    [-0.25, 0, 0.25].forEach((offset) => {
      bossBulletsArray.push(new BossBullet(cx, cy, baseAngle + offset));
    });
  }

  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

class BossBullet {
  constructor(x, y, angle) {
    this.width = 18;
    this.height = 18;
    this.x = x - this.width / 2;
    this.y = y;
    this.speed = 4.2;
    this.speedX = Math.sin(angle) * this.speed;
    this.speedY = Math.cos(angle) * this.speed;
  }
  draw() {
    this.x += this.speedX;
    this.y += this.speedY;
    ctx.save();
    ctx.fillStyle = "#d500f9";
    ctx.shadowColor = "#d500f9";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

const enemySpawnInterval = () => {
  const difficulty = getDifficultyLevel();
  const base = Math.max(35, 120 - Math.floor(difficulty * 6));
  return activeBoss ? base * 3 : base; // fewer regular Mortys while a boss is up
};

const MAX_ENEMIES_DURING_BOSS = 2;
const BOSS_SCORE_INTERVAL = 60;
const BOSS_COOLDOWN_FRAMES = 12 * 60; // ~12s of breathing room between bosses
let bossCooldownUntil = 0;

const addNewEnemiesToEnemiesArray = () => {
  if (
    !activeBoss &&
    frames >= bossCooldownUntil &&
    score >= lastBossScoreThreshold + BOSS_SCORE_INTERVAL
  ) {
    activeBoss = new Boss(getDifficultyLevel());
    return;
  }
  if (activeBoss && enemiesArray.length >= MAX_ENEMIES_DURING_BOSS) return;
  if (frames % enemySpawnInterval() === 0) {
    enemiesArray.push(new Enemies(getDifficultyLevel()));
  }
};

const splitEnemy = (enemy) => {
  const childX1 = Math.max(0, enemy.x - 20);
  const childX2 = Math.min(gameBoard.width - 50, enemy.x + 20);
  [childX1, childX2].forEach((x) => {
    const child = new Enemies(getDifficultyLevel(), "normal", x);
    child.y = enemy.y;
    child.isSplitChild = true;
    enemiesArray.push(child);
  });
};

const createNewEnemies = () => {
  enemiesArray.forEach((element) => element.drawEnemies());
  if (activeBoss) {
    activeBoss.drawEnemies();
    if (activeBoss.hp <= 0) {
      onEnemyKilled(activeBoss);
      maybeDropPowerup(activeBoss);
      maybeDropPowerup(activeBoss);
      activeBoss = null;
      lastBossScoreThreshold = score;
      bossCooldownUntil = frames + BOSS_COOLDOWN_FRAMES;
    }
  }
};

let reflectedBulletsArray = [];

class ReflectedBullet {
  constructor(x, y) {
    this.width = 22;
    this.height = 22;
    this.x = x - this.width / 2;
    this.y = y - this.height / 2;
    this.speed = 11;
    this.damage = 4;
  }
  draw() {
    this.y -= this.speed;
    ctx.save();
    ctx.fillStyle = "#ffeb3b";
    ctx.shadowColor = "#ffeb3b";
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

const updateBossBullets = () => {
  for (let i = bossBulletsArray.length - 1; i >= 0; i -= 1) {
    const b = bossBulletsArray[i];
    b.draw();
    if (b.y > gameBoard.height || b.y < -50 || b.x < -50 || b.x > gameBoard.width + 50) {
      bossBulletsArray.splice(i, 1);
      continue;
    }
    if (
      b.bottom() > bigRick.top() &&
      b.top() < bigRick.bottom() &&
      b.left() < bigRick.right() &&
      b.right() > bigRick.left()
    ) {
      if (bigRick.parryWindow > 0) {
        portal.currentTime = 0;
        portal.play();
        reflectedBulletsArray.push(new ReflectedBullet(b.x + b.width / 2, b.y + b.height / 2));
        bigRick.parryWindow = 0;
        bigRick.invulnTimer = Math.max(bigRick.invulnTimer, 20);
      } else {
        bigRick.takeDamage(1);
      }
      bossBulletsArray.splice(i, 1);
    }
  }

  for (let i = reflectedBulletsArray.length - 1; i >= 0; i -= 1) {
    const rb = reflectedBulletsArray[i];
    rb.draw();
    if (rb.y + rb.height < 0) {
      reflectedBulletsArray.splice(i, 1);
      continue;
    }
    if (
      activeBoss &&
      rb.bottom() > activeBoss.top() &&
      rb.top() < activeBoss.bottom() &&
      rb.left() < activeBoss.right() &&
      rb.right() > activeBoss.left()
    ) {
      hitMorty.currentTime = 0;
      hitMorty.play();
      activeBoss.hp -= rb.damage;
      reflectedBulletsArray.splice(i, 1);
    }
  }
};

const playerBulletsHitBoss = (bulletsArr) => {
  if (!activeBoss) return;
  for (let i = bulletsArr.length - 1; i >= 0; i -= 1) {
    const bullet = bulletsArr[i];
    if (
      bullet.bottom() > activeBoss.top() &&
      bullet.top() < activeBoss.bottom() &&
      bullet.left() < activeBoss.right() &&
      bullet.right() > activeBoss.left()
    ) {
      hitMorty.currentTime = 0;
      hitMorty.play();
      activeBoss.hp -= bullet.damage;
      if (bullet.pierce > 0) {
        bullet.pierce -= 1;
      } else {
        bulletsArr.splice(i, 1);
      }
    }
  }
};
