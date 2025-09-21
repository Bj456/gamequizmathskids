document.addEventListener('DOMContentLoaded', () => {

    // Splash screen start button
    document.getElementById('start-app').addEventListener('click', () => {
        document.querySelector('.splash').classList.remove('show');
        document.querySelector('.start').classList.remove('hide');
        document.querySelector('.start').classList.add('show');
    });

    const startBtn = document.getElementById('start');
    const restartBtn = document.getElementById('restart');
    const startScreen = document.querySelector('.start');
    const questionScreen = document.querySelector('.question');
    const resultScreen = document.querySelector('.result');
    const notify = document.querySelector('.notify');
    const questionImage = document.getElementById('question-image');

    // Placeholder for demo
    function generateQuestion(){
        return { text: "2 × 3 = ?", image:"assets/images/placeholder.png", answer:"6", options:["5","6","7","8"] };
    }

    let currentQ = 0, score = 0, totalQuestions = 10, currentQuestion;

    startBtn.addEventListener('click', () => {
        totalQuestions = parseInt(document.getElementById('totalQuestions').value);
        startScreen.classList.add('hide');
        startScreen.classList.remove('show');
        loadQuestion();
    });

    restartBtn.addEventListener('click', () => location.reload());

