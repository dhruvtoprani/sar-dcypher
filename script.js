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

    // 🎮 Game Constants
    const step = 5;
    const boxSize = 500;
    const playerSize = 20;
    const victimSize = 15;
    const numVictims = 5;

    let keysPressed = {};
    let victims = [];

    // 🎮 Handle Key Presses
    document.addEventListener("keydown", (event) => {
        const key = event.key.toLowerCase();
        keysPressed[key] = true;

        // Allow players to press "E" to exit quarantine
        if (key === "e") {
            if (p1Quarantined) resetStatus("player1");
            if (p2Quarantined) resetStatus("player2");
        }
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

    // 🔄 Update Player Movement (Even When Unfit)
    function updatePositions() {
        if (keysPressed["w"]) player1Pos.y = Math.max(0, player1Pos.y - step);
        if (keysPressed["s"]) player1Pos.y = Math.min(boxSize - playerSize, player1Pos.y + step);
        if (keysPressed["a"]) player1Pos.x = Math.max(0, player1Pos.x - step);
        if (keysPressed["d"]) player1Pos.x = Math.min(boxSize - playerSize, player1Pos.x + step);

        if (keysPressed["arrowup"]) player2Pos.y = Math.max(0, player2Pos.y - step);
        if (keysPressed["arrowdown"]) player2Pos.y = Math.min(boxSize - playerSize, player2Pos.y + step);
        if (keysPressed["arrowleft"]) player2Pos.x = Math.max(0, player2Pos.x - step);
        if (keysPressed["arrowright"]) player2Pos.x = Math.min(boxSize - playerSize, player2Pos.x + step);

        player1.style.left = player1Pos.x + "px";
        player1.style.top = player1Pos.y + "px";
        player2.style.left = player2Pos.x + "px";
        player2.style.top = player2Pos.y + "px";

        checkVictimRescue();
        requestAnimationFrame(updatePositions);
    }

    // 🏥 Spawn Victims
    function spawnVictims() {
        victims.forEach(victim => victim.element.remove());
        victims = [];
    
        let halfVictims = Math.floor(numVictims / 2);
    
        for (let i = 0; i < numVictims; i++) {
            let victim = document.createElement("div");
    
            // Ensure exactly half of each color
            let isOrange = i < halfVictims || (numVictims % 2 !== 0 && i === halfVictims);
            victim.classList.add("victim", isOrange ? "red-victim" : "blue-victim");
    
            let posX = Math.floor(Math.random() * (boxSize - victimSize));
            let posY = Math.floor(Math.random() * (boxSize - victimSize));
    
            victim.style.left = posX + "px";
            victim.style.top = posY + "px";
    
            gameContainer.appendChild(victim);
            victims.push({ element: victim, x: posX, y: posY, color: isOrange ? "orange" : "purple" });
        }
    }
    

    // 🎲 Check for Rescue & Apply Quarantine
    function checkVictimRescue() {
        victims.forEach((victim, index) => {
            let quarantineChance = victim.color === "orange" ? 50 : 5;
    
            if (!p1Quarantined && isColliding(player1, victim)) {
                if (Math.random() < quarantineChance / 100) {
                    applyQuarantine("player1");
                }
                redScore += 10;
                redScoreElement.textContent = redScore;
                respawnVictim(index);
            }
    
            if (!p2Quarantined && isColliding(player2, victim)) {
                if (Math.random() < quarantineChance / 100) {
                    applyQuarantine("player2");
                }
                blueScore += 10;
                blueScoreElement.textContent = blueScore;
                respawnVictim(index);
            }
    
            probabilityCounter.textContent = `Last Quarantine Probability: ${quarantineChance}%`;
        });
    }
    

    // 🚷 Apply Quarantine (Prevents Rescue but ALLOWS Movement)
    function applyQuarantine(player) {
        if (player === "player1") {
            p1Quarantined = true;
            p1StatusFill.style.width = "0%";
            p1StatusText.textContent = "Unfit for tasks! Press 'E' to recover";
            p1StatusText.classList.add("unfit");
        } else {
            p2Quarantined = true;
            p2StatusFill.style.width = "0%";
            p2StatusText.textContent = "Unfit for tasks! Press 'E' to recover";
            p2StatusText.classList.add("unfit");
        }
    }

    // 🔄 Restore Status After Pressing "E"
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
        let newPosX = Math.floor(Math.random() * (boxSize - victimSize));
        let newPosY = Math.floor(Math.random() * (boxSize - victimSize));

        victims[index].x = newPosX;
        victims[index].y = newPosY;
        victims[index].element.style.left = newPosX + "px";
        victims[index].element.style.top = newPosY + "px";
    }

    // 🎮 Start Game
    spawnVictims();
    updatePositions();
});
