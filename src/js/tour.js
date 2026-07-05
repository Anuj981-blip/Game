const TOUR_STEPS = [
  {
    title: "Welcome to Rick's Survival",
    text: "Dodge falling Mortys, shoot them with pickle blasts, and survive as long as you can. Let's walk through the controls.",
  },
  {
    title: "Move Rick",
    text: "Use the Arrow Keys (\u2191 \u2193 \u2190 \u2192) to move Rick around the screen. Movement is smooth, so keep tapping to steer.",
  },
  {
    title: "Shoot",
    text: "Hold Spacebar to fire pickle shots upward at incoming Mortys.",
  },
  {
    title: "Pause",
    text: "Press P at any time to pause or resume the game.",
  },
  {
    title: "Power-ups",
    text: "Defeated Mortys sometimes drop glowing orbs. Fly into one to grab it: Shield blocks damage, Rapid Fire speeds up your shots, Multi-Shot fires a 3-way spread, Piercing lets shots punch through enemies, Power x2 doubles your damage, +1 restores a life, and Bomb clears the screen.",
  },
  {
    title: "Enemy variety",
    text: "Not every Morty is the same: fast ones are quick but fragile, tanky ones soak up hits, and splitters break into two weaker Mortys when destroyed. Prioritize your targets wisely.",
  },
  {
    title: "Boss fights",
    text: "Every so often a Boss Morty drops in, hovers, and fires aimed volleys back at you. Regular Mortys thin out while a boss is active so you can focus the fight. There's a cooldown after each boss before the next one can appear, so you get a breather.",
  },
  {
    title: "Parry",
    text: "Press Shift right as a boss bullet reaches you to parry it: the bullet gets reflected back and slams into the boss for heavy damage. Parry only works against boss bullets during a boss fight \u2014 it does nothing against regular falling Mortys. It also has a short cooldown, so time it carefully.",
  },
  {
    title: "Game modes & settings",
    text: "Pick Classic, Hardcore, or Time Attack from the dropdown before you start. Use the Music and SFX sliders to adjust sound, and hit Fullscreen for a distraction-free view.",
  },
  {
    title: "You're ready!",
    text: "Pick a mode and hit Start Game. Good luck out there.",
  },
];

let tourIndex = 0;

const tourOverlay = () => document.getElementById("tour-overlay");
const tourTitle = () => document.getElementById("tour-title");
const tourText = () => document.getElementById("tour-text");
const tourPrev = () => document.getElementById("tour-prev");
const tourNext = () => document.getElementById("tour-next");

const GAME_CONTROL_IDS = ["start-button", "pause-button", "restart-button"];

const setGameControlsLocked = (locked) => {
  GAME_CONTROL_IDS.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.disabled = locked;
  });
};

const renderTourStep = () => {
  const step = TOUR_STEPS[tourIndex];
  tourTitle().textContent = `${step.title} (${tourIndex + 1}/${TOUR_STEPS.length})`;
  tourText().textContent = step.text;
  tourPrev().style.visibility = tourIndex === 0 ? "hidden" : "visible";
  tourNext().textContent = tourIndex === TOUR_STEPS.length - 1 ? "Let's go!" : "Next";
};

const openTour = () => {
  tourIndex = 0;
  tourOverlay().classList.remove("hidden");
  renderTourStep();
  setGameControlsLocked(true);
  if (typeof pauseGame !== "undefined" && gameStarted && !pauseGame && !gameOver) {
    pauseNow();
  }
};

const closeTour = () => {
  tourOverlay().classList.add("hidden");
  setGameControlsLocked(false);
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("tour-button").onclick = openTour;
  document.getElementById("tour-next").onclick = () => {
    if (tourIndex === TOUR_STEPS.length - 1) {
      closeTour();
      return;
    }
    tourIndex += 1;
    renderTourStep();
  };
  document.getElementById("tour-prev").onclick = () => {
    if (tourIndex > 0) {
      tourIndex -= 1;
      renderTourStep();
    }
  };

  // The tour runs every time the page loads and must be completed via
  // the Next/Back buttons - there is no skip option.
  openTour();
});
