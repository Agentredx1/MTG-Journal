from flask import Blueprint, request, jsonify, session
from functools import wraps
from queries import (
    get_group_by_passkey, get_group_by_id, get_player_win_rates_filtered,
    get_commander_stats_filtered, get_overall_color_stats, get_top_win_rate,
    get_longest_win_streak, get_recent_commanders, get_player_detail_stats,
    get_player_commanders, get_player_color_stats, get_commander_suggestions,
    insert_game_with_group, insert_player_with_game, update_game_winner,
    to_kebab_case, sanitize_input
)
import traceback

# Create API blueprint
api = Blueprint('api', __name__, url_prefix='/api/v1')

# DEVELOPMENT MODE: Default group ID (comment out for production)
DEVELOPMENT_MODE = True
DEFAULT_GROUP_ID = 1

def api_login_required(f):
    """Decorator for API endpoints that require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        # DEVELOPMENT MODE: Skip authentication and use default group
        if DEVELOPMENT_MODE:
            session['logged_in'] = True
            session['group_id'] = DEFAULT_GROUP_ID
            session['group_name'] = 'Default Group'
            return f(*args, **kwargs)
        
        # Production authentication (commented out for development)
        if 'logged_in' not in session or 'group_id' not in session:
            return jsonify({'error': 'Authentication required', 'code': 'AUTH_REQUIRED'}), 401
        return f(*args, **kwargs)
    return decorated_function

def get_current_group_id():
    """Helper function to get the current user's group ID from session"""
    # DEVELOPMENT MODE: Always return default group ID
    if DEVELOPMENT_MODE:
        return DEFAULT_GROUP_ID
    return session.get('group_id')

def error_response(message: str, code: str = 'ERROR', status_code: int = 400):
    """Helper function to create consistent error responses"""
    return jsonify({'error': message, 'code': code}), status_code

def success_response(data=None, message: str = 'Success'):
    """Helper function to create consistent success responses"""
    response = {'success': True, 'message': message}
    if data is not None:
        response['data'] = data
    return jsonify(response)

# Authentication endpoints
@api.route('/auth/login', methods=['POST'])
def login():
    """Authenticate user with group passkey"""
    try:
        data = request.get_json()
        if not data or 'passkey' not in data:
            return error_response('Passkey is required', 'MISSING_PASSKEY')
        
        passkey = data['passkey'].strip()
        if not passkey:
            return error_response('Passkey cannot be empty', 'EMPTY_PASSKEY')
        
        group = get_group_by_passkey(passkey)
        if not group:
            return error_response('Invalid passkey', 'INVALID_PASSKEY', 401)
        
        # Set session data
        session['logged_in'] = True
        session['group_id'] = group['id']
        session['group_name'] = group['group_name']
        
        return success_response({
            'group_id': group['id'],
            'group_name': group['group_name']
        }, 'Login successful')
        
    except Exception as e:
        return error_response(f'Login failed: {str(e)}', 'LOGIN_ERROR', 500)

@api.route('/auth/logout', methods=['POST'])
def logout():
    """Logout user and clear session"""
    try:
        session.pop('logged_in', None)
        session.pop('group_id', None)
        session.pop('group_name', None)
        return success_response(message='Logout successful')
    except Exception as e:
        return error_response(f'Logout failed: {str(e)}', 'LOGOUT_ERROR', 500)

@api.route('/auth/status', methods=['GET'])
def auth_status():
    """Check current authentication status"""
    try:
        if 'logged_in' in session and 'group_id' in session:
            group = get_group_by_id(session['group_id'])
            if group:
                return success_response({
                    'authenticated': True,
                    'group_id': group['id'],
                    'group_name': group['group_name']
                })
        
        return success_response({
            'authenticated': False
        })
    except Exception as e:
        return error_response(f'Status check failed: {str(e)}', 'STATUS_ERROR', 500)

# Dashboard/Home endpoints
@api.route('/dashboard', methods=['GET'])
@api_login_required
def dashboard():
    """Get dashboard data with top players and win streaks"""
    try:
        group_id = get_current_group_id()
        
        # Get top player (king)
        king = get_top_win_rate(group_id=group_id)
        king_commanders = []
        if king:
            king_imgs = get_recent_commanders(king["name"], group_id=group_id)
            king_commanders = [
                {
                    "name": c["name"],
                    "img": f"/static/assets/commanders/{to_kebab_case(c['name'])}.jpg"
                }
                for c in king_imgs
            ]
        
        # Get win streak players (villains)
        villains_raw = get_longest_win_streak(group_id=group_id)
        villains = []
        for v in villains_raw:
            commanders = []
            for c in v["commanders"][:3]:  # limit to 3
                if c:  # skip empty
                    commanders.append({
                        "name": c["name"],
                        "img": f"/static/assets/commanders/{to_kebab_case(c['name'])}.jpg"
                    })
            villains.append({
                "player_name": v["player_name"],
                "streak_count": v["streak_count"],
                "commanders": commanders
            })
        
        return success_response({
            'king': king,
            'king_commanders': king_commanders,
            'villains': villains
        })
        
    except Exception as e:
        return error_response(f'Failed to load dashboard: {str(e)}', 'DASHBOARD_ERROR', 500)

