const gameBoard = document.getElementById("game-board");
const ctx = gameBoard.getContext("2d");
let frames = 0;
let requestId = 0;
let pauseGame = false;
let gameStarted = false;
let gameOver = false;

const themeSong = new Audio('src/audio/theme.mp3');
const hitMorty = new Audio('src/audio/tiny-rick.wav');
const shoot = new Audio('src/audio/shot.mp3');
const portal = new Audio('src/audio/portal.mp3');
themeSong.loop = true;

let background = new Image();
background.src = 'src/images/background-canvas.png';
ctx.drawImage(background, 0, 0, gameBoard.width, gameBoard.height);

// ---------- Game modes ----------
const GAME_MODES = {
  classic:  { label: "Classic",      startLifes: 10, timeLimit: null,   difficultyRate: 1,   scoreMult: 1 },
  hardcore: { label: "Hardcore",     startLifes: 5,  timeLimit: null,   difficultyRate: 1.8, scoreMult: 1.5 },
  timeattack:{ label: "Time Attack", startLifes: 10, timeLimit: 90 * 60, difficultyRate: 1.3, scoreMult: 2 },
};
let currentMode = "classic";

const getDifficultyLevel = () => {
  const mode = GAME_MODES[currentMode];
  return (frames / (60 * 12)) * mode.difficultyRate; // ramps roughly every 12s
};

// ---------- Score / combo ----------
let score = 0;
let combo = 0;
let comboTimer = 0;
let banner = null;

const showBanner = (text) => {
  banner = { text, timer: 120 };
};

const onEnemyKilled = (enemy) => {
  combo += 1;
  comboTimer = 90;
  const mult = GAME_MODES[currentMode].scoreMult;
  score += Math.round(enemy.scoreValue * mult * (1 + Math.min(combo, 20) * 0.05));
  if (enemy.isBoss) showBanner("Boss defeated!");
  maybeDropPowerup(enemy);
};

const bigRick = new Rick("blue");

const clearGameBoard = () => {
  ctx.drawImage(background, 0, 0, gameBoard.width, gameBoard.height);
};

let moveLeft = false;
let moveRight = false;
let moveBackward = false;
let moveUp = false;
let firing = false;

document.onkeydown = function (e) {
  if (!gameStarted || gameOver) return;
  switch (e.keyCode) {
    case 38: // up
      moveUp = true;
      bigRick.speedY -= bigRick.accel * 3;
      break;
    case 40: // down
      moveBackward = true;
      bigRick.speedY += bigRick.accel * 3;
      break;
    case 37: // left
      moveLeft = true;
      bigRick.speedX -= bigRick.accel * 3;
      break;
    case 39: // right
      moveRight = true;
      bigRick.speedX += bigRick.accel * 3;
      break;
    case 32: // space - fire
      firing = true;
      break;
    case 16: // shift - parry
      bigRick.tryParry();
      break;
    case 80: // P - pause
      pauseNow();
      break;
    default:
      break;
  }
};

document.onkeyup = function (e) {
  switch (e.keyCode) {
    case 38:
      moveUp = false;
      break;
    case 40:
      moveBackward = false;
      break;
    case 37:
      moveLeft = false;
      break;
    case 39:
      moveRight = false;
      break;
    case 32:
      firing = false;
      break;
    default:
      break;
  }
};

const pauseNow = () => {
  pauseGame = !pauseGame;
  if (!pauseGame) {
    requestId = requestAnimationFrame(engine);
    themeSong.play();
  } else {
    ctx.font = '150px Ricks';
    ctx.fillStyle = 'lightseagreen';
    ctx.textAlign = 'center';
    ctx.fillText('PAUSE', gameBoard.width / 2, gameBoard.height / 2);
    ctx.textAlign = 'left';
    cancelAnimationFrame(requestId);
    themeSong.pause();
  }
};

