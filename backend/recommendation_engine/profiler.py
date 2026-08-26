import json
import os
import uuid
from datetime import datetime


DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class LearnerProfiler:
    """Manages learner profiles: creation, updates, skill tracking."""

    def __init__(self):
        self.profiles = {}
        self.domain_mappings = self._load_json("domain_mappings.json")

    def _load_json(self, filename):
        path = os.path.join(DATA_DIR, filename)
        with open(path, "r") as f:
            return json.load(f)

    def create_profile(self, learner_data):
        """Create a new learner profile."""
        profile_id = str(uuid.uuid4())[:8]
        profile = {
            "id": profile_id,
            "name": learner_data.get("name", "Learner"),
            "email": learner_data.get("email", ""),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "experience_level": learner_data.get("experience_level", "beginner"),
            "interests": learner_data.get("interests", []),
            "completed_courses": learner_data.get("completed_courses", []),
            "current_skills": learner_data.get("current_skills", []),
            "target_skills": learner_data.get("target_skills", []),
            "career_goals": learner_data.get("career_goals", []),
            "learning_style": learner_data.get("learning_style", "visual"),
            "time_commitment": learner_data.get("time_commitment", "5-10 hours/week"),
            "learning_history": [],
            "progress": {
                "total_courses_completed": 0,
                "total_hours_learned": 0,
                "skills_acquired": [],
                "milestones_reached": [],
                "streak_days": 0,
                "last_activity": None,
            },
            "feedback_history": [],
            "current_learning_path": None,
        }
        self.profiles[profile_id] = profile
        return profile

    def get_profile(self, profile_id):
        return self.profiles.get(profile_id)

    def update_profile(self, profile_id, updates):
        if profile_id not in self.profiles:
            return None

        profile = self.profiles[profile_id]
        for key, value in updates.items():
            if key in profile and key not in ("id", "created_at"):
                profile[key] = value
        profile["updated_at"] = datetime.now().isoformat()
        return profile

    def add_completed_course(self, profile_id, course_id, score=None):
        profile = self.profiles.get(profile_id)
        if not profile:
            return None

        entry = {
            "course_id": course_id,
            "completed_at": datetime.now().isoformat(),
            "score": score,
        }
        profile["learning_history"].append(entry)
        if course_id not in profile["completed_courses"]:
            profile["completed_courses"].append(course_id)
        profile["progress"]["total_courses_completed"] = len(
            profile["completed_courses"]
        )
        profile["updated_at"] = datetime.now().isoformat()
        return profile

    def add_skill(self, profile_id, skill, source="course"):
        profile = self.profiles.get(profile_id)
        if not profile:
            return None

        skill_entry = {
            "skill": skill,
            "acquired_at": datetime.now().isoformat(),
            "source": source,
            "level": "basic",
        }
        existing = [s for s in profile["current_skills"] if s.get("skill") == skill]
        if not existing:
            profile["current_skills"].append(skill_entry)
            if skill not in profile["progress"]["skills_acquired"]:
                profile["progress"]["skills_acquired"].append(skill)
        return profile

    def update_from_nlp(self, profile_id, nlp_result):
        """Update profile based on NLP analysis of user's natural language input."""
        profile = self.profiles.get(profile_id)
        if not profile:
            return None

        if nlp_result.get("domains"):
            for d in nlp_result["domains"][:3]:
                if d["domain"] not in profile["interests"]:
                    profile["interests"].append(d["domain"])

        if nlp_result.get("level"):
            profile["experience_level"] = nlp_result["level"]["level"]

        if nlp_result.get("skills_mentioned"):
            for skill in nlp_result["skills_mentioned"]:
                self.add_skill(profile_id, skill, source="self_reported")

        if nlp_result.get("goals"):
            for g in nlp_result["goals"]:
                if g["goal"] not in profile["career_goals"]:
                    profile["career_goals"].append(g["goal"])

        profile["updated_at"] = datetime.now().isoformat()
        return profile

    def get_skill_coverage(self, profile_id, target_domain):
        profile = self.profiles.get(profile_id)
        if not profile:
            return {}

        domain_info = self.domain_mappings.get("domains", {}).get(target_domain, {})
        current_skills = {s["skill"] for s in profile.get("current_skills", [])}

        courses = self._load_json("courses.json")
        required_skills = set()
        for course in courses:
            if course["domain"] == target_domain:
                required_skills.update(course.get("skills_taught", []))

        covered = current_skills & required_skills
        missing = required_skills - current_skills
        coverage = len(covered) / max(len(required_skills), 1)

        return {
            "domain": target_domain,
            "coverage": round(coverage, 2),
            "covered_skills": list(covered),
            "missing_skills": list(missing),
            "total_required": len(required_skills),
        }

    def get_profile_summary(self, profile_id):
        profile = self.profiles.get(profile_id)
        if not profile:
            return None

        return {
            "id": profile["id"],
            "name": profile["name"],
            "level": profile["experience_level"],
            "interests": profile["interests"],
            "skills_count": len(profile["current_skills"]),
            "courses_completed": profile["progress"]["total_courses_completed"],
            "career_goals": profile["career_goals"],
            "learning_style": profile["learning_style"],
            "time_commitment": profile["time_commitment"],
        }
