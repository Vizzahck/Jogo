const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const faseDiv = document.getElementById('fase');
const vidaDiv = document.getElementById('vidaNave');
const finalDiv = document.getElementById('final');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Carregamento robusto de imagens
function loadImages(sources, callback, errorCallback) {
  let loaded = 0;
  let hasError = false;
  const total = Object.keys(sources).length;
  const images = {};
  for (const key in sources) {
    images[key] = new Image();
    images[key].src = sources[key];
    images[key].onload = () => {
      loaded++;
      if (loaded === total && !hasError) callback(images);
    };
    images[key].onerror = () => {
      hasError = true;
      if (errorCallback) errorCallback(key, sources[key]);
    };
  }
}

let naveImg, inimigoImg, tiroNaveImg, tiroInimigoImg, bossImg;
let nave, tiros, inimigos, tirosInimigos, fase, boss;
let tempoDisparo;
let jogoFinalizado = false;
let animationId;

// Movimento
function setupInput() {
  // Mouse
  canvas.addEventListener('mousemove', function(e) {
    if (jogoFinalizado) return;
    const rect = canvas.getBoundingClientRect();
    nave.x = e.client {
    if (jogoFinalizado) return;
    if (e.touches.length > 0) {
      const rect = canvas.getBoundingClientRect();
      nave.x = e.touches[0].clientX - rect.left;
      nave.y = e.touches[0].clientY - rect.top;
    }
    e.preventDefault();
  }, {passive: false});

  // Impede scroll ao tocar no canvas
  canvas.addEventListener('touchstart', function(e) {
    e.preventDefault();
  }, {passive: false});
}

function spawnInimigos(qtd) {
  inimigos = [];
  for (let i = 0; i < qtd; i++) {
    inimigos.push({
      x: Math.random() * (canvas.width - 50),
      y: -Math.random() * 300 - 50,
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

  // TESTE VISUAL: desenhar um quadrado vermelho fixo
  ctx.fillStyle = "red";
  ctx.fillRect(100, 100, 100, 100);
}

function desenhar() {
  desenharFundo();

  // Protege contra erro se imagem não carregou
  if (naveImg.complete && naveImg.naturalWidth > 0) {
    ctx.drawImage(naveImg, nave.x - nave.w / 2, nave.y - nave.h / 2, nave.w, nave.h);
  } else {
    ctx.x - nave.w / 2, nave.y - nave.h / 2, nave.w, nave.h);
  }

  tiros.forEach(t => {
    if (tiroNaveImg.complete && tiroNaveImg.naturalWidth > 0) {
      ctx.drawImage(tiroNaveImg, t.x - 5, t.y - 10, 10, 20);
    } else {
      ctx.fillStyle = "white";
      ctx.fillRect(t.x - 3, t.y - 10, 6, 20);
    }
  });

  inimigos.forEach(i => {
    if (inimigoImg.complete && inimigoImg.naturalWidth > 0) {
      ctx.drawImage(inimigoImg, i.x, i.y, i.w, i.h);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(i.x, i.y, i.w, i.h);
    }
  });

  tirosInimigos.forEach(t => {
    if (tiroInimigoImg.complete && tiroInimigoImg.naturalWidth > 0) {
      ctx.drawImage(tiroInimigoImg, t.x - 5, t.y - 10, 10, 20);
    } else {
      ctx.fillStyle = "orange";
      ctx.fillRect(t.x - 3, t.y - 10, 6, 20);
    }
  });

  if (boss) {
    if (bossImg.complete && bossImg.naturalWidth > 0) {
      ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
    } else {
      ctx.fillStyle = "purple";
      ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
    }
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

  tiros.forEach(t => t.y -= 8);
  tiros = tiros.filter(t => t.y > -20);

  tirosInimigos.forEach(t => t.y += 5);
  tirosInimigos = tirosInimigos.filter(t => t.y < canvas.height + 20);

  inimigos.forEach(i => {
    i.y += i.velocidade;
    if (Math.random() < 0.015) tirosInimigos.push({ x: i.x + i.w / 2, y: i.y + i.h });
  });
  inimigos = inimigos.filter(i => i.y < canvas.height + 50 && i.vida > 0);

  if (boss) {
    boss.x += boss.dir * 3;
    if (boss.x <= 0 || boss.x + boss.w >= canvas.width) boss.dir *= -1;
    if (Math.random() < 0.02) tirosInimigos.push({ x: boss.x + boss.w / 2, y: boss.y + boss.h });
  }

  tiros.forEach(t => {
    inimigos.forEach(i => {
      if (t.x > i.x && t.x < i.x + i.w && t.y > i.y && t.y < i.y + i.h) {
        i.vida--;
        t.y = -999;
      }
    });
    if (boss && t.x > boss.x && t.x < boss.x + boss.w && t.y > boss.y && t.y < boss.y + boss.h) {
      boss.vida--;
      t.y = -999;
    }
  });

  tirosInimigos.forEach(t => {
    if (t.x > nave.x - nave.w / 2 && t.x < nave.x + nave.w / 2 &&
      t.y > nave.y - nave.h / 2 && t.y < nave.y + nave.h / 2) {
      nave.vida--;
      t.y = canvas.height + 999;
    }
  });

  if (nave.vida <= 0) {
    jogoFinalizado = true