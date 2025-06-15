const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Variáveis de teste
let x = 100, y = 100;

// TESTE: Loop de animação
function loop() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "red";
  ctx.fillRect(x, y, 100, 100);

  x += 2;
  if (x > canvas.width) x = 0;

  requestAnimationFrame(loop);
}

console.log("Iniciando loop de teste!");
loop();