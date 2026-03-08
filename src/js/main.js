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

const CYCLE_STORAGE_PREFIX = 'pomodoro_cycle_history';

let currentMode = 'pomodoro';
let timeLeft = timerSettings[currentMode];
let timerId = null;
let isRunning = false;
let cycleHistory = [];

document.addEventListener('DOMContentLoaded', () => {
    const display = document.getElementById('usernameDisplay');
    if (display) display.innerText = `Hola, ${(currentUser && currentUser.username) || 'Usuario'}`;

    document.getElementById('startBtn').addEventListener('click', toggleTimer);
    document.getElementById('resetBtn').addEventListener('click', resetTimer);

    setupSettingsModal();
    setupPdfDownload();
    loadCycleHistory();
    updateCycleStatsUI();
    renderCycleHistory();
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

function getCycleStorageKey() {
    const userId = (currentUser && currentUser.id) ? currentUser.id : '';
    const username = (currentUser && currentUser.username) ? currentUser.username : 'usuario';
    const safeUsername = String(username).replace(/\s+/g, '_').toLowerCase();
    const identity = userId || safeUsername;
    return `${CYCLE_STORAGE_PREFIX}:${identity}`;
}

function loadCycleHistory() {
    const raw = localStorage.getItem(getCycleStorageKey());
    if (!raw) {
        cycleHistory = [];
        return;
    }

    try {
        const parsed = JSON.parse(raw);
        cycleHistory = Array.isArray(parsed) ? parsed : [];
    } catch (_e) {
        cycleHistory = [];
    }
}

function saveCycleHistory() {
    localStorage.setItem(getCycleStorageKey(), JSON.stringify(cycleHistory));
}

function dateKeyFromDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getTodayDateKey() {
    return dateKeyFromDate(new Date());
}

function isCycleFromToday(cycleEntry) {
    if (!cycleEntry || !cycleEntry.completedAt) return false;
    const d = new Date(cycleEntry.completedAt);
    if (Number.isNaN(d.getTime())) return false;
    return dateKeyFromDate(d) === getTodayDateKey();
}

function updateCycleStatsUI() {
    const todayCount = cycleHistory.filter(isCycleFromToday).length;
    const cyclesEl = document.getElementById('cyclesTodayValue');
    if (cyclesEl) cyclesEl.innerText = String(todayCount);
}

function renderCycleHistory() {
    const list = document.getElementById('cycleHistoryList');
    if (!list) return;

    list.innerHTML = '';

    if (cycleHistory.length === 0) {
        const item = document.createElement('li');
        item.className = 'history-item history-empty';
        item.innerText = 'Aun no hay ciclos completados.';
        list.appendChild(item);
        return;
    }

    const sorted = [...cycleHistory].sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    const recent = sorted.slice(0, 8);

    recent.forEach((entry) => {
        const item = document.createElement('li');
        item.className = 'history-item';

        const completedDate = new Date(entry.completedAt);
        const timeText = Number.isNaN(completedDate.getTime())
            ? 'Fecha no disponible'
            : completedDate.toLocaleString();

        const mins = Number(entry.durationMinutes) || Math.round(timerSettings.pomodoro / 60);
        item.innerText = `Ciclo completado (${mins} min) - ${timeText}`;
        list.appendChild(item);
    });
}

function registerCompletedPomodoroCycle() {
    cycleHistory.push({
        mode: 'pomodoro',
        durationMinutes: Math.round(timerSettings.pomodoro / 60),
        completedAt: new Date().toISOString()
    });
    saveCycleHistory();
    updateCycleStatsUI();
    renderCycleHistory();
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

            if (currentMode === 'pomodoro') {
                registerCompletedPomodoroCycle();
            }

            alert('Tiempo cumplido!');
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
            alert('Ingresa solo numeros mayores a 0.');
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
        const JsPdfCtor = (window.jspdf && window.jspdf.jsPDF) || window.jsPDF || null;
        if (!JsPdfCtor) {
            alert('No se pudo cargar el generador de PDF.');
            console.error('jsPDF no disponible en window.jspdf/window.jsPDF');
            return;
        }

        const notesField = document.getElementById('sessionNotes');
        const notesText = notesField ? notesField.value : '';
        const storedUser = getStoredUser();
        const username = (storedUser && storedUser.username) || 'Usuario';
        const date = new Date().toLocaleDateString();
        const doc = new JsPdfCtor({ unit: 'pt', format: 'letter', orientation: 'portrait' });

        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const marginX = 50;
        const marginTop = 55;
        const lineHeight = 18;
        const maxTextWidth = pageWidth - (marginX * 2);
        let y = marginTop;

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(20);
        doc.text('Reporte de Enfoque - Pomodoro Pro', marginX, y);
        y += 30;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(`Usuario: ${username}`, marginX, y);
        y += 20;
        doc.text(`Fecha: ${date}`, marginX, y);
        y += 25;

        doc.setDrawColor(180);
        doc.line(marginX, y, pageWidth - marginX, y);
        y += 25;

        const safeNotes = notesText && notesText.trim() ? notesText : 'Sin notas registradas.';
        const lines = doc.splitTextToSize(safeNotes, maxTextWidth);

        lines.forEach((line) => {
            if (y > pageHeight - 55) {
                doc.addPage();
                y = marginTop;
                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
            }
            doc.text(line, marginX, y);
            y += lineHeight;
        });

        doc.save(`Notas_Pomodoro_${username}.pdf`);
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
