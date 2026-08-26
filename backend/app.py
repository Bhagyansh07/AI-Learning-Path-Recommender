import os
import json
from flask import Flask, request, jsonify
from flask_cors import CORS

from ml import MLRecommender, SkillGapAnalyzer, HybridScorer, RoadmapGenerator
from ai import GeminiClient

app = Flask(__name__)
CORS(app)

ml_recommender = MLRecommender()
skill_gap = SkillGapAnalyzer()
scorer = HybridScorer()
roadmap_gen = RoadmapGenerator()
gemini = GeminiClient()

learner_profiles = {}


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ok",
        "message": "AI Learning Path Recommender API",
        "ml_model": ml_recommender.model_info(),
        "gemini": gemini.available,
    })


@app.route("/api/train", methods=["POST"])
def train_model():
    result = ml_recommender.train()
    return jsonify(result)


@app.route("/api/onboarding", methods=["GET"])
def get_onboarding():
    return jsonify({
        "welcome_message": "Welcome to the AI-Powered Learning Path Recommender! Tell me about your learning goals.",
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
    })


@app.route("/api/profile/create", methods=["POST"])
def create_profile():
    data = request.json
    profile_id = str(len(learner_profiles) + 1).zfill(4)
    profile = {
        "id": profile_id,
        "name": data.get("name", "Learner"),
        "experience_level": data.get("experience_level", "beginner"),
        "interests": data.get("interests", []),
        "current_skills": [{"skill": s} for s in data.get("current_skills", [])],
        "completed_courses": data.get("completed_courses", []),
        "career_goals": data.get("career_goals", []),
        "time_commitment": data.get("time_commitment", "5-10 hours"),
        "learning_style": data.get("learning_style", "visual"),
        "progress": {
            "total_courses_completed": 0,
            "total_hours_learned": 0,
            "skills_acquired": [],
        },
    }
    learner_profiles[profile_id] = profile
    return jsonify({"profile": profile})


@app.route("/api/profile/<profile_id>", methods=["GET"])
def get_profile(profile_id):
    profile = learner_profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    return jsonify({"profile": profile})


@app.route("/api/profile/<profile_id>", methods=["PUT"])
def update_profile(profile_id):
    profile = learner_profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404
    data = request.json
    for key, value in data.items():
        if key not in ("id",):
            profile[key] = value
    return jsonify({"profile": profile})


@app.route("/api/analyze", methods=["POST"])
def analyze_input():
    data = request.json
    text = data.get("text", "")
    result = gemini.analyze_profile(text)
    return jsonify(result)


@app.route("/api/recommend/<profile_id>", methods=["GET"])
def get_recommendations(profile_id):
    profile = learner_profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    text = " ".join([
        " ".join(profile.get("interests", [])),
        profile.get("experience_level", ""),
        " ".join(profile.get("career_goals", [])),
    ])

    ml_results = ml_recommender.predict(text)
    similar = ml_recommender.find_similar(text, top_k=5)

    ranked = scorer.rank_courses(profile, ml_results, top_k=10)

    return jsonify({
        "courses": ranked,
        "ml_predictions": ml_results[:5],
        "similar_courses": similar,
        "ml_model_info": ml_recommender.model_info(),
    })


@app.route("/api/path/<profile_id>", methods=["GET"])
def get_learning_path(profile_id):
    profile = learner_profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    text = " ".join([
        " ".join(profile.get("interests", [])),
        profile.get("experience_level", ""),
        " ".join(profile.get("career_goals", [])),
    ])

    ml_results = ml_recommender.predict(text)
    ranked = scorer.rank_courses(profile, ml_results, top_k=15)

    target_career = None
    goals = profile.get("career_goals", [])
    if goals:
        goal_text = " ".join(goals).lower().replace(" ", "_")
        for career_id in skill_gap.career_paths.get("career_paths", {}).keys():
            if goal_text in career_id or any(w in career_id for w in goal_text.split("_")):
                target_career = career_id
                break

    path = roadmap_gen.generate(profile, ranked, target_career)
    return jsonify({"learning_path": path})


@app.route("/api/skill-gaps/<profile_id>", methods=["GET"])
def get_skill_gaps(profile_id):
    profile = learner_profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    target_career = request.args.get("career", None)
    analysis = skill_gap.analyze(profile, target_career)
    return jsonify(analysis)


@app.route("/api/careers", methods=["GET"])
def get_careers():
    return jsonify(skill_gap.get_all_careers())


@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json
    message = data.get("message", "")
    profile_id = data.get("profile_id")

    context = None
    if profile_id and profile_id in learner_profiles:
        profile = learner_profiles[profile_id]
        context = {
            "level": profile.get("experience_level", "unknown"),
            "interests": profile.get("interests", []),
            "skills": [s.get("skill", "") if isinstance(s, dict) else str(s)
                       for s in profile.get("current_skills", [])],
        }

    response = gemini.chat(message, context)
    return jsonify(response)


@app.route("/api/progress/<profile_id>", methods=["POST"])
def update_progress(profile_id):
    profile = learner_profiles.get(profile_id)
    if not profile:
        return jsonify({"error": "Profile not found"}), 404

    data = request.json
    action = data.get("action")

    if action == "complete_course":
        course_id = data.get("course_id")
        if course_id and course_id not in profile["completed_courses"]:
            profile["completed_courses"].append(course_id)
            profile["progress"]["total_courses_completed"] = len(profile["completed_courses"])

    return jsonify({"profile": profile, "message": "Progress updated"})


@app.route("/api/explain/<course_id>", methods=["POST"])
def explain_course(course_id):
    data = request.json
    profile_id = data.get("profile_id")

    course = None
    for c in ml_recommender.courses:
        if c.get("course_id") == course_id:
            course = c
            break

    if not course:
        return jsonify({"error": "Course not found"}), 404

    profile = learner_profiles.get(profile_id) if profile_id else None

    explanation = gemini.explain_recommendation(
        course.get("title", ""),
        profile or {},
        f"Domain: {course.get('domain')}, Level: {course.get('level')}",
    )

    return jsonify({
        "course": course,
        "explanation": explanation,
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(debug=True, port=port, host="0.0.0.0")
