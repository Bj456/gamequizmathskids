document.addEventListener('DOMContentLoaded', () => {

    const splash = document.querySelector('.splash');
    const startScreen = document.querySelector('.start');
    const startButtons = document.querySelectorAll('.start-btn'); // Both buttons

    // Splash buttons click → start screen
    startButtons.forEach(button => {
        button.addEventListener('click', () => {
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

    let currentQ = 0, score = 0, totalQuestions = 10;

    startBtn.addEventListener('click', () => {
        totalQuestions = parseInt(document.getElementById('totalQuestions').value);
        startScreen.classList.remove('show');
        startScreen.classList.add('hide');
        questionScreen.classList.add('show');

        // Example question
        questionImage.src = "assets/images/placeholder.png";
    });

    restartBtn.addEventListener('click', () => location.reload());
});
