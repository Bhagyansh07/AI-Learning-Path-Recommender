# Solution Documentation — LearnPath AI

> HCLTech AMPlified 2025 · Round 2 · Team NightCoders · JECRC University

---

## 1. Problem Understanding

### What the Problem Statement Asks For

| Requirement | PS Wording | Our Solution |
|---|---|---|
| Conversational interface | "learners describe their goals in natural language" | Chat with onboarding + free-text input |
| Learner profiling | "capturing interests, experience level, completed courses and objectives" | Structured profile with LLM NLU + form fallback |
| Recommendation engine | "suggesting relevant courses, projects and learning resources" | 5-factor hybrid scoring engine |
| Personalized learning path | "with prerequisites and milestones" | Topological sort over skill DAG |
| Explainable AI | "explains why each recommendation was made" | Rule-based explanation engine (3 levels) |
| Progress dashboard | "visualizing progress, skill development, milestones" | Circular chart, phase bars, stats |
| Feedback adaptation | "adapt suggestions based on user feedback" | Real-time feedback loop adjusts rankings |

### The Hard Problem We Solve

> "Learners often struggle to identify the **right sequence** of learning resources."

Most systems (Coursera, YouTube) do **content retrieval** — "here are 50 Python courses." We do **curriculum sequencing** — "here's the exact order: Python → NumPy → Statistics → ML, because each step has prerequisites the next one needs."

---

## 2. Solution Architecture

### Core Principle

> **If you remove every LLM call, the system still generates correct, complete, explainable learning paths.**

The LLM is a UI convenience, not the brain. The brain is algorithmic.

### System Diagram

```
┌──────────────────────────────────────────────────────┐
│                    Frontend (Next.js)                  │
├──────────────────────────────────────────────────────┤
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ Skill Graph │  │   Profiler   │  │    Path      │ │
│  │    DAG      │  │   Engine     │  │  Generator   │ │
│  │  (54 nodes) │  │ (NLU+form)   │  │ (topo sort)  │ │
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

---

## 3. AI/ML Implementation Details

### 3.1 Skill Graph — Knowledge Representation

A **Directed Acyclic Graph (DAG)** with:
- **54 nodes** (skills) across 9 domains
- **Directed edges** = prerequisite relationships
- **Node weights** = difficulty (1-5), estimated hours
- **8 career paths** with target skill sets

```javascript
{
  id: "machine-learning",
  name: "Machine Learning Fundamentals",
  domain: "machine_learning",
  difficulty: 3,
  estimated_hours: 50,
  prerequisites: ["numpy-pandas", "statistics-basics"],
  resources: [
    { type: "course", title: "ML Specialization", platform: "Coursera", free: true },
    { type: "project", title: "House Price Predictor", difficulty: 3 }
  ]
}
```

### 3.2 Gap Analysis — Algorithmic

```
gap = target_skills − current_skills
```

Pure set difference. For each target career path:
1. Get `target_skills` from career path definition
2. Get `current_skills` from learner profile
3. Compute set difference → these are the missing skills
4. Sort by Indian job market demand score

### 3.3 Path Generation — Topological Sort

**Algorithm** (Kahn's BFS-based topological sort):

```
1. Map goal → target career → target_skills
2. For each target skill, traverse DAG backwards
3. Collect ALL prerequisite nodes not in current_skills
4. Build adjacency list + in-degree count
5. BFS: process nodes with in-degree 0
6. Result = topologically sorted learning path
7. Group into phases by difficulty:
   - Phase 1: Foundation (difficulty ≤ 1)
   - Phase 2: Development (difficulty 2-3)
   - Phase 3: Mastery (difficulty 4+)
8. Adjust timeline based on time_commitment
```

**Why this is real AI/ML**: This is a textbook graph algorithm applied to curriculum design. It's deterministic, explainable, and produces correct prerequisite ordering every time.

### 3.4 Explanation Engine — Rule-Based

Three levels of explanation, all computed from graph data:

| Level | Source | Example |
|-------|--------|---------|
| **Per-recommendation** | Graph traversal + prerequisite check | "NumPy is a fundamental skill that requires 1 prerequisite. It unlocks 4 downstream skills including Machine Learning." |
| **Per-path** | Path metadata + time calculation | "This 12-skill path covers 3 phases. Based on your 10 hrs/week, you'll reach your goal in ~8 weeks." |
| **Chat-answerable** | Graph queries + structured response | "Why Python before ML? ML requires NumPy and Statistics, both of which require Python." |

**Critical**: These are NOT LLM-generated. The LLM wraps them in natural language, but the factual core comes from graph queries.

### 3.5 Hybrid Scoring — 5-Factor Weighted

| Factor | Weight | Algorithm |
|--------|--------|-----------|
| Skill Gap Score | 35% | Is this skill in the target career path? |
| Career Relevance | 25% | Does it match learner's career goals + interests? |
| ML Similarity | 20% | Indian job market demand score × domain match |
| Difficulty Fit | 10% | How close is the skill difficulty to learner's level? |
| Prerequisite Fit | 10% | How many prerequisites has the learner already met? |

### 3.6 Feedback Loop — Adaptivity

```javascript
// Learner rates a skill
submitFeedback("machine-learning", "easy", 40);

