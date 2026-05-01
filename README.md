# Rituals

## Frontend

### Setup & Installation
1. **Install Node.js**: Ensure you have [Node.js](https://nodejs.org/) installed on your machine.
2. **Install Dependencies**:
   ```bash
   cd frontend
   npm install
   ```
3. **Start Development Server**:
   ```bash
   npm run dev
   ```

### Environment Configuration
The frontend uses a `.env.local` file to manage the API URL. 
- **Local Backend**: Set the URL to your local Chalice instance (typically `http://127.0.0.1:8000`).
- **Deployed Backend**: Set the URL to your deployed AWS API Gateway endpoint.

---

## Backend

### Setup & Installation
1. **Create Virtual Environment**:
   ```bash
   python3 -m venv backend/skincare-env
   ```
2. **Activate Virtual Environment**:
   ```bash
   source backend/skincare-env/bin/activate
   ```
3. **Install Dependencies**:
   ```bash
   pip install -r backend/requirements.txt
   ```

### Running & Deployment
- **Run Locally**: Use the following command to start the backend locally for development:
  ```bash
  chalice local
  ```
- **Deploy to AWS**: To deploy the backend as a Lambda function:
  ```bash
  chalice deploy
  ```

### CORS Configuration
In `backend/app.py`, ensure the `allow_origin` field is configured correctly to permit requests from your frontend's URL (e.g., `http://localhost:5173` for local development).
