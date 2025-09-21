/* Restored + minimal updates version.
   - Keeps quiz generator simple (safe integer division),
   - Adds progress bar,
   - Adds back-to-splash buttons,
   - Plays celebration when full marks,
   - Plays background music if user toggles it on (after gesture)
*/

document.addEventListener('DOMContentLoaded', () => {
  // DOM references
  const splash = document.querySelector('.splash');
  const startScreen = document.querySelector('.start');
  const questionScreen = document.querySelector('.question');
  const resultScreen = document.querySelector('.result');

  const startEn = document.getElementById('start-en');
  const startHi = document.getElementById('start-hi');
  const startBtn = document.getElementById('start');
  const restartBtn = document.getElementById('restart');
  const backButtons = document.querySelectorAll('.back-to-splash');

  const operandButtons = document.querySelectorAll('.option-container');
  const difficultySelect = document.getElementById('difficulty');
  const totalQuestionsInput = document.getElementById('totalQuestions');

  const questionText = document.getElementById('question-text');
  const optionsWrap = document.getElementById('options');
  const questionImage = document.getElementById('question-image');

  const progressEl = document.getElementById('progress');
  const scoreEl = document.getElementById('score');
  const progressBar = document.getElementById('progress-bar');

  const celebrationArea = document.getElementById('celebration');
  const finalScoreEl = document.getElementById('final-score');
  const gradeEl = document.getElementById('grade');

  const notify = document.getElementById('notify');

  const bgMusic = document.getElementById('bg-music');
  const celebrationSound = document.getElementById('celebration-sound');
  const musicToggle = document.getElementById('musicToggle');

  // state
  let questions = [];
  let currentQ = 0;
  let score = 0;
  let totalQuestions = parseInt(totalQuestionsInput.value, 10) || 20;

  // Utility - notify
  function showNotify(text, ms = 1400) {
    notify.textContent = text;
    notify.classList.add('show');
    setTimeout(() => notify.classList.remove('show'), ms);
  }

  // Audio control (start after a user gesture)
  function handleMusicStart() {
    try {
      if (musicToggle && musicToggle.checked) {
        bgMusic.play().catch(()=>{});
      } else {
        bgMusic.pause(); bgMusic.currentTime = 0;
      }
    } catch (e) { /* ignore */ }
  }

  // Splash -> Start (two buttons)
  [startEn, startHi].forEach(btn => btn.addEventListener('click', () => {
    splash.classList.add('hide');
    startScreen.classList.remove('hide'); startScreen.classList.add('show');
    handleMusicStart();
  }));

  // Back to splash from various screens
  backButtons.forEach(b => b.addEventListener('click', () => {
    // stop music
    bgMusic.pause(); bgMusic.currentTime = 0;

    // hide other screens, show splash
    startScreen.classList.add('hide');
    questionScreen.classList.add('hide');
    resultScreen.classList.add('hide');

    splash.classList.remove('hide'); splash.classList.add('show');
  }));

  // operand selection UI
  operandButtons.forEach(b => {
    b.addEventListener('click', () => {
      operandButtons.forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
    });
  });

  // Start Quiz - generate questions based on selected operand/difficulty
  startBtn.addEventListener('click', () => {
    const selected = document.querySelector('.option-container.selected');
    if (!selected) {
      showNotify('Please select an operation');
      return;
    }
    const op = selected.getAttribute('data-operand');
    const diff = difficultySelect.value;
    totalQuestions = Math.max(1, parseInt(totalQuestionsInput.value, 10) || 20);

    // generate
    questions = generateQuiz(op, diff, totalQuestions);
    if (!questions.length) {
      showNotify('Unable to generate questions');
      return;
    }

    score = 0; currentQ = 0;
    startScreen.classList.add('hide');
    questionScreen.classList.remove('hide'); questionScreen.classList.add('show');

    // start music if toggled on
    handleMusicStart();

    renderQuestion();
    updateProgress();
  });

  // Next button (delegated through answer click in this flow)
  const nextBtn = document.getElementById('next-btn');
  nextBtn.addEventListener('click', () => {
    currentQ++;
    if (currentQ >= questions.length) {
      showResults();
    } else {
      renderQuestion();
      updateProgress();
    }
    nextBtn.disabled = true;
  });

  // Restart
  restartBtn.addEventListener('click', () => location.reload());

  // Render question
  function renderQuestion() {
    const q = questions[currentQ];
    questionText.textContent = `Q${currentQ + 1}: ${q.text}`;
    scoreEl.textContent = `Score: ${score}`;
    progressEl.textContent = `${currentQ + 1} / ${questions.length}`;
    optionsWrap.innerHTML = '';
    nextBtn.disabled = true;

    // optional image
    if (q.image) {
      questionImage.src = q.image; questionImage.style.display = 'block';
    } else {
      questionImage.style.display = 'none';
    }

    q.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'answer';
      btn.type = 'button';
      btn.textContent = opt;
      btn.addEventListener('click', () => handleAnswer(btn, idx));
      optionsWrap.appendChild(btn);
    });
  }

  // Handle answer selection
  let answered = false;
  function handleAnswer(buttonEl, idx) {
    if (answered) return;
    answered = true;

    const q = questions[currentQ];
    const correctIdx = q.answerIndex;

    // disable all
    const all = Array.from(optionsWrap.querySelectorAll('.answer'));
    all.forEach(b => b.classList.add('disabled'));

    if (idx === correctIdx) {
      buttonEl.classList.add('correct');
      score++;
      showNotify('Correct 🎉');
    } else {
      buttonEl.classList.add('wrong');
      if (all[correctIdx]) all[correctIdx].classList.add('correct');
      showNotify('Wrong ✖');
    }
    scoreEl.textContent = `Score: ${score}`;
    nextBtn.disabled = false;
  }

  // update progress bar
  function updateProgress() {
    const pct = Math.round(((currentQ) / (totalQuestions)) * 100);
    progressBar.style.width = `${pct}%`;
  }

  // Show results
  function showResults() {
    questionScreen.classList.add('hide');
    resultScreen.classList.remove('hide'); resultScreen.classList.add('show');

    finalScoreEl.textContent = `${score} / ${questions.length}`;
    const pct = Math.round((score / questions.length) * 100);

    // Full score celebration
    celebrationArea.innerHTML = '';
    if (score === questions.length) {
      // show two Lottie players (balloons + sparkles)
      celebrationArea.innerHTML = `
        <lottie-player src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json" background="transparent" speed="1" loop autoplay></lottie-player>
        <lottie-player src="https://assets1.lottiefiles.com/private_files/lf30_jmgekfqg.json" background="transparent" speed="1" loop autoplay></lottie-player>
        <p>🎉 Amazing — Full Marks! 🎉</p>
      `;
      // pause bg music, play celebration short sound
      try { bgMusic.pause(); } catch(e){}
      celebrationSound.currentTime = 0; celebrationSound.play().catch(()=>{});
    } else if (pct >= 75) {
      celebrationArea.innerHTML = `<p>🌟 Great job! You scored ${pct}% — keep practicing to get full marks!</p>`;
      celebrationArea.innerHTML += `<lottie-player src="https://assets1.lottiefiles.com/private_files/lf30_jmgekfqg.json" background="transparent" speed="1" loop autoplay></lottie-player>`;
    } else if (pct >= 40) {
      celebrationArea.innerHTML = `<p>👍 Good effort! Try again to improve — you can do it!</p>`;
    } else {
      celebrationArea.innerHTML = `<p>💪 Don’t give up! Practice a little every day — you’ll get better!</p>`;
    }

    // grade bubble
    let grade = 'D';
    if (pct >= 90) grade = 'A';
    else if (pct >= 75) grade = 'B';
    else if (pct >= 50) grade = 'C';
    gradeEl.querySelector('p').textContent = grade;
  }

  /***************
   * Question generator (simple, deterministic safety)
   ***************/
  function generateQuiz(op, difficulty, count) {
    const list = [];
    const map = {
      easy: {min:1, max:10},
      average: {min:2, max:20},
      hard: {min:5, max:99}
    };
    const range = map[difficulty] || map.easy;

    while (list.length < count) {
      const q = generateQuestion(op, range.min, range.max);
      // avoid exact duplicate text
      if (!list.some(ex => ex.text === q.text)) list.push(q);
    }
    return list;
  }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function generateQuestion(op, minVal, maxVal) {
    let a,b,text,correct;
    if (op === '+') {
      a = randInt(minVal,maxVal); b = randInt(minVal,maxVal);
      correct = a + b; text = `${a} + ${b} = ?`;
    } else if (op === '-') {
      a = randInt(minVal,maxVal); b = randInt(minVal, Math.min(a, maxVal));
      correct = a - b; text = `${a} - ${b} = ?`;
    } else if (op === '*') {
      a = randInt(Math.max(1,minVal), Math.max(2, Math.floor(maxVal/2)));
      b = randInt(1, Math.max(1, Math.floor(maxVal/2)));
      correct = a * b; text = `${a} × ${b} = ?`;
    } else if (op === '/') {
      b = randInt(1, Math.max(1, Math.floor(maxVal/6)));
      const multiplier = randInt(minVal, Math.max(2, Math.floor(maxVal / Math.max(1,b))));
      a = b * multiplier; correct = Math.floor(a / b); text = `${a} ÷ ${b} = ?`;
    } else {
      a = randInt(minVal,maxVal); b = randInt(minVal,maxVal);
      correct = a + b; text = `${a} + ${b} = ?`;
    }

    // make 4 options
    const opts = new Set([correct]);
    while (opts.size < 4) {
      const delta = Math.max(1, Math.floor(Math.abs(correct) * 0.2)) || 1;
      let cand = correct + randInt(-delta*3, delta*3);
      if (cand === correct) continue;
      // keep reasonable bounds
      if (cand >= -999 && cand <= 9999) opts.add(cand);
    }
    const optsArr = shuffle(Array.from(opts));
    return { text, options: optsArr, answerIndex: optsArr.indexOf(correct), image: null };
  }

  function shuffle(a) {
    const arr = a.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // wire music toggle changes
  if (musicToggle) {
    musicToggle.addEventListener('change', () => {
      if (musicToggle.checked) {
        bgMusic.play().catch(()=>{});
      } else {
        bgMusic.pause(); bgMusic.currentTime = 0;
      }
    });
  }

  // preload audio
  [bgMusic, celebrationSound].forEach(a => { try { if(a) a.load(); } catch(e){} });

  // Expose for debugging if needed
  window.__quiz = { generateQuiz, generateQuestion: (op,d1,d2)=>generateQuestion(op,d1,d2) };
});
