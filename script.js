// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HUD
const faseDiv = document.getElementById('fase');
const vidaDiv = document.getElementById('vidaNave');
const finalDiv = document.getElementById('final');

// Responsivo
function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Imagens
const naveImg = new Image();
naveImg.src = './assets/nave1.png';
const inimigoImg = new Image();
inimigoImg.src = './assets/inimigo.png';
const tiroNaveImg = new Image();
tiroNaveImg.src = './assets/tiro_nave.png';
const tiroInimigoImg = new Image();
tiroInimigoImg.src = './assets/tiro_inimigo.png';
const bossImg = new Image();
bossImg.src = './assets/inimigo.png'; // Boss é o inimigo, mas maior

// Variáveis do jogo
let nave;
let tiros;
let inimigos;
let tirosInimigos;
let fase;
let boss;
let jogoFinalizado;
let tempoDisparo;

function iniciarJogo() {
  nave = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    w: 70,
    h: 70,
    vida: 5
  };

  tiros = [];
  inimigos = [];
  tirosInimigos = [];
  fase = 1;
  boss = null;
  jogoFinalizado = false;
  tempoDisparo = 0;

  finalDiv.classList.add('hidden');

  spawnInimigos(5 + fase * 2);
  loop();
}

// Controle da nave
function moverNave(e) {
  const toque = e.touches ? e.touches[0] : e;
  const rect = canvas.getBoundingClientRect();
  nave.x = toque.clientX - rect.left;
  nave.y = toque.clientY - rect.top;
}
canvas.addEventListener('touchmove', moverNave);
canvas.addEventListener('mousemove', moverNave);

// Funções auxiliares
function spawnInimigos(qtd) {
  for (let i = 0; i < qtd; i++) {
    inimigos.push({
      x: Math.random() * (canvas.width - 50),
      y: -Math.random() * 500,
      w: 50,
      h: 50,
      vida: 1,
      velocidade: 2 + fase * 0.3
    });
  }
}

function spawnBoss() {
  boss = {
    x: canvas.width / 2 - 75,
    y: 50,
    w: 150,
    h: 150,
    vida: 5 + fase * 3,
    dir: 1
  };
}

function desenharFundo() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function desenhar() {
  desenharFundo();

  // Nave  
  ctx.drawImage(naveImg, nave.x - nave.w / 2, nave.y - nave.h / 2, nave.w, nave.h);

  // Tiros da nave  
  tiros.forEach(t => {
    ctx.drawImage(tiroNaveImg, t.x - 5, t.y - 10, 10, 20);
  });

  // Inimigos  
  inimigos.forEach(i => {
    ctx.drawImage(inimigoImg, i.x, i.y, i.w, i.h);
  });

  // Tiros dos inimigos  
  tirosInimigos.forEach(t => {
    ctx.drawImage(tiroInimigoImg, t.x - 5, t.y - 10, 10, 20);
  });

  // Boss  
  if (boss) {
    ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
    // Vida do boss  
    ctx.fillStyle = 'red';
    ctx.fillRect(boss.x, boss.y - 10, boss.w * (boss.vida / (5 + fase * 3)), 5);
  }
}

function atualizar() {
  if (jogoFinalizado) return;

  tempoDisparo++;
  if (tempoDisparo > 15) {
    tiros.push({ x: nave.x, y: nave.y - nave.h / 2 });
    tempoDisparo = 0;
  }

  // Movimentar tiros da nave  
  tiros.forEach(t => t.y -= 8);
  tiros = tiros.filter(t => t.y > -20);

  // Movimentar tiros dos inimigos  
  tirosInimigos.forEach(t => t.y += 5);
  tirosInimigos = tirosInimigos.filter(t => t.y < canvas.height + 20);

  // Movimentar inimigos  
  inimigos.forEach(i => {
    i.y += i.velocidade;
    if (Math.random() < 0.015) {
      tirosInimigos.push({ x: i.x + i.w / 2, y: i.y + i.h });
    }
  });
  inimigos = inimigos.filter(i => i.y < canvas.height + 50 && i.vida > 0);

  // Boss  
  if (boss) {
    boss.x += boss.dir * 3;
    if (boss.x <= 0 || boss.x + boss.w >= canvas.width) boss.dir *= -1;

    if (Math.random() < 0.02) {
      tirosInimigos.push({ x: boss.x + boss.w / 2, y: boss.y + boss.h });
    }
  }

  // Colisões  
  tiros.forEach(t => {
    inimigos.forEach(i => {
      if (t.x > i.x && t.x < i.x + i.w && t.y > i.y && t.y < i.y + i.h) {
        i.vida--;
        t.y = -999;
      }
    });
    if (boss) {
      if (t.x > boss.x && t.x < boss.x + boss.w && t.y > boss.y && t.y < boss.y + boss.h) {
        boss.vida--;
        t.y = -999;
      }
    }
  });

  tirosInimigos.forEach(t => {
    if (t.x > nave.x - nave.w / 2 && t.x < nave.x + nave.w / 2 &&
      t.y > nave.y - nave.h / 2 && t.y < nave.y + nave.h / 2) {
      nave.vida--;
      t.y = canvas.height + 999;
    }
  });

  // Check vitórias e derrotas  
  if (nave.vida <= 0) {
    jogoFinalizado = true;
    // Reinicia o jogo após 2 segundos
    setTimeout(() => {
      iniciarJogo();
    }, 2000);
  }

  if (boss && boss.vida <= 0) {
    boss = null;
    if (fase >= 21) {
      finalDiv.classList.remove('hidden');
      jogoFinalizado = true;
    } else {
      fase++;
      nave.vida = 5;
      spawnInimigos(5 + fase * 2);
    }
  }

  if (!boss && inimigos.length === 0 && !jogoFinalizado) {
    spawnBoss();
  }
}

function loop() {
  atualizar();
  desenhar();
  faseDiv.innerText = 'Fase ' + fase;
  vidaDiv.innerText = '❤️'.repeat(nave.vida);
  if (!jogoFinalizado) {
    requestAnimationFrame(loop);
  }
}

// Inicializa o jogo quando a página carregar
window.onload = iniciarJogo;