const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');
const coletavel = document.querySelector('#coletavel');
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

let playerName = "";
let score = 0;
let level = 1;
let isGameOver = true;
let gameLoopInterval;
let scoreInterval;

const charImages = {
    subzero: 'https://icons8.com',
    coala: 'https://icons8.com',
    professor: 'https://icons8.com'
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
    mario.style.bottom = '0px';
    mario.src = charImages[selectedChar];
    
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

    gameLoopInterval = setInterval(() => {
        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
        
        if (pipePosition <= 120 && pipePosition > 50 && marioPosition < 80) {
            endGame(pipePosition, marioPosition);
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
    pipe.style.left = `${pipePos}px`;
    
    mario.style.animation = 'none';
    mario.style.bottom = `${marioPos}px`;
    
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
        console.log("Pontuação salva:", data);
        atualizarRankingTabela();
    });
}

function atualizarRankingTabela() {
    fetch('obter_ranking.php')
    .then(response => response.text())
    .then(html => {
        document.querySelector('#ranking-body').innerHTML = html;
    });
}

btnRestart.addEventListener('click', () => {
    gameoverModal.classList.remove('active');
    resetGameProperties();
});

btnChangePlayer.addEventListener('click', () => {
    gameoverModal.classList.remove('active');
    startModal.classList.add('active');
});
