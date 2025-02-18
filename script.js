document.addEventListener("DOMContentLoaded", () => {
    // 🛠️ Select Game Elements
    const gameContainer = document.getElementById("game-container");
    const player1 = document.getElementById("player1");
    const player2 = document.getElementById("player2");

    const redScoreElement = document.getElementById("red-score");
    const blueScoreElement = document.getElementById("blue-score");

    const p1StatusFill = document.getElementById("p1-fill");
    const p2StatusFill = document.getElementById("p2-fill");
    const p1StatusText = document.getElementById("p1-status-text");
    const p2StatusText = document.getElementById("p2-status-text");

    const probabilityCounter = document.getElementById("probability-counter");

    // 📌 Instructions Button Elements
    const infoButton = document.getElementById("info-button");
    const instructionsPopup = document.getElementById("instructions-popup");
    const closePopup = document.getElementById("close-popup");

    // 📍 Player States
    let player1Pos = { x: 50, y: 50 };
    let player2Pos = { x: 400, y: 400 };
    let redScore = 0;
    let blueScore = 0;
    let p1Quarantined = false;
    let p2Quarantined = false;
    let taskCounter = 1; // Initialize task numbering globally

    // 🎮 Game Constants
    const step = 5;
    const boxSize = 500;
    const playerSize = 20;
    const victimSize = 15;
    const numVictims = 5;

    let keysPressed = {};
    let victims = [];


// 📊 Quarantine Probability Tracking
let orangeRescues = 0, orangeQuarantines = 0;
let purpleRescues = 0, purpleQuarantines = 0;

// 🔢 Update Probability Counters
function updateProbabilityCounters() {
    let orangeProb = orangeRescues > 0 ? (orangeQuarantines / orangeRescues * 100).toFixed(1) : 0;
    let purpleProb = purpleRescues > 0 ? (purpleQuarantines / purpleRescues * 100).toFixed(1) : 0;

    probabilityCounter.innerHTML = `
        <p>Last Quarantine Probability:</p>
        <p>🟠 Orange Victims: ${orangeProb}%</p>
        <p>🟣 Purple Victims: ${purpleProb}%</p>
    `;
}


    // 🎮 Handle Key Presses
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        keysPressed[key] = true;

        // Allow players to press "E" to exit quarantine

    });

    document.addEventListener("keyup", (event) => {
        keysPressed[event.key.toLowerCase()] = false;
    });

    // 📌 Instructions Popup Logic
    infoButton.addEventListener("click", () => {
        instructionsPopup.classList.add("show");
    });

    closePopup.addEventListener("click", () => {
        instructionsPopup.classList.remove("show");
    });

    instructionsPopup.addEventListener("click", (event) => {
        if (event.target === instructionsPopup) {
            instructionsPopup.classList.remove("show");
        }
    });

function updatePositions() {
    const gameBounds = gameContainer.getBoundingClientRect();
    const playerBounds = player1.getBoundingClientRect(); // Players are the same size

    // Ensure players can move fully within the game container
    if (keysPressed["w"]) player1Pos.y = Math.max(0, player1Pos.y - step);
    if (keysPressed["s"]) player1Pos.y = Math.min(gameBounds.height - playerBounds.height, player1Pos.y + step);
    if (keysPressed["a"]) player1Pos.x = Math.max(0, player1Pos.x - step);
    if (keysPressed["d"]) player1Pos.x = Math.min(gameBounds.width - playerBounds.width, player1Pos.x + step);

    if (keysPressed["arrowup"]) player2Pos.y = Math.max(0, player2Pos.y - step);
    if (keysPressed["arrowdown"]) player2Pos.y = Math.min(gameBounds.height - playerBounds.height, player2Pos.y + step);
    if (keysPressed["arrowleft"]) player2Pos.x = Math.max(0, player2Pos.x - step);
    if (keysPressed["arrowright"]) player2Pos.x = Math.min(gameBounds.width - playerBounds.width, player2Pos.x + step);

    player1.style.left = `${player1Pos.x}px`;
    player1.style.top = `${player1Pos.y}px`;
    player2.style.left = `${player2Pos.x}px`;
    player2.style.top = `${player2Pos.y}px`;

    checkVictimRescue();
    requestAnimationFrame(updatePositions);
}



    function spawnVictims() {
        victims.forEach(victim => victim.element.remove()); // Clear existing victims
        victims = [];
    
        let halfVictims = Math.floor(numVictims / 2);
    
        for (let i = 0; i < numVictims; i++) {
            let victim = document.createElement("div");
            let taskLabel = document.createElement("span"); // Task number label
    
            let isOrange = i < halfVictims || (numVictims % 2 !== 0 && i === halfVictims);
            victim.classList.add("victim", isOrange ? "red-victim" : "blue-victim");
    
            let posX = Math.floor(Math.random() * (boxSize - victimSize));
            let posY = Math.floor(Math.random() * (boxSize - victimSize));
    
            victim.style.left = posX + "px";
            victim.style.top = posY + "px";
    
            // Set up the task label
            taskLabel.textContent = `Task ${taskCounter++}`;
            taskLabel.classList.add("task-label");
            taskLabel.style.left = `${posX}px`;
            taskLabel.style.top = `${posY - 20}px`; // Position above victim
    
            gameContainer.appendChild(taskLabel);
            gameContainer.appendChild(victim);
            victims.push({ element: victim, label: taskLabel, x: posX, y: posY, color: isOrange ? "orange" : "purple" });
        }
    }
    

    // 🎲 Check for Rescue & Apply Quarantine
    function checkVictimRescue() {
        victims.forEach((victim, index) => {
            let isOrange = victim.color === "orange";
            let quarantineChance = isOrange ? 50 : 5;
            let scoreIncrease = isOrange ? 10 : 1;
    
            if (!p1Quarantined && isColliding(player1, victim)) {
                if (Math.random() < quarantineChance / 100) {
                    applyQuarantine("player1");
                    isOrange ? orangeQuarantines++ : purpleQuarantines++;
                }
                redScore += scoreIncrease;
                redScoreElement.textContent = redScore;
                isOrange ? orangeRescues++ : purpleRescues++;
                updateProbabilityCounters();
                respawnVictim(index);
            }
    
            if (!p2Quarantined && isColliding(player2, victim)) {
                if (Math.random() < quarantineChance / 100) {
                    applyQuarantine("player2");
                    isOrange ? orangeQuarantines++ : purpleQuarantines++;
                }
                blueScore += scoreIncrease;
                blueScoreElement.textContent = blueScore;
                isOrange ? orangeRescues++ : purpleRescues++;
                updateProbabilityCounters();
                respawnVictim(index);
            }
        });
    }
    
    
    

    // 🚷 Apply Quarantine (Prevents Rescue but ALLOWS Movement)
