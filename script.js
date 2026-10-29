const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const coletavel = document.querySelector('#coletavel');
const clouds = document.querySelector('.clouds');
const startModal = document.querySelector('#start-modal');
const gameoverModal = document.querySelector('#gameover-modal');
const startForm = document.querySelector('#start-form');
const hudPlayerName = document.querySelector('#hud-player-name');
const scoreDisplay = document.querySelector('#score-display');
const levelDisplay = document.querySelector('#level-display');
const finalScoreValue = document.querySelector('#final-score-value');
const btnRestart = document.querySelector('#btn-restart');
const btnChangePlayer = document.querySelector('#btn-change-player');
const charButtons = document.querySelectorAll('.btn-char');
const btnViewRanking = document.querySelector('#btn-view-ranking');

let playerName = "";
let score = 0;
let level = 1;
let isGameOver = true;
let gameLoopInterval;
let scoreInterval;

const charImages = {
    subzero: 'subzero.png?v=2.0',
    kratos: 'kratos.png',
    roberto: 'roberto.jpg'
};


let selectedChar = "subzero";

charButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        charButtons.forEach(b => b.style.borderColor = '#555');
        btn.style.borderColor = '#f1c40f';
        selectedChar = btn.getAttribute('data-char');
    });
});

startForm.addEventListener('submit', (event) => {
    event.preventDefault();
    playerName = document.querySelector('#player-input').value;
    hudPlayerName.textContent = playerName.toUpperCase();
    
    mario.src = charImages[selectedChar];
    
    startModal.classList.remove('active');
    resetGameProperties();
});

const jump = () => {
    if (isGameOver) return;
    if (mario.classList.contains('jump')) return;
    
    mario.classList.add('jump');
    setTimeout(() => {
        mario.classList.remove('jump');
    }, 500);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') jump();
});
document.addEventListener('click', jump);

function resetGameProperties() {
    score = 0;
    level = 1;
    isGameOver = false;
    scoreDisplay.textContent = score;
    levelDisplay.textContent = level;
    
    pipe.style.animation = 'pipe-animation 2s infinite linear';
    pipe.style.left = '';
    
    clouds.style.animation = 'clouds-animation 20s infinite linear';
    clouds.style.left = '';

    mario.style.animation = '';
    mario.style.bottom = '0px';
    mario.src = charImages[selectedChar];
    
    coletavel.style.display = 'block';
    coletavel.style.right = '-40px';
    
    startLoops();
}

function startLoops() {
    scoreInterval = setInterval(() => {
        if (!isGameOver) {
            score++;
            scoreDisplay.textContent = score;
            checkLevelProgress();
        }
    }, 100);

    let itemSpeed = 2.5;
    let itemPosition = -40;
    coletavel.style.right = itemPosition + 'px';

    gameLoopInterval = setInterval(() => {
        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
        
        if (pipePosition <= 120 && pipePosition > 50 && marioPosition < 80) {
            endGame(pipePosition, marioPosition);
            return;
        }

        if (!isGameOver) {
            itemPosition += itemSpeed;
            if (itemPosition > 640) {
                itemPosition = -40;
            }
            coletavel.style.left = (600 - itemPosition) + 'px';

            const coletavelLeft = coletavel.offsetLeft;

            if (coletavelLeft <= 110 && coletavelLeft > 50 && marioPosition >= 70 && marioPosition <= 160) {
                score += 50;
                scoreDisplay.textContent = score;
                itemPosition = -150; 
                checkLevelProgress();
            }
        }
    }, 10);
}

function checkLevelProgress() {
    if (score >= 300 && level === 2) {
        level = 3;
        levelDisplay.textContent = level;
        pipe.style.animationDuration = '1.0s';
    } else if (score >= 100 && level === 1) {
        level = 2;
        levelDisplay.textContent = level;
        pipe.style.animationDuration = '1.4s';
    }
}

function endGame(pipePos, marioPos) {
    isGameOver = true;
    clearInterval(gameLoopInterval);
    clearInterval(scoreInterval);
    
    pipe.style.animation = 'none';
    pipe.style.left = pipePos + 'px';
    
    clouds.style.animation = 'none';
    clouds.style.left = clouds.offsetLeft + 'px';
    
    mario.style.animation = 'none';
    mario.style.bottom = marioPos + 'px';
    mario.src = charImages[selectedChar];
    
    coletavel.style.display = 'none';
    
    finalScoreValue.textContent = score;
    gameoverModal.classList.add('active');
    
    salvarPontuacaoNoBanco();
}

function salvarPontuacaoNoBanco() {
    const formData = new FormData();
    formData.append('nome', playerName);
    formData.append('pontos', score);

    fetch('salvar_ranking.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        atualizarRankingTabela();
    })
    .catch(error => console.error("Erro ao salvar ranking:", error));
}

function atualizarRankingTabela() {
    fetch('obter_ranking.php')
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            const rankingBody = document.querySelector('#ranking-body');
            rankingBody.innerHTML = '';

            if (data.ranking.length === 0) {
                rankingBody.innerHTML = "<tr><td colspan='3' class='loading-cell'>Nenhuma pontuação gravada ainda. Jogue para ser o 1º!</td></tr>";
                return;
            }

            data.ranking.forEach((row, i) => {
                let posicao = (i + 1) + "º";
                if (i === 0) posicao = "🥇 1º";
                if (i === 1) posicao = "🥈 2º";
                if (i === 2) posicao = "🥉 3º";

                const tr = document.createElement('tr');
                tr.innerHTML = "<tr><td class='ranking-pos'>" + posicao + "</td><td><strong>" + escapeHTML(row.nome) + "</strong></td><td>" + parseInt(row.pontos) + " pts</td></tr>";
                rankingBody.appendChild(tr);
            });
        }
    })
    .catch(error => console.error("Erro ao obter ranking:", error));
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
}

btnRestart.addEventListener('click', () => {
    gameoverModal.classList.remove('active');
    resetGameProperties();
});

btnChangePlayer.addEventListener('click', () => {
    gameoverModal.classList.remove('active');
    startModal.classList.add('active');
});

if (btnViewRanking) {
    btnViewRanking.addEventListener('click', () => {
        startModal.classList.remove('active');
        finalScoreValue.textContent = "0";
        atualizarRankingTabela();
        gameoverModal.classList.add('active');
    });
}
