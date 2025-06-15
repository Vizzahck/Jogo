// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

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
bossImg.src = './assets/inimigo.png'; // Boss é o inimigo maior

// Variáveis
let nave = {
    x: canvas.width / 2,
    y: canvas.height - 150,
    w: 70,
    h: 70,
    vida: 5
};

let tiros = [];
let inimigos = [];
let tirosInimigos = [];
let fase = 1;
let boss = null;
let jogoFinalizado = false;
let tempoDisparo = 0;

// HUD
const faseDiv = document.getElementById('fase');
const vidaDiv = document.getElementById('vidaNave');
const finalDiv = document.getElementById('final');

// Controle
function moverNave(e) {
    const toque = e.touches ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    nave.x = toque.clientX - rect.left;
    nave.y = toque.clientY - rect.top;
}
canvas.addEventListener('touchmove', moverNave);
canvas.addEventListener('mousemove', moverNave);

// Funções
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
    ctx.drawImage(naveImg, nave.x - nave.w/2, nave.y - nave.h/2, nave.w, nave.h);

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
        // Barra de vida do boss
        ctx.fillStyle = 'red';
        ctx.fillRect(boss.x, boss.y - 10, boss.w * (boss.vida / (5 + fase * 3)), 5);
    }
}

function atualizar() {
    if (jogoFinalizado) return;

    tempoDisparo++;
    if (tempoDisparo > 15) {
        tiros.push({x: nave.x, y: nave.y - nave.h/2});
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
            tirosInimigos.push({x: i.x + i.w/2, y: i.y + i.h});
        }
    });

    inimigos = inimigos.filter(i => i.y < canvas.height + 50 && i.vida > 0);

    // Boss
    if (boss) {
        boss.x += boss.dir * 3;
        if (boss.x <= 0 || boss.x + boss.w >= canvas.width) boss.dir *= -1;

        if (Math.random() < 0.02) {
            tirosInimigos.push({x: boss.x + boss.w/2, y: boss.y + boss.h});
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
        if (t.x > nave.x - nave.w/2 && t.x < nave.x + nave.w/2 &&
            t.y > nave.y - nave.h/2 && t.y < nave.y + nave.h/2) {
            nave.vida--;
            t.y = canvas.height + 999;
        }
    });

    // Verificar derrota
    if (nave.vida <= 0) {
        jogoFinalizado = true;
        setTimeout(() => {
            location.reload();
        }, 1000);
    }

    // Verificar vitória
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

    if (!boss && inimigos.length === 0) {
        spawnBoss();
    }
}

// Loop
function loop() {
    atualizar();
    desenhar();
    faseDiv.innerText = 'Fase ' + fase;
    vidaDiv.innerText = '❤️'.repeat(nave.vida);
    requestAnimationFrame(loop);
}

spawnInimigos(5 + fase * 2);
loop();ice(i, 1);
        if (boss.vida <= 0) {
          boss = null;
          if (fase < maxFase) {
            fase++;
            nivelNave = Math.min(nivelNave + 1, 6);
            naveVida = naveVidaMax;
            criarInimigos();
          } else {
            vitoria = true;
          }
        }
        break;
      }
    }
  }
}

// Checar colisão tiros inimigos com nave
function checarColisaoTirosInimigos() {
  for (let i = tirosInimigos.length - 1; i >= 0; i--) {
    const tiro = tirosInimigos[i];
    if (colisaoCirculo(tiro.x, tiro.y, 10, naveX, naveY, naveTamanho / 2)) {
      naveVida -= 15;
      tirosInimigos.splice(i, 1);
      if (naveVida <= 0) {
        gameOver = true;
      }
    }
  }
}

// Checar colisão inimigos e boss com a nave
function checarColisaoNave() {
  // Inimigos
  for (let inim of inimigos) {
    if (colisaoCirculo(naveX, naveY, naveTamanho / 2, inim.x, inim.y, inim.tamanho / 2)) {
      naveVida -= inim.dano;
      inim.y = -inim.tamanho; // reset inimigo pra cima
      if (naveVida <= 0) {
        gameOver = true;
      }
    }
  }
  // Boss
  if (boss) {
    if (colisaoCirculo(naveX, naveY, naveTamanho / 2, boss.x, boss.y, boss.largura / 2)) {
      naveVida -= boss.dano;
      if (naveVida <= 0) {
        gameOver = true;
      }
    }
  }
}

// Atualizar tudo
function atualizar(time) {
  if (gameOver || vitoria) return;
  atirar(time);
  inimigosAtiram(time);
  atualizarTiros();
  atualizarTirosInimigos();
  atualizarInimigos();
  atualizarBoss();
  checarColisoes();
  checarColisaoTirosInimigos();
  checarColisaoNave();
  criarBoss();
}

