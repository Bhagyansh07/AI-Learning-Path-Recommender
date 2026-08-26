import json
import os
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class LearningPathGenerator:
    """Generates structured, ordered learning paths with milestones and dependencies."""

    def __init__(self):
        self.courses = self._load_json("courses.json")
        self.projects = self._load_json("projects.json")
        self.course_map = {c["id"]: c for c in self.courses}

    def _load_json(self, filename):
        path = os.path.join(DATA_DIR, filename)
        with open(path, "r") as f:
            return json.load(f)

    def generate_path(self, profile, recommended_courses, recommended_projects):
        """Generate a structured learning path from recommendations."""
        completed = set(profile.get("completed_courses", []))
        level = profile.get("experience_level", "beginner")

        selected_courses = []
        for rec in recommended_courses[:12]:
            course = rec["course"]
            if course["id"] not in completed:
                selected_courses.append(course)

        selected_projects = []
        for rec in recommended_projects[:4]:
            project = rec["project"]
            selected_projects.append(project)

        ordered = self._topological_sort(selected_courses)
        phases = self._create_phases(ordered, selected_projects, completed)

        milestones = self._create_milestones(phases)

        total_hours = sum(c.get("duration_hours", 0) for c in ordered)
        est_weeks = max(1, total_hours // 10)

        path = {
            "id": f"path_{profile.get('id', 'unknown')}",
            "target_level": self._next_level(level),
            "total_courses": len(ordered),
            "total_projects": len(selected_projects),
            "estimated_weeks": est_weeks,
            "estimated_hours": total_hours,
            "phases": phases,
            "milestones": milestones,
            "skill_gaps": self._identify_gaps(profile, ordered),
        }
        return path

    def _topological_sort(self, courses):
        """Order courses respecting prerequisite dependencies."""
        course_ids = {c["id"] for c in courses}
        in_degree = defaultdict(int)
        adjacency = defaultdict(list)

        for course in courses:
            cid = course["id"]
            if cid not in in_degree:
                in_degree[cid] = 0
            for prereq in course.get("prerequisites", []):
                if prereq in course_ids:
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

        return [self.course_map[cid] for cid in sorted_ids if cid in self.course_map]

    def _create_phases(self, ordered_courses, projects, completed):
        """Group courses into learning phases."""
        phases = []
        foundations = []
        skill_building = []
        advanced = []

        for course in ordered_courses:
            level = course.get("level", "beginner")
            if level == "beginner":
                foundations.append(course)
            elif level == "intermediate":
                skill_building.append(course)
            else:
                advanced.append(course)

        if foundations:
            phase_courses = []
            for c in foundations:
                phase_courses.append(self._course_to_step(c, completed))
            phases.append({
                "phase": 1,
                "name": "Foundation Building",
                "description": "Build strong fundamentals in your chosen domain",
                "courses": phase_courses,
                "duration_weeks": max(1, sum(c.get("duration_hours", 0) for c in foundations) // 10),
            })

        if skill_building:
            phase_courses = []
            for c in skill_building:
                phase_courses.append(self._course_to_step(c, completed))
            mid_projects = [p for p in projects if p.get("level") in ("beginner", "intermediate")]
            phase_projects = [self._project_to_step(p) for p in mid_projects[:2]]
            phases.append({
                "phase": 2,
                "name": "Skill Development",
                "description": "Deepen your skills with intermediate courses and hands-on projects",
                "courses": phase_courses,
                "projects": phase_projects,
                "duration_weeks": max(1, sum(c.get("duration_hours", 0) for c in skill_building) // 10),
            })

        if advanced:
            phase_courses = []
            for c in advanced:
                phase_courses.append(self._course_to_step(c, completed))
            adv_projects = [p for p in projects if p.get("level") == "advanced"]
            phase_projects = [self._project_to_step(p) for p in adv_projects[:2]]
            phases.append({
                "phase": 3,
                "name": "Advanced Mastery",
                "description": "Master advanced topics and build portfolio-worthy projects",
                "courses": phase_courses,
                "projects": phase_projects,
                "duration_weeks": max(1, sum(c.get("duration_hours", 0) for c in advanced) // 10),
            })

        return phases

    def _course_to_step(self, course, completed):
        return {
            "id": course["id"],
            "title": course["title"],
            "type": "course",
            "domain": course["domain"],
            "level": course["level"],
            "duration_hours": course.get("duration_hours", 0),
            "provider": course.get("provider", ""),
            "url": course.get("url", ""),
            "skills": course.get("skills_taught", []),
            "completed": course["id"] in completed,
            "milestone_type": course.get("milestone_type", "skill_building"),
            "prerequisites": course.get("prerequisites", []),
        }

    def _project_to_step(self, project):
        return {
            "id": project["id"],
            "title": project["title"],
            "type": "project",
            "domain": project["domain"],
            "level": project["level"],
            "duration_hours": project.get("duration_hours", 0),
            "skills": project.get("skills_practiced", []),
            "completed": False,
            "milestone_type": "hands_on",
            "prerequisites": project.get("prerequisites", []),
        }

    def _create_milestones(self, phases):
        milestones = []
        milestone_num = 1

        for phase in phases:
            courses = phase.get("courses", [])
            if courses:
                first = courses[0]
                milestones.append({
                    "id": f"ms_{milestone_num}",
                    "title": f"Start {phase['name']}",
                    "description": f"Begin with {first['title']}",
                    "phase": phase["phase"],
                    "type": "start",
                    "position": 0,
                })
                milestone_num += 1

            foundation_courses = [c for c in courses if c.get("milestone_type") == "milestone"]
            for mc in foundation_courses:
                milestones.append({
                    "id": f"ms_{milestone_num}",
                    "title": f"Complete: {mc['title']}",
                    "description": f"Master {', '.join(mc.get('skills', [])[:3])}",
                    "phase": phase["phase"],
                    "type": "course_completion",
                    "course_id": mc["id"],
                    "position": courses.index(mc),
                })
                milestone_num += 1

            projects = phase.get("projects", [])
            for proj in projects:
                milestones.append({
                    "id": f"ms_{milestone_num}",
                    "title": f"Build: {proj['title']}",
                    "description": f"Apply your skills in a real project",
                    "phase": phase["phase"],
                    "type": "project_completion",
                    "project_id": proj["id"],
                    "position": len(courses) + projects.index(proj),
                })
                milestone_num += 1

        milestones.append({
            "id": f"ms_{milestone_num}",
            "title": "Path Complete!",
            "description": "You've completed your personalized learning journey!",
            "phase": len(phases),
            "type": "path_complete",
            "position": 999,
        })

        return milestones

    def _identify_gaps(self, profile, courses):
        current = set()
        for s in profile.get("current_skills", []):
            if isinstance(s, dict):
                current.add(s.get("skill", ""))
            else:
                current.add(str(s))

        required = set()
        for c in courses:
            required.update(c.get("skills_taught", []))

        return list(required - current)

    def _next_level(self, current):
        levels = {"beginner": "intermediate", "intermediate": "advanced", "advanced": "expert"}
        return levels.get(current, "intermediate")
