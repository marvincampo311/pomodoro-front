function getStoredUser() {
    const raw = sessionStorage.getItem('user');
    if (!raw) return null;

    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : null;
    } catch (_e) {
        return null;
    }
}

const currentUser = getStoredUser();
if (!currentUser) {
    sessionStorage.removeItem('user');
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
    const display = document.getElementById('usernameDisplay');
    if (display) display.innerText = `Hola, ${(currentUser && currentUser.username) || 'Usuario'}`;

    document.getElementById('startBtn').addEventListener('click', toggleTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);

    setupSettingsModal();
    setupPdfDownload();
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

function setupPdfDownload() {
    const downloadBtn = document.getElementById('downloadPdf');
    if (!downloadBtn) return;

    downloadBtn.addEventListener('click', () => {
        if (typeof html2pdf === 'undefined') {
            alert('No se pudo cargar la librería de PDF.');
            return;
        }

        const notesText = document.getElementById('sessionNotes').value;
        const storedUser = getStoredUser();
        const username = (storedUser && storedUser.username) || 'Usuario';
        const date = new Date().toLocaleDateString();

        const element = document.createElement('div');
        element.innerHTML = `
            <div style="padding: 40px; font-family: Arial, sans-serif;">
                <h1 style="color: #333;">Reporte de Enfoque - Pomodoro Pro</h1>
                <p><strong>Usuario:</strong> ${username}</p>
                <p><strong>Fecha:</strong> ${date}</p>
                <hr style="margin: 20px 0;">
                <div style="white-space: pre-wrap; line-height: 1.6;">${(notesText || 'Sin notas registradas.').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            </div>
        `;

        const opt = {
            margin: 1,
            filename: `Notas_Pomodoro_${username}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(element).save();
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
