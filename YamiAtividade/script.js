const playArea = document.getElementById('play-area');
const scoreElement = document.getElementById('score');
const timeElement = document.getElementById('time');
const startBtn = document.getElementById('start-btn');

let score = 0;
let timeLeft = 15;
let gameInterval;
let countdownInterval;
let isPlaying = false;


startBtn.addEventListener('click', startGame);

function startGame() {
    if (isPlaying) return;
    
    isPlaying = true;
    score = 0;
    timeLeft = 15;
    scoreElement.textContent = score;
    timeElement.textContent = timeLeft;
    startBtn.disabled = true;
    startBtn.style.opacity = '0.5';
    playArea.innerHTML = ''; 

    countdownInterval = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
    }, 1000);

    gameInterval = setInterval(spawnYami, 800);

    setTimeout(endGame, timeLeft * 1000);
}

function spawnYami() {
    if (!isPlaying) return;

    const yami = document.createElement('img');
    yami.src = 'mask_yami.png';
    yami.alt = 'Alvo Yami';
    yami.classList.add('yami-target');

    yami.style.backgroundColor = '#550055'; 

    const yamiSize = 70;
    const maxX = playArea.clientWidth - yamiSize;
    const maxY = playArea.clientHeight - yamiSize;
    
    const randomX = Math.floor(Math.random() * maxX);
    const randomY = Math.floor(Math.random() * maxY);

    yami.style.left = `${randomX}px`;
    yami.style.top = `${randomY}px`;


    yami.addEventListener('mousedown', (event) => {
        if (!isPlaying) return;
        
        score++;
        scoreElement.textContent = score;
        
        createBloodEffect(event.clientX, event.clientY);
        

        yami.remove();
    });


    playArea.appendChild(yami);

  
    setTimeout(() => {
        if (playArea.contains(yami)) {
            yami.remove();
        }
}


function createBloodEffect(mouseX, mouseY) {
    const splatter = document.createElement('div');
    splatter.c
    }, 1200);lassList.add('blood-splatter');
    
    const rect = playArea.getBoundingClientRect();
    const x = mouseX - rect.left - 25; 
    const y = mouseY - rect.top - 25;

    splatter.style.left = `${x}px`;
    splatter.style.top = `${y}px`;
    
    playArea.appendChild(splatter);

    setTimeout(() => {
        if (playArea.contains(splatter)) {
            splatter.remove();
        }
    }, 400);
}

function endGame() {
    isPlaying = false;
    clearInterval(gameInterval);
    clearInterval(countdownInterval);
    
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
    
    playArea.innerHTML = '';
   
    setTimeout(() => {
        alert(`O tempo acabou!\nSua pontuação final foi: ${score} Yami(s) capturados.`);
    }, 100);
}