let playerCount = 0;
function addPlayer() {
    playerCount++;
    const container = document.getElementById('playersContainer');
    const div = document.createElement('div');
    div.className = 'player-block';
    div.innerHTML = `
    <h3 class="player-title">Player ${playerCount}</h3>
    <label class="form-label">Name:<br>
        <input type="text" name="playerName[]" required class="input">
    </label><br>
    <label class="form-label">Commander:<br>
        <input type="text" name="commanderName[]" class="input">
    </label><br>
    <label class="form-label">Turn Order:<br>
        <input type="number" name="turnOrder[]" min="1" class="input">
    </label><br>
    `;
    container.appendChild(div);
}