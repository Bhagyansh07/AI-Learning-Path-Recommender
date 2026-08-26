# AI-Powered Personalized Learning Path Recommender

An intelligent learning assistant that recommends personalized learning paths based on a learner's interests, goals, previous learning history, and skill level. The system generates structured learning roadmaps, explains recommendations, and adapts suggestions based on user feedback.

## Features

- **Conversational AI Interface** - Chat with an AI assistant in natural language to describe your learning goals
- **Learner Profiling Engine** - Captures interests, experience level, completed courses, and career objectives
- **TF-IDF Recommendation Engine** - Content-based filtering using TF-IDF vectors and cosine similarity for course/project recommendations
- **Learning Path Generator** - Creates structured roadmaps with prerequisites, milestones, and estimated timelines
- **Explainable AI** - Every recommendation comes with a clear explanation of why it was made
- **Progress Dashboard** - Visualizes progress, skill development, milestones, and next recommended actions

## Tech Stack

### Backend
- **Python 3.8+** with Flask
- **TF-IDF** content-based recommendation engine (no external ML library dependency)
- **NLP Processor** for natural language goal understanding
- **RESTful API** with CORS support

### Frontend
- **Next.js 14** (React 18)
- **CSS3** with custom design system (no external UI library)
- **Responsive** dark-themed interface

## Project Structure

```
HCL AMPLIFIED/
├── backend/
│   ├── app.py                          # Flask API server
│   ├── requirements.txt                # Python dependencies
│   ├── recommendation_engine/
│   │   ├── __init__.py
│   │   ├── nlp_processor.py            # NLP for goal understanding
│   │   ├── profiler.py                 # Learner profiling engine
│   │   ├── recommender.py              # TF-IDF recommendation engine
│   │   ├── path_generator.py           # Learning path generator
│   │   └── ai_assistant.py             # Conversational AI assistant
│   └── data/
│       ├── courses.json                # 20 courses across 10 domains
│       ├── projects.json               # 6 hands-on projects
│       ├── assessments.json            # 4 skill assessments
│       └── domain_mappings.json        # Domain relationships & career paths
├── frontend/
│   ├── package.json
│   ├── next.config.js
│   ├── pages/
│   │   ├── index.js                    # Landing page
│   │   ├── chat.js                     # Conversational AI interface
│   │   ├── dashboard.js                # Progress dashboard
│   │   ├── learning-path.js            # Learning path visualization
│   │   └── profile.js                  # Learner profile view
│   ├── components/                     # Reusable UI components
│   └── styles/
│       └── globals.css                 # Global styles & design system
├── docs/
│   └── documentation.md                # Solution documentation
└── README.md
```

## Setup & Execution

### Prerequisites
- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The Flask server starts on `http://localhost:5000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The Next.js dev server starts on `http://localhost:3000`.

### Access the Application

1. Open `http://localhost:3000` in your browser
2. Click "Start Learning Journey" or go to the AI Assistant
3. Complete the onboarding (4 quick questions)
4. Get your personalized learning path and recommendations
5. Explore the dashboard and track your progress

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/onboarding` | Get onboarding chat flow |
| POST | `/api/profile/create` | Create a new learner profile |
| GET | `/api/profile/<id>` | Get learner profile |
| PUT | `/api/profile/<id>` | Update learner profile |
| POST | `/api/analyze` | Analyze natural language input |
| GET | `/api/recommend/<id>` | Get course/project recommendations |
| GET | `/api/path/<id>` | Generate learning path |
| POST | `/api/chat` | Chat with AI assistant |
| POST | `/api/progress/<id>` | Update learning progress |
| GET | `/api/skill-coverage/<id>/<domain>` | Get skill coverage for a domain |
| GET | `/api/courses` | List all courses |
| GET | `/api/projects` | List all projects |
| GET | `/api/domains` | List all domain mappings |

## AI/ML Techniques Used

1. **TF-IDF Vectorization** - Course and learner profile representation using Term Frequency-Inverse Document Frequency
2. **Cosine Similarity** - Content-based recommendation scoring between learner profiles and course vectors
3. **NLP Keyword Extraction** - Domain detection, skill level identification, and goal classification from natural language
4. **Topological Sorting** - Course ordering respecting prerequisite dependencies
5. **Multi-factor Scoring** - Combining relevance, level match, and prerequisite readiness for ranking

## License

This project was built for the HCL Amplified program.