# Statistics endpoints
@api.route('/stats', methods=['GET'])
@api_login_required
def stats():
    """Get comprehensive statistics for the group"""
    try:
        group_id = get_current_group_id()
        
        # Get player statistics
        player_stats_raw = get_player_win_rates_filtered(group_id=group_id)
        player_stats = [
            {
                'player_name': row[0],
                'games_played': row[1],
                'wins': row[2],
                'win_rate': row[3]
            }
            for row in player_stats_raw
        ]
        
        # Get commander statistics
        commander_stats = get_commander_stats_filtered(group_id=group_id)
        
        # Add image URLs to commanders
        for commander in commander_stats:
            commander['img'] = f"/static/assets/commanders/{to_kebab_case(commander['name'])}.jpg"
        
        # Get color statistics
        color_stats = get_overall_color_stats(group_id=group_id)
        
        return success_response({
            'player_stats': player_stats,
            'commander_stats': commander_stats,
            'color_stats': color_stats
        })
        
    except Exception as e:
        return error_response(f'Failed to load statistics: {str(e)}', 'STATS_ERROR', 500)

@api.route('/players/<player_name>', methods=['GET'])
@api_login_required
def player_detail(player_name):
    """Get detailed statistics for a specific player"""
    try:
        group_id = get_current_group_id()
        
        # Get player stats
        stats = get_player_detail_stats(player_name, group_id=group_id)
        if not stats:
            return error_response(f'Player "{player_name}" not found', 'PLAYER_NOT_FOUND', 404)
        
        # Get player commanders
        commanders_raw = get_player_commanders(player_name, group_id=group_id)
        commanders = []
        for commander in commanders_raw:
            commanders.append({
                'name': commander['name'],
                'games_played': commander['games_played'],
                'wins': commander['wins'],
                'win_rate': commander['win_rate'],
                'img': f"/static/assets/commanders/{to_kebab_case(commander['name'])}.jpg"
            })
        
        # Get color statistics
        color_stats = get_player_color_stats(player_name, group_id=group_id)
        
        return success_response({
            'player_name': player_name,
            'stats': stats,
            'commanders': commanders,
            'color_stats': color_stats
        })
        
    except Exception as e:
        return error_response(f'Failed to load player details: {str(e)}', 'PLAYER_DETAIL_ERROR', 500)

# Game management endpoints
@api.route('/games', methods=['POST'])
@api_login_required
def create_game():
    """Create a new game"""
    try:
        data = request.get_json()
        if not data:
            return error_response('Request body is required', 'MISSING_DATA')
        
        # Validate required fields
        required_fields = ['date', 'players']
        for field in required_fields:
            if field not in data:
                return error_response(f'Field "{field}" is required', 'MISSING_FIELD')
        
        group_id = get_current_group_id()
        
        # Sanitize input data
        date = sanitize_input(data['date'])
        players = data['players']
        num_players = len(players)
        turns = sanitize_input(data.get('turns', ''))
        win_con = sanitize_input(data.get('win_con', 'Combat'))
        winner_name = sanitize_input(data.get('winner_name', ''))
        
        # Validate players data
        if not players or num_players < 2:
            return error_response('At least 2 players are required', 'INSUFFICIENT_PLAYERS')
        
        # Validate winner is in player list
        player_names = [sanitize_input(p.get('name', '')) for p in players]
        if winner_name and winner_name not in player_names:
            return error_response('Winner must be one of the players', 'INVALID_WINNER')
        
        # Insert game
        game_id = insert_game_with_group(date, num_players, turns, win_con, group_id)
        
        # Insert players
        winner_id = None
        for player in players:
            player_name = sanitize_input(player.get('name', ''))
            commander_name = sanitize_input(player.get('commander', ''))
            turn_order = player.get('turn_order')
            
            if not player_name:
                continue
            
            pid = insert_player_with_game(game_id, player_name, commander_name, group_id, turn_order)
            if player_name == winner_name:
                winner_id = pid
        
        # Update winner
        if winner_id:
            update_game_winner(game_id, winner_id)
        
        return success_response({'game_id': game_id}, 'Game created successfully')
        
    except Exception as e:
        return error_response(f'Failed to create game: {str(e)}', 'GAME_CREATE_ERROR', 500)

# Commander suggestions endpoint
@api.route('/commanders/suggestions', methods=['GET'])
@api_login_required
def commander_suggestions():
    """Get commander name suggestions for autocomplete"""
    try:
        query = request.args.get('q', '').strip()
        group_id = get_current_group_id()
        
        if len(query) < 2:
            return success_response([])
        
        suggestions = get_commander_suggestions(sanitize_input(query), group_id, limit=8)
        return success_response(suggestions)
        
    except Exception as e:
        return error_response(f'Failed to get suggestions: {str(e)}', 'SUGGESTIONS_ERROR', 500)

# Health check endpoint
@api.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return success_response({'status': 'healthy'}, 'API is running')

# Error handlers
@api.errorhandler(404)
def not_found(error):
    return error_response('Endpoint not found', 'NOT_FOUND', 404)

@api.errorhandler(405)
def method_not_allowed(error):
    return error_response('Method not allowed', 'METHOD_NOT_ALLOWED', 405)

@api.errorhandler(500)
def internal_error(error):
    return error_response('Internal server error', 'INTERNAL_ERROR', 500)