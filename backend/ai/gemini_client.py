import os
import json

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")


class GeminiClient:
    """Gemini API client with rule-based fallback."""

    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.available = bool(self.api_key)
        self._model = None

    def _get_model(self):
        if not self.available or self._model:
            return self._model
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel("gemini-pro")
            return self._model
        except ImportError:
            self.available = False
            return None
        except Exception:
            self.available = False
            return None

    def analyze_profile(self, text):
        model = self._get_model()
        if model:
            try:
                prompt = f"""Extract learning profile from this text. Return JSON with:
- interests: list of domains (e.g. data_science, web_development)
- experience_level: beginner/intermediate/advanced
- skills: list of mentioned skills
- goals: list of career goals

Text: {text}

Return ONLY valid JSON."""
                response = model.generate_content(prompt)
                return {"source": "gemini", "data": json.loads(response.text)}
            except Exception:
                pass
        return {"source": "fallback", "data": self._fallback_profile(text)}

    def explain_recommendation(self, course_title, user_profile, reason_context=""):
        model = self._get_model()
        if model:
            try:
                prompt = f"""Explain why this course is recommended for this learner in 2-3 sentences.

Course: {course_title}
User level: {user_profile.get('experience_level', 'unknown')}
User interests: {', '.join(user_profile.get('interests', []))}
Context: {reason_context}

Keep it concise and encouraging."""
                response = model.generate_content(prompt)
                return {"source": "gemini", "explanation": response.text}
            except Exception:
                pass
        return {"source": "fallback", "explanation": self._fallback_explanation(course_title, user_profile)}

    def chat(self, message, context=None):
        model = self._get_model()
        if model:
            try:
                context_str = ""
                if context:
                    context_str = f"User profile: level={context.get('level', 'unknown')}, interests={context.get('interests', [])}, skills={context.get('skills', [])}"
                prompt = f"""You are an AI learning assistant for a personalized learning path recommender.

{context_str}

User message: {message}

Respond helpfully about learning paths, courses, and career guidance. Keep response under 200 words."""
                response = model.generate_content(prompt)
                return {"source": "gemini", "response": response.text}
            except Exception:
                pass
        return {"source": "fallback", "response": self._fallback_chat(message)}

    def _fallback_profile(self, text):
        text_lower = text.lower()
        interests = []
        domain_keywords = {
            "data_science": ["data", "analytics", "statistics", "data science"],
            "machine_learning": ["machine learning", "ml", "ai", "artificial intelligence"],
            "web_development": ["web", "frontend", "backend", "fullstack", "react", "node"],
            "cloud_computing": ["cloud", "aws", "devops", "docker", "kubernetes"],
            "cybersecurity": ["security", "cyber", "hacking", "penetration"],
            "mobile_development": ["mobile", "android", "ios", "flutter", "app"],
            "programming": ["programming", "coding", "software", "developer"],
        }
        for domain, keywords in domain_keywords.items():
            if any(kw in text_lower for kw in keywords):
                interests.append(domain)

        level = "beginner"
        if any(w in text_lower for w in ["advanced", "experienced", "senior", "expert"]):
            level = "advanced"
        elif any(w in text_lower for w in ["intermediate", "some experience", "familiar", "know"]):
            level = "intermediate"

        skills = []
        skill_list = ["python", "javascript", "java", "html", "css", "react", "sql", "docker"]
        for s in skill_list:
            if s in text_lower:
                skills.append(s)

        goals = []
        if "data scientist" in text_lower:
            goals.append("data_scientist")
        if "full stack" in text_lower or "fullstack" in text_lower:
            goals.append("full_stack_developer")
        if "ml engineer" in text_lower:
            goals.append("ml_engineer")
        if "frontend" in text_lower:
            goals.append("frontend_developer")
        if "cloud" in text_lower:
            goals.append("cloud_engineer")

        return {
            "interests": interests,
            "experience_level": level,
            "skills": skills,
            "goals": goals,
        }

    def _fallback_explanation(self, course_title, profile):
        interests = profile.get("interests", [])
        level = profile.get("experience_level", "beginner")
        return (
            f"'{course_title}' is recommended because it aligns with your "
            f"{'interest in ' + interests[0] if interests else 'learning goals'} "
            f"and matches your {level} skill level. "
            f"This course will help you build the foundational knowledge needed for your career path."
        )

    def _fallback_chat(self, message):
        msg = message.lower()
        if any(w in msg for w in ["hello", "hi", "hey"]):
            return "Hello! I'm your AI learning assistant. Tell me your learning goals and I'll help you create a personalized roadmap."
        if any(w in msg for w in ["recommend", "suggest", "what should"]):
            return "I'd recommend starting with your profile setup. Once I know your skills and goals, I can suggest the best courses and learning path for you."
        if any(w in msg for w in ["next", "what now", "after"]):
            return "Check your learning path dashboard to see your next recommended course. The system adapts as you complete courses."
        if any(w in msg for w in ["skill", "gap", "missing"]):
            return "Your skill gap analysis shows which skills you need to develop for your target career. Focus on the high-priority skills first."
        return "I can help you with course recommendations, learning paths, skill gap analysis, and career guidance. What would you like to know?"
