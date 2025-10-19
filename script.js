// Typing Speed Test - script.js
// Modular, clear logic. Uses local sentences (no API).
const sentences = [
  "The quick brown fox jumps over the lazy dog.",
  "Life is what happens when you are busy making other plans.",
  "Do not go where the path may lead, go instead where there is no path.",
  "Simplicity is the ultimate sophistication.",
  "A smooth sea never made a skilled sailor.",
  "Strive not to be a success, but rather to be of value.",
  "In the middle of difficulty lies opportunity.",
  "Action is the foundational key to all success.",
  "The only way to do great work is to love what you do.",
  "Small deeds done are better than great deeds planned."
];

const sentenceArea = document.getElementById('sentenceArea');
const input = document.getElementById('input');
const startBtn = document.getElementById('startBtn');
const nextBtn = document.getElementById('nextBtn');
const resetBestBtn = document.getElementById('resetBest');

const timeEl = document.getElementById('time');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const bestEl = document.getElementById('best');

const BEST_KEY = 'typing_best_wpm_v1';

let current = '';
let started = false;
let startTime = 0;
let elapsed = 0;
let timerInterval = null;
let typed = ''; // what the user typed
let bestWPM = parseInt(localStorage.getItem(BEST_KEY) || '0', 10);

// initialize
bestEl.textContent = bestWPM;
loadNewSentence();

// helpers
function pickSentence() {
  return sentences[Math.floor(Math.random() * sentences.length)];
}

function renderSentence(text) {
  sentenceArea.innerHTML = '';
  for (let i = 0; i < text.length; i++) {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = text[i];
    // mark the first character as current for guidance
    if (i === 0) span.classList.add('current');
    sentenceArea.appendChild(span);
  }
}

/**
 * Update visual feedback based on typed input
 */
function updateFeedback() {
  const spans = sentenceArea.querySelectorAll('.char');
  const typedLen = typed.length;

  // mark classes
  for (let i = 0; i < spans.length; i++) {
    spans[i].classList.remove('correct', 'incorrect', 'current');
    const ch = spans[i].textContent;
    if (i < typedLen) {
      if (typed[i] === ch) spans[i].classList.add('correct');
      else spans[i].classList.add('incorrect');
    } else if (i === typedLen) {
      spans[i].classList.add('current');
    }
  }

  // finish if whole sentence typed
  if (typedLen >= current.length) {
    finishTest();
  }
}

/**
 * Calculate metrics: WPM and accuracy
 */
function computeMetrics() {
  const correctChars = computeCorrectChars();
  const totalTyped = typed.length;
  const secs = Math.max(0.001, elapsed / 1000);
  const minutes = secs / 60;
  const wpm = minutes > 0 ? Math.round((correctChars / 5) / minutes) : 0;
  const accuracy = totalTyped > 0 ? Math.round((correctChars / totalTyped) * 100) : 0;
  return { wpm, accuracy, secs };
}

function computeCorrectChars() {
  let correct = 0;
  for (let i = 0; i < typed.length && i < current.length; i++) {
    if (typed[i] === current[i]) correct++;
  }
  return correct;
}

/**
 * Timer loop updates elapsed and displayed time & WPM live
 */
function startTimer() {
  startTime = performance.now();
  timerInterval = setInterval(() => {
    elapsed = performance.now() - startTime;
    const { wpm } = computeMetrics();
    timeEl.textContent = (elapsed / 1000).toFixed(1) + 's';
    wpmEl.textContent = wpm;
  }, 100);
}

function stopTimer() {
  clearInterval(timerInterval);
  timerInterval = null;
}

/**
 * Called when user completes sentence or clicks start/restart
 */
function finishTest() {
  if (!started) return;
  stopTimer();
  started = false;
  // ensure final elapsed
  elapsed = performance.now() - startTime;
  const { wpm, accuracy, secs } = computeMetrics();
  timeEl.textContent = secs.toFixed(1) + 's';
  wpmEl.textContent = wpm;
  accuracyEl.textContent = accuracy + '%';

  // update best
  if (wpm > bestWPM) {
    bestWPM = wpm;
    localStorage.setItem(BEST_KEY, String(bestWPM));
    bestEl.textContent = bestWPM;
    // brief highlight animation
    bestEl.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.08)' }, { transform: 'scale(1)' }], { duration: 420 });
  }
}

/**
 * Resets UI and state for a new sentence
 */
function loadNewSentence() {
  current = pickSentence();
  typed = '';
  started = false;
  startTime = 0;
  elapsed = 0;
  stopTimer();
  timeEl.textContent = '0.0s';
  wpmEl.textContent = '0';
  accuracyEl.textContent = '0%';
  input.value = '';
  renderSentence(current);
  // ensure focus
  input.focus();
}

/**
 * Start or restart the test
 */
function startTest() {
  loadNewSentence();
  // start immediately when user types
  input.focus();
}

/**
 * Reset best stored WPM
 */
function resetBest() {
  localStorage.removeItem(BEST_KEY);
  bestWPM = 0;
  bestEl.textContent = '0';
}

/* Input handling */
input.addEventListener('input', (e) => {
  // input.value includes current typed content
  // ensure we don't allow newlines (textarea used for comfortable input)
  typed = input.value.replace(/\r?\n/g, '');
  // start timer on first keystroke
  if (!started && typed.length > 0) {
    started = true;
    startTimer();
  }
  updateFeedback();
  // compute live accuracy too
  const { accuracy } = computeMetrics();
  accuracyEl.textContent = accuracy + '%';
});

input.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // clear input quickly
    typed = '';
    input.value = '';
    stopTimer();
    started = false;
    elapsed = 0;
    timeEl.textContent = '0.0s';
    wpmEl.textContent = '0';
    accuracyEl.textContent = '0%';
    updateFeedback();
  }
});

/* Buttons */
startBtn.addEventListener('click', () => {
  startTest();
});

nextBtn.addEventListener('click', () => {
  loadNewSentence();
});

resetBestBtn.addEventListener('click', () => {
  resetBest();
});

/* Keyboard shortcuts for convenience */
window.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'r') {
    e.preventDefault();
    loadNewSentence();
  }
});

/* Ensure best is shown on load */
bestEl.textContent = bestWPM;
