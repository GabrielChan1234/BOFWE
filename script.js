let currentRound = -1; // Start from -1 for warm-up round
let puzzles = [];
let categories = []; // Add this to hold the category names
let revealedLetters = [];
let roundLabels = ["WARM-UP ROUND", "ROUND ONE", "ROUND TWO", "ROUND THREE", "ROUND FOUR", "BONUS ROUND ONE", "BONUS ROUND TWO", "BONUS ROUND THREE"];
let vowels = ['A', 'E', 'I', 'O', 'U'];
let autoRevealInterval;
const defaultRevealedLetters = ['R', 'S', 'T', 'L', 'N', 'E'];

function startGame() {
    document.querySelector('.host-inputs').style.display = 'none';
    document.getElementById('continueButton').style.display = 'none';
    document.getElementById('stopButton').style.display = 'block';

    // Get all puzzles including warm-up and bonus rounds
    puzzles = [
        document.getElementById('warmUp').value.toUpperCase(),
        document.getElementById('puzzle1').value.toUpperCase(),
        document.getElementById('puzzle2').value.toUpperCase(),
        document.getElementById('puzzle3').value.toUpperCase(),
        document.getElementById('puzzle4').value.toUpperCase(),
        document.getElementById('bonus1').value.toUpperCase(),
        document.getElementById('bonus2').value.toUpperCase(),
        document.getElementById('bonus3').value.toUpperCase()
    ];

    categories = [
        document.getElementById('warmUpCategory').value,
        document.getElementById('puzzle1Category').value,
        document.getElementById('puzzle2Category').value,
        document.getElementById('puzzle3Category').value,
        document.getElementById('puzzle4Category').value,
        document.getElementById('bonus1Category').value,
        document.getElementById('bonus2Category').value,
        document.getElementById('bonus3Category').value
    ];

    currentRound = 0; // Start with the warm-up round
    revealedLetters = [];
    displayPuzzle(puzzles[currentRound]);

    // Display the round label and category
    displayRoundLabel(roundLabels[currentRound], categories[currentRound]);
    displayVowelList(); // Show the vowel list for the round

    // Start automatic letter reveals for the warm-up round
    autoRevealLetters();

    // Set up the stop button to reveal the answer immediately
    document.getElementById('stopButton').onclick = stopWarmUp;

    // Listen for key presses during rounds 1-4
    if (currentRound > 0) {
        document.addEventListener('keydown', handleKeyPress);
    }

    // Set bonus round button labels
    document.getElementById('bonusButton1').textContent = categories[5];
    document.getElementById('bonusButton2').textContent = categories[6];
    document.getElementById('bonusButton3').textContent = categories[7];
}

function displayRoundLabel(roundLabel, category) {
    let existingRoundLabel = document.getElementById('roundLabel');
    if (existingRoundLabel) {
        existingRoundLabel.remove();
    }

    let roundLabelElement = document.createElement('div');
    roundLabelElement.id = 'roundLabel';
    roundLabelElement.innerHTML = `<strong>${roundLabel}</strong><br><strong>Category:</strong> ${category || ''}`;
    document.body.insertBefore(roundLabelElement, document.querySelector('.puzzle-board'));
}

function displayPuzzle(puzzle, horizontal = false) {
    const puzzleBoard = document.getElementById('puzzleBoard');
    puzzleBoard.innerHTML = ''; // Clear any existing puzzle

    if (horizontal) {
        puzzleBoard.classList.add('puzzle-board-horizontal');
    } else {
        puzzleBoard.classList.remove('puzzle-board-horizontal');
    }

    puzzle.split('').forEach(letter => {
        const letterElement = document.createElement('div');
        letterElement.classList.add('letter');
        if (letter === ' ') {
            letterElement.classList.add('space');
        } else {
            letterElement.textContent = letter;
        }
        puzzleBoard.appendChild(letterElement);
    });
}

function displayVowelList() {
    const vowelList = document.getElementById('vowelList');
    const listItems = vowelList.querySelectorAll('li');
    listItems.forEach(li => {
        li.classList.remove('struckthrough'); // Reset strikethrough on each round
    });
    vowelList.style.display = 'block'; // Show the vowel list
}

function handleKeyPress(event) {
    const letter = event.key.toUpperCase();
    if (revealedLetters.includes(letter) || !/^[A-Z]$/.test(letter)) {
        return;
    }

    revealedLetters.push(letter);
    if (puzzles[currentRound].includes(letter)) {
        revealLetters(letter);

        if (isVowel(letter)) {
            markVowelAsGuessed(letter);
        }

        if (checkIfPuzzleSolved()) {
            if (currentRound < 5) { // Show continue button only if it's not a bonus round
                document.getElementById('continueButton').style.display = 'block';
            } else {
                // Send game over request
                sendGameOverRequest();
            }
        }
    } else {
        flashScreenRed();
    }
}

function revealLetters(letter) {
    const puzzleBoard = document.getElementById('puzzleBoard');
    const puzzle = puzzles[currentRound];
    puzzle.split('').forEach((puzzleLetter, index) => {
        if (puzzleLetter === letter) {
            puzzleBoard.children[index].classList.add('revealed');
        }
    });
}