// ---------- HUD ----------
const drawHud = () => {
  ctx.font = "20px Ricks, sans-serif";
  ctx.fillStyle = "#97ce4c";
  ctx.fillText(`Score: ${score}`, gameBoard.width - 190, 30);
  ctx.fillText(`Lifes: ${bigRick.lifes}`, gameBoard.width - 190, 60);
  ctx.fillText(`Mode: ${GAME_MODES[currentMode].label}`, gameBoard.width - 190, 90);

  if (combo > 1) {
    ctx.fillStyle = "#ffca28";
    ctx.font = "24px Ricks, sans-serif";
    ctx.fillText(`Combo x${combo}`, 20, 30);
  }

  if (GAME_MODES[currentMode].timeLimit !== null) {
    const remaining = Math.max(0, Math.ceil((GAME_MODES[currentMode].timeLimit - frames) / 60));
    ctx.fillStyle = remaining <= 10 ? "#ef5350" : "#97ce4c";
    ctx.font = "22px Ricks, sans-serif";
    ctx.fillText(`Time: ${remaining}s`, 20, 60);
  }

  let badgeY = 90;
  if (bigRick.shieldTimer > 0) { drawBadge(20, badgeY, "SHIELD", "#29b6f6"); badgeY += 24; }
  if (bigRick.rapidFireTimer > 0) { drawBadge(20, badgeY, "RAPID FIRE", "#ffca28"); badgeY += 24; }
  if (bigRick.multiShotTimer > 0) { drawBadge(20, badgeY, "MULTI-SHOT", "#ab47bc"); badgeY += 24; }
  if (bigRick.pierceTimer > 0) { drawBadge(20, badgeY, "PIERCING", "#00e5ff"); badgeY += 24; }
  if (bigRick.powerTimer > 0) { drawBadge(20, badgeY, "POWER x2", "#ff6d00"); badgeY += 24; }

  if (activeBoss) {
    const parryText = bigRick.parryCooldown > 0 ? `PARRY: ${Math.ceil(bigRick.parryCooldown / 60 * 10) / 10}s` : "PARRY READY (Shift)";
    ctx.fillStyle = bigRick.parryCooldown > 0 ? "#9e9e9e" : "#ffeb3b";
    ctx.font = "16px Ricks, sans-serif";
    ctx.fillText(parryText, 20, badgeY);
    badgeY += 24;
  }

  if (banner) {
    ctx.fillStyle = "#fff176";
    ctx.font = "28px Ricks, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(banner.text, gameBoard.width / 2, 60);
    ctx.textAlign = "left";
    banner.timer -= 1;
    if (banner.timer <= 0) banner = null;
  }
};

const drawBadge = (x, y, text, color) => {
  ctx.fillStyle = color;
  ctx.font = "16px Ricks, sans-serif";
  ctx.fillText(text, x, y);
};

const enemiesLeaked = () => {
  enemiesArray.forEach((element, idx) => {
    if (element.y > gameBoard.height) {
      portal.currentTime = 0;
      portal.play();
      bigRick.takeDamage(1);
      enemiesArray.splice(idx, 1);
    }
  });
};

const checkGameOver = () => {
  const mode = GAME_MODES[currentMode];
  const timeUp = mode.timeLimit !== null && frames >= mode.timeLimit;
  if (bigRick.lifes < 1 || timeUp) {
    gameOver = true;
    ctx.font = "150px Ricks";
    ctx.fillStyle = "plum";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", gameBoard.width / 2, gameBoard.height / 2);
    ctx.font = "50px Ricks";
    ctx.fillStyle = "palegreen";
    ctx.fillText(`Final score: ${score}`, gameBoard.width / 2, gameBoard.height - 150);
    ctx.font = "28px Ricks";
    const best = updateHighScore(score);
    ctx.fillText(`Best (${GAME_MODES[currentMode].label}): ${best}`, gameBoard.width / 2, gameBoard.height - 100);
    ctx.textAlign = "left";
    window.cancelAnimationFrame(requestId);
    themeSong.pause();
  }
};

