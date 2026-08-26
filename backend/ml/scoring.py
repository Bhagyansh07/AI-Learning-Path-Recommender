import os
import json
import csv

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class HybridScorer:
    """Hybrid scoring: skill_gap(35%) + career_relevance(25%) + ml_similarity(20%) + difficulty(10%) + prereq(10%)."""

    WEIGHTS = {
        "skill_gap": 0.35,
        "career_relevance": 0.25,
        "ml_similarity": 0.20,
        "difficulty_fit": 0.10,
        "prerequisite_fit": 0.10,
    }

    LEVEL_MAP = {"beginner": 0, "intermediate": 1, "advanced": 2}

    def __init__(self):
        self.courses = self._load_courses()
        self.skills_data = self._load_json("skills.json")
        self.career_paths = self._load_json("career_paths.json")
        self.prereqs = self._load_json("prerequisites.json")

    def _load_json(self, filename):
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
        return {}

    def _load_courses(self):
        courses = []
        csv_path = os.path.join(DATA_DIR, "course_metadata.csv")
        if os.path.exists(csv_path):
            with open(csv_path, "r") as f:
                courses = list(csv.DictReader(f))
        return courses

    def score(self, profile, course_id, ml_score=0.0, target_career=None):
        course = self._get_course(course_id)
        if not course:
            return {"total": 0, "breakdown": {}}

        current_skills = self._get_current_skills(profile)
        completed = set(profile.get("completed_courses", []))

        skill_gap_score = self._skill_gap_score(course, current_skills)
        career_score = self._career_relevance_score(course, profile, target_career)
        ml_norm = min(max(ml_score / 3.0, 0), 1) if ml_score else 0
        difficulty_score = self._difficulty_fit_score(course, profile)
        prereq_score = self._prerequisite_score(course_id, completed)

        total = (
            skill_gap_score * self.WEIGHTS["skill_gap"]
            + career_score * self.WEIGHTS["career_relevance"]
            + ml_norm * self.WEIGHTS["ml_similarity"]
            + difficulty_score * self.WEIGHTS["difficulty_fit"]
            + prereq_score * self.WEIGHTS["prerequisite_fit"]
        )

        return {
            "total": round(total, 4),
            "breakdown": {
                "skill_gap": round(skill_gap_score, 4),
                "career_relevance": round(career_score, 4),
                "ml_similarity": round(ml_norm, 4),
                "difficulty_fit": round(difficulty_score, 4),
                "prerequisite_fit": round(prereq_score, 4),
            },
        }

    def _skill_gap_score(self, course, current_skills):
        course_skills = set(course.get("skills_taught", "").split("|"))
        course_skills = {s.strip() for s in course_skills if s.strip()}
        if not course_skills:
            return 0.5
        missing = course_skills - current_skills
        if not missing:
            return 0.2
        demand_sum = 0
        for skill in missing:
            info = self.skills_data.get("skills", {}).get(skill, {})
            demand_sum += info.get("demand_score", 0.5)
        avg_demand = demand_sum / max(len(missing), 1)
        new_skill_ratio = len(missing) / max(len(course_skills), 1)
        return min(avg_demand * 0.6 + new_skill_ratio * 0.4, 1.0)

    def _career_relevance_score(self, course, profile, target_career=None):
        interests = set(profile.get("interests", []))
        course_domain = course.get("domain", "")

        if course_domain in interests:
            return 0.9

        if target_career and target_career in self.career_paths.get("career_paths", {}):
            career = self.career_paths["career_paths"][target_career]
            career_skills = set(career.get("required_skills", []))
            course_skills = set(course.get("skills_taught", "").split("|"))
            overlap = len(course_skills & career_skills)
            if overlap:
                return min(overlap / max(len(career_skills), 1) + 0.3, 1.0)

        return 0.3

    def _difficulty_fit_score(self, course, profile):
        user_level = profile.get("experience_level", "beginner")
        course_level = course.get("level", "beginner")
        user_idx = self.LEVEL_MAP.get(user_level, 0)
        course_idx = self.LEVEL_MAP.get(course_level, 0)
        diff = abs(user_idx - course_idx)
        if diff == 0:
            return 1.0
        elif diff == 1:
            return 0.6
        return 0.2

    def _prerequisite_score(self, course_id, completed):
        prereqs = self.prereqs.get("prerequisites", {}).get(course_id, [])
        if not prereqs:
            return 1.0
        met = sum(1 for p in prereqs if p in completed)
        return met / len(prereqs)

    def _get_course(self, course_id):
        for c in self.courses:
            if c.get("course_id") == course_id:
                return c
        return None

    def _get_current_skills(self, profile):
        skills = set()
        for s in profile.get("current_skills", []):
            if isinstance(s, dict):
                skills.add(s.get("skill", ""))
            else:
                skills.add(str(s))
        return skills

    def rank_courses(self, profile, ml_results=None, top_k=10, target_career=None):
        ml_scores = {}
        if ml_results:
            for r in ml_results:
                cid = r.get("course_id", "")
                ml_scores[cid] = r.get("ml_score", 0)

        completed = set(profile.get("completed_courses", []))
        ranked = []

        for course in self.courses:
            cid = course.get("course_id", "")
            if cid in completed:
                continue
            ml = ml_scores.get(cid, 0)
            result = self.score(profile, cid, ml, target_career)
            ranked.append({
                "course_id": cid,
                "title": course.get("title", ""),
                "domain": course.get("domain", ""),
                "level": course.get("level", ""),
                "duration_hours": int(course.get("duration_hours", 0)),
                "rating": float(course.get("rating", 0)),
                "skills_taught": course.get("skills_taught", "").split("|"),
                "provider": course.get("provider", ""),
                "total_score": result["total"],
                "breakdown": result["breakdown"],
            })

        ranked.sort(key=lambda x: x["total_score"], reverse=True)
        return ranked[:top_k]
