let playerCount = 0;

function addPlayer() {
    playerCount++;
    const container = document.getElementById('playersContainer');
    const div = document.createElement('div');
    div.className = 'player-block';
    div.innerHTML = `
        <h3 class="player-title">Player ${playerCount}</h3>
        <div class="form__group">
            <label class="form__label">
                Name:
                <input type="text" name="playerName[]" required class="form__input">
            </label>
        </div>
        <div class="form__group">
            <label class="form__label">
                Commander:
                <div class="autocomplete-container">
                    <input type="text" name="commanderName[]" class="form__input commander-input" placeholder="Start typing commander name..."  autocomplete="off">
                    <div class="autocomplete-suggestions"></div>
                </div>
            </label>
        </div>
        <div class="form__group">
            <label class="form__label">
                Turn Order:
                <input type="number" name="turnOrder[]" min="1" class="form__input">
            </label>
        </div>
    `;
    container.appendChild(div);
    
    // Initialize autocomplete for the new commander input
    const commanderInput = div.querySelector('.commander-input');
    initCommanderAutocomplete(commanderInput);
}

function initCommanderAutocomplete(input) {
    let currentTimeout = null;
    let currentSelection = -1;
    const suggestionsContainer = input.parentElement.querySelector('.autocomplete-suggestions');
    
    input.addEventListener('input', function() {
        const query = this.value.trim();
        
        // Clear previous timeout
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }
        
        // Clear suggestions if query is too short
        if (query.length < 2) {
            suggestionsContainer.innerHTML = '';
            suggestionsContainer.style.display = 'none';
            return;
        }
        
        // Debounce the API call
        currentTimeout = setTimeout(() => {
            fetchCommanderSuggestions(query, suggestionsContainer, input);
        }, 300);
    });
    
    // Handle keyboard navigation
    input.addEventListener('keydown', function(e) {
        const suggestions = suggestionsContainer.querySelectorAll('.suggestion-item');
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            currentSelection = Math.min(currentSelection + 1, suggestions.length - 1);
            updateSelection(suggestions);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            currentSelection = Math.max(currentSelection - 1, -1);
            updateSelection(suggestions);
        } else if (e.key === 'Enter' && currentSelection >= 0) {
            e.preventDefault();
            suggestions[currentSelection].click();
        } else if (e.key === 'Escape') {
            suggestionsContainer.style.display = 'none';
            currentSelection = -1;
        }
    });
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestionsContainer.contains(e.target)) {
            suggestionsContainer.style.display = 'none';
            currentSelection = -1;
        }
    });
}

function fetchCommanderSuggestions(query, container, input) {
    fetch(`/api/commander-suggestions?q=${encodeURIComponent(query)}`)
        .then(response => response.json())
        .then(suggestions => {
            displaySuggestions(suggestions, container, input);
        })
        .catch(error => {
            console.error('Error fetching suggestions:', error);
            container.innerHTML = '';
            container.style.display = 'none';
        });
}

function displaySuggestions(suggestions, container, input) {
    container.innerHTML = '';
    
    if (suggestions.length === 0) {
        container.style.display = 'none';
        return;
    }
    
    suggestions.forEach((suggestion, index) => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = suggestion;
        div.addEventListener('click', function() {
            input.value = suggestion;
            container.style.display = 'none';
        });
        container.appendChild(div);
    });
    
    container.style.display = 'block';
}

function updateSelection(suggestions) {
    suggestions.forEach((item, index) => {
        item.classList.toggle('selected', index === currentSelection);
    });
}