// script.js
document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const playerBankDisplay = document.getElementById('player-bank');
    const currentBetDisplay = document.getElementById('current-bet-display');
    const dealerHandDisplay = document.getElementById('dealer-hand');
    const playerHandDisplay = document.getElementById('player-hand');
    const dealerScoreDisplay = document.getElementById('dealer-score');
    const playerScoreDisplay = document.getElementById('player-score');
    const gameMessageDisplay = document.getElementById('game-message');

    const bettingControls = document.getElementById('betting-controls');
    const gameActions = document.getElementById('game-actions');
    const postRoundControls = document.getElementById('post-round-controls');

    const dealButton = document.getElementById('deal-button');
    const clearBetButton = document.getElementById('clear-bet-button');
    const chipButtons = document.querySelectorAll('.chip');
    const betAmountInput = document.getElementById('bet-amount-input');

    const hitButton = document.getElementById('hit-button');
    const standButton = document.getElementById('stand-button');
    const doubleDownButton = document.getElementById('double-down-button');
    const splitButton = document.getElementById('split-button');
    const newRoundButton = document.getElementById('new-round-button');

    // --- Game State Variables ---
    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let playerBank = parseInt(localStorage.getItem('playerBank')) || 1000;
    let currentBet = 0;
    let gameInProgress = false;
    let playerTurn = false;

    const SUITS = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const SUIT_CHARS = {'Hearts': '♥', 'Diamonds': '♦', 'Clubs': '♣', 'Spades': '♠'};
    const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    // --- Classes ---
    class Card {
        constructor(suit, rank) {
            this.suit = suit;
            this.rank = rank;
            this.value = this._getValue();
            this.suitChar = SUIT_CHARS[suit];
        }

        _getValue() {
            if (['J', 'Q', 'K'].includes(this.rank)) return 10;
            if (this.rank === 'A') return 11;
            return parseInt(this.rank);
        }

        getHTML() {
            const cardDiv = document.createElement('div');
            cardDiv.classList.add('card', this.suit.toLowerCase());
            cardDiv.setAttribute('data-rank', this.rank);
            cardDiv.setAttribute('data-suit-char', this.suitChar);
            
            const rankSpan = document.createElement('span');
            rankSpan.classList.add('rank');
            rankSpan.textContent = this.rank;

            const suitSpan = document.createElement('span');
            suitSpan.classList.add('suit');
            suitSpan.innerHTML = this.suitChar;

            cardDiv.appendChild(rankSpan);
            // Not adding central suitSpan by default, relying on pseudo-elements and rank primarily.
            // If you want a large central suit, uncomment the line below and adjust CSS.
            // cardDiv.appendChild(suitSpan); 

            setTimeout(() => cardDiv.classList.add('visible'), 50 + (Math.random() * 100)); // Stagger animation slightly
            return cardDiv;
        }
    }

    // --- Game Logic Functions ---
    function createDeck() {
        deck = [];
        for (const suit of SUITS) {
            for (const rank of RANKS) {
                deck.push(new Card(suit, rank));
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function dealCard(hand) { // Removed isDealerHidden, handled by renderHands
        if (deck.length < 10) { // Reshuffle if deck is low
            setMessage("Reshuffling deck...", true, 1500);
            createDeck();
            shuffleDeck();
        }
        const card = deck.pop();
        hand.push(card);
        return card;
    }

    function calculateHandValue(hand) {
        let value = 0;
        let aceCount = 0;
        for (const card of hand) {
            value += card.value;
            if (card.rank === 'A') aceCount++;
        }
        while (value > 21 && aceCount > 0) {
            value -= 10;
            aceCount--;
        }
        return value;
    }

    function renderHands(revealDealerHoleCard = false) {
        playerHandDisplay.innerHTML = '';
        playerHand.forEach(card => playerHandDisplay.appendChild(card.getHTML()));

        dealerHandDisplay.innerHTML = '';
        dealerHand.forEach((card, index) => {
            const cardHTML = card.getHTML();
            // Standard Blackjack: Dealer's second card (index 1) is the hole card (hidden initially)
            if (index === 1 && gameInProgress && !revealDealerHoleCard && dealerHand.length > 1) {
                cardHTML.classList.add('hidden');
                cardHTML.innerHTML = ''; // Clear visual content for hidden card
                cardHTML.removeAttribute('data-rank'); // Prevent text via pseudo-elements
                cardHTML.removeAttribute('data-suit-char');
                // Ensure central rank/suit spans are also cleared if they were part of getHTML directly
                const rankSpan = cardHTML.querySelector('.rank');
                if (rankSpan) rankSpan.textContent = '';
                const suitSpan = cardHTML.querySelector('.suit');
                if (suitSpan) suitSpan.textContent = '';
            }
            dealerHandDisplay.appendChild(cardHTML);
        });
        // Scores are updated after renderHands in the main game flow, e.g., after dealing or player actions
    }

    function updateScores() {
        playerScoreDisplay.textContent = calculateHandValue(playerHand);

        const isDealerHoleCardHidden = dealerHandDisplay.querySelector('.card.hidden') !== null;

        if (isDealerHoleCardHidden && dealerHand.length > 1) {
            // If hole card (dealerHand[1]) is hidden, display value of dealerHand[0] (up-card) + ?
            dealerScoreDisplay.textContent = `${dealerHand[0].value} + ?`;
        } else if (dealerHand.length === 1 && gameInProgress) {
            // If dealer only has one card, it must be the up-card
            dealerScoreDisplay.textContent = dealerHand[0].value;
        } else {
            // All dealer cards are revealed or game not in a state for hidden card logic
            dealerScoreDisplay.textContent = calculateHandValue(dealerHand);
        }
    }
    
    function updateBankDisplay() {
        playerBankDisplay.textContent = playerBank;
        localStorage.setItem('playerBank', playerBank);
    }

    function updateBetDisplay() {
        currentBetDisplay.textContent = currentBet;
        betAmountInput.value = currentBet > 0 ? currentBet : '';
    }

    function setMessage(msg, isTemporary = false, duration = 2500) {
        gameMessageDisplay.classList.remove('message-exit', 'message-enter');
        void gameMessageDisplay.offsetWidth; // Trigger reflow for re-animation

        gameMessageDisplay.textContent = msg;
        gameMessageDisplay.classList.add('message-enter');

        if (gameMessageDisplay.timeoutId) clearTimeout(gameMessageDisplay.timeoutId);
        if (gameMessageDisplay.exitTimeoutId) clearTimeout(gameMessageDisplay.exitTimeoutId);

        gameMessageDisplay.timeoutId = setTimeout(() => {
            gameMessageDisplay.classList.remove('message-enter'); // End enter animation
            if (isTemporary) {
                // Duration includes the time for enter animation to be visible and the message to be read
                gameMessageDisplay.exitTimeoutId = setTimeout(() => {
                    gameMessageDisplay.classList.add('message-exit');
                }, duration - 800); // 400ms for enter, 400ms for exit transition
            }
        }, 100); // Brief moment for enter class to apply
    }

    function checkBlackjack() {
        const playerValue = calculateHandValue(playerHand);
        // Dealer's up-card for checking initial dealer BJ
        const dealerUpCardValue = dealerHand.length > 0 ? dealerHand[0].value : 0;


        if (playerValue === 21 && playerHand.length === 2) {
            // Player has Blackjack
            renderHands(true); // Reveal dealer's hand
            updateScores();
            const dealerValue = calculateHandValue(dealerHand);
            if (dealerValue === 21 && dealerHand.length === 2) { // Dealer also has Blackjack
                setMessage("Push! Both have Blackjack.");
                playerBank += currentBet; // Return bet
            } else {
                setMessage("Blackjack! You win 3:2!");
                playerBank += currentBet + Math.floor(currentBet * 1.5); // 3:2 payout
            }
            endRound();
            return true;
        }
        // Check for dealer blackjack only if player doesn't have one (as per typical casino flow)
        // This happens after player's turn or if dealer's upcard is Ace/10 (insurance phase, not implemented)
        // For now, we'll check dealer BJ more explicitly when it's their turn or at showdown.
        // However, if dealer's up card + hidden card could be BJ, game might offer insurance (not implemented)
        // Or game might end immediately if dealer shows BJ.
        // Let's simplify: if dealer's first two cards are BJ after player plays or has no BJ
        if (calculateHandValue(dealerHand) === 21 && dealerHand.length === 2 && playerValue !== 21) {
            renderHands(true);
            updateScores();
            setMessage("Dealer Blackjack! You lose.");
            endRound();
            return true;
        }
        return false;
    }

    function checkBust(handType) {
        const handToCheck = handType === 'player' ? playerHand : dealerHand;
        const value = calculateHandValue(handToCheck);
        if (value > 21) {
            renderHands(true); // Reveal dealer card on any bust
            updateScores();
            if (handType === 'player') {
                setMessage(`Bust! (${value}) You lose.`);
            } else {
                setMessage(`Dealer Busts! (${value}) You win!`);
                playerBank += currentBet * 2;
            }
            endRound();
            return true;
        }
        return false;
    }

    function dealerPlay() {
        playerTurn = false;
        hitButton.disabled = true; // Ensure buttons are disabled
        standButton.disabled = true;
        doubleDownButton.disabled = true;

        renderHands(true); // Reveal dealer's hole card
        updateScores();    // Update score with revealed card

        if (checkBust('player')) return; // Player might have busted just before standing

        let dealerScore = calculateHandValue(dealerHand);

        // If dealer had Blackjack from the start (e.g. player didn't have BJ but dealer did)
        if (dealerScore === 21 && dealerHand.length === 2) {
            setMessage("Dealer Blackjack! You lose."); // Or push if player also had 21 (handled by checkBlackjack earlier)
            // determineWinner will formalize, but this message is more direct.
            // No, checkBlackjack should handle this. If we are here, player didn't have BJ or dealer didn't have initial BJ.
            // So if dealer has 21 now, it's either natural or after hits.
        }
        
        const playInterval = setInterval(() => {
            dealerScore = calculateHandValue(dealerHand);
            if (dealerScore < 17) {
                setMessage("Dealer hits...", true, 1000);
                dealCard(dealerHand);
                renderHands(true); // Keep revealing
                updateScores();
                if (checkBust('dealer')) {
                    clearInterval(playInterval);
                    return; // endRound is called by checkBust
                }
            } else {
                clearInterval(playInterval);
                determineWinner();
            }
        }, 1200);
    }

    function determineWinner() {
        renderHands(true); // Ensure dealer's hand is fully visible
        updateScores();    // And scores are up to date

        const playerValue = calculateHandValue(playerHand);
        const dealerValue = calculateHandValue(dealerHand);

        // Busts should have been caught earlier and ended the round.
        // This is a final check or for non-bust scenarios.
        if (playerValue > 21) {
            //setMessage(`You Busted (${playerValue})! Dealer wins.`); // Already handled by checkBust
        } else if (dealerValue > 21) {
            //setMessage(`Dealer Busted (${dealerValue})! You win!`); // Already handled by checkBust
            // playerBank += currentBet * 2; // This should have happened in checkBust
        } else if (playerValue > dealerValue) {
            setMessage(`You win! (${playerValue} vs ${dealerValue})`);
            playerBank += currentBet * 2;
        } else if (dealerValue > playerValue) {
            setMessage(`Dealer wins! (${dealerValue} vs ${playerValue})`);
        } else { // playerValue === dealerValue
            setMessage(`Push! (${playerValue})`);
            playerBank += currentBet; // Return bet
        }
        endRound();
    }

    function startRound() {
        if (currentBet <= 0) {
            setMessage("Please place a bet first.", true);
            return;
        }
        if (currentBet > playerBank) {
            setMessage("Bet exceeds bank. Lower your bet.", true);
            return;
        }

        gameInProgress = true;
        playerTurn = true;
        playerHand = [];
        dealerHand = [];
        
        createDeck();
        shuffleDeck();

        playerBank -= currentBet;
        updateBankDisplay();
        setMessage("Dealing cards...", true, 1000);

        // Deal initial cards: P1, D1(up), P2, D2(down)
        dealCard(playerHand); // Player card 1
        dealCard(dealerHand); // Dealer card 1 (up)
        dealCard(playerHand); // Player card 2
        dealCard(dealerHand); // Dealer card 2 (hole card)

        renderHands(false); // Render with dealer's hole card hidden
        updateScores();     // Update scores based on this state

        if (!checkBlackjack()) { // checkBlackjack will reveal cards if BJ occurs
             setMessage("Your turn. Hit or Stand?");
        }
        updateGameControls();
    }

    function endRound() {
        gameInProgress = false;
        playerTurn = false;
        updateBankDisplay();
        updateGameControls();

        if (playerBank <= 0 && currentBet === 0) { // Make sure bet is processed before declaring game over
            setMessage("Game Over! You're out of money. Refresh to play again.");
            dealButton.disabled = true;
            chipButtons.forEach(b => b.disabled = true);
            betAmountInput.disabled = true;
            newRoundButton.disabled = true; // Can't start new round if broke
        }
    }
    
    function resetForNewRound() {
        playerHand = [];
        dealerHand = [];
        currentBet = 0; 
        updateBetDisplay();
        dealerHandDisplay.innerHTML = '';
        playerHandDisplay.innerHTML = '';
        dealerScoreDisplay.textContent = '0';
        playerScoreDisplay.textContent = '0';
        setMessage("Place your bet for the next round.");
        gameInProgress = false;
        updateGameControls();
        newRoundButton.disabled = false; // Re-enable if it was disabled by game over
         if (playerBank <= 0) {
             initializeGame(); // Effectively a reset with new bank if player was broke.
         }
    }

    function updateGameControls() {
        const canBet = playerBank > 0;
        dealButton.disabled = !canBet || currentBet <= 0 || currentBet > playerBank || gameInProgress;
        chipButtons.forEach(b => b.disabled = !canBet || gameInProgress);
        betAmountInput.disabled = !canBet || gameInProgress;
        clearBetButton.disabled = !canBet || gameInProgress || currentBet === 0;


        if (!gameInProgress && canBet) { // Betting phase
            bettingControls.style.display = 'flex';
            gameActions.style.display = 'none';
            postRoundControls.style.display = 'none';
        } else if (gameInProgress && playerTurn) { // Player's turn
            bettingControls.style.display = 'none';
            gameActions.style.display = 'flex';
            postRoundControls.style.display = 'none';
            
            hitButton.disabled = false;
            standButton.disabled = false;
            doubleDownButton.disabled = !(playerHand.length === 2 && playerBank >= currentBet);
            splitButton.disabled = true; // Keeping split disabled as per original
            // splitButton.disabled = !(playerHand.length === 2 && playerHand[0].rank === playerHand[1].rank && playerBank >= currentBet);
        } else if (!gameInProgress && canBet) { // Round ended, option for new round
             bettingControls.style.display = 'none'; 
             gameActions.style.display = 'none';
             postRoundControls.style.display = 'flex';
        } else if (!canBet) { // Game Over
            bettingControls.style.display = 'flex'; // Show betting but elements will be disabled
            gameActions.style.display = 'none';
            postRoundControls.style.display = 'none'; // Or show a "Restart Game" button here
        } else { // Dealer's turn or other intermediate states
            bettingControls.style.display = 'none';
            gameActions.style.display = 'none';
            postRoundControls.style.display = 'flex'; 
            hitButton.disabled = true;
            standButton.disabled = true;
            doubleDownButton.disabled = true;
        }
    }


    // --- Event Listeners ---
    chipButtons.forEach(button => {
        button.addEventListener('click', () => {
            if (gameInProgress) return;
            const value = parseInt(button.dataset.value);
            if (currentBet + value > playerBank) {
                setMessage("Cannot bet more than your bank.", true, 1500);
                return;
            }
            currentBet += value;
            updateBetDisplay();
            updateGameControls();
        });
    });

    betAmountInput.addEventListener('input', () => {
        if (gameInProgress) return;
        let value = parseInt(betAmountInput.value);
        if (isNaN(value) || value < 0) value = 0;
        
        if (value > playerBank) {
            setMessage("Cannot bet more than your bank.", true, 1500);
            value = playerBank;
            betAmountInput.value = value; // Correct input if over bank
        }
        currentBet = value;
        // updateBetDisplay(); // currentBetDisplay updates via its own variable, input needs to reflect `currentBet`
        currentBetDisplay.textContent = currentBet; // Keep this direct update
        updateGameControls();
    });
    
    clearBetButton.addEventListener('click', () => {
        if (gameInProgress) return;
        currentBet = 0;
        updateBetDisplay();
        updateGameControls();
    });

    dealButton.addEventListener('click', () => {
        if (currentBet > 0 && currentBet <= playerBank) {
            startRound();
        } else if (currentBet <= 0) {
            setMessage("Please place a bet.", true);
        } else {
            setMessage("Bet exceeds bank. Lower your bet.", true);
        }
    });

    hitButton.addEventListener('click', () => {
        if (!gameInProgress || !playerTurn) return;
        dealCard(playerHand);
        renderHands(false); // Dealer card still hidden
        updateScores();

        if (!checkBust('player')) {
            if(calculateHandValue(playerHand) === 21) {
                setMessage("21! Standing automatically.", true, 1500);
                doubleDownButton.disabled = true; 
                standButton.click(); 
            } else {
                setMessage("Hit or Stand?", false);
            }
        }
        // Double down is only allowed on first two cards, so disable after a hit.
        doubleDownButton.disabled = true;
        updateGameControls(); 
    });

    standButton.addEventListener('click', () => {
        if (!gameInProgress || !playerTurn) return;
        playerTurn = false;
        setMessage("Dealer's turn...");
        updateGameControls(); 
        dealerPlay();
    });

    doubleDownButton.addEventListener('click', () => {
        if (!gameInProgress || !playerTurn || playerHand.length !== 2 || playerBank < currentBet) return;
        
        playerBank -= currentBet; 
        currentBet *= 2;
        updateBankDisplay();
        updateBetDisplay(); 
        
        setMessage("Doubled Down! One more card.", true, 2000);
        dealCard(playerHand);
        renderHands(false); // Dealer card still hidden during player's double down card draw
        updateScores();
        
        playerTurn = false; // Turn ends after double down card
        updateGameControls(); 

        if (!checkBust('player')) {
            setTimeout(() => {
                dealerPlay();
            }, 1000); // Give time to see card then dealer plays
        }
        // If busted, checkBust already called endRound and updated controls.
    });

    splitButton.addEventListener('click', () => {
        setMessage("Split functionality is not implemented in this version.", true, 3000);
        splitButton.disabled = true;
    });

    newRoundButton.addEventListener('click', () => {
        resetForNewRound();
    });

    // --- Initial Setup ---
    function initializeGame() {
        updateBankDisplay();
        updateBetDisplay();
        setMessage("Welcome to Blackjack Royale! Place your bet.");
        updateGameControls(); 
        if (playerBank <= 0) {
            setMessage("Game Over! Refresh or click 'Next Round' for a fresh start (if bank allows).");
             // If truly game over, playerBank should be reset to starting value
             // For now, we'll rely on refresh or make 'Next Round' reset bank if at 0.
            playerBank = 1000; // Allow reset for demo purposes if bank is 0
            updateBankDisplay();
            updateGameControls(); // Update controls again after bank reset
        }
    }

    initializeGame();
});