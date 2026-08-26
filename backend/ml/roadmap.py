import json
import os
import csv
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class RoadmapGenerator:
    """Generates structured learning roadmaps with prerequisites and milestones."""

    def __init__(self):
        self.courses = self._load_courses()
        self.course_map = {c["course_id"]: c for c in self.courses}
        self.prereqs = self._load_json("prerequisites.json")
        self.skills_data = self._load_json("skills.json")
        self.career_paths = self._load_json("career_paths.json")

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

    def generate(self, profile, ranked_courses, target_career=None):
        completed = set(profile.get("completed_courses", []))
        level = profile.get("experience_level", "beginner")

        selected_ids = []
        for rec in ranked_courses[:15]:
            cid = rec.get("course_id", "")
            if cid not in completed:
                selected_ids.append(cid)

        ordered = self._topological_sort(selected_ids)
        phases = self._create_phases(ordered, completed, level)
        milestones = self._create_milestones(phases)
        skill_gaps = self._identify_skill_gaps(profile, ordered, target_career)

        total_hours = sum(
            int(self.course_map.get(cid, {}).get("duration_hours", 0))
            for cid in ordered
        )

        return {
            "phases": phases,
            "milestones": milestones,
            "skill_gaps": skill_gaps,
            "total_courses": len(ordered),
            "estimated_hours": total_hours,
            "estimated_weeks": max(1, total_hours // 10),
        }

    def _topological_sort(self, course_ids):
        cid_set = set(course_ids)
        prereq_map = self.prereqs.get("prerequisites", {})
        in_degree = defaultdict(int)
        adjacency = defaultdict(list)

        for cid in course_ids:
            if cid not in in_degree:
                in_degree[cid] = 0
            for prereq in prereq_map.get(cid, []):
                if prereq in cid_set:
                    adjacency[prereq].append(cid)
                    in_degree[cid] += 1

        queue = [cid for cid, deg in in_degree.items() if deg == 0]
        sorted_ids = []

        while queue:
            queue.sort()
            node = queue.pop(0)
            sorted_ids.append(node)
            for neighbor in adjacency[node]:
                in_degree[neighbor] -= 1
                if in_degree[neighbor] == 0:
                    queue.append(neighbor)

        for cid in course_ids:
            if cid not in sorted_ids:
                sorted_ids.append(cid)

        return sorted_ids

    def _create_phases(self, ordered_ids, completed, level):
        phases = []
        beginner = []
        intermediate = []
        advanced = []

        for cid in ordered_ids:
            course = self.course_map.get(cid, {})
            lvl = course.get("level", "beginner")
            if lvl == "beginner":
                beginner.append(cid)
            elif lvl == "intermediate":
                intermediate.append(cid)
            else:
                advanced.append(cid)

        if beginner:
            phases.append({
                "phase": 1,
                "name": "Foundation Building",
                "description": "Build strong fundamentals in your chosen domain",
                "courses": [self._course_step(cid, completed) for cid in beginner],
                "duration_weeks": max(1, sum(
                    int(self.course_map.get(c, {}).get("duration_hours", 0)) for c in beginner
                ) // 10),
            })

        if intermediate:
            phases.append({
                "phase": 2,
                "name": "Skill Development",
                "description": "Deepen your skills with intermediate-level courses and hands-on projects",
                "courses": [self._course_step(cid, completed) for cid in intermediate],
                "duration_weeks": max(1, sum(
                    int(self.course_map.get(c, {}).get("duration_hours", 0)) for c in intermediate
                ) // 10),
            })

        if advanced:
            phases.append({
                "phase": 3,
                "name": "Advanced Mastery",
                "description": "Master advanced topics and build portfolio-worthy projects",
                "courses": [self._course_step(cid, completed) for cid in advanced],
                "duration_weeks": max(1, sum(
                    int(self.course_map.get(c, {}).get("duration_hours", 0)) for c in advanced
                ) // 10),
            })

        return phases

    def _course_step(self, course_id, completed):
        course = self.course_map.get(course_id, {})
        skills = course.get("skills_taught", "").split("|")
        return {
            "course_id": course_id,
            "title": course.get("title", ""),
            "domain": course.get("domain", ""),
            "level": course.get("level", ""),
            "duration_hours": int(course.get("duration_hours", 0)),
            "provider": course.get("provider", ""),
            "skills": [s.strip() for s in skills if s.strip()],
            "completed": course_id in completed,
        }

    def _create_milestones(self, phases):
        milestones = []
        num = 1
        for phase in phases:
            courses = phase.get("courses", [])
            if courses:
                milestones.append({
                    "id": f"ms_{num}",
                    "title": f"Start {phase['name']}",
                    "description": f"Begin with {courses[0]['title']}",
                    "phase": phase["phase"],
                    "type": "start",
                })
                num += 1

            for c in courses:
                if c["level"] in ("intermediate", "advanced"):
                    milestones.append({
                        "id": f"ms_{num}",
                        "title": f"Complete: {c['title']}",
                        "description": f"Master {', '.join(c['skills'][:3])}",
                        "phase": phase["phase"],
                        "type": "completion",
                        "course_id": c["course_id"],
                    })
                    num += 1

        milestones.append({
            "id": f"ms_{num}",
            "title": "Path Complete!",
            "description": "You've completed your personalized learning journey!",
            "phase": len(phases),
            "type": "path_complete",
        })

        return milestones

    def _identify_skill_gaps(self, profile, ordered_ids, target_career=None):
        current = set()
        for s in profile.get("current_skills", []):
            if isinstance(s, dict):
                current.add(s.get("skill", ""))
            else:
                current.add(str(s))

        for cid in profile.get("completed_courses", []):
            skills = self.prereqs.get("course_to_skills", {}).get(cid, [])
            current.update(skills)

        required = set()
        for cid in ordered_ids:
            skills = self.prereqs.get("course_to_skills", {}).get(cid, [])
            required.update(skills)

        if target_career and target_career in self.career_paths.get("career_paths", {}):
            career = self.career_paths["career_paths"][target_career]
            required.update(career.get("required_skills", []))

        return list(required - current)
