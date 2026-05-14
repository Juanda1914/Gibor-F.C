// Cuenta regresiva para el próximo partido
function updateCountdown() {
    // Fecha del próximo partido (cámbiala por la fecha real)
    const partidoDate = new Date('March 29, 2026 15:00:00').getTime();
    const now = new Date().getTime();
    const distance = partidoDate - now;

    if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        document.getElementById('days').textContent = String(days).padStart(2, '0');
        document.getElementById('hours').textContent = String(hours).padStart(2, '0');
        document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
        document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
    }
}

// Actualizar cada segundo
setInterval(updateCountdown, 1000);
updateCountdown();