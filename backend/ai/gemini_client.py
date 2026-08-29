import os
import json
import time
from functools import wraps

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")

gemini_rate_store = {}
GEMINI_RATE_LIMIT = 10
GEMINI_RATE_WINDOW = 60


def gemini_rate_limit(f):
    @wraps(f)
    def decorated(self, *args, **kwargs):
        now = time.time()
        key = "gemini_calls"
        if key not in gemini_rate_store:
            gemini_rate_store[key] = []
        gemini_rate_store[key] = [t for t in gemini_rate_store[key] if now - t < GEMINI_RATE_WINDOW]
        if len(gemini_rate_store[key]) >= GEMINI_RATE_LIMIT:
            return self._fallback(*args, **kwargs) if hasattr(self, '_fallback') else {"source": "rate_limited", "response": "Too many AI requests. Please wait a moment."}
        gemini_rate_store[key].append(now)
        return f(self, *args, **kwargs)
    return decorated


class GeminiClient:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        self.available = bool(self.api_key)
        self._model = None

    def _get_model(self):
        if not self.available:
            return None
        if self._model is not None:
            return self._model
        try:
            import google.generativeai as genai
            genai.configure(api_key=self.api_key)
            self._model = genai.GenerativeModel("gemini-1.5-flash")
            return self._model
        except ImportError:
            self.available = False
            return None
        except Exception:
            self.available = False
            return None

    @gemini_rate_limit
    def analyze_profile(self, text):
        model = self._get_model()
        if model:
            try:
                prompt = f"""Extract a learning profile from this text. Return ONLY valid JSON (no markdown, no backticks) with these fields:
- interests: array of domain strings like "data_science", "web_development", "machine_learning", "cloud_computing", "cybersecurity", "mobile_development", "programming"
- experience_level: one of "beginner", "intermediate", "advanced"
- skills: array of mentioned technical skills
- goals: array of career goals

Text: "{text}"

JSON:"""
                response = model.generate_content(prompt, generation_config={"temperature": 0.3})
                raw = response.text.strip()
                if raw.startswith("```"):
                    raw = raw.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
                return {"source": "gemini", "data": json.loads(raw)}
            except json.JSONDecodeError:
                return {"source": "gemini_parse_error", "data": self._fallback_profile(text)}
            except Exception as e:
                return {"source": "gemini_error", "data": self._fallback_profile(text), "error": str(e)}
        return {"source": "fallback", "data": self._fallback_profile(text)}

    @gemini_rate_limit
    def explain_recommendation(self, course_title, user_profile, reason_context=""):
        model = self._get_model()
        if model:
            try:
                level = user_profile.get("experience_level", "unknown")
                interests = ", ".join(user_profile.get("interests", []))
                prompt = f"""Explain why this course is recommended for this learner. Be concise (2-3 sentences max). Be encouraging and specific.

Course: {course_title}
Learner level: {level}
Learner interests: {interests}
Context: {reason_context}

Explanation:"""
                response = model.generate_content(prompt, generation_config={"temperature": 0.5})
                return {"source": "gemini", "explanation": response.text.strip()}
            except Exception:
                pass
        return {"source": "fallback", "explanation": self._fallback_explanation(course_title, user_profile)}

    @gemini_rate_limit
    def chat(self, message, context=None):
        model = self._get_model()
        if model:
            try:
                context_str = ""
                if context:
                    context_str = f"\nLearner profile: level={context.get('level', 'unknown')}, interests={context.get('interests', [])}, skills={context.get('skills', [])}"

                prompt = f"""You are LearnPath AI, a friendly and knowledgeable learning assistant for a personalized course recommendation platform.

Your job is to:
1. Help learners understand what to study next
2. Recommend courses and learning paths
3. Explain skill gaps and how to fill them
4. Answer questions about tech careers and learning
{context_str}

Rules:
- Be concise (2-3 sentences max per response)
- Be encouraging and helpful
- If recommending something, explain why briefly
- Use simple, friendly language

User: {message}

AI:"""
                response = model.generate_content(prompt, generation_config={"temperature": 0.7, "max_output_tokens": 200})
                return {"source": "gemini", "response": response.text.strip()}
            except Exception:
                pass
        return {"source": "fallback", "response": self._fallback_chat(message)}

    def _fallback_profile(self, text):
        text_lower = text.lower()
        interests = []
        domain_keywords = {
            "data_science": ["data", "analytics", "statistics", "data science"],
            "machine_learning": ["machine learning", "ml", "ai", "artificial intelligence", "deep learning", "neural"],
            "web_development": ["web", "frontend", "backend", "fullstack", "react", "node", "javascript", "html", "css"],
            "cloud_computing": ["cloud", "aws", "devops", "docker", "kubernetes", "azure", "gcp"],
            "cybersecurity": ["security", "cyber", "hacking", "penetration", "network security"],
            "mobile_development": ["mobile", "android", "ios", "flutter", "app", "swift", "kotlin"],
            "programming": ["programming", "coding", "software", "developer", "python", "java", "c++"],
        }
        for domain, keywords in domain_keywords.items():
            if any(kw in text_lower for kw in keywords):
                interests.append(domain)

        level = "beginner"
        if any(w in text_lower for w in ["advanced", "experienced", "senior", "expert", "5+ year", "10+ year"]):
            level = "advanced"
        elif any(w in text_lower for w in ["intermediate", "some experience", "familiar", "know", "1 year", "2 year"]):
            level = "intermediate"

        skills = []
        skill_list = ["python", "javascript", "java", "html", "css", "react", "sql", "docker", "aws", "git", "node", "typescript", "mongodb", "linux"]
        for s in skill_list:
            if s in text_lower:
                skills.append(s)

        goals = []
        goal_keywords = {
            "data_scientist": ["data scientist", "data science"],
            "full_stack_developer": ["full stack", "fullstack", "full-stack"],
            "ml_engineer": ["ml engineer", "machine learning engineer"],
            "frontend_developer": ["frontend", "front-end", "ui developer"],
            "backend_developer": ["backend", "back-end", "server side"],
            "cloud_engineer": ["cloud engineer", "devops engineer", "cloud architect"],
            "mobile_developer": ["mobile developer", "app developer", "android developer", "ios developer"],
            "cybersecurity_analyst": ["cybersecurity", "security analyst", "ethical hacker"],
        }
        for goal, keywords in goal_keywords.items():
            if any(kw in text_lower for kw in keywords):
                goals.append(goal)

        if not interests:
            interests = ["programming"]
        if not goals:
            goals = ["software_developer"]

        return {
            "interests": interests,
            "experience_level": level,
            "skills": skills,
            "goals": goals,
        }

    def _fallback_explanation(self, course_title, profile):
        interests = profile.get("interests", [])
        level = profile.get("experience_level", "beginner")
        interest_text = interests[0].replace("_", " ") if interests else "your field"
        return (
            f"'{course_title}' is a great fit for you! "
            f"It aligns with your interest in {interest_text} and matches your {level} skill level. "
            f"This course will help you build practical skills that are in high demand in the industry."
        )

    def _fallback_chat(self, message):
        msg = message.lower()
        if any(w in msg for w in ["hello", "hi", "hey", "namaste"]):
            return "Hello! I'm LearnPath AI, your personal learning assistant. Tell me about your career goals and I'll help you create a personalized learning roadmap!"
        if any(w in msg for w in ["recommend", "suggest", "what should", "which course"]):
            return "To give you the best recommendations, I need to know your current skills, experience level, and career goals. You can set up your profile through the onboarding process, and I'll suggest courses tailored just for you!"
        if any(w in msg for w in ["next", "what now", "after", "then what"]):
            return "Check your Learning Path page to see your next recommended course! The system dynamically adjusts recommendations as you complete courses and acquire new skills."
        if any(w in msg for w in ["skill", "gap", "missing", "don't know"]):
            return "Head to the Dashboard and check the 'Skills' tab. It shows your acquired skills and the gaps to fill for your target career. Focus on high-priority skills first for maximum career impact!"
        if any(w in msg for w in ["career", "job", "salary", "hiring"]):
            return "Our system maps courses to specific career paths with salary data and growth rates. Complete the onboarding to see which careers match your interests and current skill level!"
        if any(w in msg for w in ["project", "portfolio", "build"]):
            return "Great question! The learning path includes hands-on projects at each phase. These projects build your portfolio and give you practical experience that employers look for!"
        if any(w in msg for w in ["thank", "thanks", "appreciate"]):
            return "You're welcome! I'm here to help you on your learning journey. Feel free to ask anything else!"
        return "I can help you with course recommendations, learning paths, skill gap analysis, career guidance, and project suggestions. What would you like to know? You can also set up your profile through the AI Assistant for personalized recommendations!"
