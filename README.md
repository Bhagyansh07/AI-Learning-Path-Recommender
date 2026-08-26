<div align="center">

# LearnPath AI

### AI-Powered Personalized Learning Path Recommender

**HCLTech AMPlified 2025 — Round 2 Submission**

[![Deployed](https://img.shields.io/badge/Deployed-Vercel-000?style=for-the-badge&logo=vercel)](https://frontend-mu-jet-18.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-14-000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](#)
[![Team](https://img.shields.io/badge/Team-NightCoders-blue?style=for-the-badge)](#team)

[Live Demo](https://frontend-mu-jet-18.vercel.app) · [Documentation](./docs/documentation.md) · [Video Demo](#)

</div>

---

## What It Does

Online learning platforms have thousands of courses but no map. You search "how to become an ML Engineer" and get 50 unrelated videos. **LearnPath AI doesn't just recommend courses — it builds you a sequenced learning roadmap** based on your current skills, identifies your actual skill gaps, and explains every recommendation.

> **The hard problem we solve**: curriculum sequencing, not content retrieval.

## Key Features

| Feature | Description |
|---------|-------------|
| **Skill Graph DAG** | 65 skills with prerequisite edges across 8 career paths — algorithmic intelligence, not LLM vibes |
| **Topological Sort Path Generation** | Textbook graph algorithm generates prerequisite-ordered learning paths |
| **Gap Analysis** | Set difference: `target_skills − current_skills` — shows exactly what you're missing |
| **Explainable AI** | Every recommendation comes with rule-based reasoning (why this, why now) |
| **Feedback Loop** | Rate skills "Too Easy / Just Right / Too Hard" — path adapts in real-time |
| **Hybrid Scoring** | 5-factor weighted scoring: skill gap (35%), career relevance (25%), ML similarity (20%), difficulty fit (10%), prerequisite fit (10%) |
| **Conversational Interface** | Chat naturally to set goals, ask questions, get guidance |
| **Progress Dashboard** | Circular progress chart, phase breakdown, milestones, next action card |
| **Dark/Light Mode** | Professional theme toggle with smooth transitions |
| **Works Offline** | 100% client-side algorithms — remove the LLM and everything still works |

## Architecture

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                  │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Skill Graph │  │   Profiler   │  │    Path      │ │
│  │    DAG      │  │   Engine     │  │  Generator   │ │
│  │  (65 nodes) │  │ (NLU+form)   │  │ (topo sort)  │ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                │                  │          │
│  ┌──────▼──────┐  ┌──────▼───────┐  ┌──────▼───────┐ │
│  │Gap Analysis │  │  Feedback    │  │ Explanation  │ │
│  │(set diff)   │  │    Loop      │  │   Engine     │ │
│  └─────────────┘  └──────────────┘  └──────────────┘ │
│                                                        │
│  ┌──────────────────────────────────────────────────┐ │
│  │              Gemini API (optional)                │ │
│  │         NLU parsing + NLG polish only             │ │
│  └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘
```

**Golden rule**: Remove every LLM call → the system still generates correct, complete, explainable learning paths. The LLM only makes the text nicer.

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | Next.js 14, React 18 | Fast builds, SSG, API routes |
| Core Intelligence | Pure JavaScript algorithms | Deterministic, explainable, no API dependency |
| AI/ML | Skill Graph DAG + Topological Sort | Real graph algorithms, not LLM wrappers |
| LLM (optional) | Google Gemini 3.6 Flash | NLU parsing + NLG text polish |
| Styling | Custom CSS with CSS Variables | Light/dark mode, no framework bloat |
| State | localStorage | No database needed for demo |
| Deployment | Vercel | Free, fast, serverless functions |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) Gemini API key for enhanced chat

### Installation

```bash
# Clone the repository
git clone https://github.com/Bhagyansh07/AI-Learning-Path-Recommender.git
cd AI-Learning-Path-Recommender/frontend

# Install dependencies
npm install

# (Optional) Set up Gemini API key
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Start development server
npm run dev
```

App runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
frontend/
├── components/
│   ├── NavBar.js              # Shared navigation with theme toggle
│   └── ThemeContext.js         # Dark/light mode context provider
├── lib/
│   ├── skillGraph.js          # 65-skill DAG, 8 career paths, demand scores
│   └── engine.js              # Core intelligence engine (all algorithms)
├── pages/
│   ├── index.js               # Landing page
│   ├── chat.js                # Conversational AI interface
│   ├── dashboard.js           # Progress dashboard with charts
│   ├── learning-path.js       # Roadmap timeline viewer
│   ├── profile.js             # Learner profile
│   └── api/
│       └── gemini.js          # Serverless Gemini API proxy
├── styles/
│   └── globals.css            # Complete theme system (light + dark)
└── package.json
```

## How the AI Works

### 1. Skill Graph (Knowledge Representation)

A Directed Acyclic Graph where:
- **Nodes** = 65 skills (Python, ML, React, Docker, etc.)
- **Edges** = prerequisite relationships (ML requires NumPy + Statistics)
- **Weights** = difficulty (1-5), estimated hours, demand score

### 2. Gap Analysis (Algorithmic)

```
gap = target_skills − current_skills
```

Compares learner's current skills against career path requirements. Pure set difference — no LLM involved.

### 3. Path Generation (Topological Sort)

```
1. Map goal → target career → target_skills
2. Traverse DAG backwards → collect all prerequisites
3. Remove skills learner already has
4. Topologically sort remaining nodes → THIS IS THE LEARNING PATH
5. Group into phases: Foundation → Development → Mastery
6. Attach resources, generate explanations
7. Adjust timeline based on time commitment
```

### 4. Explanation Engine (Rule-Based)

Three levels, all computed from graph data:

| Level | Example |
|-------|---------|
| **Per-recommendation** | "NumPy is a fundamental skill that requires 1 prerequisite (Python). It unlocks 4 downstream skills including Machine Learning." |
| **Per-path** | "This 12-skill path covers 3 phases. Based on your 10 hrs/week, you'll reach your goal in ~8 weeks." |
| **Chat-answerable** | "Why Python before ML? Because ML's prerequisites include NumPy and Statistics, both of which require Python." |

### 5. Feedback Loop (Adaptivity)

```javascript
// After completing a module
submitFeedback("machine-learning", "easy", 40);

// System adjusts:
// - "easy" → boost score for next difficulty level
// - "hard" → reduce score, suggest remedial resources
// - Domain feedback → adjust all related skills
```

## India-Specific Features

- **NPTEL & SWAYAM** courses mapped as primary resources
- **Indian salary data** in LPA (Lakhs Per Annum)
- **Skill demand scores** based on Indian job market
- **Growth rates** from Indian tech sector data

## Demo Profiles

Pre-loaded profiles for instant demo (no onboarding needed):

| Profile | Level | Career Goal | Skills |
|---------|-------|-------------|--------|
| **Priya** | Intermediate | Data Scientist | Python, SQL |
| **Arjun** | Beginner | Full Stack Developer | HTML, CS Basics |
| **Sneha** | Advanced | ML Engineer | Python, SQL, Git, Linux, CS |

## Team

**NightCoders** — JECRC University, Jaipur

| Member | Role |
|--------|------|
| Bhagyansh | Full Stack + AI/ML Engine |

## License

MIT License — Built for HCLTech AMPlified 2025
