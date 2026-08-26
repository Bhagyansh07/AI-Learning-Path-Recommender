import re
from collections import Counter


class NLPProcessor:
    """Lightweight NLP processor for understanding learner goals from natural language."""

    DOMAIN_KEYWORDS = {
        "web_development": [
            "web", "website", "frontend", "backend", "full stack", "fullstack",
            "html", "css", "javascript", "react", "angular", "vue", "node",
            "express", "django", "flask", "api", "rest", "webapp", "web app",
            "web application", "responsive", "ui", "ux",
        ],
        "data_science": [
            "data", "data science", "data scientist", "analytics", "statistics",
            "visualization", "pandas", "numpy", "matplotlib", "tableau",
            "sql", "database", "etl", "data analysis", "big data",
        ],
        "machine_learning": [
            "machine learning", "ml", "ai", "artificial intelligence",
            "deep learning", "neural network", "nlp", "natural language",
            "computer vision", "tensorflow", "pytorch", "model", "prediction",
            "classification", "regression", "clustering", "reinforcement learning",
        ],
        "programming": [
            "programming", "coding", "code", "developer", "software",
            "python", "java", "c++", "javascript", "golang", "rust",
            "software engineering", "algorithm", "data structure",
        ],
        "cloud_computing": [
            "cloud", "aws", "azure", "gcp", "devops", "docker", "kubernetes",
            "ci/cd", "terraform", "infrastructure", "deployment", "sre",
            "microservices", "serverless", "container",
        ],
        "cybersecurity": [
            "cybersecurity", "security", "hacking", "penetration testing",
            "network security", "cryptography", "firewall", "encryption",
            "vulnerability", "ethical hacking", "infosec",
        ],
        "mobile_development": [
            "mobile", "android", "ios", "app", "flutter", "react native",
            "swift", "kotlin", "mobile app", "cross-platform",
        ],
        "artificial_intelligence": [
            "artificial intelligence", "ai", "chatbot", "recommendation",
            "automation", "intelligent", "smart",
        ],
        "data_management": [
            "database", "sql", "nosql", "mongodb", "postgresql", "mysql",
            "redis", "data modeling", "data architecture", "etl",
        ],
        "computer_science": [
            "computer science", "algorithms", "data structures", "theory",
            "computational", "complexity", "discrete math",
        ],
    }

    LEVEL_INDICATORS = {
        "beginner": [
            "beginner", "start", "starting", "new", "fresh", "intro",
            "introduction", "basics", "fundamentals", "learn", "no experience",
            "zero", "newbie", "noob", "first time", "just started", "basic",
            "never", "new to", "no knowledge", "complete beginner",
        ],
        "intermediate": [
            "intermediate", "some experience", "know a bit", "familiar",
            "used before", "worked with", "comfortable", "know basics",
            "already know", "have some", "moderate", "growing",
        ],
        "advanced": [
            "advanced", "expert", "experienced", "senior", "master",
            "deep knowledge", "years of experience", "professional",
            "proficient", "specialize", "advanced level", "want to master",
        ],
    }

    GOAL_KEYWORDS = {
        "career_change": [
            "career change", "switch career", "new career", "job change",
            "transition", "pivot", "new field", "change field",
        ],
        "upskill": [
            "upskill", "upskill", "improve", "enhance", "level up",
            "get better", "grow", "advance", "promotion", "raise",
        ],
        "freelance": [
            "freelance", "freelancer", "independent", "own business",
            "startup", "entrepreneur", "self-employed", "client",
        ],
        "academic": [
            "academic", "research", "thesis", "phd", "degree",
            "university", "college", "paper", "publication",
        ],
        "project": [
            "project", "build", "create", "make", "develop",
            "portfolio", "personal project", "side project",
        ],
        "certification": [
            "certification", "certified", "certificate", "exam",
            "credential", "badge", "qualification",
        ],
    }

    def __init__(self):
        self.skill_aliases = {
            "js": "javascript",
            "ts": "typescript",
            "py": "python",
            "ml": "machine_learning",
            "dl": "deep_learning",
            "ds": "data_science",
            "ai": "artificial_intelligence",
            "cs": "computer_science",
            "react.js": "react",
            "reactjs": "react",
            "node.js": "nodejs",
            "nodejs": "nodejs",
            "c sharp": "csharp",
            "c#": "csharp",
        }

    def process(self, text):
        """Main processing pipeline: extract domains, level, goals, and skills."""
        cleaned = self._clean_text(text)
        domains = self._extract_domains(cleaned)
        level = self._extract_level(cleaned)
        goals = self._extract_goals(cleaned)
        skills_mentioned = self._extract_skills(cleaned)

        return {
            "original_text": text,
            "cleaned_text": cleaned,
            "domains": domains,
            "level": level,
            "goals": goals,
            "skills_mentioned": skills_mentioned,
            "confidence": self._calculate_confidence(domains, level, goals),
        }

    def _clean_text(self, text):
        text = text.lower().strip()
        text = re.sub(r"[^\w\s]", " ", text)
        text = re.sub(r"\s+", " ", text)
        return text

    def _extract_domains(self, text):
        domain_scores = {}
        for domain, keywords in self.DOMAIN_KEYWORDS.items():
            score = 0
            matched_keywords = []
            for kw in keywords:
                if kw in text:
                    score += 1
                    matched_keywords.append(kw)
            if score > 0:
                domain_scores[domain] = {
                    "score": score,
                    "matched_keywords": matched_keywords,
                }

        sorted_domains = sorted(
            domain_scores.items(), key=lambda x: x[1]["score"], reverse=True
        )
        return [
            {"domain": d[0], "confidence": d[1]["score"] / 5.0, "matched": d[1]["matched_keywords"]}
            for d in sorted_domains
        ]

    def _extract_level(self, text):
        level_scores = {}
        for level, indicators in self.LEVEL_INDICATORS.items():
            score = sum(1 for ind in indicators if ind in text)
            if score > 0:
                level_scores[level] = score

        if not level_scores:
            return {"level": "beginner", "confidence": 0.3}

        best = max(level_scores, key=level_scores.get)
        confidence = min(level_scores[best] / 3.0, 1.0)
        return {"level": best, "confidence": confidence}

    def _extract_goals(self, text):
        goal_scores = {}
        for goal, keywords in self.GOAL_KEYWORDS.items():
            matched = [kw for kw in keywords if kw in text]
            if matched:
                goal_scores[goal] = matched

        return [
            {"goal": g, "keywords": kw_list}
            for g, kw_list in goal_scores.items()
        ]

    def _extract_skills(self, text):
        words = text.split()
        found_skills = set()

        for word in words:
            if word in self.skill_aliases:
                found_skills.add(self.skill_aliases[word])

        all_skills = [
            "python", "javascript", "java", "c++", "c#", "go", "rust",
            "html", "css", "react", "angular", "vue", "nodejs", "express",
            "django", "flask", "sql", "mongodb", "postgresql",
            "tensorflow", "pytorch", "scikit-learn", "pandas", "numpy",
            "docker", "kubernetes", "aws", "azure", "gcp",
            "machine_learning", "deep_learning", "data_science",
            "nlp", "computer_vision", "data_analysis", "data_visualization",
            "algorithms", "data_structures", "git", "linux",
        ]

        for skill in all_skills:
            if skill.replace("_", " ") in text or skill in text:
                found_skills.add(skill)

        return list(found_skills)

    def _calculate_confidence(self, domains, level, goals):
        scores = []
        if domains:
            scores.append(min(len(domains) * 0.3, 1.0))
        if level.get("confidence", 0) > 0:
            scores.append(level["confidence"])
        if goals:
            scores.append(min(len(goals) * 0.4, 1.0))
        return sum(scores) / max(len(scores), 1) if scores else 0.2
