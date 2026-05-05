from chalice import Chalice, CORSConfig
from dotenv import load_dotenv
import os

# Load .env from the backend directory and override existing environment variables
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'), override=True)

app = Chalice(app_name='skincare-api')
# 1. Define your configuration once
cors_config = CORSConfig(
    allow_origin='http://localhost:5173',
    allow_headers=['Content-Type', 'Authorization'],
    allow_credentials=True
)

# 2. Apply it globally to the API
app.api.cors = cors_config

from chalicelib.routes import profiles, rituals, auth
app.register_blueprint(profiles)
app.register_blueprint(rituals)
app.register_blueprint(auth)

from chalicelib.db import init_db
init_db()

@app.route('/')
def index():
    return {'hello': 'world'}