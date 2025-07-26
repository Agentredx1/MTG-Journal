from flask import Flask, render_template, request, redirect, session, url_for, jsonify
from queries import get_player_win_rates, get_player_win_rates_filtered, get_commander_stats, get_commander_stats_filtered, get_player_detail_stats, get_player_commanders, get_player_color_stats, get_overall_color_stats, get_longest_win_streak, get_top_win_rate, get_recent_commanders, to_kebab_case, get_group_by_passkey, insert_game_with_group, insert_player_with_game, update_game_winner, get_commander_suggestions, sanitize_input
from functools import wraps
import sqlite3
import os
import html
import re
import csv
import io
from werkzeug.utils import secure_filename

# Try to import flask-cors, fallback gracefully if not available
try:
    from flask_cors import CORS
    CORS_AVAILABLE = True
except ImportError:
    CORS_AVAILABLE = False
    print("Warning: flask-cors not installed. CORS support disabled.")

# Import API blueprint
from api import api

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'your-secret-key') # This signs the sessions but really doesn't matter atm

# Enable CORS if available
if CORS_AVAILABLE:
    CORS(app, supports_credentials=True, origins=['http://localhost:5173', 'http://127.0.0.1:5173'])

# Register API blueprint
app.register_blueprint(api)

def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'logged_in' not in session or 'group_id' not in session:
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

def get_current_group_id():
    """Helper function to get the current user's group ID from session"""
    return session.get('group_id')

# Login routes
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        passkey = request.form['passkey']
        group = get_group_by_passkey(passkey)
        
        if group:
            session['logged_in'] = True
            session['group_id'] = group['id']
            session['group_name'] = group['group_name']
            return redirect(url_for('index'))
        else:
            return render_template('login.html.j2', error='Invalid passkey')
    return render_template('login.html.j2')

@app.route('/logout')
def logout():
    session.pop('logged_in', None)
    session.pop('group_id', None)
    session.pop('group_name', None)
    return redirect(url_for('login'))

# Home page
@app.route("/")
@login_required
def index():
    group_id = get_current_group_id()
    king = get_top_win_rate(group_id=group_id)
    king_imgs = get_recent_commanders(king["player_name"], group_id=group_id) if king else []
    villains_raw = get_longest_win_streak(group_id=group_id)
    villains = []
    for v in villains_raw:
        commanders = []
        for c in v["commanders"][:3]:  # limit to 3
            if c:  # skip empty
                commanders.append({
                    "name": c["name"],  # Extract the name from the commander object
                    "img": f"/static/assets/commanders/{to_kebab_case(c['name'])}.jpg"
                })
        villains.append({
            "player_name": v["player_name"],
            "streak_count": v["streak_count"],
            "commanders": commanders
        })
    return render_template(
        "index.html.j2",
        king=king,
        king_imgs=king_imgs,
        villains=villains
    )

# Add Game Form
@app.route("/add-game-form")
@login_required
def add_game_form():
    return render_template("/add_game.html.j2")

# Add Game to SQL DB, form submit
@app.route("/add-game", methods=["POST"])
@login_required
def add_game():
    group_id = get_current_group_id()
    
    # Sanitize input data
    date = sanitize_input(request.form["date"])
    num_players = int(request.form["numPlayers"])
    turns = sanitize_input(request.form.get("turns"))
    win_con = sanitize_input(request.form.get("winCon"))
    winner_name = sanitize_input(request.form.get("winnerName"))

    player_names = [sanitize_input(name) for name in request.form.getlist("playerName[]")]
    commander_names = [sanitize_input(name) for name in request.form.getlist("commanderName[]")]
    turn_orders = request.form.getlist("turnOrder[]")

    # Validate required fields
    if not date or not player_names or len(player_names) != num_players:
        return redirect("/add-game-form?error=invalid_data")

    # Insert Game with group association
    game_id = insert_game_with_group(date, num_players, turns, win_con, group_id)

    winner_id = None
    for i, name in enumerate(player_names):
        commander_name = commander_names[i] if i < len(commander_names) else ""
        turn_order = turn_orders[i] if i < len(turn_orders) and turn_orders[i] else None
        
        pid = insert_player_with_game(game_id, name, commander_name, group_id, turn_order)
        if name == winner_name:
            winner_id = pid

    if winner_id:
        update_game_winner(game_id, winner_id)

    return redirect("/add-game-form")

@app.route("/api/commander-suggestions")
@login_required
def commander_suggestions():
    """API endpoint for commander name auto-suggestions"""
    query = sanitize_input(request.args.get('q', ''))
    group_id = get_current_group_id()
    
    if len(query) < 2:
        return jsonify([])
    
    suggestions = get_commander_suggestions(query, group_id, limit=8)
    return jsonify(suggestions)

