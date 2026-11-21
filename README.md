EcoAcoustics — Frontend Handoff & Backend Integration Guide
1. What Has Been Built & Pushed
The React + Vite frontend prototype is complete and pushed to the main branch (src/, public/, index.html, package.json, vite.config.js). It includes:

Navigation & Layout (Navbar): Top-level navigation across live monitoring, alerts, demo controls, and analytics.

Interactive Acoustic Map: Displays acoustic sensor nodes, detection locations, and alert status indicators.

Real-Time Alert Feed (AlertFeed): Lists incoming acoustic events/detections with severity, classification labels, timestamps, and confidence scores.

Demo & Simulation Panel (DemoPanel): Allows manual triggering/simulation of acoustic alerts and test events for presentations and testing.

Analytics View: Visualizes acoustic activity trends, event breakdowns, and sensor metrics.

API & Mock Data Layer (src/api/client.js & mock data): All UI components are decoupled from raw fetch calls and currently run in standalone mock mode (USE_MOCK = true).

2. How to Run the Frontend Locally
After pulling the latest main branch:

Bash
npm install
npm run dev
The dev server runs on Vite (typically http://localhost:5173).

node_modules/ and dist/ are excluded via .gitignore, so running npm install is required on first setup.

3. What the Backend Teammate Needs to Set Up Before Connecting
When you build the FastAPI backend and we move to integration, make sure the following are in place:

CORS Configuration (Required)
Enable CORSMiddleware in FastAPI so the React dev server (http://localhost:5173) can call the backend without browser CORS blocks:

Python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
Consistent Base URL & Endpoints

Run FastAPI on a predictable local port (e.g., http://localhost:8000) and share the final route paths + JSON response schemas so we can map them cleanly inside src/api/client.js.

Typical endpoints the UI expects to consume:

Sensors / Nodes list (ID, name, latitude, longitude, active/alert status)

Alerts / Detections feed (ID, sensor ID, detected sound class, confidence score, severity, timestamp, location)

Analytics / Summary stats (counts by category, timeline/trend data)

Audio upload / inference or simulator trigger endpoint (to test live classification with test_audio_samples/ and simulator)

Real-Time Updates (Optional / Recommended)

If pushing live alerts from the simulator/audio model to the dashboard, either expose a WebSocket endpoint (e.g., /ws/alerts) or a polling GET /alerts endpoint sorted newest-first.

Repository Hygiene Note

Please pull main before pushing backend changes (git pull origin main) so our commits stay in sync.

Keep .venv/ and __pycache__/ in .gitignore so virtual environment files aren't committed.

4. Next Step Once Backend Is Ready
Once the FastAPI endpoints and schemas are ready, we will flip USE_MOCK = false in src/api/client.js, point the base URL to your FastAPI server, and verify end-to-end data flow across the map, alert feed, demo panel, and analytics view.