const updateHighScore = (finalScore) => {
  const key = `rm_highscore_${currentMode}`;
  const prevBest = Number(localStorage.getItem(key) || 0);
  const best = Math.max(prevBest, finalScore);
  localStorage.setItem(key, best);
  return best;
};

const engine = () => {
  clearGameBoard();
  bigRick.drawRick();
  bigRick.rickNewPos();

  addNewEnemiesToEnemiesArray();
  createNewEnemies();

  if (firing) fireWeapon();
  createNewBullets();

  updatePowerups();
  updateBossBullets();

  enemiesLeaked();
  enemyHitByBullet(enemiesArray, bulletsArray);
  playerBulletsHitBoss(bulletsArray);
  rickHitByEnemy(enemiesArray);

  if (comboTimer > 0) {
    comboTimer -= 1;
  } else {
    combo = 0;
  }

  drawHud();

  frames += 1;
  checkGameOver();
  if (!gameOver) {
    requestId = window.requestAnimationFrame(engine);
  }
};

const resetGameState = () => {
  frames = 0;
  score = 0;
  combo = 0;
  comboTimer = 0;
  gameOver = false;
  banner = null;
  enemiesArray = [];
  bulletsArray = [];
  powerupsArray = [];
  bossBulletsArray = [];
  reflectedBulletsArray = [];
  activeBoss = null;
  lastBossScoreThreshold = 0;
  bossCooldownUntil = 0;
  bigRick.x = gameBoard.width / 2 - bigRick.width / 2;
  bigRick.y = gameBoard.height - bigRick.height;
  bigRick.speedX = 0;
  bigRick.speedY = 0;
  bigRick.lifes = GAME_MODES[currentMode].startLifes;
  bigRick.maxLifes = GAME_MODES[currentMode].startLifes;
  bigRick.shieldTimer = 0;
  bigRick.rapidFireTimer = 0;
  bigRick.multiShotTimer = 0;
  bigRick.pierceTimer = 0;
  bigRick.powerTimer = 0;
  bigRick.parryWindow = 0;
  bigRick.parryCooldown = 0;
  clearGameBoard();
};

window.onload = function () {
  const modeSelect = document.getElementById("mode-select");
  if (modeSelect) {
    modeSelect.addEventListener("change", (e) => {
      currentMode = e.target.value;
    });
  }

  const musicSlider = document.getElementById("music-volume");
  const sfxSlider = document.getElementById("sfx-volume");
  const applyVolumes = () => {
    themeSong.volume = Number(musicSlider.value) / 100;
    const sfxVol = Number(sfxSlider.value) / 100;
    [shoot, hitMorty, portal].forEach((a) => { a.volume = sfxVol; });
  };
  if (musicSlider && sfxSlider) {
    musicSlider.addEventListener("input", applyVolumes);
    sfxSlider.addEventListener("input", applyVolumes);
    applyVolumes();
  }

  const fullscreenBtn = document.getElementById("fullscreen-button");
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      const container = document.getElementById("game-container");
      if (!document.fullscreenElement) {
        container.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen();
      }
    };
  }

  document.getElementById("start-button").onclick = function (event) {
    if (modeSelect) currentMode = modeSelect.value;
    resetGameState();
    gameStarted = true;
    themeSong.currentTime = 0;
    themeSong.play();
    window.requestAnimationFrame(engine);
  };
  document.getElementById("pause-button").onclick = function () {
    if (gameStarted && !gameOver) pauseNow();
  };
  document.getElementById("restart-button").onclick = function () {
    window.cancelAnimationFrame(requestId);
    resetGameState();
    pauseGame = false;
    gameStarted = true;
    themeSong.currentTime = 0;
    themeSong.play();
    window.requestAnimationFrame(engine);
  };
};
