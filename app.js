// ================================================
// Quizzy Math Kids
// Created by: Bhaskar Joshi
// Email: bhaskarjoshi@example.com
// ================================================

// DOM Elements
const startBtn = document.getElementById('start');
const restartBtn = document.getElementById('restart');
const startScreen = document.querySelector('.start');
const questionScreen = document.querySelector('.question');
const resultScreen = document.querySelector('.result');
const questionHeader = questionScreen.querySelector('.header h2');
const optionsContainer = questionScreen.querySelector('.options');
const nextBtn = questionScreen.querySelector('button');
const notify = document.querySelector('.notify');
const gradeDisplay = document.querySelector('.grade p');
const questionImage = document.getElementById('question-image');

// Music URLs
const successMusic = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3");
const failMusic = new Audio("https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3");

// Quiz Data
let questions = [];
let currentQuestionIndex = 0;
let score = 0;

// ========================
// Generate Random Questions
// ========================
function generateQuestions(total, operation, difficulty){
    const arr = [];
    let maxNum = 10;
    if(difficulty === 'average') maxNum = 50;
    if(difficulty === 'hard') maxNum = 100;

    for(let i=0; i<total; i++){
        const a = Math.floor(Math.random() * maxNum) + 1;
        const b = Math.floor(Math.random() * maxNum) + 1;
        let questionText = '';
        let answer = 0;

        switch(operation){
            case '+':
                questionText = `${a} + ${b} = ?`;
                answer = a + b;
                break;
            case '-':
                questionText = `${a} - ${b} = ?`;
                answer = a - b;
                break;
            case '×':
                questionText = `${a} × ${b} = ?`;
                answer = a * b;
                break;
            case '÷':
                questionText = `${a * b} ÷ ${a} = ?`; // Integer division
                answer = b;
                break;
        }

        // Options generate
        const options = new Set();
        options.add(answer);
        while(options.size < 4){
            options.add(answer + Math.floor(Math.random()*10)-5);
        }

        arr.push({
            question: questionText,
            answer: answer,
            options: Array.from(options).sort(() => Math.random() - 0.5)
        });
    }

    return arr;
}

// ========================
// Generate Question Image (Placeholder)
// ========================
function generateImage(question){
    // Placeholder: real AI image integration can be done here
    const basePath = 'assets/images/';
    const filename = question.replace(/\s/g,'_').replace(/[^a-zA-Z0-9_]/g,'') + '.png';
    return basePath + filename;
}

// ========================
// Load Question
// ========================
function loadQuestion(){
    const q = questions[currentQuestionIndex];
    questionHeader.innerText = q.question;
    optionsContainer.innerHTML = '';

    q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.innerText = opt;
        btn.onclick = () => checkAnswer(opt, q.answer);
        optionsContainer.appendChild(btn);
    });

    // Assign image
    questionImage.src = generateImage(q.question);

    // Disable next until answer clicked
    nextBtn.disabled = true;
}

// ========================
// Check Answer
// ========================
function checkAnswer(selected, correct){
    if(selected == correct){
        score++;
        notify.innerText = '✅ Correct!';
        successMusic.play();
    } else {
        notify.innerText = `❌ Wrong! Correct answer: ${correct}`;
        failMusic.play();
    }
    notify.classList.add('show');
    setTimeout(()=> notify.classList.remove('show'), 1000);
    nextBtn.disabled = false;
}

// ========================
// Show Result
// ========================
function showResult(){
    questionScreen.classList.add('hide');
    resultScreen.classList.remove('hide');

    resultScreen.querySelector('.options').innerText = `You scored ${score} / ${questions.length}`;

    let grade = 'F';
    const percent = (score/questions.length)*100;
    if(percent >= 90) grade = 'A';
    else if(percent >= 70) grade = 'B';
    else if(percent >= 50) grade = 'C';
    gradeDisplay.innerText = grade;
}

// ========================
// Start Quiz
// ========================
startBtn.onclick = () => {
    const operation = document.querySelector('.start-options .option-container.selected')?.getAttribute('operand') || '+';
    const difficulty = document.getElementById('difficulty').value;
    const totalQuestions = parseInt(document.getElementById('totalQuestions').value);

    questions = generateQuestions(totalQuestions, operation, difficulty);
    currentQuestionIndex = 0;
    score = 0;

    startScreen.classList.remove('show');
    questionScreen.classList.remove('hide');
    loadQuestion();
};

// ========================
// Next Question
// ========================
nextBtn.onclick = () => {
    currentQuestionIndex++;
    if(currentQuestionIndex < questions.length){
        loadQuestion();
    } else {
        showResult();
    }
};

// ========================
// Restart Quiz
// ========================
restartBtn.onclick = () => {
    location.reload();
};

// ========================
// Operation Selection
// ========================
document.querySelectorAll('.option-container').forEach(el => {
    el.onclick = () => {
        document.querySelectorAll('.option-container').forEach(e => e.classList.remove('selected'));
        el.classList.add('selected');
    }
});