// Desenhar fundo animado de estrelas cadentes
const estrelas = [];
for(let i=0; i<100; i++){
  estrelas.push({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    tamanho: Math.random()*2+1,
    velocidade: Math.random()*1+0.3,
    comprimento: Math.random()*20+10
  });
}
function desenharFundo(){
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = 'white';
  estrelas.forEach(e => {
    ctx.beginPath();
    ctx.lineWidth = e.tamanho;
    ctx.moveTo(e.x, e.y);
    ctx.lineTo(e.x - e.comprimento, e.y + e.comprimento*0.3);
    ctx.stroke();

    e.x -= e.velocidade;
    e.y += e.velocidade*0.3;
    if(e.x < 0 || e.y > canvas.height){
      e.x = canvas.width + e.comprimento;
      e.y = Math.random()*canvas.height/2;
    }
  });
}

// Desenhar tudo
function desenhar() {
  desenharFundo();

  // Nave
  const imgNave = IMAGES['nave'+nivelNave];
  ctx.drawImage(imgNave, naveX - naveTamanho/2, naveY - naveTamanho/2, naveTamanho, naveTamanho);

  // Tiros do jogador
  tiros.forEach(tiro => {
    ctx.drawImage(IMAGES.tiro, tiro.x - 5, tiro.y - 15, 10, 30);
  });

  // Tiros inimigos
  tirosInimigos.forEach(tiro => {
    ctx.drawImage(IMAGES.tiroInimigo, tiro.x - 10, tiro.y - 20, 20, 40);
  });

  // Inimigos
  inimigos.forEach(inim => {
    ctx.fillStyle = inim.cor;
    ctx.beginPath();
    ctx.arc(inim.x, inim.y, inim.tamanho/2, 0, Math.PI*2);
    ctx.fill();
  });

  // Boss
  if (boss) {
    ctx.fillStyle = 'red';
    ctx.fillRect(boss.x - boss.largura/2, boss.y - boss.altura/2, boss.largura, boss.altura);

    // Vida do boss
    ctx.fillStyle = 'black';
    ctx.fillRect(boss.x - boss.largura/2, boss.y - boss.altura/2 - 15, boss.largura, 10);
    ctx.fillStyle = 'limegreen';
    ctx.fillRect(boss.x - boss.largura/2, boss.y - boss.altura/2 - 15, boss.largura * (boss.vida / boss.vidaMax), 10);
  }

  // Barra de vida da nave
  const barraX = 20;
  const barraY = 20;
  const barraLargura = 200;
  const barraAltura = 20;
  ctx.fillStyle = 'black';
  ctx.fillRect(barraX, barraY, barraLargura, barraAltura);
  ctx.fillStyle = 'limegreen';
  ctx.fillRect(barraX, barraY, barraLargura * (naveVida / naveVidaMax), barraAltura);
  ctx.strokeStyle = 'white';
  ctx.strokeRect(barraX, barraY, barraLargura, barraAltura);

  // Indicador de fase
  ctx.fillStyle = 'white';
  ctx.font = '24px Arial';
  ctx.textAlign = 'center';
  ctx.fillText(`Fase ${fase}`, canvas.width / 2, 40);

  // Tela final vitoria
  if (vitoria) {
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';

    // Coração imagem
    const coracaoSize = 150;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    ctx.drawImage(IMAGES.coracao, cx - coracaoSize / 2, cy - coracaoSize / 2, coracaoSize, coracaoSize);

    ctx.fillText('Toque no coração ❤️', cx, cy + coracaoSize);

    // Evento click no coração para mensagem romântica
    canvas.onclick = function(event) {
      const rect = canvas.getBoundingClientRect();
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;
      if (
        clickX >= cx - coracaoSize / 2 &&
        clickX <= cx + coracaoSize / 2 &&
        clickY >= cy - coracaoSize / 2 &&
        clickY <= cy + coracaoSize / 2
      ) {
        alert(`A nossa relação é como esse jogo...
Vão ter fases difíceis, isso faz parte...
Mas ainda assim, é só não desistir.

Eu te amo ❤️`);
      }
    };
  } else if (gameOver) {
    ctx.fillStyle = 'red';
    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('Você perdeu! Reiniciando...', canvas.width / 2, canvas.height / 2);
    setTimeout(() => {
      reiniciarJogo();
    }, 2500);
  }
}

// Reiniciar jogo
function reiniciarJogo() {
  fase = 1;
  naveVida = naveVidaMax;
  nivelNave = 1;
  gameOver = false;
  vitoria = false;
  naveX = canvas.width / 2;
  naveY = canvas.height - 100;
  inimigos = [];
  tiros = [];
  tirosInimigos = [];
  boss = null;
  criarInimigos();
}

// Loop do jogo
let ultimoTempo = 0;
function loop(time = 0) {
  const delta = time - ultimoTempo;
  ultimoTempo = time;
  atualizar(time);
  desenhar();
  if (!gameOver && !vitoria) {
    requestAnimationFrame(loop);
  }
}

// Iniciar jogo
function iniciarJogo() {
  naveX = canvas.width / 2;
  naveY = canvas.height - 100;
  criarInimigos();
  requestAnimationFrame(loop);
}
