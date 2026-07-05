let powerupsArray = [];

const POWERUP_TYPES = [
  { key: "shield", label: "S", color: "#29b6f6", chance: 0.20 },
  { key: "rapid", label: "R", color: "#ffca28", chance: 0.20 },
  { key: "multi", label: "M", color: "#ab47bc", chance: 0.18 },
  { key: "pierce", label: "P", color: "#00e5ff", chance: 0.16 },
  { key: "power", label: "X2", color: "#ff6d00", chance: 0.14 },
  { key: "life", label: "+1", color: "#66bb6a", chance: 0.08 },
  { key: "bomb", label: "B", color: "#ef5350", chance: 0.04 },
];

class Powerup {
  constructor(x, y, type) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 34;
    this.height = 34;
    this.speedY = 2.5;
  }

  draw() {
    const def = POWERUP_TYPES.find((p) => p.key === this.type);
    ctx.save();
    ctx.fillStyle = def.color;
    ctx.beginPath();
    ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.font = "16px Ricks, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(def.label, this.x + this.width / 2, this.y + this.height / 2 + 6);
    ctx.restore();
    this.y += this.speedY;
  }

  top() { return this.y; }
  bottom() { return this.y + this.height; }
  left() { return this.x; }
  right() { return this.x + this.width; }
}

const maybeDropPowerup = (enemy) => {
  const dropChance = enemy.isElite ? 0.55 : 0.09;
  if (Math.random() > dropChance) return;
  const roll = Math.random();
  let cumulative = 0;
  for (const def of POWERUP_TYPES) {
    cumulative += def.chance;
    if (roll <= cumulative) {
      powerupsArray.push(new Powerup(enemy.x + enemy.width / 2 - 17, enemy.y, def.key));
      return;
    }
  }
};

const applyPowerup = (type) => {
  switch (type) {
    case "shield":
      bigRick.shieldTimer = 360;
      break;
    case "rapid":
      bigRick.rapidFireTimer = 300;
      break;
    case "multi":
      bigRick.multiShotTimer = 300;
      break;
    case "pierce":
      bigRick.pierceTimer = 300;
      break;
    case "power":
      bigRick.powerTimer = 300;
      break;
    case "life":
      bigRick.lifes = Math.min(bigRick.maxLifes, bigRick.lifes + 1);
      break;
    case "bomb":
      enemiesArray.forEach((e) => onEnemyKilled(e));
      enemiesArray = [];
      if (activeBoss) {
        activeBoss.hp -= 10;
      }
      break;
  }
};

const updatePowerups = () => {
  for (let i = powerupsArray.length - 1; i >= 0; i -= 1) {
    const p = powerupsArray[i];
    p.draw();
    if (p.y > gameBoard.height) {
      powerupsArray.splice(i, 1);
      continue;
    }
    if (
      p.bottom() > bigRick.top() &&
      p.top() < bigRick.bottom() &&
      p.left() < bigRick.right() &&
      p.right() > bigRick.left()
    ) {
      portal.currentTime = 0;
      portal.play();
      applyPowerup(p.type);
      powerupsArray.splice(i, 1);
    }
  }
};
