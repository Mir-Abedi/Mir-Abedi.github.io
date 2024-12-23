let num1, num2;
let mistakeCount = 0;
let correctCount = 0;  // Add a counter for consecutive correct answers
let total_correct = 0;

function generateNumbers(prevN1 = 0, prevN2 = 0) {
    let n1 = Math.floor(Math.random() * 11) + 2;
    let n2 = n1 <= 10 ? Math.floor(Math.random() * 11) + 2 : Math.floor(Math.random() * 9) + 2;
    if (n1 === prevN1 && n2 === prevN2) {
        return generateNumbers(prevN1, prevN2);
    }
    return [n1, n2];
}

function makeNumberFarsi(number) {
    return number.toString().replace(/1/g, "۱").replace(/2/g, "۲").replace(/3/g, "۳").replace(/4/g, "۴").replace(/5/g, "۵").replace(/6/g, "۶").replace(/7/g, "۷").replace(/8/g, "۸").replace(/9/g, "۹").replace(/0/g, "۰");
}

function makeNumberEnglish(number) {
    return parseInt(number.replace(/۱/g, "1").replace(/۲/g, "2").replace(/۳/g, "3").replace(/۴/g, "4").replace(/۵/g, "5").replace(/۶/g, "6").replace(/۷/g, "7").replace(/۸/g, "8").replace(/۹/g, "9").replace(/۰/g, "0"));
}

function checkAnswer() {
    const userAnswer = makeNumberEnglish(document.getElementById("answer").value);
    const correctAnswer = num1 * num2;
    const resultLabel = document.getElementById("result");

    if (document.getElementById("answer").value === "") {
        resultLabel.textContent = `لطفا یک عدد وارد کنید.`;
        resultLabel.style.color = "red";
    } else if (isNaN(userAnswer)) {
        resultLabel.textContent = `واقعا که! این چه عددی است؟`;
        resultLabel.style.color = "red";
    } else if (userAnswer === correctAnswer) {
        resultLabel.textContent = "درسته!";
        resultLabel.style.color = "green";
        mistakeCount = 0;
        correctCount += 1;  // Increment the correct answer counter
        if (correctCount >= 5) {
            triggerCelebration();  // Trigger celebration animation
            correctCount = 0;  // Reset the counter
            resultLabel.textContent = `عالی! جواب درست ${makeNumberFarsi(correctAnswer)} است.`;
            setTimeout(() => {
                resultLabel.textContent = "";
            }, 3000);  // Keep the label for 3 seconds
        } else {
            newQuestion();
        }
    } else {
        mistakeCount += 1;
        correctCount = 0;  // Reset the correct answer counter on mistake
        if (mistakeCount >= 3) {
            resultLabel.textContent = `اشتباه! جواب درست ${makeNumberFarsi(correctAnswer)} است.`;
            resultLabel.style.color = "red";
            mistakeCount = 0;
            setTimeout(newQuestion, 3000);  // Show the correct answer for 3 seconds before generating a new question
        } else {
            resultLabel.textContent = "اشتباه! دوباره امتحان کن.";
            resultLabel.style.color = "red";
        }
    }
}

function newQuestion() {
    [num1, num2] = generateNumbers(num1, num2);
    document.getElementById("question").textContent = `${makeNumberFarsi(num1)} ضرب در ${makeNumberFarsi(num2)}؟`;
    document.getElementById("answer").value = "";
    document.getElementById("result").textContent = "";
}

function checkEnter(event) {
    if (event.key === "Enter") {
        checkAnswer();
    }
}

function triggerCelebration() {
    const body = document.body;
    body.classList.add("celebration");
    createFireworks();  // Create fireworks
    setTimeout(() => {
        body.classList.remove("celebration");
        removeFireworks();  // Remove fireworks after celebration
    }, 3000);  // Celebration lasts for 3 seconds
}

function createFireworks() {
    for (let i = 0; i < 20; i++) {
        const firework = document.createElement("div");
        firework.classList.add("firework");
        firework.style.left = `${Math.random() * 100}%`;
        firework.style.top = `${Math.random() * 100}%`;
        document.body.appendChild(firework);
    }
}

function removeFireworks() {
    const fireworks = document.querySelectorAll(".firework");
    fireworks.forEach(firework => firework.remove());
}

// Initialize the first question
newQuestion();
