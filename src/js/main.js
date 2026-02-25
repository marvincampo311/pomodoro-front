// --- 1. PROTECCIÓN DE RUTA (EJECUCIÓN INMEDIATA) ---
const userData = sessionStorage.getItem('user');
if (!userData) {
    window.location.href = 'src/pages/login.html';
}

// --- 2. VARIABLES DEL CRONÓMETRO ---
let timeLeft = 25 * 60; // 25 minutos en segundos
let timerId = null;
let isRunning = false;

// --- 3. INICIALIZACIÓN DE LA INTERFAZ ---
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(userData);

    // Mostrar nombre de usuario
    const display = document.getElementById('usernameDisplay');
    if (display) display.innerText = `Hola, ${user.username}`;

    // Referencias a botones
    const startBtn = document.getElementById('startBtn');
    const resetBtn = document.getElementById('resetBtn');
    const timerDisplay = document.getElementById('timer');

    // Eventos
    startBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);

    // Pintar el tiempo inicial
    updateDisplay();
});

// --- 4. FUNCIONES DEL RELOJ ---
function updateDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const timerDisplay = document.getElementById('timer');

    // Formato 00:00
    timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function toggleTimer() {
    const startBtn = document.getElementById('startBtn');
    const statusText = document.getElementById('status');

    if (isRunning) {
        // PAUSAR
        clearInterval(timerId);
        startBtn.innerText = "REANUDAR ENFOQUE";
        statusText.innerText = "Pausado";
    } else {
        // INICIAR
        isRunning = true;
        startBtn.innerText = "PAUSAR";
        statusText.innerText = "En enfoque...";

        timerId = setInterval(() => {
            timeLeft--;
            updateDisplay();

            if (timeLeft <= 0) {
                clearInterval(timerId);
                alert("¡Tiempo cumplido! Descansa un poco.");
                resetTimer();
            }
        }, 1000);
    }
    isRunning = !isRunning;
}

function resetTimer() {
    clearInterval(timerId);
    isRunning = false;
    timeLeft = 25 * 60;

    document.getElementById('startBtn').innerText = "EMPEZAR ENFOQUE";
    document.getElementById('status').innerText = "Esperando...";
    updateDisplay();
}

// --- 5. SESIÓN ---
function logout() {
    sessionStorage.clear();
    window.location.href = 'src/pages/login.html';
}