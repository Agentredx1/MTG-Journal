# MTG Journal API Reference

This document describes the REST API endpoints for the MTG Journal application. All API endpoints are prefixed with `/api/v1`.

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication

The API uses session-based authentication. You must login with a group passkey before accessing protected endpoints.

### Session Management
- Cookies are used to maintain session state
- Include credentials in requests: `credentials: 'include'`
- Sessions persist until logout or server restart

## Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Success message",
  "data": {
    // Response data (optional)
  }
}
```

### Error Response
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Endpoints

### Authentication

#### POST /auth/login
Authenticate with group passkey.

**Request Body:**
```json
{
  "passkey": "your-group-passkey"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "group_id": 1,
    "group_name": "Wednesday Night Pod"
  }
}
```

**Errors:**
- 400: Missing or empty passkey
- 401: Invalid passkey

#### POST /auth/logout
Logout and clear session.

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### GET /auth/status
Check authentication status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "authenticated": true,
    "group_id": 1,
    "group_name": "Wednesday Night Pod"
  }
}
```

### Dashboard

#### GET /dashboard
Get dashboard data with top players and win streaks.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "king": {
      "player_name": "Alice",
      "win_rate": 75.5,
      "games_played": 12,
      "wins": 9
    },
    "king_commanders": [
      {
        "name": "Alesha, Who Smiles at Death",
        "img": "/static/assets/commanders/alesha-who-smiles-at-death.jpg"
      }
    ],
    "villains": [
      {
        "player_name": "Bob",
        "streak_count": 3,
        "commanders": [
          {
            "name": "Krenko, Mob Boss",
            "img": "/static/assets/commanders/krenko-mob-boss.jpg"
          }
        ]
      }
    ]
  }
}
```

### Statistics

#### GET /stats
Get comprehensive group statistics.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "player_stats": [
      {
        "player_name": "Alice",
        "games_played": 12,
        "wins": 9,
        "win_rate": 75.0
      }
    ],
    "commander_stats": [
      {
        "name": "Alesha, Who Smiles at Death",
        "games_played": 8,
        "wins": 6,
        "win_rate": 75.0,
        "img": "/static/assets/commanders/alesha-who-smiles-at-death.jpg"
      }
    ],
    "color_stats": [
      {
        "color": "Red",
        "count": 15,
        "percentage": 35.7
      }
    ]
  }
}
```

#### GET /players/{player_name}
Get detailed statistics for a specific player.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "player_name": "Alice",
    "stats": {
      "games_played": 12,
      "wins": 9,
      "win_rate": 75.0,
      "avg_turn_order": 2.1
    },
    "commanders": [
      {
        "name": "Alesha, Who Smiles at Death",
        "games_played": 8,
        "wins": 6,
        "win_rate": 75.0,
        "img": "/static/assets/commanders/alesha-who-smiles-at-death.jpg"
      }
    ],
    "color_stats": [
      {
        "color": "Red",
        "count": 8,
        "percentage": 66.7
      }
    ]
  }
}
```

**Errors:**
- 404: Player not found

### Games

#### POST /games
Create a new game.

**Request Body:**
```json
{
  "date": "2024-01-15",
  "players": [
    {
      "name": "Alice",
      "commander": "Alesha, Who Smiles at Death",
      "turn_order": 1
    },
    {
      "name": "Bob", 
      "commander": "Krenko, Mob Boss",
      "turn_order": 2
    }
  ],
  "winner_name": "Alice",
  "turns": "8",
  "win_con": "Combat"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Game created successfully",
  "data": {
    "game_id": 123
  }
}
```

**Errors:**
- 400: Missing required fields
- 400: Insufficient players (need at least 2)
- 400: Invalid winner (must be one of the players)

### Commander Suggestions

#### GET /commanders/suggestions?q={query}
Get commander name suggestions for autocomplete.

**Query Parameters:**
- `q`: Search query (minimum 2 characters)

**Response (200):**
```json
{
  "success": true,
  "data": [
    "Alesha, Who Smiles at Death",
    "Alesha, Who Laughs at Fate",
    "Alexander Clamilton"
  ]
}
```

### Utility

#### GET /health
Health check endpoint.

**Response (200):**
```json
{
  "success": true,
  "message": "API is running",
  "data": {
    "status": "healthy"
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `MISSING_PASSKEY` | Passkey field is required |
| `EMPTY_PASSKEY` | Passkey cannot be empty |
| `INVALID_PASSKEY` | Invalid passkey provided |
| `LOGIN_ERROR` | Login failed |
| `LOGOUT_ERROR` | Logout failed |
| `STATUS_ERROR` | Status check failed |
| `DASHBOARD_ERROR` | Dashboard data loading failed |
| `STATS_ERROR` | Statistics loading failed |
| `PLAYER_NOT_FOUND` | Player not found |
| `PLAYER_DETAIL_ERROR` | Player details loading failed |
| `MISSING_DATA` | Request body is required |
| `MISSING_FIELD` | Required field missing |
| `INSUFFICIENT_PLAYERS` | At least 2 players required |
| `INVALID_WINNER` | Winner must be one of the players |
| `GAME_CREATE_ERROR` | Game creation failed |
| `SUGGESTIONS_ERROR` | Commander suggestions failed |
| `NOT_FOUND` | Endpoint not found |
| `METHOD_NOT_ALLOWED` | HTTP method not allowed |
| `INTERNAL_ERROR` | Internal server error |

## Setup Requirements

To use the API with a React frontend:

1. **Install flask-cors:**
   ```bash
   pip install flask-cors
   ```

2. **Configure CORS origins** in `app.py` if needed:
   ```python
   CORS(app, supports_credentials=True, origins=['http://localhost:3000'])
   ```

3. **Start the Flask server:**
   ```bash
   flask run
   ```

The API will be available at `http://localhost:5000/api/v1`.