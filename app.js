// app.js - full file (replace your old one)
document.addEventListener('DOMContentLoaded', () => {
  // DOM refs
  const splash = document.querySelector('.splash');
  const startScreen = document.querySelector('.start');
  const startEn = document.getElementById('start-en');
  const startHi = document.getElementById('start-hi');
  const startBtn = document.getElementById('start');
  const questionScreen = document.querySelector('.question');
  const resultScreen = document.querySelector('.result');
  const restartBtn = document.getElementById('restart');
  const playAgainBtn = document.getElementById('play-again');
  const questionText = document.getElementById('question-text');
  const optionsWrap = document.getElementById('options');
  const nextBtn = document.getElementById('next-btn');
  const progressEl = document.getElementById('progress');
  const scoreEl = document.getElementById('score');
  const finalScoreEl = document.getElementById('final-score');
  const gradeEl = document.getElementById('grade');
  const notify = document.getElementById('notify');

  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bg-music');
  const soundCorrect = document.getElementById('sound-correct');
  const soundWrong = document.getElementById('sound-wrong');

  // start options
  const operandButtons = document.querySelectorAll('.option-container');
  operandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      operandButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // state
  let currentQ = 0;
  let score = 0;
  let totalQuestions = 10;
  let questions = [];
  let lastAnswerIndex = null;
  let allowMusic = true;

  // helper - show notify
  function showNotify(text, ms = 1500) {
    notify.textContent = text;
    notify.classList.add('show');
    setTimeout(() => notify.classList.remove('show'), ms);
  }

  // audio control - only start music after a user gesture
  function startBackgroundMusicIfAllowed() {
    if (!musicToggle) return;
    allowMusic = musicToggle.checked;
    if (allowMusic) {
      // attempt to play
      bgMusic.play().catch(()=>{ /* autoplay might be blocked */ });
    } else {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  // splash click handlers (two buttons)
  [startEn, startHi].forEach(btn => {
    btn.addEventListener('click', () => {
      splash.classList.remove('show');
      splash.classList.add('hide');

      startScreen.classList.remove('hide');
      startScreen.classList.add('show');

      // start/pause music depending on toggle
      startBackgroundMusicIfAllowed();
    });
  });

  // "Start Quiz" button
  startBtn.addEventListener('click', () => {
    const selectedOperand = document.querySelector('.option-container.selected');
    if (!selectedOperand) {
      showNotify('Please select an operation first');
      return;
    }
    const operand = selectedOperand.getAttribute('data-operand');
    const difficulty = document.getElementById('difficulty').value;
    totalQuestions = Math.max(1, parseInt(document.getElementById('totalQuestions').value) || 10);

    questions = generateQuiz(operand, difficulty, totalQuestions);
    if (!questions.length) {
      showNotify('Could not generate questions');
      return;
    }

    score = 0; currentQ = 0;
    startScreen.classList.remove('show'); startScreen.classList.add('hide');
    questionScreen.classList.remove('hide'); questionScreen.classList.add('show');
    startBackgroundMusicIfAllowed();

    renderQuestion();
  });

  // Next button
  nextBtn.addEventListener('click', () => {
    currentQ++;
    lastAnswerIndex = null;
    if (currentQ >= questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  });

  // Restart / Play again
  restartBtn.addEventListener('click', () => location.reload());
  playAgainBtn.addEventListener('click', () => {
    // go back to start with previous selections intact
    resultScreen.classList.remove('show'); resultScreen.classList.add('hide');
    startScreen.classList.remove('hide'); startScreen.classList.add('show');
  });

  // render question
  function renderQuestion() {
    const q = questions[currentQ];
    questionText.textContent = `Q${currentQ + 1}: ${q.text}`;
    progressEl.textContent = `${currentQ + 1} / ${questions.length}`;
    scoreEl.textContent = `Score: ${score}`;
    nextBtn.disabled = true;
    optionsWrap.innerHTML = '';

    // create option elements
    q.options.forEach((opt, idx) => {
      const button = document.createElement('button');
      button.className = 'answer';
      button.type = 'button';
      button.textContent = opt;
      button.addEventListener('click', () => handleAnswer(button, idx));
      optionsWrap.appendChild(button);
    });

    // set image if available (optional)
    const img = document.getElementById('question-image');
    if (q.image) {
      img.src = q.image;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  }

  // handle an answer click
  function handleAnswer(buttonEl, idx) {
    if (lastAnswerIndex !== null) return; // already answered
    lastAnswerIndex = idx;

    const q = questions[currentQ];
    const correctIdx = q.answerIndex;

    // disable all buttons
    const allBtn = Array.from(optionsWrap.querySelectorAll('.answer'));
    allBtn.forEach(b => b.classList.add('disabled'));

    if (idx === correctIdx) {
      buttonEl.classList.add('correct');
      score++;
      if (soundCorrect) { soundCorrect.currentTime = 0; soundCorrect.play().catch(()=>{}); }
      showNotify('Correct 👍');
    } else {
      buttonEl.classList.add('wrong');
      // highlight the correct one
      const correctButton = allBtn[correctIdx];
      if (correctButton) correctButton.classList.add('correct');
      if (soundWrong) { soundWrong.currentTime = 0; soundWrong.play().catch(()=>{}); }
      showNotify('Wrong ✖');
    }

    scoreEl.textContent = `Score: ${score}`;
    nextBtn.disabled = false;
  }

  // show result screen
  function showResults() {
    questionScreen.classList.remove('show'); questionScreen.classList.add('hide');
    resultScreen.classList.remove('hide'); resultScreen.classList.add('show');

    finalScoreEl.textContent = `${score} / ${questions.length}`;
    const pct = Math.round((score / questions.length) * 100);
    let grade = 'C';
    if (pct >= 90) grade = 'A';
    else if (pct >= 75) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else grade = 'D';
    gradeEl.querySelector('p').textContent = grade;
  }

  /*********************
   * QUESTION GENERATOR
   *********************/
  function generateQuiz(operand, difficulty, count) {
    const qList = [];
    const difficultyMap = {
      easy: {min:1, max:10},
      average: {min:2, max:20},
      hard: {min:5, max:99}
    };
    const range = difficultyMap[difficulty] || difficultyMap.easy;

    while (qList.length < count) {
      const q = generateQuestion(operand, range.min, range.max);
      // simple uniqueness guard
      if (!qList.some(existing => existing.text === q.text)) {
        qList.push(q);
      }
    }
    return qList;
  }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function generateQuestion(op, minVal, maxVal) {
    // produce operands based on op
    let a, b, text, correct;
    if (op === '+') {
      a = randInt(minVal, maxVal);
      b = randInt(minVal, maxVal);
      correct = a + b;
      text = `${a} + ${b} = ?`;
    } else if (op === '-') {
      a = randInt(minVal, maxVal);
      b = randInt(minVal, Math.min(a, maxVal)); // avoid negative where possible
      correct = a - b;
      text = `${a} - ${b} = ?`;
    } else if (op === '*') {
      a = randInt(Math.max(1,minVal), Math.max(2, Math.floor(maxVal/2)));
      b = randInt(1, Math.max(1, Math.floor(maxVal/2)));
      correct = a * b;
      text = `${a} × ${b} = ?`;
    } else if (op === '/') {
      // make divisible pair: choose divisor and multiplier
      b = randInt(1, Math.max(1, Math.floor(maxVal/4)));
      const multiplier = randInt(minVal, Math.max(2, Math.floor(maxVal / Math.max(1,b))));
      a = b * multiplier;
      correct = Math.floor(a / b);
      text = `${a} ÷ ${b} = ?`;
    } else {
      // fallback to addition
      a = randInt(minVal, maxVal);
      b = randInt(minVal, maxVal);
      correct = a + b;
      text = `${a} + ${b} = ?`;
    }

    // generate options (one correct + 3 distractors)
    const options = new Set();
    options.add(correct);
    while (options.size < 4) {
      // distractor strategy: +/- small random offset
      let delta = Math.max(1, Math.floor(Math.abs(correct) * 0.2)) || 1;
      const candidate = correct + randInt(-delta*3, delta*3);
      if (candidate !== correct && candidate >= -999 && candidate <= 9999) options.add(candidate);
    }
    const optsArr = shuffle(Array.from(options));
    const answerIndex = optsArr.indexOf(correct);

    return {
      text,
      options: optsArr,
      answerIndex,
      image: null // optional: you can set images for specific questions if you have assets
    };
  }

  // simple Fisher-Yates shuffle
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // wire music toggle immediately if user changes it
  if (musicToggle) {
    musicToggle.addEventListener('change', () => {
      allowMusic = musicToggle.checked;
      if (!allowMusic) {
        bgMusic.pause(); bgMusic.currentTime = 0;
      } else {
        bgMusic.play().catch(()=>{});
      }
    });
  }

  // preload: attempt to load small sounds
  [soundCorrect, soundWrong, bgMusic].forEach(a => {
    if (a) a.load();
  });

  // expose for debugging (optional)
  window.__quizzy = {
    generateQuestion, generateQuiz, questions
  };
});