// System updates:
// 1. Marks skill as completed
// 2. Adds to current_skills
// 3. Stores feedback rating
// 4. Re-ranks future recommendations:
//    - "easy" → boost score for next difficulty level (+10%)
//    - "hard" → reduce score, suggest remedial resources (-10%)
//    - Domain feedback → adjust all related skills in same domain
```

---

## 4. What the LLM Actually Does

| Task | Method | LLM Required? |
|------|--------|:---:|
| Parse free-text goals → structured profile | NLU | Yes (optional) |
| Polish explanation text → natural language | NLG | Yes (optional) |
| Handle unknown chat queries | Fallback | Yes (optional) |
| Skill graph traversal | Algorithmic | **No** |
| Gap analysis | Algorithmic | **No** |
| Path generation (topological sort) | Algorithmic | **No** |
| Explanation generation | Rule-based | **No** |
| Scoring & ranking | Algorithmic | **No** |
| Feedback adaptation | Algorithmic | **No** |

**The test**: Remove `pages/api/gemini.js` — does the system still work? **Yes.** All core features function without any API call.

---

## 5. India-Specific Features

- **NPTEL & SWAYAM** courses as primary resources
- **Indian salary data** in LPA (Lakhs Per Annum)
- **Skill demand scores** from Indian job market analysis
- **Growth rates** from Indian tech sector projections
- Free resources prioritized (NPTEL, SWAYAM, YouTube, freeCodeCamp)

---

## 6. Demo Walkthrough (3 Minutes)

1. **Open app** → Landing page with stats
2. **Click "Start Learning Journey"** → Chat onboarding
3. **Select interests** → "Machine Learning & AI"
4. **Select level** → "Intermediate"
5. **Select time** → "10-20 hours"
6. **Select goal** → "Career change to tech"
7. **See generated path** → Skills with phases, milestones
8. **Click "Why this?"** → Explanation panel opens
9. **Rate a skill "Too Easy"** → Progress updates instantly
10. **Mark a course "Complete"** → Overall progress % + phase counter update live
11. **Ask "How long will this take?"** → Timeline response
12. **Dashboard** → Progress chart, next action, skill coverage
13. **Dark mode toggle** → Theme switches smoothly

---

## 7. Judging Criteria Alignment

| Criterion | Weight | Our Score | Evidence |
|-----------|--------|-----------|----------|
| **Functionality** | 25% | High | All features working end-to-end |
| **Problem Understanding** | 20% | High | Curriculum sequencing, not content retrieval |
| **AI/ML Implementation** | 20% | High | Topological sort, gap analysis, feedback loop |
| **Innovation** | 15% | High | Skill graph approach, explainability, India context |
| **UX** | 10% | Medium | Clean, responsive, dark/light mode |
| **Code Quality** | 10% | Medium | Modular engine, clear separation |

---

## 8. Team — NightCoders

**Team NightCoders · Team size: 5/5 · HCLTech AMPlified 2025 (Round 2)**

| Member | Email |
|--------|-------|
| Bhagyansh Chandel | bhagyanshchandel3567@gmail.com |
| Varun Jain | varunjain2409@gmail.com |
| Prashant Sharma | prashantsharma.ai28@jecrc.ac.in |
| Raghav Gupta | raghav.23bcon1939@jecrcu.edu.in |
| Parth Manocha | parth.manocha2901@gmail.com |

**Institution:** JECRC University, Jaipur

---

## 9. Local Setup & Execution Instructions

### Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.9+ and **pip** (only required for the backend / Gemini NLU polish)

### 1. Get the code
Download and unzip `LearnPath-AI-Source-Code.zip`, or clone:
```
git clone https://github.com/Bhagyansh07/AI-Learning-Path-Recommender.git
```

### 2. Run the frontend (the main app)
```
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your browser. The full app works locally — profile, learning path, dashboard, skill graph and algorithm are all client-side.

### 3. Run the backend (optional — only for Gemini-powered NLU/NLG polish)
```
cd backend
python -m pip install -r requirements.txt
python app.py
```
Server runs on `http://localhost:5000`. Set your Gemini API key in `.env` (see `.env.example`). The app gracefully falls back to local parsing if no key is configured.

### 4. Run the tests
```
cd frontend && npm test
cd backend && python -m pytest tests/ -q
```
Frontend (skill-graph) has 9 passing tests; backend has 13 passing tests.

### 5. Production build
```
cd frontend
npm run build
npm start
```

---

*Team NightCoders — JECRC University, Jaipur*
