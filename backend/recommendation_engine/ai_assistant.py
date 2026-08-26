import json
import os
import random

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")


class AIAssistant:
    """Conversational AI assistant that explains recommendations and answers queries."""

    def __init__(self):
        self.courses = self._load_json("courses.json")
        self.course_map = {c["id"]: c for c in self.courses}
        self.context = {}

    def _load_json(self, filename):
        path = os.path.join(DATA_DIR, filename)
        with open(path, "r") as f:
            return json.load(f)

    def set_context(self, profile, learning_path=None, recommendations=None):
        self.context = {
            "profile": profile,
            "learning_path": learning_path,
            "recommendations": recommendations or [],
        }

    def process_query(self, query, profile=None, learning_path=None):
        """Process a user query and return a contextual response."""
        query_lower = query.lower().strip()
        if profile:
            self.context["profile"] = profile
        if learning_path:
            self.context["learning_path"] = learning_path

        intent = self._classify_intent(query_lower)

        response_handlers = {
            "greeting": self._handle_greeting,
            "goal_query": self._handle_goal_query,
            "recommendation_request": self._handle_recommendation_request,
            "course_explanation": self._handle_course_explanation,
            "progress_query": self._handle_progress_query,
            "next_step": self._handle_next_step,
            "skill_gap": self._handle_skill_gap,
            "help": self._handle_help,
            "feedback_positive": self._handle_feedback,
            "feedback_negative": self._handle_negative_feedback,
            "general": self._handle_general,
        }

        handler = response_handlers.get(intent, self._handle_general)
        return handler(query_lower)

    def _classify_intent(self, query):
        greeting_words = ["hello", "hi", "hey", "start", "begin"]
        if any(w in query for w in greeting_words):
            return "greeting"

        goal_words = ["goal", "want to", "aim", "target", "become", "dream", "career"]
        if any(w in query for w in goal_words):
            return "goal_query"

        rec_words = ["recommend", "suggest", "what should", "which course", "which path", "advice"]
        if any(w in query for w in rec_words):
            return "recommendation_request"

        explain_words = ["why", "explain", "reason", "because", "how does", "tell me about"]
        if any(w in query for w in explain_words):
            return "course_explanation"

        progress_words = ["progress", "how am i", "where am i", "status", "complete", "done"]
        if any(w in query for w in progress_words):
            return "progress_query"

        next_words = ["next", "what now", "after this", "what to do", "following"]
        if any(w in query for w in next_words):
            return "next_step"

        skill_words = ["skill", "gap", "missing", "don't know", "need to learn", "weak"]
        if any(w in query for w in skill_words):
            return "skill_gap"

        help_words = ["help", "what can you", "how to use", "guide"]
        if any(w in query for w in help_words):
            return "help"

        positive_words = ["thanks", "great", "good", "perfect", "awesome", "nice", "like it"]
        if any(w in query for w in positive_words):
            return "feedback_positive"

        negative_words = ["no", "not good", "bad", "wrong", "don't like", "change", "different"]
        if any(w in query for w in negative_words):
            return "feedback_negative"

        return "general"

    def _handle_greeting(self, query):
        profile = self.context.get("profile")
        name = profile.get("name", "there") if profile else "there"

        greetings = [
            f"Hello {name}! I'm your AI Learning Assistant. I help you find the best courses and create a personalized learning path. What would you like to learn today?",
            f"Hi {name}! Welcome to your learning journey. Tell me your goals and I'll create a roadmap just for you. What are you interested in?",
            f"Hey {name}! Ready to level up your skills? Share your learning goals and I'll recommend the perfect path forward.",
        ]
        return {
            "response": random.choice(greetings),
            "type": "greeting",
            "suggestions": [
                "I want to become a Data Scientist",
                "Help me learn Web Development",
                "What's the best path for Machine Learning?",
            ],
        }

    def _handle_goal_query(self, query):
        profile = self.context.get("profile")
        name = profile.get("name", "Learner") if profile else "Learner"

        if "data scientist" in query or "data science" in query:
            return {
                "response": f"Great choice, {name}! Data Science is a rewarding field. Based on your profile, here's what I recommend:\n\n"
                "1. Start with Python fundamentals if you haven't already\n"
                "2. Learn Data Analysis with pandas and NumPy\n"
                "3. Master Statistics and Data Visualization\n"
                "4. Progress to Machine Learning\n"
                "5. Specialize in Deep Learning or NLP\n\n"
                "Shall I create a detailed learning path for you?",
                "type": "goal_response",
                "suggested_domains": ["data_science", "machine_learning", "programming"],
            }

        if "web" in query or "full stack" in query or "frontend" in query or "backend" in query:
            return {
                "response": f"Web Development is a fantastic field, {name}! Here's my recommended path:\n\n"
                "1. HTML, CSS & JavaScript fundamentals\n"
                "2. Pick a framework (React recommended)\n"
                "3. Learn backend with Node.js\n"
                "4. Database design and SQL\n"
                "5. Build a full-stack capstone project\n\n"
                "Want me to generate a detailed roadmap?",
                "type": "goal_response",
                "suggested_domains": ["web_development", "programming"],
            }

        if "machine learning" in query or "ml" in query or "ai" in query:
            return {
                "response": f"Machine Learning/AI is transforming the world, {name}! Here's your roadmap:\n\n"
                "1. Python + Data Science foundations\n"
                "2. Machine Learning fundamentals (Andrew Ng's course)\n"
                "3. Deep Learning Specialization\n"
                "4. Choose a specialization (NLP, CV, or Reinforcement Learning)\n"
                "5. Build ML portfolio projects\n\n"
                "Shall I create your personalized path?",
                "type": "goal_response",
                "suggested_domains": ["machine_learning", "data_science"],
            }

        return {
            "response": f"Thanks for sharing your goal, {name}! I understand you're looking to grow. "
            "Could you tell me more specifically what field interests you? "
            "For example: Data Science, Web Development, Machine Learning, Cloud Computing, or Cybersecurity?",
            "type": "clarification",
            "suggestions": [
                "Data Science",
                "Web Development",
                "Machine Learning & AI",
                "Cloud Computing",
                "Cybersecurity",
            ],
        }

    def _handle_recommendation_request(self, query):
        profile = self.context.get("profile")
        recs = self.context.get("recommendations", [])

        if recs:
            response = "Based on your profile, here are my top recommendations:\n\n"
            for i, rec in enumerate(recs[:5], 1):
                course = rec.get("course", rec.get("project", {}))
                title = course.get("title", "Unknown")
                reason = rec.get("explanation", "Recommended for your learning path")
                response += f"{i}. **{title}**\n   Reason: {reason}\n\n"
            response += "Want me to explain why I recommended any of these courses?"
            return {
                "response": response,
                "type": "recommendations",
                "items": recs[:5],
            }

        return {
            "response": "I'd love to recommend courses for you! First, tell me:\n"
            "1. What field are you interested in?\n"
            "2. What's your current experience level?\n"
            "3. What's your end goal?\n\n"
            "This will help me create the perfect learning path for you.",
            "type": "request_info",
        }

    def _handle_course_explanation(self, query):
        profile = self.context.get("profile")
        recs = self.context.get("recommendations", [])

        for rec in recs:
            course = rec.get("course", {})
            title = course.get("title", "").lower()
            if any(word in query for word in title.split()):
                return {
                    "response": f"About **{course.get('title', 'this course')}**:\n\n"
                    f"{rec.get('explanation', 'This course is recommended based on your profile.')}\n\n"
                    f"**Duration:** {course.get('duration_hours', 'N/A')} hours\n"
                    f"**Level:** {course.get('level', 'N/A').title()}\n"
                    f"**Rating:** {course.get('rating', 'N/A')} / 5\n"
                    f"**Skills you'll learn:** {', '.join(course.get('skills_taught', []))}\n\n"
                    f"This course is part of the {course.get('domain', '').replace('_', ' ').title()} domain.",
                    "type": "course_explanation",
                    "course": course,
                }

        return {
            "response": "I'd be happy to explain a specific course! Which course from your recommendations would you like to know more about? You can ask about any course by name.",
            "type": "clarification",
        }

    def _handle_progress_query(self, query):
        profile = self.context.get("profile")
        if not profile:
            return {"response": "Please set up your profile first to track progress.", "type": "error"}

        progress = profile.get("progress", {})
        path = self.context.get("learning_path")

        response = f"Here's your learning progress summary:\n\n"
        response += f"Courses completed: {progress.get('total_courses_completed', 0)}\n"
        response += f"Skills acquired: {len(progress.get('skills_acquired', []))}\n"
        response += f"Milestones reached: {len(progress.get('milestones_reached', []))}\n\n"

        if path:
            phases = path.get("phases", [])
            total_courses = path.get("total_courses", 0)
            completed = progress.get("total_courses_completed", 0)
            pct = int((completed / max(total_courses, 1)) * 100)
            response += f"Learning Path Progress: {pct}% complete\n"
            response += f"Estimated time remaining: {max(0, path.get('estimated_weeks', 0))} weeks\n"

        if not progress.get("skills_acquired"):
            response += "\nYou're just getting started! Every expert was once a beginner. Keep going!"

        return {"response": response, "type": "progress", "progress": progress}

    def _handle_next_step(self, query):
        path = self.context.get("learning_path")
        profile = self.context.get("profile")
        completed = set(profile.get("completed_courses", [])) if profile else set()

        if path:
            for phase in path.get("phases", []):
                for course in phase.get("courses", []):
                    if not course.get("completed") and course["id"] not in completed:
                        return {
                            "response": f"Your next step is:\n\n"
                            f"**{course['title']}** ({course.get('domain', '').replace('_', ' ').title()})\n"
                            f"Duration: {course.get('duration_hours', 'N/A')} hours\n"
                            f"Level: {course.get('level', 'N/A').title()}\n"
                            f"Skills you'll gain: {', '.join(course.get('skills', [])[:3])}\n\n"
                            f"Start this course to continue your learning journey!",
                            "type": "next_step",
                            "course": course,
                        }

        return {
            "response": "Based on your profile, I recommend starting with the courses in your personalized learning path. "
            "Check your dashboard for the full roadmap!",
            "type": "suggestion",
        }

    def _handle_skill_gap(self, query):
        profile = self.context.get("profile")
        path = self.context.get("learning_path")

        if path:
            gaps = path.get("skill_gaps", [])
            if gaps:
                response = f"I've identified these skill gaps in your learning journey:\n\n"
                for i, gap in enumerate(gaps[:8], 1):
                    response += f"{i}. {gap.replace('_', ' ').title()}\n"
                response += "\nThe courses in your learning path are designed to fill these gaps. Follow the roadmap to build these skills systematically!"
                return {"response": response, "type": "skill_gaps", "gaps": gaps}

        return {
            "response": "Complete your learning path and the skill gaps will be addressed. "
            "The path generator has already identified which skills you need to develop!",
            "type": "suggestion",
        }

    def _handle_help(self, query):
        return {
            "response": "Here's what I can help you with:\n\n"
            "1. **Set Learning Goals** - Tell me what you want to learn and I'll create a roadmap\n"
            "2. **Get Recommendations** - Ask me to suggest courses, projects, or resources\n"
            "3. **Explain Recommendations** - Ask why I recommended a specific course\n"
            "4. **Track Progress** - Check how far you've come\n"
            "5. **Next Steps** - Find out what to learn next\n"
            "6. **Identify Skill Gaps** - See what skills you need to develop\n\n"
            "Just type your question or goal in natural language!",
            "type": "help",
            "suggestions": [
                "I want to learn Data Science",
                "What should I study next?",
                "Show my progress",
                "What skills am I missing?",
            ],
        }

    def _handle_feedback(self, query):
        responses = [
            "Thank you! I'm glad the recommendations are helpful. I'll keep refining them based on your preferences.",
            "Awesome! Your feedback helps me provide better recommendations. Keep learning!",
            "Great to hear! Feel free to ask if you need any adjustments to your learning path.",
        ]
        return {
            "response": random.choice(responses),
            "type": "feedback_acknowledgment",
            "sentiment": "positive",
        }

    def _handle_negative_feedback(self, query):
        return {
            "response": "I understand the recommendations might not be perfect. Could you tell me more specifically what you'd like changed? "
            "For example:\n"
            "- Different difficulty level?\n"
            "- Different domain or topic?\n"
            "- More practical projects?\n"
            "- Shorter courses?\n\n"
            "Your feedback helps me personalize your experience better!",
            "type": "feedback_request",
            "sentiment": "negative",
        }

    def _handle_general(self, query):
        profile = self.context.get("profile")
        name = profile.get("name", "there") if profile else "there"

        return {
            "response": f"I'm here to help with your learning journey, {name}! "
            "You can:\n"
            "- Tell me your learning goal\n"
            "- Ask for course recommendations\n"
            "- Check your progress\n"
            "- Ask why a course was recommended\n\n"
            "What would you like to do?",
            "type": "general",
            "suggestions": [
                "Recommend courses for me",
                "What's my next step?",
                "Show my learning path",
                "I need help",
            ],
        }

    def generate_onboarding_chat(self):
        return {
            "welcome_message": "Welcome to the AI-Powered Learning Path Recommender! "
            "I'll help you create a personalized learning roadmap. "
            "Let's start by understanding your goals.",
            "steps": [
                {
                    "question": "What field or career are you interested in?",
                    "field": "primary_interest",
                    "options": [
                        "Data Science & Analytics",
                        "Web Development",
                        "Machine Learning & AI",
                        "Cloud Computing & DevOps",
                        "Cybersecurity",
                        "Mobile Development",
                        "Software Engineering",
                    ],
                },
                {
                    "question": "What's your current experience level?",
                    "field": "experience_level",
                    "options": [
                        "Beginner (New to the field)",
                        "Intermediate (Some experience)",
                        "Advanced (Experienced professional)",
                    ],
                },
                {
                    "question": "How much time can you dedicate to learning per week?",
                    "field": "time_commitment",
                    "options": [
                        "Less than 5 hours",
                        "5-10 hours",
                        "10-20 hours",
                        "More than 20 hours",
                    ],
                },
                {
                    "question": "What's your primary goal?",
                    "field": "career_goal",
                    "options": [
                        "Career change to tech",
                        "Get a promotion",
                        "Start freelancing",
                        "Build personal projects",
                        "Academic/research",
                        "Just learning for fun",
                    ],
                },
            ],
        }
