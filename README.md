# AI-Powered Personalized Learning Path Recommender

> HCLTech AMPlified 2025 - Round 2 Submission by Team NightCoders

An intelligent learning assistant that recommends personalized learning paths using AI/ML, natural language processing, and career-aligned skill gap analysis.

## Live Demo

- **Frontend**: https://frontend-mu-jet-18.vercel.app
- **Backend API**: https://ai-learning-path-api.onrender.com/api/health

## Features

- **Conversational AI Interface** - Chat naturally to describe learning goals
- **ML-Powered Recommendations** - TF-IDF + LinearSVC trained on course catalog
- **Hybrid Scoring Engine** - 5-factor scoring (skill gap 35%, career relevance 25%, ML similarity 20%, difficulty fit 10%, prerequisite fit 10%)
- **Skill Gap Analysis** - Compare current skills vs career path requirements
- **Personalized Learning Roadmaps** - Prerequisites, milestones, and timeline estimates
- **Explainable AI** - Every recommendation includes reasoning
- **Progress Dashboard** - Track courses, skills, and milestones
- **Gemini AI Integration** - Enhanced conversational AI with Google Gemini (with smart fallback)

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, React 18 |
| Backend | Python Flask |
| ML Engine | scikit-learn (TF-IDF + LinearSVC) |
| AI Chat | Google Gemini API (with rule-based fallback) |
| Deployment | Vercel (frontend) + Render (backend) |

## Local Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm or yarn

### Backend

```bash
cd backend
pip install -r requirements.txt
set GEMINI_API_KEY=your_api_key_here  # Optional
python app.py
```

Server runs on `http://localhost:5000`

### Frontend

```bash
cd frontend
npm install
set NEXT_PUBLIC_API_URL=http://localhost:5000/api
npm run dev
```

App runs on `http://localhost:3000`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check + model status |
| GET | `/api/onboarding` | Onboarding steps data |
| POST | `/api/profile/create` | Create learner profile |
| GET | `/api/profile/<id>` | Get profile details |
| PUT | `/api/profile/<id>` | Update profile |
| POST | `/api/analyze` | NLP analysis of text |
| GET | `/api/recommend/<id>` | Get course recommendations |
| GET | `/api/path/<id>` | Get learning roadmap |
| GET | `/api/skill-gaps/<id>` | Skill gap analysis |
| GET | `/api/careers` | List career paths |
| POST | `/api/chat` | AI chat (Gemini powered) |
| POST | `/api/progress/<id>` | Update learning progress |
| POST | `/api/explain/<id>` | Explain a course recommendation |

## Project Structure

```
HCL AMPLIFIED/
├── backend/
│   ├── app.py                  # Flask API server
│   ├── requirements.txt        # Python dependencies
│   ├── ai/                     # Gemini AI client
│   │   ├── __init__.py
│   │   └── gemini_client.py
│   ├── ml/                     # ML engine
│   │   ├── __init__.py
│   │   ├── recommender.py      # TF-IDF + LinearSVC
│   │   ├── skill_gap.py        # Career skill gap analysis
│   │   ├── scoring.py          # Hybrid scoring engine
│   │   └── roadmap.py          # Learning roadmap generator
│   ├── data/                   # Course/skill/career data
│   │   ├── course_metadata.csv
│   │   ├── courses.json
│   │   ├── skills.json
│   │   ├── career_paths.json
│   │   └── prerequisites.json
│   └── recommendation_engine/  # Core recommendation logic
├── frontend/
│   ├── pages/                  # Next.js pages
│   │   ├── index.js            # Landing page
│   │   ├── chat.js             # AI chat interface
│   │   ├── dashboard.js        # Progress dashboard
│   │   ├── learning-path.js    # Roadmap viewer
│   │   └── profile.js          # Profile page
│   ├── styles/globals.css      # Dark theme UI
│   ├── config.js               # API configuration
│   └── next.config.js          # Next.js config
└── docs/
    └── documentation.md        # Solution documentation
```

## ML Implementation

- **TF-IDF Vectorizer** transforms course text into feature vectors
- **LinearSVC Classifier** trained on course catalog for domain classification
- **Cosine Similarity** for finding similar courses to user queries
- **Hybrid Scoring** combines ML scores with skill gap, career relevance, difficulty, and prerequisites
- **Models persisted** via joblib for fast inference

## License

Team NightCoders - JECRC University
