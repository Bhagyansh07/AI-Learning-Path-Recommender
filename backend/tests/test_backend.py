"""Unit + integration tests for the LearnPath AI backend.

Run from the backend/ directory with:
    python -m pytest tests/ -v
"""

import os
import sys

import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from ml import SkillGapAnalyzer, HybridScorer, RoadmapGenerator
from app import app


def make_profile(**overrides):
    profile = {
        "experience_level": "beginner",
        "interests": ["Data Science"],
        "current_skills": [],
        "completed_courses": [],
        "career_goals": ["data_scientist"],
        "time_commitment": "5-10 hours",
    }
    profile.update(overrides)
    return profile


# ── Skill Gap Analyzer ─────────────────────────────────────

def test_skill_gap_returns_career_analysis():
    analyzer = SkillGapAnalyzer()
    result = analyzer.analyze(make_profile(interests=["Data Science"]), target_career="data_scientist")
    assert "readiness_score" in result
    assert "missing_skills" in result or "required_skills" in result


def test_skill_gap_no_career_matches_best():
    analyzer = SkillGapAnalyzer()
    result = analyzer.analyze(make_profile(interests=["Data Science"]))
    assert "career" in result or "readiness_score" in result


def test_skill_gap_handles_empty_profile():
    analyzer = SkillGapAnalyzer()
    result = analyzer.analyze(make_profile(current_skills=[], completed_courses=[]))
    assert result is not None


# ── Hybrid Scorer ──────────────────────────────────────────

def test_hybrid_scorer_ranks_without_ml():
    scorer = HybridScorer()
    ranked = scorer.rank_courses(make_profile(), ml_results=[], top_k=5)
    assert isinstance(ranked, list)

    with_ml_fail = scorer.rank_courses(make_profile(), ml_results=None, top_k=5)
    assert isinstance(with_ml_fail, list)


# ── Roadmap Generator ──────────────────────────────────────

def test_roadmap_generate_returns_structure():
    gen = RoadmapGenerator()
    path = gen.generate(make_profile(), [], target_career="data_scientist")
    assert "phases" in path
    assert "milestones" in path
    assert "estimated_weeks" in path
    assert path["estimated_weeks"] >= 1


# ── Flask HTTP integration ─────────────────────────────────

@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as c:
        yield c


def test_health_endpoint(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    body = resp.get_json()
    assert body["status"] == "ok"


def test_onboarding_endpoint(client):
    resp = client.get("/api/onboarding")
    assert resp.status_code == 200
    assert "steps" in resp.get_json()


def test_profile_create_and_get(client):
    create = client.post("/api/profile/create", json=make_profile(interests=["Web Development"]))
    assert create.status_code == 200
    profile = create.get_json()["profile"]
    assert "id" in profile

    fetch = client.get(f"/api/profile/{profile['id']}")
    assert fetch.status_code == 200
    assert fetch.get_json()["profile"]["id"] == profile["id"]


def test_profile_get_missing_returns_404(client):
    resp = client.get("/api/profile/does-not-exist")
    assert resp.status_code == 404


def test_analyze_requires_text(client):
    resp = client.post("/api/analyze", json={})
    assert resp.status_code == 400


def test_careers_endpoint(client):
    resp = client.get("/api/careers")
    assert resp.status_code == 200


def test_cors_header_restricted_to_allowlist(client):
    # Origin not in the allowlist must NOT be echoed back (no wildcard).
    resp = client.get("/api/health", headers={"Origin": "https://evil.example.com"})
    acao = resp.headers.get("Access-Control-Allow-Origin")
    assert acao is None or acao == "http://localhost:3000"


def test_cors_allowlists_deployed_origin(client):
    resp = client.get("/api/health", headers={"Origin": "https://frontend-mu-jet-18.vercel.app"})
    acao = resp.headers.get("Access-Control-Allow-Origin")
    assert acao == "https://frontend-mu-jet-18.vercel.app"
