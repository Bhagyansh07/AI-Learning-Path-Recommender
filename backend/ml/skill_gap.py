import json
import os

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class SkillGapAnalyzer:
    """Analyzes skill gaps between learner profile and career path requirements."""

    def __init__(self):
        self.skills_data = self._load_json("skills.json")
        self.career_paths = self._load_json("career_paths.json")
        self.course_skills = self._load_json("prerequisites.json")

    def _load_json(self, filename):
        path = os.path.join(DATA_DIR, filename)
        if os.path.exists(path):
            with open(path, "r") as f:
                return json.load(f)
        return {}

    def analyze(self, profile, target_career=None):
        current_skills = set()
        for s in profile.get("current_skills", []):
            if isinstance(s, dict):
                current_skills.add(s.get("skill", ""))
            else:
                current_skills.add(str(s))

        completed = set(profile.get("completed_courses", []))
        for cid in completed:
            course_skills = self.course_skills.get("course_to_skills", {}).get(cid, [])
            current_skills.update(course_skills)

        if target_career and target_career in self.career_paths.get("career_paths", {}):
            career = self.career_paths["career_paths"][target_career]
            return self._analyze_career(current_skills, career, target_career)

        best_match = None
        best_score = -1
        interests = set(profile.get("interests", []))

        for career_id, career in self.career_paths.get("career_paths", {}).items():
            required = set(career.get("required_skills", []))
            if required:
                overlap = len(current_skills & required)
                score = overlap / len(required)
                interest_bonus = 0.2 if any(
                    cat in interests
                    for cat in [career_id.split("_")[0], career_id.split("_")[-1]]
                ) else 0
                total = score + interest_bonus
                if total > best_score:
                    best_score = total
                    best_match = career_id

        if best_match:
            return self._analyze_career(
                current_skills,
                self.career_paths["career_paths"][best_match],
                best_match,
            )
        return {"error": "No matching career path found"}

    def _analyze_career(self, current_skills, career, career_id):
        required = set(career.get("required_skills", []))
        nice_to_have = set(career.get("nice_to_have", []))

        acquired = current_skills & required
        missing_required = required - current_skills
        missing_nice = nice_to_have - current_skills
        extra = current_skills - required - nice_to_have

        coverage = len(acquired) / max(len(required), 1)

        missing_with_info = []
        for skill in missing_required:
            skill_info = self.skills_data.get("skills", {}).get(skill, {})
            missing_with_info.append({
                "skill": skill,
                "category": skill_info.get("category", "unknown"),
                "level": skill_info.get("level", "unknown"),
                "demand": skill_info.get("demand_score", 0),
                "priority": "high",
                "related_courses": self._find_courses_for_skill(skill),
            })

        for skill in missing_nice:
            skill_info = self.skills_data.get("skills", {}).get(skill, {})
            missing_with_info.append({
                "skill": skill,
                "category": skill_info.get("category", "unknown"),
                "level": skill_info.get("level", "unknown"),
                "demand": skill_info.get("demand_score", 0),
                "priority": "medium",
                "related_courses": self._find_courses_for_skill(skill),
            })

        missing_with_info.sort(key=lambda x: (0 if x["priority"] == "high" else 1, -x["demand"]))

        readiness_score = round(coverage * 100)

        return {
            "career_path": career_id,
            "career_title": career.get("display_name", career_id),
            "description": career.get("description", ""),
            "avg_salary": career.get("avg_salary", "N/A"),
            "growth_rate": career.get("growth_rate", "N/A"),
            "readiness_score": readiness_score,
            "acquired_skills": list(acquired),
            "missing_skills": missing_with_info,
            "extra_skills": list(extra),
            "total_required": len(required),
            "total_acquired": len(acquired),
            "total_missing": len(missing_required),
            "coverage": round(coverage, 2),
        }

    def _find_courses_for_skill(self, skill):
        courses = []
        course_to_skills = self.course_skills.get("course_to_skills", {})
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "course_metadata.csv")

        if os.path.exists(csv_path):
            import csv
            with open(csv_path, "r") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    cid = row.get("course_id", "")
                    skills = course_to_skills.get(cid, [])
                    if not skills:
                        skills = row.get("skills_taught", "").split("|")
                    if skill in skills:
                        courses.append({
                            "course_id": cid,
                            "title": row.get("title", ""),
                            "level": row.get("level", ""),
                        })
        return courses[:3]

    def get_all_careers(self):
        careers = []
        for cid, career in self.career_paths.get("career_paths", {}).items():
            careers.append({
                "id": cid,
                "title": career.get("display_name", cid),
                "required_skills": career.get("required_skills", []),
                "description": career.get("description", ""),
                "avg_salary": career.get("avg_salary", "N/A"),
                "growth_rate": career.get("growth_rate", "N/A"),
            })
        return careers
