#!/usr/bin/env python3
"""
Development runner for MTG Journal API
Run this instead of `flask run` for development mode
"""

try:
    from app import app
    print("✅ Flask app loaded successfully")
    print("🔧 Development mode enabled:")
    print("   - CORS disabled/permissive")
    print("   - Authentication bypassed (using group ID 1)")
    print("   - Session management simplified")
    print("\n🚀 Starting development server...")
    print("   Frontend should connect to: http://localhost:5001/api/v1")
    
    if __name__ == '__main__':
        app.run(debug=True, host='0.0.0.0', port=5001)
        
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("\n📦 Please install required packages:")
    print("   pip install flask")
    print("   pip install flask-cors  # Optional but recommended")
    
except Exception as e:
    print(f"❌ Error starting app: {e}")
    import traceback
    traceback.print_exc()