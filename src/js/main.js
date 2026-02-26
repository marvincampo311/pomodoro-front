const userData = sessionStorage.getItem('user');
if (!userData) {
    window.location.href = 'src/pages/login.html';
}

const timerSettings = {
    pomodoro: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
};

const modeLabels = {
    pomodoro: 'ENFOQUE',
    short: 'DESCANSO CORTO',
    long: 'DESCANSO LARGO'
};

let currentMode = 'pomodoro';
let timeLeft = timerSettings[currentMode];
let timerId = null;
let isRunning = false;

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(userData);
    const display = document.getElementById('usernameDisplay');
    if (display) display.innerText = `Hola, ${user.username}`;

    document.getElementById('startBtn').addEventListener('click', toggleTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);

    setupSettingsModal();
    syncSettingsInputs();
    setMode('pomodoro');
});

function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function getStartLabel() {
    return `EMPEZAR ${modeLabels[currentMode]}`;
}

function getRunningStatus() {
    if (currentMode === 'pomodoro') return 'En enfoque...';
    if (currentMode === 'short') return 'En descanso corto...';
    return 'En descanso largo...';
}

function toggleTimer() {
    const startBtn = document.getElementById('startBtn');
    const statusText = document.getElementById('status');

    if (isRunning) {
        clearInterval(timerId);
        isRunning = false;
        startBtn.innerText = `REANUDAR ${modeLabels[currentMode]}`;
        statusText.innerText = 'Pausado';
        return;
    }

    isRunning = true;
    startBtn.innerText = 'PAUSAR';
    statusText.innerText = getRunningStatus();

    timerId = setInterval(() => {
        timeLeft -= 1;
        updateDisplay();

        if (timeLeft <= 0) {
            clearInterval(timerId);
            isRunning = false;
            alert('¡Tiempo cumplido!');
            resetTimer();
        }
    }, 1000);
}

function resetTimer() {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    timeLeft = timerSettings[currentMode];
    document.getElementById('startBtn').innerText = getStartLabel();
    document.getElementById('status').innerText = 'Esperando...';
    updateDisplay();
}

function setMode(mode) {
    if (!timerSettings[mode]) return;

    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    currentMode = mode;
    timeLeft = timerSettings[mode];

    document.querySelectorAll('.mode-btn').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });

    document.getElementById('startBtn').innerText = getStartLabel();
    document.getElementById('status').innerText = 'Esperando...';
    updateDisplay();
}

function setupSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const btnOpen = document.getElementById('settingsBtn');
    const btnClose = document.getElementById('closeModal');
    const btnApply = document.getElementById('applySettings');

    if (!modal || !btnOpen || !btnClose || !btnApply) return;

    btnOpen.addEventListener('click', () => {
        modal.classList.remove('hidden');
    });

    btnClose.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    btnApply.addEventListener('click', () => {
        const p = parseInt(document.getElementById('inputPomodoro').value, 10);
        const s = parseInt(document.getElementById('inputShort').value, 10);
        const l = parseInt(document.getElementById('inputLong').value, 10);

        if (!isValidMinutes(p) || !isValidMinutes(s) || !isValidMinutes(l)) {
            alert('Ingresa solo números mayores a 0.');
            return;
        }

        timerSettings.pomodoro = p * 60;
        timerSettings.short = s * 60;
        timerSettings.long = l * 60;

        setMode('pomodoro');
        modal.classList.add('hidden');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.add('hidden');
    });
}

function syncSettingsInputs() {
    document.getElementById('inputPomodoro').value = timerSettings.pomodoro / 60;
    document.getElementById('inputShort').value = timerSettings.short / 60;
    document.getElementById('inputLong').value = timerSettings.long / 60;
}

function isValidMinutes(value) {
    return Number.isInteger(value) && value > 0;
}

function logout() {
    sessionStorage.clear();
    window.location.href = 'src/pages/login.html';
}