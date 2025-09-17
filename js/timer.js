// js/timer.js
(function () {
  // ---------- DOM Ready Event Listener ----------
  // Ensures the script runs after the page is fully loaded.
  document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.getElementById('back-btn');
    if (backButton) {
      backButton.addEventListener('click', () => (window.location.href = 'index.html'));
    }
  });

  // ---------- Read & validate minutes from URL ----------
  const params = new URLSearchParams(window.location.search);
  const minutesRaw = params.get('minutes');
  const parsed = Number(minutesRaw);
  const minutes = Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : null;

  if (minutes === null) {
    // Invalid minutes -> go back to index (safer UX)
    alert('Invalid timer value. Please set a valid time.');
    window.location.href = 'index.html';
    return;
  }

  const originalTitle = document.title;
  // ---------- Initial state ----------
  let totalSeconds = minutes * 60;
  let secondsLeft = totalSeconds;

  // ---------- Elements ----------
  const timerContainer = document.querySelector('.timer-container');
  const circle = document.getElementById('circle');
  const timeDisplay = document.getElementById('time');
  const popup = document.getElementById('done-popup');
  const closePopupBtn = document.getElementById('close-popup');
  const controlBtn = document.getElementById('control-btn');
  const resetBtn = document.getElementById('reset-btn');
  const tickSound = document.getElementById('tick-sound');

  // ---------- Circle setup ----------
  const radius = 125;
  const circumference = 2 * Math.PI * radius;
  if (circle) {
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;
  }

  // ---------- Display update ----------
  function updateDisplay() {
    const m = Math.floor(secondsLeft / 60);
    const s = secondsLeft % 60;
    const timeString = `${m}:${String(s).padStart(2, '0')}`;

    if (timeDisplay && timeDisplay.textContent !== timeString) {
      timeDisplay.textContent = timeString;
      // Add class to trigger animation and remove it after it finishes
      timeDisplay.classList.add('pop');
      setTimeout(() => timeDisplay.classList.remove('pop'), 300); // Match CSS animation duration
    } else if (timeDisplay && !timeDisplay.textContent) {
      timeDisplay.textContent = timeString; // For initial render
    }

    document.title = `${timeString} - ${originalTitle}`;

    // safe progress calculation (clamp)
    const progress = totalSeconds > 0 ? Math.max(0, Math.min(1, secondsLeft / totalSeconds)) : 0;
    const offset = circumference * (1 - progress);
    if (circle) circle.style.strokeDashoffset = offset;

    // flash class in last 10s (if your CSS supports it)
    if (timeDisplay) {
      if (secondsLeft <= 10) timeDisplay.classList.add('flash');
      else timeDisplay.classList.remove('flash');
    }
  }

  // initial render
  updateDisplay();

  // ---------- Countdown logic ----------
  let intervalId = null;

  function toggleTimer() {
    if (intervalId) { // Timer is running, so pause it
      clearInterval(intervalId);
      intervalId = null;
      document.body.classList.remove('timer-running');
      if (timerContainer) timerContainer.classList.add('paused');
      if (controlBtn) controlBtn.textContent = 'Resume';
    } else { // Timer is paused or not started, so start/resume it
      if (controlBtn) controlBtn.textContent = 'Pause';
      if (timerContainer) timerContainer.classList.remove('paused');
      document.body.classList.add('timer-running');

      // If timer finished, reset it before starting
      if (secondsLeft <= 0) {
        secondsLeft = totalSeconds;
        updateDisplay();
      }

      // --- Prime the tick sound on the first user interaction ---
      const prime = (sound) => {
        if (sound) {
          const playPromise = sound.play();
          if (playPromise !== undefined) {
            playPromise.then(() => {
              sound.pause();
              sound.currentTime = 0;
            }).catch(() => {
              // Autoplay was prevented.
            });
          }
        }
      }
      prime(tickSound);

      intervalId = setInterval(() => {
        if (tickSound) { try { tickSound.currentTime = 0; tickSound.play(); } catch(e) {} }
        secondsLeft--;
        updateDisplay();

        if (secondsLeft <= 0) {
          clearInterval(intervalId);
          intervalId = null;
          document.body.classList.remove('timer-running');
          popup.style.display = 'flex';
          document.title = `⏰ Time's Up!`;
          if (controlBtn) controlBtn.textContent = 'Start'; // Reset button for next run
        }
      }, 1000);
    }
  }

  // ---------- Reset logic ----------
  function resetTimer() {
    // Stop any active interval
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
      document.body.classList.remove('timer-running');
    }

    // Reset state variables
    secondsLeft = totalSeconds;
    if (controlBtn) controlBtn.textContent = 'Start';
    if (timerContainer) timerContainer.classList.remove('paused');

    // Update the UI
    updateDisplay();
  }
  // ---------- Close popup handler (reset UI for another run) ----------
  if (closePopupBtn) {
    closePopupBtn.addEventListener('click', () => {
      popup.style.display = 'none';
      // reset timer for next run
      secondsLeft = totalSeconds;
      document.title = originalTitle;
      updateDisplay();
    });
  }

  // ---------- Control button handler (Pause/Resume) ----------
  if (controlBtn) controlBtn.addEventListener('click', toggleTimer);
  if (resetBtn) resetBtn.addEventListener('click', resetTimer);

  // Safety: Confirm before leaving if the timer is running
  window.addEventListener('beforeunload', (event) => {
    // If the timer is running (not paused), show a confirmation dialog.
    if (intervalId) {
      // Standard way to trigger the browser's native confirmation dialog.
      // The custom message is no longer displayed in most modern browsers.
      event.preventDefault();
      event.returnValue = 'Are you sure you want to leave? The timer is still running.';
    }
  });

  // ---------- Keyboard Shortcuts ----------
  window.addEventListener('keydown', (event) => {
    // Ignore keypresses if user is typing in an input (none on this page, but good practice)
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      return;
    }

    if (event.code === 'Space') {
      event.preventDefault(); // Prevent page from scrolling down
      toggleTimer();
    } else if (event.code === 'KeyR') {
      resetTimer();
    }
  });
})();
