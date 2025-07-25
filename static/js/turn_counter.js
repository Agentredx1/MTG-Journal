// Turn Counter Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const turnCounterToggle = document.getElementById('turnCounterToggle');
    const turnCounterOverlay = document.getElementById('turnCounterOverlay');
    const turnCounterClose = document.getElementById('turnCounterClose');
    const turnCounterDisplay = document.getElementById('turnCounterDisplay');
    const turnCounterIncrement = document.getElementById('turnCounterIncrement');
    const turnCounterDecrement = document.getElementById('turnCounterDecrement');
    const turnCounterReset = document.getElementById('turnCounterReset');
    const turnCounterSave = document.getElementById('turnCounterSave');
    const turnsInput = document.getElementById('turnsInput');
    
    // State
    let currentTurn = 1;
    let isCounterActive = false;
    let playerLifeTotals = {
        1: 40,
        2: 40,
        3: 40,
        4: 40
    };
    
    // Initialize turn counter from form input if it has a value
    if (turnsInput && turnsInput.value) {
        currentTurn = parseInt(turnsInput.value) || 1;
        updateDisplay();
    }
    
    // Toggle turn counter overlay
    if (turnCounterToggle) {
        turnCounterToggle.addEventListener('click', function() {
            openTurnCounter();
        });
    }
    
    // Close turn counter
    if (turnCounterClose) {
        turnCounterClose.addEventListener('click', function() {
            closeTurnCounter();
        });
    }
    
    // Close on overlay click (outside modal)
    if (turnCounterOverlay) {
        turnCounterOverlay.addEventListener('click', function(e) {
            if (e.target === turnCounterOverlay) {
                closeTurnCounter();
            }
        });
    }
    
    // Increment turn
    if (turnCounterIncrement) {
        turnCounterIncrement.addEventListener('click', function() {
            incrementTurn();
        });
        
        // Add touch event for better mobile response
        turnCounterIncrement.addEventListener('touchstart', function(e) {
            e.preventDefault();
            incrementTurn();
        });
    }
    
    // Decrement turn
    if (turnCounterDecrement) {
        turnCounterDecrement.addEventListener('click', function() {
            decrementTurn();
        });
        
        // Add touch event for better mobile response
        turnCounterDecrement.addEventListener('touchstart', function(e) {
            e.preventDefault();
            decrementTurn();
        });
    }
    
    // Reset turn counter
    if (turnCounterReset) {
        turnCounterReset.addEventListener('click', function() {
            resetTurn();
        });
    }
    
    // Save and close
    if (turnCounterSave) {
        turnCounterSave.addEventListener('click', function() {
            saveAndClose();
        });
    }
    
    // Keyboard shortcuts (when overlay is open)
    document.addEventListener('keydown', function(e) {
        if (!isCounterActive) return;
        
        switch(e.key) {
            case 'ArrowUp':
            case '+':
            case '=':
                e.preventDefault();
                incrementTurn();
                break;
            case 'ArrowDown':
            case '-':
                e.preventDefault();
                decrementTurn();
                break;
            case 'r':
            case 'R':
                e.preventDefault();
                resetTurn();
                break;
            case 'Escape':
                e.preventDefault();
                closeTurnCounter();
                break;
            case 'Enter':
                e.preventDefault();
                saveAndClose();
                break;
        }
    });
    
    // Prevent body scroll when overlay is open
    function preventScroll(e) {
        e.preventDefault();
    }
    
    function openTurnCounter() {
        isCounterActive = true;
        turnCounterOverlay.classList.add('turn-counter-overlay--active');
        document.body.style.overflow = 'hidden';
        
        // Add scroll prevention for mobile
        document.addEventListener('touchmove', preventScroll, { passive: false });
        
        // Update button state
        turnCounterToggle.classList.add('turn-counter-btn--active');
        
        // Focus on increment button for better UX
        setTimeout(() => {
            turnCounterIncrement.focus();
        }, 100);
        
        // Haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }
    
    function closeTurnCounter() {
        isCounterActive = false;
        turnCounterOverlay.classList.remove('turn-counter-overlay--active');
        document.body.style.overflow = '';
        
        // Remove scroll prevention
        document.removeEventListener('touchmove', preventScroll);
        
        // Update button state
        turnCounterToggle.classList.remove('turn-counter-btn--active');
    }
    
    function incrementTurn() {
        currentTurn++;
        updateDisplay();
        animateButton(turnCounterIncrement, 'increment');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
    
    function decrementTurn() {
        if (currentTurn > 1) {
            currentTurn--;
            updateDisplay();
            animateButton(turnCounterDecrement, 'decrement');
            
            // Haptic feedback
            if (navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
    }
    
    function resetTurn() {
        currentTurn = 1;
        updateDisplay();
        animateDisplay('reset');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }
    
    function saveAndClose() {
        if (turnsInput) {
            turnsInput.value = currentTurn;
            
            // Trigger change event for any listeners
            const event = new Event('change', { bubbles: true });
            turnsInput.dispatchEvent(event);
        }
        
        // Save life tracking data to hidden inputs
        saveLifeTrackingData();
        
        closeTurnCounter();
        
        // Show brief success indication
        showSaveConfirmation();
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(100);
        }
    }
    
    function updateDisplay() {
        if (turnCounterDisplay) {
            turnCounterDisplay.textContent = currentTurn;
        }
        
        // Update button states
        if (turnCounterDecrement) {
            turnCounterDecrement.disabled = currentTurn <= 1;
            turnCounterDecrement.classList.toggle('turn-counter-btn--disabled', currentTurn <= 1);
        }
    }
    
    function animateButton(button, type) {
        const className = `turn-counter-btn--${type}-active`;
        button.classList.add(className);
        
        setTimeout(() => {
            button.classList.remove(className);
        }, 150);
    }
    
    function animateDisplay(type) {
        const className = `turn-counter-number--${type}`;
        turnCounterDisplay.classList.add(className);
        
        setTimeout(() => {
            turnCounterDisplay.classList.remove(className);
        }, 300);
    }
    
    function showSaveConfirmation() {
        const originalText = turnCounterToggle.querySelector('.turn-counter-text').textContent;
        const textElement = turnCounterToggle.querySelector('.turn-counter-text');
        
        textElement.textContent = 'Saved!';
        turnCounterToggle.classList.add('turn-counter-btn--saved');
        
        setTimeout(() => {
            textElement.textContent = originalText;
            turnCounterToggle.classList.remove('turn-counter-btn--saved');
        }, 2000);
    }
    
    // Life Counter Elements and Event Listeners
    const lifeCounterReset = document.getElementById('lifeCounterReset');
    const lifeCounterButtons = document.querySelectorAll('.life-counter-btn');
    
    // Life counter button event listeners
    lifeCounterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const player = parseInt(this.dataset.player);
            const action = this.dataset.action;
            
            if (action === 'increment') {
                incrementLife(player);
            } else if (action === 'decrement') {
                decrementLife(player);
            }
        });
        
        // Add touch events for better mobile response
        button.addEventListener('touchstart', function(e) {
            e.preventDefault();
            const player = parseInt(this.dataset.player);
            const action = this.dataset.action;
            
            if (action === 'increment') {
                incrementLife(player);
            } else if (action === 'decrement') {
                decrementLife(player);
            }
        });
    });
    
    // Life counter reset
    if (lifeCounterReset) {
        lifeCounterReset.addEventListener('click', function() {
            resetLife();
        });
    }
    
    // Life Counter Functions
    function incrementLife(player) {
        playerLifeTotals[player]++;
        updateLifeDisplay(player);
        animateLifeButton(player, 'increment');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
    
    function decrementLife(player) {
        playerLifeTotals[player]--;
        updateLifeDisplay(player);
        animateLifeButton(player, 'decrement');
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate(30);
        }
    }
    
    function resetLife() {
        playerLifeTotals = {
            1: 40,
            2: 40,
            3: 40,
            4: 40
        };
        
        updateAllLifeDisplays();
        
        // Haptic feedback
        if (navigator.vibrate) {
            navigator.vibrate([50, 50, 50]);
        }
    }
    
    function updateLifeDisplay(player) {
        const lifeElement = document.getElementById(`player${player}Life`);
        const playerElement = document.querySelector(`.life-counter-player[data-player="${player}"]`);
        
        if (lifeElement && playerElement) {
            const life = playerLifeTotals[player];
            lifeElement.textContent = life;
            
            // Update styling based on life total
            lifeElement.classList.remove('life-counter-player-life--low', 'life-counter-player-life--dead');
            playerElement.classList.remove('life-counter-player--dead');
            
            if (life <= 0) {
                lifeElement.classList.add('life-counter-player-life--dead');
                playerElement.classList.add('life-counter-player--dead');
            } else if (life <= 10) {
                lifeElement.classList.add('life-counter-player-life--low');
            }
        }
        
        // Update the hidden form inputs in real-time
        const input = document.getElementById(`player${player}FinalLife`);
        if (input) {
            input.value = playerLifeTotals[player];
        }
    }
    
    function updateAllLifeDisplays() {
        for (let player = 1; player <= 4; player++) {
            updateLifeDisplay(player);
        }
    }
    
    function animateLifeButton(player, action) {
        const button = document.querySelector(`.life-counter-btn[data-player="${player}"][data-action="${action}"]`);
        if (button) {
            const className = `life-counter-btn--${action}-active`;
            button.classList.add(className);
            
            setTimeout(() => {
                button.classList.remove(className);
            }, 150);
        }
    }
    
    function getLifeTrackingData() {
        return {
            finalLifeTotals: { ...playerLifeTotals },
            gameCompleted: Object.values(playerLifeTotals).filter(life => life <= 0).length >= 3
        };
    }
    
    function saveLifeTrackingData() {
        // Save individual life totals to hidden inputs
        for (let player = 1; player <= 4; player++) {
            const input = document.getElementById(`player${player}FinalLife`);
            if (input) {
                input.value = playerLifeTotals[player];
            }
        }
        
        // Save complete life tracking data as JSON
        const lifeDataInput = document.getElementById('lifeTrackingData');
        if (lifeDataInput) {
            lifeDataInput.value = JSON.stringify(getLifeTrackingData());
        }
    }
    
    // Initialize displays
    updateDisplay();
    updateAllLifeDisplays();
});