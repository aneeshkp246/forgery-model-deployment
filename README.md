# 🕵️ Image Forgery Detection

A full-stack application that detects whether an uploaded image is fake or real.

## Features

- **Image Upload**: Upload PNG, JPG, or JPEG images up to 10MB
- **Real-time Detection**: AI-powered detection of any format of images
- **Confidence Score**: Visual confidence meter with percentage
- **Responsive UI**: Modern, mobile-friendly interface
- **Containerized**: Docker support for easy deployment
- **Kubernetes Ready**: K8s manifests for production deployment

## Tech Stack

**Backend:**
- Flask (Python web framework)
- TensorFlow (ML model inference)
- PIL (Image processing)
- Flask-CORS (Cross-origin requests)

**Frontend:**
- Next.js 14 (React framework)
- TypeScript (Type safety)
- Tailwind CSS (Styling)

## Local Development Setup

### Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Docker and Docker Compose (optional)

### 1. Clone the Repository

```bash
git clone https://github.com/aneeshkp246/forgery-model-deployment
cd forgery-model-deployment
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the Flask server
python app.py
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`

### 4. Test the Application

1. Open `http://localhost:3000` in your browser
2. Upload an image using the file picker
3. Click "Predict" to analyze the image
4. View the detection result with confidence score

## Docker Compose Setup

For easier local development with Docker:

```bash
# Build and run both services
docker-compose up --build

# Run in background
docker-compose up -d --build

# Stop services
docker-compose down
```

Access the application at `http://localhost:3000`

## Kubernetes Deployment with Minikube

### Prerequisites

- [Minikube](https://minikube.sigs.k8s.io/docs/start/) installed
- kubectl configured

### 1. Start Minikube

```bash
# Start minikube with Docker driver
minikube start --driver=docker
```

### 2. Configure Docker Environment

```bash
# Use minikube's Docker daemon
eval $(minikube docker-env)
```

### 3. Build Docker Images

```bash
# Build backend image
docker build -t forgery-backend:latest ./backend

# Build frontend image
docker build -t forgery-frontend:latest ./frontend

# Verify images
docker images | grep forgery
```

### 4. Deploy to Kubernetes

```bash
# Apply all manifests
kubectl apply -f .

# Or apply individually
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
kubectl apply -f frontend-deployment.yaml
kubectl apply -f frontend-service.yaml
```

### 5. Verify Deployment

```bash
# Check pods status
kubectl get pods

# Check services
kubectl get services

# Check deployments
kubectl get deployments
```

### 6. Access the Application

```bash
# Get the frontend service URL
minikube service frontend-service --url

# Or open directly in browser
minikube service frontend-service
```

### 7. Cleanup

```bash
# Delete all resources
kubectl delete -f .

# Stop minikube
minikube stop
```

## API Endpoints

### Backend (Flask)

- `POST /predict` - Upload image for forgery detection
  - **Body**: FormData with `file` field
  - **Response**: `{"label": "Real|Fake", "confidence": 0.95}`

### Frontend (Next.js)

- `POST /api/predict` - Proxy endpoint to backend
  - Forwards requests to backend service
  - Handles CORS and error responses


## License

This project is licensed under the MIT License.
