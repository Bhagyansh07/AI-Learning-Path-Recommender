# Changelog

All notable changes to LearnPath AI are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [1.1.0] - 2026-08-31

### Added
- Chat now renders **real course recommendation cards** from the deterministic, client-side engine (gap analysis + 5-factor scoring) instead of relying solely on LLM text.
- 8 legal/policy pages are now **pre-rendered as static HTML** (SSG) so content loads correctly even without JavaScript.
- `getStaticPaths` + `getStaticProps` fixed for `/legal/[slug]` (previously returned an invalid shape and failed serialization).

### Fixed
- **Legal pages**: resolved 404 on all 8 policy pages (`/legal/privacy-policy`, `/legal/terms-of-service`, etc.).
- **Chat "Thinking..." hang**: course-recommendation requests no longer get stuck waiting on the LLM; they resolve instantly using the local recommendation engine.
- **Algorithm page**: corrected brace/token syntax in the displayed `topologicalSort()` code sample.
- **Lint**: removed `react-hooks/exhaustive-deps` warning in the chat `TypingText` component.
- **Duplicate config**: removed redundant `backend/render.yaml` (root `render.yaml` is canonical).

## [1.0.0] - 2026-08-28

### Added
- Skill Graph DAG (54 skills, 63 prerequisite edges, 8 career paths).
- Topological-sort learning path generation.
- 5-factor hybrid scoring engine.
- Gap analysis (set difference) for skill readiness.
- Onboarding + conversational AI assistant.
- Progress dashboard and learning-path views.
- 8 legal/policy pages.
- Public deployment on Vercel with GitHub Actions CI.

### Fixed (audit round, C1-C5 / M1-M5)
- `getLearningPath()` crash on missing profile fields.
- Chat path stats compatibility.
- Hardcoded "65 skills" replaced with dynamic count (now 54).
- Brand `theme-color` + favicon aligned to the accent orange.
- Gemini model name reconciled with the working deployed key.
- `skillToCourse()` now returns a `type` field.
- Algorithm sliders normalized to 100% and NaN-safe.
- Text contrast raised to WCAG AA.
- `/profile` added to the navbar.
- Chat height no longer overlaps the fixed navbar.

## [0.9.0] - 2026-07-15

### Added
- Initial prototype: single-engine client-side recommendation and onboarding flow.
