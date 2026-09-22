// wheel.js - Lógica interactiva de la ruleta
const PALETTE = ["#4169E1", "#FF7659", "#98FB98", "#F5DEB3", "#D8A4E8"];
let items = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
let currentAngle = 0;
let isSpinning = false;
let spinVelocity = 0;
let lastWinner = "";

const canvas = document.getElementById("wheel-canvas");
const ctx = canvas.getContext("2d");
const textarea = document.getElementById("items-textarea");
const display = document.getElementById("winner-display");

function syncItems() {
  textarea.value = items.join("\n");
}

function draw() {
  const n = items.length;
  const w = canvas.width;
  const r = w / 2 - 10;
  ctx.clearRect(0, 0, w, w);

  if (n === 0) return;
  const arc = (Math.PI * 2) / n;

  for (let i = 0; i < n; i++) {
    const angle = currentAngle + i * arc;
    ctx.beginPath();
    ctx.moveTo(w / 2, w / 2);
    ctx.arc(w / 2, w / 2, r, angle, angle + arc);
    ctx.fillStyle = PALETTE[i % PALETTE.length];
    ctx.fill();
    ctx.stroke();

    ctx.save();
    ctx.translate(w / 2, w / 2);
    ctx.rotate(angle + arc / 2);
    ctx.textAlign = "right";
    ctx.fillStyle = "#000";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText(items[i], r - 25, 6);
    ctx.restore();
  }
}

function spin() {
  if (isSpinning || items.length === 0) return;
  spinVelocity = Math.random() * 0.35 + 0.35;
  isSpinning = true;
  requestAnimationFrame(loop);
}

function loop() {
  if (!isSpinning) return;
  currentAngle += spinVelocity;
  spinVelocity *= 0.988;

  if (spinVelocity < 0.002) {
    isSpinning = false;
    const arc = (Math.PI * 2) / items.length;
    const norm = (Math.PI * 2 - (currentAngle % (Math.PI * 2))) % (Math.PI * 2);
    const idx = Math.floor(norm / arc);
    lastWinner = items[idx];
    display.textContent = lastWinner;
  }
  draw();
  if (isSpinning) requestAnimationFrame(loop);
}

document.getElementById("btn-spin").addEventListener("click", spin);
document.getElementById("center-spin-btn").addEventListener("click", spin);
document.getElementById("wheel-canvas").addEventListener("click", spin);
document.getElementById("btn-reset").addEventListener("click", () => {
  items = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
  syncItems();
  draw();
});
document.getElementById("btn-hide").addEventListener("click", () => {
  if (lastWinner) {
    items = items.filter((x) => x !== lastWinner);
    syncItems();
    draw();
  }
});
textarea.addEventListener("input", (e) => {
  items = e.target.value
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  draw();
});

window.addEventListener("keydown", (e) => {
  if (e.code === "Space" && document.activeElement !== textarea) {
    e.preventDefault();
    spin();
  }
});

syncItems();
draw();
