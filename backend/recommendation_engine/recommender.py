import json
import os
import math
from collections import Counter

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class RecommendationEngine:
    """TF-IDF-like content-based recommendation engine for courses and projects."""

    def __init__(self):
        self.courses = self._load_json("courses.json")
        self.projects = self._load_json("projects.json")
        self.assessments = self._load_json("assessments.json")
        self.domain_mappings = self._load_json("domain_mappings.json")
        self._build_index()

    def _load_json(self, filename):
        path = os.path.join(DATA_DIR, filename)
        with open(path, "r") as f:
            return json.load(f)

    def _build_index(self):
        """Build inverted index and document frequencies for TF-IDF scoring."""
        self.doc_freq = Counter()
        self.course_vectors = {}
        all_docs = []

        for course in self.courses:
            tokens = self._tokenize_course(course)
            all_docs.append(tokens)
            unique_tokens = set(tokens)
            for token in unique_tokens:
                self.doc_freq[token] += 1

        for i, course in enumerate(self.courses):
            self.course_vectors[course["id"]] = self._compute_tfidf(
                all_docs[i], len(self.courses)
            )

        self.project_vectors = {}
        for project in self.projects:
            tokens = self._tokenize_project(project)
            self.project_vectors[project["id"]] = self._compute_tfidf(
                tokens, len(self.projects)
            )

    def _tokenize_course(self, course):
        tokens = []
        tokens.extend(course.get("domain", "").split("_"))
        tokens.extend(course.get("title", "").lower().split())
        tokens.extend(course.get("skills_taught", []))
        tokens.extend(course.get("tags", []))
        tokens.append(course.get("level", ""))
        return [t.lower() for t in tokens if t]

    def _tokenize_project(self, project):
        tokens = []
        tokens.extend(project.get("domain", "").split("_"))
        tokens.extend(project.get("title", "").lower().split())
        tokens.extend(project.get("skills_practiced", []))
        tokens.append(project.get("level", ""))
        return [t.lower() for t in tokens if t]

    def _compute_tfidf(self, tokens, total_docs):
        tf = Counter(tokens)
        max_tf = max(tf.values()) if tf else 1
        vector = {}
        for token, count in tf.items():
            tf_val = count / max_tf
            df = self.doc_freq.get(token, 1)
            idf = math.log(total_docs / df) + 1
            vector[token] = tf_val * idf
        return vector

    def _cosine_similarity(self, vec1, vec2):
        common = set(vec1.keys()) & set(vec2.keys())
        if not common:
            return 0.0
        dot = sum(vec1[k] * vec2[k] for k in common)
        mag1 = math.sqrt(sum(v ** 2 for v in vec1.values()))
        mag2 = math.sqrt(sum(v ** 2 for v in vec2.values()))
        if mag1 == 0 or mag2 == 0:
            return 0.0
        return dot / (mag1 * mag2)

    def _build_learner_vector(self, profile, nlp_result=None):
        tokens = []

        for interest in profile.get("interests", []):
            tokens.extend(interest.split("_"))

        for skill in profile.get("current_skills", []):
            if isinstance(skill, dict):
                tokens.append(skill.get("skill", ""))
            else:
                tokens.append(str(skill))

        tokens.append(profile.get("experience_level", "beginner"))

        for goal in profile.get("career_goals", []):
            tokens.extend(goal.split("_"))

        if nlp_result:
            for domain in nlp_result.get("domains", []):
                tokens.extend(domain.get("domain", "").split("_"))
                tokens.extend(domain.get("matched", []))
            for skill in nlp_result.get("skills_mentioned", []):
                tokens.append(skill)
            tokens.append(nlp_result.get("level", {}).get("level", ""))

        tokens = [t.lower() for t in tokens if t]

        tf = Counter(tokens)
        max_tf = max(tf.values()) if tf else 1
        vector = {}
        for token, count in tf.items():
            vector[token] = count / max_tf
        return vector

    def recommend_courses(self, profile, nlp_result=None, top_k=10):
        """Recommend courses based on learner profile and NLP analysis."""
        learner_vec = self._build_learner_vector(profile, nlp_result)
        completed = set(profile.get("completed_courses", []))
        scored = []

        for course in self.courses:
            if course["id"] in completed:
                continue

            sim = self._cosine_similarity(learner_vec, self.course_vectors[course["id"]])

            level_bonus = self._level_match_bonus(
                profile.get("experience_level", "beginner"), course["level"]
            )

            prereq_met = self._prerequisites_met(course, completed)

            final_score = (sim * 0.5) + (level_bonus * 0.25) + (prereq_met * 0.25)

            explanation = self._generate_explanation(
                course, profile, nlp_result, sim, level_bonus, prereq_met
            )

            scored.append({
                "course": course,
                "score": round(final_score, 4),
                "relevance": round(sim, 4),
                "level_match": round(level_bonus, 2),
                "prerequisites_met": bool(prereq_met),
                "explanation": explanation,
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def recommend_projects(self, profile, nlp_result=None, top_k=5):
        """Recommend projects based on skills to practice."""
        learner_vec = self._build_learner_vector(profile, nlp_result)
        completed = set(profile.get("completed_courses", []))
        scored = []

        for project in self.projects:
            sim = self._cosine_similarity(learner_vec, self.project_vectors[project["id"]])
            prereq_met = self._prerequisites_met(project, completed)

            scored.append({
                "project": project,
                "score": round((sim * 0.6) + (prereq_met * 0.4), 4),
                "relevance": round(sim, 4),
                "prerequisites_met": bool(prereq_met),
                "explanation": f"This project will help you practice {', '.join(project.get('skills_practiced', [])[:3])}. "
                + ("You have the prerequisites!" if prereq_met else "Complete recommended courses first."),
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def recommend_assessments(self, profile, top_k=3):
        """Recommend assessments to validate skills."""
        current_skills = set()
        for s in profile.get("current_skills", []):
            if isinstance(s, dict):
                current_skills.add(s.get("skill", ""))
            else:
                current_skills.add(str(s))

        scored = []
        for assess in self.assessments:
            overlap = len(set(assess.get("skills_assessed", [])) & current_skills)
            scored.append({
                "assessment": assess,
                "score": overlap / max(len(assess.get("skills_assessed", [])), 1),
                "explanation": f"Test your {', '.join(assess.get('skills_assessed', [])[:2])} skills.",
            })

        scored.sort(key=lambda x: x["score"], reverse=True)
        return scored[:top_k]

    def _level_match_bonus(self, user_level, course_level):
        levels = ["beginner", "intermediate", "advanced"]
        user_idx = levels.index(user_level) if user_level in levels else 0
        course_idx = levels.index(course_level) if course_level in levels else 0
        diff = abs(user_idx - course_idx)
        if diff == 0:
            return 1.0
        elif diff == 1:
            return 0.6
        return 0.2

    def _prerequisites_met(self, item, completed_ids):
        prereqs = item.get("prerequisites", [])
        if not prereqs:
            return 1.0
        met = sum(1 for p in prereqs if p in completed_ids)
        return met / len(prereqs)

    def _generate_explanation(self, course, profile, nlp_result, sim, level_bonus, prereq_met):
        reasons = []

        if sim > 0.3:
            reasons.append(
                f"This course matches your interests in {', '.join(profile.get('interests', [])[:2])}"
            )

        if level_bonus >= 0.9:
            reasons.append(f"It's well-matched to your {profile.get('experience_level', 'current')} level")
        elif level_bonus >= 0.6:
            reasons.append(f"It's slightly above your level — a good stretch goal")

        if prereq_met >= 0.9:
            reasons.append("You meet all prerequisites")
        elif prereq_met > 0:
            reasons.append("You meet most prerequisites")

        if nlp_result:
            for domain in nlp_result.get("domains", [])[:1]:
                if course["domain"] == domain["domain"]:
                    reasons.append(
                        f"Directly aligned with your goal in {domain['domain'].replace('_', ' ')}"
                    )

        if not reasons:
            reasons.append(f"Popular course with {course.get('rating', 0)} rating")

        return ". ".join(reasons) + "."