function isVowel(letter) {
    return vowels.includes(letter);
}

function markVowelAsGuessed(letter) {
    const vowelListItems = document.getElementById('vowelList').querySelectorAll('li');
    vowelListItems.forEach(item => {
        if (item.textContent === letter) {
            item.classList.add('struckthrough');
        }
    });
}

function checkIfPuzzleSolved() {
    const puzzleBoard = document.getElementById('puzzleBoard');
    return [...puzzleBoard.children].every(letterDiv => {
        return letterDiv.classList.contains('revealed') || letterDiv.classList.contains('space');
    });
}

function flashScreenRed() {
    document.body.style.backgroundColor = 'red';
    setTimeout(() => {
        document.body.style.backgroundColor = '';
    }, 100);
}

function autoRevealLetters() {
    autoRevealInterval = setInterval(() => {
        const unrevealedLetters = puzzles[currentRound].split('').filter(letter => {
            return !revealedLetters.includes(letter) && /^[A-Z]$/.test(letter);
        });
        if (unrevealedLetters.length === 0) {
            clearInterval(autoRevealInterval);
            if (currentRound < 5) { // Show continue button only if it's not a bonus round
                document.getElementById('continueButton').style.display = 'block';
            } else {
                // Send game over request
                sendGameOverRequest();
            }
            return;
        }

        const letterToReveal = unrevealedLetters[Math.floor(Math.random() * unrevealedLetters.length)];
        revealedLetters.push(letterToReveal);
        revealLetters(letterToReveal);
    }, 1000);
}

function stopWarmUp() {
    clearInterval(autoRevealInterval);
    revealedLetters = puzzles[currentRound].split('');
    revealLetters(puzzles[currentRound]);
    document.getElementById('continueButton').style.display = 'block';
    document.getElementById('stopButton').style.display = 'none';
}

function nextRound() {
    currentRound++;
    if (currentRound < puzzles.length) {
        if (currentRound >= 5) {
            // Bonus rounds
            removePreviousRoundElements();
            document.getElementById('bonusRoundSelection').style.display = 'block';
        } else {
            // Regular rounds
            revealedLetters = [];
            displayPuzzle(puzzles[currentRound]);

            // Display the round label and category
            displayRoundLabel(roundLabels[currentRound], categories[currentRound]);

            // Reset vowel list and continue button visibility
            displayVowelList();
            document.getElementById('continueButton').style.display = 'none';

            // Start automatic letter reveals for the warm-up round
            if (currentRound === 0) {
                autoRevealLetters();
            }

            // Listen for key presses during rounds 1-4
            if (currentRound > 0 && currentRound < 5) {
                document.addEventListener('keydown', handleKeyPress);
            } else {
                document.removeEventListener('keydown', handleKeyPress);
            }

            // Hide the bonus round selection if it is not the bonus round
            document.getElementById('bonusRoundSelection').style.display = 'none';
        }
    } else {
        // Game over, handle any end of game logic here
        sendGameOverRequest();
    }
}

function removePreviousRoundElements() {
    // Remove round label
    let existingRoundLabel = document.getElementById('roundLabel');
    if (existingRoundLabel) {
        existingRoundLabel.remove();
    }

    // Clear puzzle board
    const puzzleBoard = document.getElementById('puzzleBoard');
    puzzleBoard.innerHTML = '';

    // Hide vowel list and continue button
    document.getElementById('vowelList').style.display = 'none';
    document.getElementById('continueButton').style.display = 'none';
}

function selectBonusRound(bonusRoundNumber) {
    currentRound = 4 + bonusRoundNumber;
    revealedLetters = [];
    displayPuzzle(puzzles[currentRound], true); // Pass true for horizontal layout

    // Automatically reveal default letters R, S, T, L, N, E
    defaultRevealedLetters.forEach(letter => {
        if (puzzles[currentRound].includes(letter)) {
            revealedLetters.push(letter);
            revealLetters(letter);
        }
    });

    // Display the round label and category
    displayRoundLabel(roundLabels[currentRound], categories[currentRound]);

    // Reset vowel list and continue button visibility
    displayVowelList();
    document.getElementById('continueButton').style.display = 'none';

    // Hide the bonus round selection
    document.getElementById('bonusRoundSelection').style.display = 'none';

    // Show the puzzle board
    document.querySelector('.puzzle-board').style.display = 'block';

    // Listen for key presses during bonus rounds
    document.addEventListener('keydown', handleKeyPress);
}

function sendGameOverRequest() {
    // Implement the logic to send a request indicating that the game is over
    console.log("Game Over");
    // Example: sending a POST request to a server endpoint
    // fetch('/game-over', {
    //     method: 'POST',
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({ message: 'Game Over' })
    // }).then(response => {
    //     return response.json();
    // }).then(data => {
    //     console.log(data);
    // }).catch(error => {
    //     console.error('Error:', error);
    // });
}
