document.addEventListener('DOMContentLoaded', () => {
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
    let totalQuestions = 10;
    let questions = [];
    let lastAnswerIndex = null;

    function showNotify(text, ms = 1500) {
        notify.textContent = text;
        notify.classList.add('show');
        setTimeout(() => notify.classList.remove('show'), ms);
    }

    function startBackgroundMusicIfAllowed() {
        if (musicToggle.checked) {
            bgMusic.currentTime = 0;
            bgMusic.play().catch(()=>{ console.log("Music play blocked by browser"); });
        } else {
            bgMusic.pause();
            bgMusic.currentTime = 0;
        }
    }

    [startEn, startHi].forEach(btn => {
        btn.addEventListener('click', () => {
            splash.classList.remove('show');
            splash.classList.add('hide');
            startScreen.classList.remove('hide');
            startScreen.classList.add('show');

            // play music on user gesture
            startBackgroundMusicIfAllowed();
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
        resultScreen.classList.remove('show'); resultScreen.classList.add('hide');
        startScreen.classList.remove('hide'); startScreen.classList.add('show');
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
            soundCorrect.currentTime = 0;
            soundCorrect.play().catch(()=>{});
            showNotify('Correct 👍');
        } else {
            buttonEl.classList.add('wrong');
            const correctButton = allBtn[correctIdx];
            if (correctButton) correctButton.classList.add('correct');
            soundWrong.currentTime = 0;
            soundWrong.play().catch(()=>{});
            showNotify('Wrong ✖');
        }

        scoreEl.textContent = `Score: ${score}`;
        nextBtn.disabled = false;
    }

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

    // Music toggle
    if (musicToggle) {
        musicToggle.addEventListener('change', () => {
            if (musicToggle.checked) {
                bgMusic.play().catch(()=>{});
            } else {
                bgMusic.pause();
                bgMusic.currentTime = 0;
            }
        });
    }

    [soundCorrect, soundWrong, bgMusic].forEach(a => a.load());

    // expose for debugging
    window.__quizzy = { questions };
});
