import os
import json
import csv
import joblib
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "saved_models")


class MLRecommender:
    """ML-based recommender using TF-IDF + LinearSVC with joblib persistence."""

    def __init__(self):
        self.vectorizer = None
        self.classifier = None
        self.course_vectors = None
        self.courses = []
        self.course_ids = []
        self.is_trained = False
        os.makedirs(MODEL_DIR, exist_ok=True)
        self._load_models()

    def _load_models(self):
        vec_path = os.path.join(MODEL_DIR, "vectorizer.joblib")
        clf_path = os.path.join(MODEL_DIR, "classifier.joblib")
        if os.path.exists(vec_path) and os.path.exists(clf_path):
            self.vectorizer = joblib.load(vec_path)
            self.classifier = joblib.load(clf_path)
            self.is_trained = True
        self._load_courses()

    def _load_courses(self):
        csv_path = os.path.join(DATA_DIR, "course_metadata.csv")
        if os.path.exists(csv_path):
            with open(csv_path, "r") as f:
                reader = csv.DictReader(f)
                self.courses = list(reader)
                self.course_ids = [c["course_id"] for c in self.courses]

    def _build_course_texts(self):
        texts = []
        for c in self.courses:
            parts = [
                c.get("title", ""),
                c.get("domain", "").replace("_", " "),
                c.get("description", ""),
                c.get("skills_taught", "").replace("|", " "),
                c.get("level", ""),
            ]
            texts.append(" ".join(parts).lower())
        return texts

    def train(self):
        csv_path = os.path.join(DATA_DIR, "course_metadata.csv")
        if not os.path.exists(csv_path):
            return {"status": "error", "message": "No training data found"}

        texts = self._build_course_texts()
        labels = self.course_ids

        if len(texts) < 2:
            return {"status": "error", "message": "Not enough courses for training"}

        self.vectorizer = TfidfVectorizer(
            max_features=5000,
            ngram_range=(1, 2),
            stop_words="english",
            sublinear_tf=True,
        )
        X = self.vectorizer.fit_transform(texts)

        if len(set(labels)) > 1:
            X_train, X_test, y_train, y_test = train_test_split(
                X, labels, test_size=0.2, random_state=42
            )
            self.classifier = LinearSVC(random_state=42, max_iter=1000)
            self.classifier.fit(X_train, y_train)
            y_pred = self.classifier.predict(X_test)
            report = classification_report(y_test, y_pred, output_dict=True, zero_division=0)
        else:
            self.classifier = LinearSVC(random_state=42, max_iter=1000)
            self.classifier.fit(X, labels)
            report = {"accuracy": 1.0}

        self.course_vectors = X
        self.is_trained = True

        joblib.dump(self.vectorizer, os.path.join(MODEL_DIR, "vectorizer.joblib"))
        joblib.dump(self.classifier, os.path.join(MODEL_DIR, "classifier.joblib"))

        return {
            "status": "trained",
            "courses": len(self.courses),
            "features": X.shape[1],
            "metrics": report,
        }

    def predict(self, text):
        if not self.is_trained or not self.vectorizer or not self.classifier:
            return []

        X = self.vectorizer.transform([text.lower()])
        try:
            decision = self.classifier.decision_function(X)[0]
            classes = self.classifier.classes_

            if len(decision.shape) if hasattr(decision, "shape") else 0:
                scores = list(decision)
            else:
                scores = [decision] if np.isscalar(decision) else list(decision)

            results = []
            for i, cid in enumerate(classes):
                score = float(scores[i]) if i < len(scores) else 0.0
                course = self._get_course(cid)
                if course:
                    results.append({
                        "course_id": cid,
                        "course": course,
                        "ml_score": round(score, 4),
                    })

            results.sort(key=lambda x: x["ml_score"], reverse=True)
            return results[:10]
        except Exception:
            return []

    def find_similar(self, text, top_k=5):
        if not self.is_trained or self.course_vectors is None or self.vectorizer is None:
            return []

        X = self.vectorizer.transform([text.lower()])
        similarities = cosine_similarity(X, self.course_vectors).flatten()
        top_indices = similarities.argsort()[::-1][:top_k]

        results = []
        for idx in top_indices:
            if idx < len(self.courses):
                results.append({
                    "course": self.courses[idx],
                    "similarity": round(float(similarities[idx]), 4),
                })
        return results

    def get_course_vector(self, course_id):
        if not self.is_trained or self.vectorizer is None:
            return None
        course = self._get_course(course_id)
        if not course:
            return None
        parts = [
            course.get("title", ""),
            course.get("domain", "").replace("_", " "),
            course.get("description", ""),
            course.get("skills_taught", "").replace("|", " "),
            course.get("level", ""),
        ]
        text = " ".join(parts).lower()
        return self.vectorizer.transform([text])

    def _get_course(self, course_id):
        for c in self.courses:
            if c["course_id"] == course_id:
                return c
        return None

    def model_info(self):
        return {
            "trained": self.is_trained,
            "courses": len(self.courses),
            "vectorizer": "TF-IDF" if self.vectorizer else None,
            "classifier": "LinearSVC" if self.classifier else None,
        }