def process_csv_games(csv_content, group_id):
    """Process CSV content and insert games into database"""
    games_processed = 0
    errors = []
    
    try:
        # Parse CSV content
        csv_reader = csv.DictReader(io.StringIO(csv_content))
        
        required_columns = ['Date', 'NumPlayers', 'WinnerName', 'PlayerName']
        optional_columns = ['Turns', 'WinCon', 'CommanderName', 'TurnOrder']
        
        # Validate headers
        if not all(col in csv_reader.fieldnames for col in required_columns):
            missing = [col for col in required_columns if col not in csv_reader.fieldnames]
            return 0, [f"Missing required columns: {', '.join(missing)}"]
        
        # Group rows by game (same date, num_players, winner)
        games = {}
        for row_num, row in enumerate(csv_reader, start=2):  # Start at 2 for header
            try:
                # Sanitize input
                date = sanitize_input(row['Date'].strip())
                num_players = int(row['NumPlayers'].strip())
                winner_name = sanitize_input(row['WinnerName'].strip())
                player_name = sanitize_input(row['PlayerName'].strip())
                
                # Optional fields
                turns = sanitize_input(row.get('Turns', '').strip()) or None
                win_con = sanitize_input(row.get('WinCon', '').strip()) or 'Combat'
                commander_name = sanitize_input(row.get('CommanderName', '').strip())
                turn_order = row.get('TurnOrder', '').strip()
                turn_order = int(turn_order) if turn_order else None
                
                # Validate win condition
                valid_win_cons = ['Combat', 'Combo', 'Commander Damage', 'Ping/Burn', 'Scoops']
                if win_con not in valid_win_cons:
                    win_con = 'Combat'
                
                # Create game key
                game_key = (date, num_players, winner_name, turns, win_con)
                
                if game_key not in games:
                    games[game_key] = []
                
                games[game_key].append({
                    'player_name': player_name,
                    'commander_name': commander_name,
                    'turn_order': turn_order
                })
                
            except (ValueError, KeyError) as e:
                errors.append(f"Row {row_num}: {str(e)}")
                continue
        
        # Insert games into database
        for (date, num_players, winner_name, turns, win_con), players in games.items():
            try:
                # Validate number of players matches actual players
                if len(players) != num_players:
                    errors.append(f"Game on {date}: Expected {num_players} players, found {len(players)}")
                    continue
                
                # Insert game
                game_id = insert_game_with_group(date, num_players, turns, win_con, group_id)
                
                # Insert players
                winner_id = None
                for player in players:
                    pid = insert_player_with_game(
                        game_id, 
                        player['player_name'], 
                        player['commander_name'], 
                        group_id,
                        player['turn_order']
                    )
                    
                    if player['player_name'] == winner_name:
                        winner_id = pid
                
                # Update winner
                if winner_id:
                    update_game_winner(game_id, winner_id)
                else:
                    errors.append(f"Game on {date}: Winner '{winner_name}' not found in player list")
                
                games_processed += 1
                
            except Exception as e:
                errors.append(f"Game on {date}: {str(e)}")
                continue
        
        return games_processed, errors
        
    except Exception as e:
        return 0, [f"CSV parsing error: {str(e)}"]

@app.route("/upload-csv", methods=["POST"])
@login_required
def upload_csv():
    """Handle CSV file upload and processing"""
    group_id = get_current_group_id()
    
    if 'csvFile' not in request.files:
        return redirect("/add-game-form?error=no_file")
    
    file = request.files['csvFile']
    if file.filename == '':
        return redirect("/add-game-form?error=no_file")
    
    if not file.filename.lower().endswith('.csv'):
        return redirect("/add-game-form?error=invalid_file_type")
    
    try:
        # Read and decode file content
        csv_content = file.read().decode('utf-8')
        
        # Process CSV
        games_processed, errors = process_csv_games(csv_content, group_id)
        
        # Prepare result message
        if games_processed > 0:
            success_msg = f"Successfully processed {games_processed} games"
            if errors:
                error_msg = " with some errors: " + "; ".join(errors[:5])  # Limit error display
                return redirect(f"/add-game-form?success={success_msg}&warnings={error_msg}")
            else:
                return redirect(f"/add-game-form?success={success_msg}")
        else:
            error_msg = "No games were processed. Errors: " + "; ".join(errors[:5])
            return redirect(f"/add-game-form?error={error_msg}")
            
    except Exception as e:
        return redirect(f"/add-game-form?error=Upload failed: {str(e)}")

@app.route("/stats")
@login_required
def stats():
    group_id = get_current_group_id()
    # PLAYER WIN RATE FILTER TOGGLE:
    # - Use get_player_win_rates_filtered() to show only players with wins > 0 (less clutter)
    # - Use get_player_win_rates() to show all players including those with 0 wins (complete data)
    # Change the function call below to toggle between filtered/unfiltered results
    player_stats = get_player_win_rates_filtered(group_id=group_id)  # FILTERED: Only players with wins
    # player_stats = get_player_win_rates(group_id=group_id)         # UNFILTERED: All players
    
    #commander_stats = get_commander_stats(group_id=group_id)
    commander_stats = get_commander_stats_filtered(group_id=group_id)
    color_stats = get_overall_color_stats(group_id=group_id)
    return render_template("stats.html.j2",
                           player_stats=player_stats,
                           commander_stats=commander_stats,
                           color_stats=color_stats)

@app.route('/player/<player_name>')
@login_required
def player_detail(player_name):
    group_id = get_current_group_id()
    stats = get_player_detail_stats(player_name, group_id=group_id)
    commanders = get_player_commanders(player_name, group_id=group_id)
    color_stats = get_player_color_stats(player_name, group_id=group_id)
    if stats is None:
        # handle case where player not found
        return f"No stats found for {player_name}", 404
    return render_template(
        'player_detail.html.j2',
        player_name=player_name,
        stats=stats,
        commanders=commanders,
        color_stats=color_stats
    )
