document.addEventListener("DOMContentLoaded", () => {
  const splash = document.querySelector(".splash");
  const startScreen = document.querySelector(".start");
  const questionScreen = document.querySelector(".question");
  const resultScreen = document.querySelector(".result");

  const startButtons = document.querySelectorAll(".start-btn");
  const startBtn = document.getElementById("start");
  const restartBtn = document.getElementById("restart");
  const backBtns = document.querySelectorAll(".back-btn");

  const questionText = document.getElementById("question-text");
  const optionsDiv = document.querySelector(".options");
  const progressBar = document.getElementById("progress-bar");
  const scoreText = document.getElementById("score-text");
  const celebration = document.getElementById("celebration");

  const bgMusic = document.getElementById("bg-music");
  const celebrationSound = document.getElementById("celebration-sound");

  let currentQ = 0, score = 0, totalQuestions = 20;

  // Go from splash -> start
  startButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      splash.classList.add("hide");
      startScreen.classList.add("show");
      bgMusic.play(); // start background music
    });
  });

  // Back buttons -> splash
  backBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      startScreen.classList.add("hide");
      questionScreen.classList.add("hide");
      resultScreen.classList.add("hide");
      splash.classList.remove("hide");
      splash.classList.add("show");
      bgMusic.pause();
      bgMusic.currentTime = 0;
    });
  });

  // Start quiz
  startBtn.addEventListener("click", () => {
    totalQuestions = parseInt(document.getElementById("totalQuestions").value) || 20;
    score = 0;
    currentQ = 0;
    startScreen.classList.add("hide");
    questionScreen.classList.add("show");
    loadQuestion();
  });

  // Load question
  function loadQuestion() {
    if (currentQ >= totalQuestions) {
      showResult();
      return;
    }
    questionText.textContent = `Question ${currentQ + 1}: What is ${currentQ}+${currentQ}?`;
    optionsDiv.innerHTML = "";

    for (let i = 0; i < 4; i++) {
      const opt = document.createElement("div");
      opt.className = "option-container";
      opt.textContent = currentQ + i;
      opt.addEventListener("click", () => {
        if (i === 0) score++;
        currentQ++;
        progressBar.style.width = `${(currentQ / totalQuestions) * 100}%`;
        loadQuestion();
      });
      optionsDiv.appendChild(opt);
    }
  }

  // Show result
  function showResult() {
    questionScreen.classList.add("hide");
    resultScreen.classList.add("show");
    scoreText.textContent = `You scored ${score} / ${totalQuestions}`;
    celebration.innerHTML = "";

    if (score === totalQuestions) {
      // Balloons + Sparkles + Sound
      celebration.innerHTML = `
        <lottie-player src="https://assets6.lottiefiles.com/packages/lf20_jcikwtux.json" background="transparent" speed="1" loop autoplay></lottie-player>
        <lottie-player src="https://assets1.lottiefiles.com/private_files/lf30_jmgekfqg.json" background="transparent" speed="1" loop autoplay></lottie-player>
        <p>🎉 Amazing! You got full marks! 🎉</p>
      `;
      bgMusic.pause();
      celebrationSound.play();
    } else if (score >= totalQuestions * 0.6) {
      celebration.innerHTML = `
        <p>🌟 Great job! Keep practicing! 🌟</p>
        <lottie-player src="https://assets1.lottiefiles.com/private_files/lf30_jmgekfqg.json" background="transparent" speed="1" loop autoplay></lottie-player>
      `;
    } else {
      celebration.innerHTML = `
        <p>💪 Don’t give up! You’ll do better next time!</p>
      `;
    }
  }

  restartBtn.addEventListener("click", () => location.reload());
});
