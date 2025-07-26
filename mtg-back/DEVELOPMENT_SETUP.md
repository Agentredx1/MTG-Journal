# Development Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd MTG-Journal
pip install flask
pip install flask-cors  # Optional but recommended
```

### 2. Start Backend
```bash
# Option 1: Use the development runner
python run_dev.py

# Option 2: Use Flask directly
flask run
```

### 3. Start Frontend
```bash
cd ../mtg-front
npm run dev
```

### 4. Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api/v1

## Development Mode Features

### Backend (Flask)
- ✅ Authentication bypassed (uses group ID 1 automatically)
- ✅ CORS permissive (allows all origins)
- ✅ No session/cookie requirements
- ✅ All API endpoints available without login

### Frontend (React)
- ✅ Login screen bypassed
- ✅ Shows dashboard directly
- ✅ Uses default group info
- ✅ No authentication state management

## Troubleshooting

### Backend Issues

**Problem: "No module named 'flask'"**
```bash
pip install flask flask-cors
```

**Problem: CORS errors in browser**
- Check that `flask-cors` is installed
- Verify the development CORS settings in `app.py`
- Look for manual CORS headers if flask-cors is not available

**Problem: "Authentication required" errors**
- Verify `DEVELOPMENT_MODE = True` in `api.py`
- Check that the API decorator is setting session automatically

### Frontend Issues

**Problem: API calls failing**
- Check network tab in browser dev tools
- Verify backend is running on port 5000
- Check API base URL in `services/api.ts`

**Problem: Components not rendering**
- Check browser console for errors
- Verify all imports are correct after auth bypass

### API Testing

Test the API directly with curl:

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Dashboard data
curl http://localhost:5000/api/v1/dashboard

# Statistics
curl http://localhost:5000/api/v1/stats
```

## Re-enabling Authentication

When ready to restore authentication:

### Backend
1. Set `DEVELOPMENT_MODE = False` in `api.py`
2. Restore CORS credentials support in `app.py`

### Frontend
1. Uncomment authentication code in `AuthContext.tsx`
2. Restore login routing in `App.tsx`
3. Uncomment logout functionality in `Dashboard.tsx`
4. Re-enable credentials in API service

## Database

The app uses SQLite database `mtg.db`. Make sure:
- Database file exists
- Group with ID 1 exists in the Groups table
- Sample game data exists for testing

If you need sample data, you can add it through the existing Flask web interface or create it manually.