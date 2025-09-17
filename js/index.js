// -------------------- Timer Preset Data --------------------
const timerData = {
  eggs: [
    { label: "🥚 Runny yolk (3 min)", minutes: 3 },
    { label: "🥚 Soft boiled (8 min)", minutes: 8 },
    { label: "🥚 Hard boiled (10 min)", minutes: 10 },
    { label: "🥚 Very firm (13 min)", minutes: 13 }
  ],
  tea: [
    { label: "🍵 Green tea (2 min)", minutes: 2 },
    { label: "🍵 White tea (3 min)", minutes: 3 },
    { label: "🍵 Oolong tea (3 min)", minutes: 3 },
    { label: "🍵 Black tea (5 min)", minutes: 5 },
    { label: "🍵 Herbal tea (10 min)", minutes: 10 }
  ]
};

// -------------------- Elements --------------------
const eggPresetsContainer = document.getElementById("egg-presets");
const teaPresetsContainer = document.getElementById("tea-presets");
const customTimerForm = document.getElementById("custom-timer-form");

// -------------------- Generate Preset Buttons --------------------
timerData.eggs.forEach(item => {
  const btn = document.createElement("button");
  btn.textContent = item.label;
  btn.addEventListener('click', () => startTimer(item.minutes));
  if (eggPresetsContainer) eggPresetsContainer.appendChild(btn);
});

timerData.tea.forEach(item => {
  const btn = document.createElement("button");
  btn.textContent = item.label;
  btn.addEventListener('click', () => startTimer(item.minutes));
  if (teaPresetsContainer) teaPresetsContainer.appendChild(btn);
});

// -------------------- Start Custom Timer --------------------
customTimerForm.addEventListener("submit", (event) => {
  // Prevent the default form submission which reloads the page
  event.preventDefault();

  const val = document.getElementById("custom-minutes").value;
  const minutes = parseInt(val);
  if (!isNaN(minutes) && minutes > 0) {
    startTimer(minutes);
  } else {
    alert("Please enter valid minutes!");
  }
});

// -------------------- Navigate to Timer Page --------------------
function startTimer(minutes) {
  // Navigate to timer.html with minutes query parameter
  window.location.href = `timer.html?minutes=${minutes}`;
}
