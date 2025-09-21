document.addEventListener('DOMContentLoaded', () => {

    const splash = document.querySelector('.splash');
    const startScreen = document.querySelector('.start');
    const startButtons = document.querySelectorAll('.start-btn');

    // Splash buttons click → start quiz
    startButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            splash.classList.remove('show');
            splash.classList.add('hide');
            startScreen.classList.remove('hide');
            startScreen.classList.add('show');
        });
    });

    // Placeholder quiz logic
    const startBtn = document.getElementById('start');
    const questionScreen = document.querySelector('.question');
    const resultScreen = document.querySelector('.result');
    const questionImage = document.getElementById('question-image');
    const restartBtn = document.getElementById('restart');

    function generateQuestion(){
        return { text:"2 × 3 = ?", image:"assets/images/placeholder.png", answer:"6", options:["5","6","7","
