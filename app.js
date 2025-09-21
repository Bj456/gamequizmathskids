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

  // Audio
  const musicToggle = document.getElementById('musicToggle');
  const bgMusic = document.getElementById('bg-music');
  const soundCorrect = document.getElementById('sound-correct');
  const soundWrong = document.getElementById('sound-wrong');

  // Operand selection buttons
  const operandButtons = document.querySelectorAll('.option-container');
  operandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      operandButtons.forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
    });
  });

  // State
  let currentQ = 0;
  let score = 0;
  let totalQuestions = 10;
  let questions = [];
  let lastAnswerIndex = null;

  // Show notification
  function showNotify(text, ms = 1500) {
    notify.textContent = text;
    notify.classList.add('show');
    setTimeout(() => notify.classList.remove('show'), ms);
  }

  // Background music control
  function startBackgroundMusic() {
    if (musicToggle.checked) {
      bgMusic.play().catch(() => {
        console.log('Autoplay prevented, click any button to start music');
      });
    } else {
      bgMusic.pause();
      bgMusic.currentTime = 0;
    }
  }

  // Splash screen buttons
  [startEn, startHi].forEach(btn => {
    btn.addEventListener('click', () => {
      splash.classList.remove('show');
      splash.classList.add('hide');

      startScreen.classList.remove('hide');
      startScreen.classList.add('show');

      startBackgroundMusic();
    });
  });

  // Start Quiz button
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

    score = 0; currentQ = 0;
    startScreen.classList.remove('show'); startScreen.classList.add('hide');
    questionScreen.classList.remove('hide'); questionScreen.classList.add('show');

    startBackgroundMusic();
    renderQuestion();
  });

  // Next Question
  nextBtn.addEventListener('click', () => {
    currentQ++;
    lastAnswerIndex = null;
    if (currentQ >= questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  });

  // Restart / Play Again
  restartBtn.addEventListener('click', () => location.reload());
  playAgainBtn.addEventListener('click', () => {
    resultScreen.classList.remove('show'); resultScreen.classList.add('hide');
    startScreen.classList.remove('hide'); startScreen.classList.add('show');
  });

  // Render a question
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

  // Handle answer click
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
      soundCorrect.currentTime = 0;
      soundCorrect.play().catch(() => {});
      showNotify('Correct 👍');
    } else {
      buttonEl.classList.add('wrong');
      allBtn[correctIdx].classList.add('correct');
      soundWrong.currentTime = 0;
      soundWrong.play().catch(() => {});
      showNotify('Wrong ✖');
    }

    scoreEl.textContent = `Score: ${score}`;
    nextBtn.disabled = false;
  }

  // Show results
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
   * Question Generator
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
      if (!qList.some(existing => existing.text === q.text)) {
        qList.push(q);
      }
    }
    return qList;
  }

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

  function generateQuestion(op, minVal, maxVal) {
    let a, b, text, correct;
    if (op === '+') {
      a = randInt(minVal, maxVal); b = randInt(minVal, maxVal);
      correct = a + b; text = `${a} + ${b} = ?`;
    } else if (op === '-') {
      a = randInt(minVal, maxVal); b = randInt(minVal, Math.min(a, maxVal));
      correct = a - b; text = `${a} - ${b} = ?`;
    } else if (op === '*') {
      a = randInt(Math.max(1,minVal), Math.max(2, Math.floor(maxVal/2)));
      b = randInt(1, Math.max(1, Math.floor(maxVal/2)));
      correct = a * b; text = `${a} × ${b} = ?`;
    } else if (op === '/') {
      b = randInt(1, Math.max(1, Math.floor(maxVal/4)));
      const multiplier = randInt(minVal, Math.max(2, Math.floor(maxVal / Math.max(1,b))));
      a = b * multiplier; correct = Math.floor(a / b); text = `${a} ÷ ${b} = ?`;
    } else {
      a = randInt(minVal, maxVal); b = randInt(minVal, maxVal); correct = a + b;
      text = `${a} + ${b} = ?`;
    }

    const options = new Set();
    options.add(correct);
    while (options.size < 4) {
      let delta = Math.max(1, Math.floor(Math.abs(correct) * 0.2)) || 1;
      const candidate = correct + randInt(-delta*3, delta*3);
      if (candidate !== correct && candidate >= -999 && candidate <= 9999) options.add(candidate);
    }
    const optsArr = shuffle(Array.from(options));
    const answerIndex = optsArr.indexOf(correct);

    return { text, options: optsArr, answerIndex, image: null };
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Music toggle
  if (musicToggle) {
    musicToggle.addEventListener('change', () => {
      if (!musicToggle.checked) { bgMusic.pause(); bgMusic.currentTime = 0; }
      else { bgMusic.play().catch(()=>{}); }
    });
  }

  // Preload sounds
  [soundCorrect, soundWrong, bgMusic].forEach(a => a.load());

  // Expose for debugging
  window.__quizzy = { generateQuestion, generateQuiz, questions };
});
