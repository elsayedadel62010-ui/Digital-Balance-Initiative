/* ============================================================
   DIGITAL BALANCE — script.js
   All interactive functionality: nav, calculator, test, scoring,
   challenge, progress dashboard, badges, activities, sharing.
   ============================================================ */
(function(){
  "use strict";

  /* ---------- storage helpers ---------- */
  const STORE_KEYS = {
    testAnswers: "db_testAnswers",
    testResult: "db_testResult",
    challenge: "db_challenge",
    focusSessions: "db_focusSessions",
    screenTime: "db_screenTime",
    activities: "db_activities",
    badgesUnlocked: "db_badgesUnlocked",
    goal: "db_goal"
  };

  function load(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }
  function save(key, value){
    try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ /* storage unavailable */ }
  }

  /* ============================================================
     NAVBAR
     ============================================================ */
  const burgerBtn = document.getElementById("burgerBtn");
  const navLinks = document.getElementById("navLinks");

  function closeMenu(){
    navLinks.classList.remove("is-open");
    burgerBtn.classList.remove("is-open");
    burgerBtn.setAttribute("aria-expanded", "false");
  }
  burgerBtn.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    burgerBtn.classList.toggle("is-open", isOpen);
    burgerBtn.setAttribute("aria-expanded", String(isOpen));
  });
  document.querySelectorAll("[data-nav]").forEach(link => {
    link.addEventListener("click", closeMenu);
  });

  /* Back to top */
  const fabTop = document.getElementById("fabTop");
  const backToTopBtn = document.getElementById("backToTopBtn");
  function scrollTop(){ window.scrollTo({ top: 0, behavior: "smooth" }); }
  fabTop.addEventListener("click", scrollTop);
  backToTopBtn.addEventListener("click", scrollTop);
  window.addEventListener("scroll", () => {
    fabTop.classList.toggle("is-visible", window.scrollY > 500);
  });

  /* ============================================================
     SCREEN-TIME CALCULATOR
     ============================================================ */
  const calcRange = document.getElementById("calcRange");
  const calcHours = document.getElementById("calcHours");
  const calcDay = document.getElementById("calcDay");
  const calcWeek = document.getElementById("calcWeek");
  const calcMonth = document.getElementById("calcMonth");
  const calcYear = document.getElementById("calcYear");

  function fmt(n){ return n.toLocaleString(undefined, { maximumFractionDigits: 0 }); }

  function updateCalculator(){
    const h = parseFloat(calcRange.value);
    calcHours.textContent = h;
    calcDay.textContent = fmt(h);
    calcWeek.textContent = fmt(h * 7);
    calcMonth.textContent = fmt(h * 30.4);
    calcYear.textContent = fmt(h * 365);
  }
  calcRange.addEventListener("input", updateCalculator);
  updateCalculator();

  /* ============================================================
     DIGITAL BALANCE TEST
     ============================================================ */
  const QUESTIONS = [
    {
      id: "hours", category: "hours",
      text: "How many hours do you usually spend on your phone each day?",
      options: [
        { text: "Less than 2 hours", points: 3 },
        { text: "2–4 hours", points: 2.2 },
        { text: "4–6 hours", points: 1.4 },
        { text: "6–8 hours", points: 0.6 },
        { text: "More than 8 hours", points: 0 }
      ]
    },
    {
      id: "mindless", category: "mindless",
      text: "How often do you check your phone without a specific reason?",
      options: [
        { text: "Rarely", points: 3 }, { text: "Sometimes", points: 2 },
        { text: "Often", points: 1 }, { text: "Very often", points: 0 }
      ],
      recommendation: "Try leaving your phone in another room during focused activities — it breaks the automatic-checking habit."
    },
    {
      id: "study", category: "study",
      text: "Do you use your phone while studying?",
      options: [
        { text: "Never", points: 3 }, { text: "Sometimes", points: 2 },
        { text: "Often", points: 1 }, { text: "Almost always", points: 0 }
      ],
      recommendation: "Try a 45-minute phone-free study session."
    },
    {
      id: "meals", category: "meals",
      text: "Do you use your phone during meals?",
      options: [
        { text: "Never", points: 3 }, { text: "Sometimes", points: 2 },
        { text: "Often", points: 1 }, { text: "Almost always", points: 0 }
      ],
      recommendation: "Keep at least one meal a day phone-free to rebuild the habit."
    },
    {
      id: "sleep", category: "sleep",
      text: "Do you use your phone shortly before sleeping?",
      options: [
        { text: "Never", points: 3 }, { text: "Sometimes", points: 2 },
        { text: "Often", points: 1 }, { text: "Almost always", points: 0 }
      ],
      recommendation: "Create a 30-minute screen-free wind-down period before bed."
    },
    {
      id: "notifications", category: "notifications",
      text: "How often do notifications interrupt your studying or activities?",
      options: [
        { text: "Never", points: 3 }, { text: "Rarely", points: 2 },
        { text: "Sometimes", points: 1 }, { text: "Often", points: 0 }
      ],
      recommendation: "Turn off non-essential notifications so your phone interrupts you less."
    },
    {
      id: "selfcontrol", category: "selfcontrol",
      text: "Do you feel that you spend more time scrolling than you planned?",
      options: [
        { text: "Never", points: 3 }, { text: "Sometimes", points: 2 },
        { text: "Often", points: 1 }, { text: "Very often", points: 0 }
      ],
      recommendation: "Set a specific social-media time window and use an app timer to help you stick to it."
    },
    {
      id: "offline", category: "offline",
      text: "How often do you spend time doing offline activities?",
      options: [
        { text: "Every day", points: 3 }, { text: "Several times a week", points: 2 },
        { text: "Occasionally", points: 1 }, { text: "Rarely", points: 0 }
      ],
      recommendation: "Choose one 30–60 minute offline activity this week and put it on your calendar."
    },
    {
      id: "phonefree", category: "phonefree",
      text: "How often do you have phone-free periods during your day?",
      options: [
        { text: "Every day", points: 3 }, { text: "Several times a week", points: 2 },
        { text: "Occasionally", points: 1 }, { text: "Almost never", points: 0 }
      ],
      recommendation: "Block out one short phone-free period each day — even 20 minutes builds the habit."
    },
    {
      id: "satisfaction", category: "satisfaction",
      text: "How satisfied are you with your current digital habits?",
      options: [
        { text: "Very satisfied", points: 3 }, { text: "Satisfied", points: 2.2 },
        { text: "Not sure", points: 1.4 }, { text: "Unsatisfied", points: 0.7 },
        { text: "Very unsatisfied", points: 0 }
      ]
    }
  ];

  const CATEGORY_META = {
    mindless: { strong: "Mindful phone checking", weak: "Mindless phone checking" },
    study: { strong: "Distraction-free studying", weak: "Phone use while studying" },
    meals: { strong: "Phone-free meals", weak: "Phone use during meals" },
    sleep: { strong: "A healthy sleep routine", weak: "Late-night screen use" },
    notifications: { strong: "Low notification interruptions", weak: "Notification interruptions" },
    selfcontrol: { strong: "Staying within planned time", weak: "Scrolling past planned time" },
    offline: { strong: "Regular offline activities", weak: "Limited offline activities" },
    phonefree: { strong: "Daily phone-free periods", weak: "Rare phone-free time" }
  };

  const GENERIC_TIPS = [
    "Turn on a daily screen-time summary so patterns become visible.",
    "Pick one hour each day to keep your phone in another room.",
    "Move distracting apps off your home screen so opening them takes an extra step."
  ];

  let testAnswers = load(STORE_KEYS.testAnswers, new Array(QUESTIONS.length).fill(null));
  let currentQ = 0;

  const testCard = document.getElementById("testCard");
  const testResults = document.getElementById("testResults");
  const questionWrap = document.getElementById("testQuestionWrap");
  const progressFill = document.getElementById("testProgressFill");
  const progressLabel = document.getElementById("testProgressLabel");
  const prevBtn = document.getElementById("testPrev");
  const nextBtn = document.getElementById("testNext");

  function renderQuestion(){
    const q = QUESTIONS[currentQ];
    const percentDone = Math.round((currentQ / QUESTIONS.length) * 100);
    progressFill.style.width = `${percentDone}%`;
    progressLabel.textContent = `Question ${currentQ + 1} of ${QUESTIONS.length} · ${percentDone}% complete`;

    const optionsHtml = q.options.map((opt, i) => {
      const selected = testAnswers[currentQ] === i ? "is-selected" : "";
      return `
        <label class="test-option ${selected}">
          <input type="radio" name="q${currentQ}" value="${i}" ${testAnswers[currentQ] === i ? "checked" : ""}>
          <span>${opt.text}</span>
        </label>`;
    }).join("");

    questionWrap.innerHTML = `
      <h3 class="test-question__title">${q.text}</h3>
      <div class="test-options">${optionsHtml}</div>
    `;

    questionWrap.querySelectorAll(".test-option input").forEach(input => {
      input.addEventListener("change", () => {
        testAnswers[currentQ] = parseInt(input.value, 10);
        save(STORE_KEYS.testAnswers, testAnswers);
        questionWrap.querySelectorAll(".test-option").forEach(el => el.classList.remove("is-selected"));
        input.closest(".test-option").classList.add("is-selected");
        nextBtn.disabled = false;
      });
    });

    prevBtn.disabled = currentQ === 0;
    nextBtn.disabled = testAnswers[currentQ] === null;
    nextBtn.textContent = currentQ === QUESTIONS.length - 1 ? "Calculate My Digital Balance" : "Next →";
  }

  prevBtn.addEventListener("click", () => {
    if (currentQ > 0){ currentQ--; renderQuestion(); }
  });
  nextBtn.addEventListener("click", () => {
    if (currentQ < QUESTIONS.length - 1){
      currentQ++; renderQuestion();
    } else {
      finishTest();
    }
  });

  function computeResult(){
    let totalPoints = 0, maxPoints = 0;
    const categoryPoints = {};
    const recommendations = [];

    QUESTIONS.forEach((q, i) => {
      const ansIdx = testAnswers[i];
      const opt = ansIdx !== null ? q.options[ansIdx] : null;
      const pts = opt ? opt.points : 1.5; // neutral default if skipped
      totalPoints += pts;
      maxPoints += 3;

      if (CATEGORY_META[q.category]){
        categoryPoints[q.category] = pts / 3; // 0..1 ratio
        if (q.recommendation && pts <= 1){
          recommendations.push(q.recommendation);
        }
      }
    });

    const score = Math.round((totalPoints / maxPoints) * 100);

    let strongestKey = null, opportunityKey = null;
    let maxRatio = -1, minRatio = 2;
    Object.keys(categoryPoints).forEach(key => {
      if (categoryPoints[key] > maxRatio){ maxRatio = categoryPoints[key]; strongestKey = key; }
      if (categoryPoints[key] < minRatio){ minRatio = categoryPoints[key]; opportunityKey = key; }
    });

    const strongest = strongestKey ? CATEGORY_META[strongestKey].strong : "Balanced habits overall";
    const opportunity = opportunityKey ? CATEGORY_META[opportunityKey].weak : "Keep building consistency";

    let finalRecs = recommendations.slice(0, 3);
    let g = 0;
    while (finalRecs.length < 3 && g < GENERIC_TIPS.length){
      if (!finalRecs.includes(GENERIC_TIPS[g])) finalRecs.push(GENERIC_TIPS[g]);
      g++;
    }

    let level;
    if (score >= 80) level = "Strong Balance";
    else if (score >= 50) level = "Room to Improve";
    else level = "Let's Build Better Habits";

    return { score, level, strongest, opportunity, recommendations: finalRecs };
  }

  function ringOffset(circleEl, percent){
    const r = parseFloat(circleEl.getAttribute("r"));
    const circumference = 2 * Math.PI * r;
    circleEl.style.strokeDasharray = `${circumference}`;
    const offset = circumference - (percent / 100) * circumference;
    requestAnimationFrame(() => { circleEl.style.strokeDashoffset = `${offset}`; });
  }

  function showResult(result){
    testCard.hidden = true;
    testResults.hidden = false;

    document.getElementById("scoreNumber").textContent = result.score;
    document.getElementById("scoreLevelLabel").textContent = result.level;
    document.getElementById("strongestArea").textContent = result.strongest;
    document.getElementById("opportunityArea").textContent = result.opportunity;

    const recsList = document.getElementById("resultsRecs");
    recsList.innerHTML = result.recommendations.map(r => `<li>${r}</li>`).join("");

    ringOffset(document.getElementById("scoreRingFill"), result.score);
    renderGoalOptions();
  }

  function finishTest(){
    const result = computeResult();
    save(STORE_KEYS.testResult, result);
    showResult(result);
    renderDashboard();
    updateJourney();
  }

  document.getElementById("retakeTest").addEventListener("click", () => {
    testAnswers = new Array(QUESTIONS.length).fill(null);
    save(STORE_KEYS.testAnswers, testAnswers);
    currentQ = 0;
    testResults.hidden = true;
    testCard.hidden = false;
    document.getElementById("resultsTransition").hidden = true;
    renderQuestion();
  });

  /* ---------- personal goal ---------- */
  const GOALS = [
    "Focus better while studying",
    "Reduce unnecessary scrolling",
    "Improve my evening routine",
    "Spend more time offline",
    "Reduce digital distractions"
  ];

  const goalOptionsWrap = document.getElementById("goalOptions");
  const goalCurrentEl = document.getElementById("goalCurrent");
  const goalCurrentTextEl = document.getElementById("goalCurrentText");
  let selectedGoal = load(STORE_KEYS.goal, null);

  function renderGoalOptions(){
    goalOptionsWrap.innerHTML = GOALS.map((g, i) => `
      <label class="goal-option ${selectedGoal === g ? "is-selected" : ""}">
        <input type="radio" name="goalChoice" value="${i}" ${selectedGoal === g ? "checked" : ""}>
        <span>${g}</span>
      </label>`).join("");

    goalOptionsWrap.querySelectorAll(".goal-option input").forEach(input => {
      input.addEventListener("change", () => {
        selectedGoal = GOALS[parseInt(input.value, 10)];
        goalOptionsWrap.querySelectorAll(".goal-option").forEach(el => el.classList.remove("is-selected"));
        input.closest(".goal-option").classList.add("is-selected");
      });
    });

    if (selectedGoal){
      goalCurrentEl.hidden = false;
      goalCurrentTextEl.textContent = selectedGoal;
    } else {
      goalCurrentEl.hidden = true;
    }
  }

  document.getElementById("startPlanBtn").addEventListener("click", () => {
    if (selectedGoal){
      save(STORE_KEYS.goal, selectedGoal);
    }
    const transition = document.getElementById("resultsTransition");
    transition.hidden = false;
    renderGoalOptions();
    renderChallengeGoalBanner();
    updateJourney();

    setTimeout(() => {
      document.getElementById("challenge").scrollIntoView({ behavior: "smooth" });
    }, 650);
  });

  function renderChallengeGoalBanner(){
    const banner = document.getElementById("challengeGoalBanner");
    const goal = load(STORE_KEYS.goal, null);
    if (goal){
      banner.hidden = false;
      document.getElementById("challengeGoalText").textContent = goal;
    } else {
      banner.hidden = true;
    }
  }

  const savedResult = load(STORE_KEYS.testResult, null);
  if (savedResult && testAnswers.every(a => a !== null)){
    showResult(savedResult);
  } else {
    renderQuestion();
  }
  renderChallengeGoalBanner();

  /* ============================================================
     7-DAY CHALLENGE
     ============================================================ */
  const DAYS = [
    { title: "Check Your Screen Time", task: "Record your current average screen time." },
    { title: "Clean Your Notifications", task: "Turn off unnecessary notifications." },
    { title: "Focus Mode", task: "Complete one 45-minute study/work session with your phone away." },
    { title: "Replace, Don't Just Remove", task: "Replace 30 minutes of unnecessary scrolling with an offline activity." },
    { title: "Phone-Free Meal", task: "Have at least one meal without using your phone." },
    { title: "One Hour Offline", task: "Spend one hour doing something offline." },
    { title: "Check Your Progress", task: "Compare your habits with Day 1." }
  ];

  let challenge = load(STORE_KEYS.challenge, new Array(7).fill(false));
  let focusSessions = load(STORE_KEYS.focusSessions, 0);
  let screenTime = load(STORE_KEYS.screenTime, { start: null, current: null });

  const challengeGrid = document.getElementById("challengeGrid");

  function renderChallenge(){
    challengeGrid.innerHTML = DAYS.map((d, i) => {
      const complete = challenge[i];
      let extra = "";

      if (i === 0){
        extra = `
          <div class="day-card__extra">
            <span>Start: ${screenTime.start !== null ? formatHours(screenTime.start) : "not set"}</span>
          </div>
          <input type="number" min="0" max="24" step="0.1" placeholder="Hours/day" class="day1-input" style="padding:10px 12px;border-radius:10px;border:1px solid rgba(14,27,43,.15);font-family:var(--font-mono);">
        `;
      }
      if (i === 2){
        extra = `
          <div class="day-card__extra">
            <span>Focus sessions logged: ${focusSessions}/3</span>
            <button type="button" class="log-focus-btn" ${focusSessions >= 3 ? "disabled" : ""}>+ Log</button>
          </div>`;
      }

      return `
        <div class="day-card ${complete ? "is-complete" : ""}" data-day="${i}">
          <span class="day-card__num">Day ${i + 1}</span>
          <h3 class="day-card__title">${d.title}</h3>
          <p class="day-card__task">${d.task}</p>
          ${extra}
          <div class="day-card__btn">
            ${complete
              ? `<span class="day-card__status">✓ Completed</span>`
              : `<button type="button" class="btn btn--ghost btn--small mark-complete-btn">Mark as Complete</button>`}
          </div>
        </div>`;
    }).join("");

    challengeGrid.querySelectorAll(".mark-complete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const card = e.target.closest(".day-card");
        const idx = parseInt(card.dataset.day, 10);

        if (idx === 0){
          const input = card.querySelector(".day1-input");
          const val = parseFloat(input.value);
          if (!val && val !== 0){
            input.style.borderColor = "#e0524a";
            input.focus();
            return;
          }
          screenTime.start = val;
          if (screenTime.current === null) screenTime.current = val;
          save(STORE_KEYS.screenTime, screenTime);
        }

        challenge[idx] = true;
        save(STORE_KEYS.challenge, challenge);
        renderChallenge();
        renderDashboard();
      });
    });

    const focusBtn = challengeGrid.querySelector(".log-focus-btn");
    if (focusBtn){
      focusBtn.addEventListener("click", () => {
        if (focusSessions < 3){
          focusSessions++;
          save(STORE_KEYS.focusSessions, focusSessions);
          renderChallenge();
          renderDashboard();
        }
      });
    }
  }

  function formatHours(h){
    const hrs = Math.floor(h);
    const mins = Math.round((h - hrs) * 60);
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  }

  renderChallenge();

  /* ============================================================
     PROGRESS DASHBOARD + BADGES
     ============================================================ */
  const BADGES = [
    { key: "first_step", name: "First Step", desc: "Complete Day 1.", icon: "🥇", check: () => challenge[0] },
    { key: "focus_master", name: "Focus Master", desc: "Complete 3 focus sessions.", icon: "🎯", check: () => focusSessions >= 3 },
    { key: "balance_builder", name: "Balance Builder", desc: "Complete 5 challenge days.", icon: "⚖️", check: () => challenge.filter(Boolean).length >= 5 },
    { key: "champion", name: "Digital Balance Champion", desc: "Complete all 7 days.", icon: "🏆", check: () => challenge.every(Boolean) }
  ];

  const progressRingFill = document.getElementById("progressRingFill");
  const progressDaysLabel = document.getElementById("progressDaysLabel");
  const progressPercentLabel = document.getElementById("progressPercentLabel");
  const startScreenTimeEl = document.getElementById("startScreenTime");
  const currentScreenTimeEl = document.getElementById("currentScreenTime");
  const screenTimeChangeEl = document.getElementById("screenTimeChange");
  const dashboardMotivation = document.getElementById("dashboardMotivation");
  const badgesGrid = document.getElementById("badgesGrid");
  const currentScreenTimeInput = document.getElementById("currentScreenTimeInput");

  function renderDashboard(){
    const completedDays = challenge.filter(Boolean).length;
    const percent = Math.round((completedDays / 7) * 100);

    progressDaysLabel.textContent = `${completedDays}/7`;
    progressPercentLabel.textContent = `${percent}%`;
    ringOffset(progressRingFill, percent);

    if (screenTime.start !== null){
      startScreenTimeEl.textContent = formatHours(screenTime.start);
      currentScreenTimeEl.textContent = formatHours(screenTime.current);
      const diffHoursPerDay = screenTime.start - screenTime.current;
      const diffMinsPerDay = Math.round(diffHoursPerDay * 60);

      if (diffMinsPerDay > 0){
        screenTimeChangeEl.textContent = `-${diffMinsPerDay} min/day`;
        const weeklyMinsBack = diffMinsPerDay * 7;
        const hoursBack = (weeklyMinsBack / 60).toFixed(1);
        dashboardMotivation.textContent = `You've taken back about ${hoursBack} hours this week.`;
      } else if (diffMinsPerDay < 0){
        screenTimeChangeEl.textContent = `+${Math.abs(diffMinsPerDay)} min/day`;
        dashboardMotivation.textContent = "Your screen time crept up a little — no big deal, try one small change today.";
      } else {
        screenTimeChangeEl.textContent = "No change yet";
        dashboardMotivation.textContent = "Update your current screen time as the week goes on to see your trend.";
      }
    } else {
      startScreenTimeEl.textContent = "—";
      currentScreenTimeEl.textContent = "—";
      screenTimeChangeEl.textContent = "—";
      dashboardMotivation.textContent = "Complete Day 1 of the challenge to set your starting point.";
    }

    if (screenTime.current !== null){
      currentScreenTimeInput.value = screenTime.current;
    }

    renderBadges();
    renderChallengeGoalBanner();
    renderBeforeAfter();
    updateJourney();
  }

  /* ---------- before / after ---------- */
  function renderBeforeAfter(){
    const el = document.getElementById("beforeAfterCard");
    if (screenTime.start !== null && screenTime.current !== null && screenTime.start !== screenTime.current){
      const reclaimed = screenTime.start - screenTime.current;
      const weekly = (reclaimed * 7);
      const weeklyStr = weekly >= 0 ? formatHours(weekly) : formatHours(Math.abs(weekly));
      el.innerHTML = `
        <div class="before-after__row">
          <div class="before-after__stat">
            <span class="before-after__stat-label">Before</span>
            <span class="before-after__stat-value">${formatHours(screenTime.start)}/day</span>
          </div>
          <span class="before-after__arrow">→</span>
          <div class="before-after__stat">
            <span class="before-after__stat-label">After</span>
            <span class="before-after__stat-value">${formatHours(screenTime.current)}/day</span>
          </div>
          <span class="before-after__arrow">→</span>
          <div class="before-after__stat before-after__reclaimed">
            <span class="before-after__stat-label">${reclaimed >= 0 ? "You Reclaimed" : "Change"}</span>
            <span class="before-after__stat-value">${formatHours(Math.abs(reclaimed))}/day</span>
          </div>
        </div>
        <p class="before-after__weekly">${reclaimed >= 0 ? `That's approximately ${weeklyStr} of extra time per week.` : `That's about ${weeklyStr} more per week — try a small reset tomorrow.`}</p>
      `;
    } else {
      el.innerHTML = `<p class="before-after__empty">Complete your first week to see your improvement.</p>`;
    }
  }

  /* ---------- journey stepper ---------- */
  function updateJourney(){
    const goal = load(STORE_KEYS.goal, null);
    const hasResult = load(STORE_KEYS.testResult, null) !== null;
    const completedDaysNow = challenge.filter(Boolean).length;

    const stages = [
      { key: "check", label: "Check", done: hasResult },
      { key: "understand", label: "Understand", done: hasResult },
      { key: "plan", label: "Plan", done: !!goal },
      { key: "act", label: "Act", done: completedDaysNow > 0 },
      { key: "improve", label: "Improve", done: completedDaysNow >= 7 }
    ];

    let currentIdx = stages.findIndex(s => !s.done);
    if (currentIdx === -1) currentIdx = stages.length - 1;

    const strip = document.getElementById("journeyStrip");
    strip.innerHTML = stages.map((s, i) => {
      const cls = s.done ? "is-done" : (i === currentIdx ? "is-current" : "");
      const icon = s.done ? "✓" : (i === currentIdx ? "●" : "○");
      const arrow = i < stages.length - 1 ? `<span class="journey-strip__arrow">→</span>` : "";
      return `<span class="journey-strip__step ${cls}">${icon} ${s.label}</span>${arrow}`;
    }).join("");

    const goalTextEl = document.getElementById("journeyGoalText");
    goalTextEl.textContent = goal ? `Goal: "${goal}"` : "Take the test to set your goal.";
  }

  function renderBadges(){
    const previouslyUnlocked = load(STORE_KEYS.badgesUnlocked, []);
    const nowUnlocked = [];

    badgesGrid.innerHTML = BADGES.map(b => {
      const unlocked = b.check();
      if (unlocked) nowUnlocked.push(b.key);
      const justUnlocked = unlocked && !previouslyUnlocked.includes(b.key);
      return `
        <div class="badge-card ${unlocked ? "is-unlocked" : ""} ${justUnlocked ? "just-unlocked" : ""}">
          <span class="badge-card__icon">${b.icon}</span>
          <span class="badge-card__name">${b.name}</span>
          <span class="badge-card__desc">${b.desc}</span>
        </div>`;
    }).join("");

    save(STORE_KEYS.badgesUnlocked, nowUnlocked);
  }

  document.getElementById("updateScreenTimeForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const val = parseFloat(currentScreenTimeInput.value);
    if (isNaN(val)) return;
    screenTime.current = val;
    if (screenTime.start === null) screenTime.start = val;
    save(STORE_KEYS.screenTime, screenTime);
    renderDashboard();
  });

  document.getElementById("resetProgressBtn").addEventListener("click", () => {
    if (!confirm("Reset all your Digital Balance progress? This can't be undone.")) return;
    Object.values(STORE_KEYS).forEach(k => localStorage.removeItem(k));
    location.reload();
  });

  renderDashboard();

  /* ============================================================
     REPLACEMENT ACTIVITIES
     ============================================================ */
  const ACTIVITY_CATEGORIES = [
    { name: "Sport", items: ["Football", "Walking", "Cycling", "Exercise"] },
    { name: "Learning", items: ["Reading", "Programming", "English", "Learning a New Skill"] },
    { name: "Creative", items: ["Drawing", "Photography", "Music", "Writing"] },
    { name: "Social", items: ["Family Time", "Friends", "Outdoor Activities", "Team Activities"] }
  ];

  let selectedActivities = load(STORE_KEYS.activities, []);
  const activitiesGrid = document.getElementById("activitiesGrid");
  const activitiesToast = document.getElementById("activitiesToast");

  function renderActivities(){
    activitiesGrid.innerHTML = ACTIVITY_CATEGORIES.map(cat => `
      <div class="activity-cat">
        <h3>${cat.name}</h3>
        <ul>
          ${cat.items.map(item => `
            <li>
              <button type="button" class="activity-chip ${selectedActivities.includes(item) ? "is-selected" : ""}" data-item="${item}">${item}</button>
            </li>`).join("")}
        </ul>
      </div>
    `).join("");

    activitiesGrid.querySelectorAll(".activity-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const item = chip.dataset.item;
        if (selectedActivities.includes(item)){
          selectedActivities = selectedActivities.filter(i => i !== item);
          chip.classList.remove("is-selected");
        } else {
          selectedActivities.push(item);
          chip.classList.add("is-selected");
          activitiesToast.textContent = `Great choice! "${item}" was added to your plan.`;
          activitiesToast.classList.add("is-visible");
          clearTimeout(window.__toastTimer);
          window.__toastTimer = setTimeout(() => activitiesToast.classList.remove("is-visible"), 2600);
        }
        save(STORE_KEYS.activities, selectedActivities);
      });
    });
  }
  renderActivities();

  /* ============================================================
     TIPS
     ============================================================ */
  const TIPS = [
    { icon: "🔕", title: "Turn Off Unnecessary Notifications", body: "Fewer interruptions means fewer reasons to pick your phone up.", action: "Try it today" },
    { icon: "📚", title: "Keep Your Phone Away During Study Sessions", body: "Out of reach means out of mind — and easier to focus.", action: "Next study session" },
    { icon: "🍽️", title: "Create Phone-Free Meals", body: "Meals are a natural, easy moment to disconnect.", action: "Start with dinner" },
    { icon: "🌙", title: "Set a Screen-Free Wind-Down Before Sleep", body: "Give your mind 30 minutes to settle before you sleep.", action: "Tonight" },
    { icon: "🎨", title: "Replace Some Scrolling With Offline Activities", body: "Swap, don't just subtract — replace scrolling with something you enjoy.", action: "Pick one above" },
    { icon: "🎯", title: "Use Technology Intentionally", body: "Open an app because you chose to, not out of habit.", action: "Ask 'why' before opening" },
    { icon: "✋", title: "Don't Check Your Phone Automatically", body: "Notice the automatic reach — and pause before you act on it.", action: "Build the pause" }
  ];
  document.getElementById("tipsGrid").innerHTML = TIPS.map(t => `
    <div class="tip-card">
      <span class="tip-card__icon">${t.icon}</span>
      <h3>${t.title}</h3>
      <p>${t.body}</p>
      <span class="tip-card__action">${t.action}</span>
    </div>
  `).join("");

  /* ============================================================
     SHARE / CAMPAIGN
     ============================================================ */
  const shareText = "Technology is a tool. You decide how it fits into your life. Check your habits with Digital Balance. #DigitalBalance";
  const shareUrl = window.location.href;

  document.getElementById("shareX").href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
  document.getElementById("shareFb").href = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
  document.getElementById("shareWa").href = `https://wa.me/?text=${encodeURIComponent(shareText + " " + shareUrl)}`;

  document.getElementById("shareCopy").addEventListener("click", async () => {
    try{
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById("shareCopy");
      const original = btn.textContent;
      btn.textContent = "Link Copied!";
      setTimeout(() => { btn.textContent = original; }, 2000);
    }catch(e){
      alert(shareUrl);
    }
  });

  document.getElementById("shareCampaignBtn").addEventListener("click", () => {
    if (navigator.share){
      navigator.share({ title: "Digital Balance", text: shareText, url: shareUrl }).catch(() => {});
    } else {
      document.getElementById("shareRow").scrollIntoView({ behavior: "smooth", block: "center" });
    }
  });

  document.getElementById("footerHashtagBtn").addEventListener("click", () => {
    document.getElementById("movement").scrollIntoView({ behavior: "smooth" });
  });

})();
