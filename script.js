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

// ----------- Carregamento de imagens seguro -----------
function loadImages(sources, callback, errorCallback) {
  let loaded = 0;
  const total = Object.keys(sources).length;
  const images = {};
  let failed = false;
  for (const key in sources) {
    images[key] = new Image();
    images[key].src = sources[key];
    images[key].onload = () => {
      loaded++;
      if (loaded === total && !failed) callback(images);
    };
    images[key].onerror = () => {
      failed = true;
      if (errorCallback) errorCallback(key, sources[key]);
    };
  }
}

// ----------- Variáveis do Jogo -----------
let naveImg, inimigoImg, tiroNaveImg, tiroInimigoImg, bossImg;
let nave, tiros, inimigos, tirosInimigos, fase, boss;
let tempoDisparo;
let jogoFinalizado = false;
let animationId;

// ----------- Input nave (mouse e touch) -----------
function setupInput() {
  // Mouse
  canvas.addEventListener('mousemove', function(e) {
    if (jogoFinalizado) return;
    const rect = canvas.getBoundingClientRect();
    nave.x = e.clientX - rect.left;
    nave.y = e.clientY - rect.top;
  });

  // Touch
  canvas.addEventListener('touchmove', function(e) {
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

// ----------- Funções de inimigos e boss -----------
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

// ----------- Desenhar tudo (inclusive quadrado vermelho de teste) -----------
function desenharFundo() {
  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // Quadrado vermelho fixo de teste
  ctx.fillStyle = "red";
  ctx.fillRect(100, 100, 100, 100);
}

function desenhar() {
  desenharFundo();

  // Nave
  if (naveImg && naveImg.complete && naveImg.naturalWidth > 0) {
    ctx.drawImage(naveImg, nave.x - nave.w / 2, nave.y - nave.h / 2, nave.w, nave.h);
  } else {
    ctx.fillStyle = "yellow";
    ctx.fillRect(nave.x - nave.w / 2, nave.y - nave.h / 2, nave.w, nave.h);
  }

  // Tiros
  tiros.forEach(t => {
    if (tiroNaveImg && tiroNaveImg.complete && tiroNaveImg.naturalWidth > 0) {
      ctx.drawImage(tiroNaveImg, t.x - 5, t.y - 10, 10, 20);
    } else {
      ctx.fillStyle = "white";
      ctx.fillRect(t.x - 3, t.y - 10, 6, 20);
    }
  });

  // Inimigos
  inimigos.forEach(i => {
    if (inimigoImg && inimigoImg.complete && inimigoImg.naturalWidth > 0) {
      ctx.drawImage(inimigoImg, i.x, i.y, i.w, i.h);
    } else {
      ctx.fillStyle = "red";
      ctx.fillRect(i.x, i.y, i.w, i.h);
    }
  });

  // Tiros inimigos
  tirosInimigos.forEach(t => {
    if (tiroInimigoImg && tiroInimigoImg.complete && tiroInimigoImg.naturalWidth > 0) {
      ctx.drawImage(tiroInimigoImg, t.x - 5, t.y - 10, 10, 20);
    } else {
      ctx.fillStyle = "orange";
      ctx.fillRect(t.x - 3, t.y - 10, 6, 20);
    }
  });

  // Boss
  if (boss) {
    if (bossImg && bossImg.complete && bossImg.naturalWidth > 0) {
      ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
    } else {
      ctx.fillStyle = "purple";
      ctx.fillRect(boss.x, boss.y, boss.w, boss.h);
    }
    ctx.fillStyle = 'red';
    ctx.fillRect(boss.x, boss.y - 10, boss.w * (boss.vida / (5 + fase * 3)), 5);
  }
}

// ----------- Atualização do jogo -----------
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
    jogoFinalizado = true;
    finalDiv.innerHTML = `<p style="color: red; font-size: 2rem;">Game Over! Tente novamente 😢</p>`;
    finalDiv.classList.remove('hidden');
    setTimeout(() => {
      finalDiv.classList.add('hidden');
      resetGame();
    }, 2500);
    return;
  }

  if (boss && boss.vida <= 0) {
    boss = null;
    if (fase >= 21) {
      jogoFinalizado = true;
      finalDiv.innerHTML = `<img src="./assets/coracao.png" alt="Coração"><p>Viu amor, às vezes nosso relacionamento vai ser como esse jogo, haverão fases difíceis, porém, com esforço nós sempre vencemos juntos. Te amo! 💖</p>`;
      finalDiv.classList.remove('hidden');
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

// ----------- Loop principal -----------
function loop() {
  atualizar();
  desenhar();

  // Diagnóstico: log no console a cada frame
  console.log(`loop rodando | nave=(${nave.x.toFixed(1)},${nave.y.toFixed(1)}) | inimigos=${inimigos.length} | fase=${fase}`);

  faseDiv.innerText = 'Fase ' + fase;
  vidaDiv.innerText = '❤️'.repeat(nave.vida);
  if (!jogoFinalizado) animationId = requestAnimationFrame(loop);
}

// ----------- Reset e inicialização do jogo -----------
function resetGame() {
  nave = { x: canvas.width / 2, y: canvas.height - 150, w: 70, h: 70, vida: 5 };
  tiros = [];
  inimigos = [];
  tirosInimigos = [];
  fase = 1;
  boss = null;
  tempoDisparo = 0;
  jogoFinalizado = false;
  finalDiv.classList.add('hidden');
  finalDiv.innerHTML = "";
  spawnInimigos(5 + fase * 2);
  cancelAnimationFrame(animationId);
  loop();
}

// ----------- Inicialização segura -----------

document.addEventListener('DOMContentLoaded', () => {
  loadImages({
    nave: './assets/nave1.png',
    inimigo: './assets/inimigo.png',
    tiroNave: './assets/tiro_nave.png',
    tiroInimigo: './assets/tiro_inimigo.png',
    boss: './assets/inimigo.png'
  }, function(imgs) {
    naveImg = imgs.nave;
    inimigoImg = imgs.inimigo;
    tiroNaveImg = imgs.tiroNave;
    tiroInimigoImg = imgs.tiroInimigo;
    bossImg = imgs.boss;
    setupInput();
    resetGame();
  }, function(falhou, url) {
    alert(`Erro ao carregar a imagem: ${url}\nO jogo vai usar desenhos simples no lugar.`);
    naveImg = new Image();
    inimigoImg = new Image();
    tiroNaveImg = new Image();
    tiroInimigoImg = new Image();
    bossImg = new Image();
    setupInput();
    resetGame();
  });
});