function applyQuarantine(player) {
    let quarantineTime = 5; // Quarantine duration in seconds

    if (player === "player1") {
        p1Quarantined = true;
        p1StatusFill.style.width = "0%";
        p1StatusText.textContent = `Quarantined for ${quarantineTime} seconds`;
        p1StatusText.classList.add("unfit");

        let countdown = setInterval(() => {
            quarantineTime--;
            p1StatusText.textContent = `Quarantined for ${quarantineTime} seconds`;

            if (quarantineTime <= 0) {
                clearInterval(countdown);
                resetStatus("player1");
            }
        }, 1000); // Update every second

        flickerEffect(p1StatusFill); // Start flickering effect
    } else {
        p2Quarantined = true;
        p2StatusFill.style.width = "0%";
        p2StatusText.textContent = `Quarantined for ${quarantineTime} seconds`;
        p2StatusText.classList.add("unfit");

        let countdown = setInterval(() => {
            quarantineTime--;
            p2StatusText.textContent = `Quarantined for ${quarantineTime} seconds`;

            if (quarantineTime <= 0) {
                clearInterval(countdown);
                resetStatus("player2");
            }
        }, 1000);

        flickerEffect(p2StatusFill); // Start flickering effect
    }
}

 // 🔄 Restore Status After Quarantine Ends
function resetStatus(player) {
    if (player === "player1") {
        p1Quarantined = false;
        p1StatusFill.style.width = "100%";
        p1StatusText.textContent = "Fit for tasks";
        p1StatusText.classList.remove("unfit");
    } else {
        p2Quarantined = false;
        p2StatusFill.style.width = "100%";
        p2StatusText.textContent = "Fit for tasks";
        p2StatusText.classList.remove("unfit");
    }
}

// 🔴 Flickering Effect for Quarantine Status Bar
function flickerEffect(statusBar) {
    let isRed = false;
    let flickerInterval = setInterval(() => {
        statusBar.style.backgroundColor = isRed ? "red" : "darkred";
        isRed = !isRed;
    }, 3); // Flicker every 3ms

    setTimeout(() => {
        clearInterval(flickerInterval);
        statusBar.style.backgroundColor = "green"; // Reset to normal after quarantine
    }, 5000); // Stop flickering after quarantine ends
}

    // 🎲 Check Collision Between Player & Victim
    function isColliding(player, victim) {
        let playerBox = player.getBoundingClientRect();
        let victimBox = victim.element.getBoundingClientRect();
    
        return !(
            playerBox.right < victimBox.left ||
            playerBox.left > victimBox.right ||
            playerBox.bottom < victimBox.top ||
            playerBox.top > victimBox.bottom
        );
    }
    

    // 🔄 Respawn Victims After Collection
    function respawnVictim(index) {
        victims[index].element.remove(); // Remove victim
        victims[index].label.remove(); // Remove task label
    
        let newPosX = Math.floor(Math.random() * (boxSize - victimSize));
        let newPosY = Math.floor(Math.random() * (boxSize - victimSize));
    
        let newVictim = document.createElement("div");
        let newTaskLabel = document.createElement("span");
    
        newVictim.classList.add("victim", victims[index].color === "orange" ? "red-victim" : "blue-victim");
    
        newVictim.style.left = newPosX + "px";
        newVictim.style.top = newPosY + "px";
    
        newTaskLabel.textContent = `Task ${taskCounter++}`;
        newTaskLabel.classList.add("task-label");
        newTaskLabel.style.left = `${newPosX}px`;
        newTaskLabel.style.top = `${newPosY - 20}px`;
    
        gameContainer.appendChild(newTaskLabel);
        gameContainer.appendChild(newVictim);
    
        victims[index] = { element: newVictim, label: newTaskLabel, x: newPosX, y: newPosY, color: victims[index].color };
    }
    

    // 🎮 Start Game
    spawnVictims();
    updatePositions();
});
