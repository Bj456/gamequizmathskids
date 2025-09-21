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

  const operandButtons = document.querySelectorAll('.option-container');
  operandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      operandButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  let currentQ = 0;
  let score = 0;
  let totalQuestions = 20;
  let questions = [];
  let lastAnswerIndex = null;
  let allowMusic = true;

  function showNotify(text, ms = 1500) {
    notify.textContent = text;
    notify.classList.add('show');
    setTimeout(() => notify.classList.remove('show'), ms);
  }

  function playBackgroundMusic() {
    allowMusic = musicToggle && musicToggle.checked;
    if (allowMusic) {
      bgMusic.currentTime = 0;
      bgMusic.volume = 0.5;
      const playPromise = bgMusic.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log("✅ Background music started"))
          .catch(err => console.warn("⚠️ Music play failed:", err));
      }
    } else {
      console.log("🔇 Music toggle is off");
    }
  }

  [startEn, startHi].forEach(btn => {
    btn.addEventListener('click', () => {
      splash.classList.remove('show');
      splash.classList.add('hide');
      startScreen.classList.remove('hide');
      startScreen.classList.add('show');
      playBackgroundMusic();
    });
  });

  startBtn.addEventListener('click', () => {
    const selectedOperand = document.querySelector('.option-container.selected');
    if (!selectedOperand) {
      showNotify('Please select an operation first');
      return;
    }
    const operand = selectedOperand.getAttribute('data-operand');
    const difficulty = document.getElementById('difficulty').value;
    totalQuestions = Math.max(1, parseInt(document.getElementById('totalQuestions').value) || 20);
    questions = generateQuiz(operand, difficulty, totalQuestions);
    score = 0;
    currentQ = 0;
    startScreen.classList.remove('show');
    startScreen.classList.add('hide');
    questionScreen.classList.remove('hide');
    questionScreen.classList.add('show');
    playBackgroundMusic();
    renderQuestion();
  });

  nextBtn.addEventListener('click', () => {
    currentQ++;
    lastAnswerIndex = null;
    if (currentQ >= questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  });

  restartBtn.addEventListener('click', () => location.reload());
  playAgainBtn.addEventListener('click', () => {
    resultScreen.classList.remove('show');
    resultScreen.classList.add('hide');
    startScreen.classList.remove('hide');
    startScreen.classList.add('show');
  });

  function renderQuestion() {
    const q = questions[currentQ];
    questionText.textContent = `Q${currentQ + 1}: ${q.text}`;
    progressEl.textContent = `${currentQ + 1} / ${questions.length}`;
    scoreEl.textContent = `Score: ${score}`;
    nextBtn.disabled = true;
    optionsWrap.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const button = document.createElement('button');
      button.className = 'answer';
      button.type = 'button';
      button.textContent = opt;
      button.addEventListener('click', () => handleAnswer(button, idx));
      optionsWrap.appendChild(button);
    });

    const img = document.getElementById('question-image');
    if (q.image) {
      img.src = q.image;
      img.style.display = 'block';
    } else {
      img.style.display = 'none';
    }
  }

  function handleAnswer(buttonEl, idx) {
    if (lastAnswerIndex !== null) return;
    lastAnswerIndex = idx;
    const q = questions[currentQ];
    const correctIdx = q.answerIndex;

    const allBtn = Array.from(optionsWrap.querySelectorAll('.answer'));
    allBtn.forEach(b => b.classList.add('disabled'));

    if (idx === correctIdx) {
      buttonEl.classList.add('correct');
      score++;
      soundCorrect.play().catch(() => {});
      showNotify('Correct 👍');
    } else {
      buttonEl.classList.add('wrong');
      if (allBtn[correctIdx]) allBtn[correctIdx].classList.add('correct');
      soundWrong.play().catch(() => {});
      showNotify('Wrong ✖');
    }

    scoreEl.textContent = `Score: ${score}`;
    nextBtn.disabled = false;
  }

  function showResults() {
    questionScreen.classList.remove('show');
    questionScreen.classList.add('hide');
    resultScreen.classList.remove('hide');
    resultScreen.classList.add('show');
    finalScoreEl.textContent = `${score} / ${questions.length}`;
    const pct = Math.round((score / questions.length) * 100);
    let grade = 'C';
    if (pct >= 90) grade = 'A';
    else if (pct >= 75) grade = 'B';
    else if (pct >= 50) grade = 'C';
    else grade = 'D';
    gradeEl.querySelector('p').textContent = grade;
  }

  function generateQuiz(op, difficulty, count) {
    const qList = [];
    const difficultyMap = {
      easy: { min: 1, max: 10 },
      average: { min: 2, max: 20 },
      hard: { min: 5, max: 99 }
    };
    const range = difficultyMap[difficulty] || difficultyMap.easy;
    while (qList.length < count) {
      const q = generateQuestion(op, range.min, range.max);
      if (!qList.some(existing => existing.text === q.text)) qList.push(q);
    }
    return qList;
  }

  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function generateQuestion(op, minVal, maxVal) {
    let a, b, text, correct;
    if (op === '+') {
      a = randInt(minVal, maxVal);
      b = randInt(minVal, maxVal);
      correct = a + b;
      text = `${a} + ${b} = ?`;
    } else if (op === '-') {
      a = randInt(minVal, maxVal);
      b = randInt(minVal, Math.min(a, maxVal));
      correct = a - b;
      text = `${a} - ${b} = ?`;
    } else if (op === '*') {
      a = randInt(Math.max(1, minVal), Math.max(2, Math.floor(maxVal / 2)));
      b = randInt(1, Math.max(1, Math.floor(maxVal / 2)));
      correct = a * b;
      text = `${a} × ${b} = ?`;
    } else if (op === '/') {
      b = randInt(1, Math.max(1, Math.floor(maxVal / 4)));
      const multiplier = randInt(minVal, Math.max(2, Math.floor(maxVal / Math.max(1, b))));
      a = b * multiplier;
      correct = Math.floor(a / b);
      text = `${a} ÷ ${b} = ?`;
    } else {
      a = randInt(minVal, maxVal);
      b = randInt(minVal, maxVal);
      correct = a + b;
      text = `${a} + ${b} = ?`;
    }

    const options
