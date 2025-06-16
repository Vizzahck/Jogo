// Canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// HUD
const faseDiv = document.getElementById('fase');
const vidaDiv = document.getElementById('vidaNave');

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
bossImg.src = './assets/inimigo.png';

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
let inimigosDerrotados = 0;

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
function spawnInimigo() {
    inimigos.push({
        x: Math.random() * (canvas.width - 50),
        y: -60,
        w: 50,
        h: 50,
        vida: 1,
        velocidade: 2 + fase * 0.3
    });
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

    ctx.drawImage(naveImg, nave.x - nave.w/2, nave.y - nave.h/2, nave.w, nave.h);

    tiros.forEach(t => {
        ctx.drawImage(tiroNaveImg, t.x - 5, t.y - 10, 10, 20);
    });

    inimigos.forEach(i => {
        ctx.drawImage(inimigoImg, i.x, i.y, i.w, i.h);
    });

    tirosInimigos.forEach(t => {
        ctx.drawImage(tiroInimigoImg, t.x - 5, t.y - 10, 10, 20);
    });

    if (boss) {
        ctx.drawImage(bossImg, boss.x, boss.y, boss.w, boss.h);
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

    tiros.forEach(t => t.y -= 8);
    tiros = tiros.filter(t => t.y > -20);

    tirosInimigos.forEach(t => t.y += 5);
    tirosInimigos = tirosInimigos.filter(t => t.y < canvas.height + 20);

    inimigos.forEach(i => {
        i.y += i.velocidade;
        if (Math.random() < 0.015) {
            tirosInimigos.push({x: i.x + i.w/2, y: i.y + i.h});
        }
    });

    inimigos = inimigos.filter(i => i.y < canvas.height + 50 && i.vida > 0);

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
                if (i.vida <= 0) inimigosDerrotados++;
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

    // Derrota
    if (nave.vida <= 0) {
        reiniciarJogo();
        return;
    }

    // Vitória da fase
    if (boss && boss.vida <= 0) {
        boss = null;
        if (fase >= 21) {
            jogoFinalizado = true;
            alert(`Viu amor, as vezes nosso relacionamento vai ser difícil, mas não podemos desistir ❤️`);
        } else {
            fase++;
            nave.vida = 5;
            inimigosDerrotados = 0;
        }
    }

    // Spawn de inimigos
    if (!boss) {
        if (inimigosDerrotados < 15) {
            if (Math.random() < 0.03) spawnInimigo();
        } else if (inimigos.length === 0) {
            spawnBoss();
        }
    }
}

function reiniciarJogo() {
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
    boss = null;
    jogoFinalizado = false;
    tempoDisparo = 0;
    inimigosDerrotados = 0;
    fase = 1;
}

function loop() {
    atualizar();
    desenhar();
    faseDiv.innerText = 'Fase ' + fase;
    vidaDiv.innerText = '❤️'.repeat(nave.vida);
    requestAnimationFrame(loop);
}

// Inicializar
loop();