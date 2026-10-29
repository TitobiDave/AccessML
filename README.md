# AccessML

**Free, accessible machine learning education powered by open-weight AI models.**

> 🔗 **Live demo:** `ADD-YOUR-LIVE-LINK-HERE`
> 💻 **Repository:** https://github.com/TitobiDave/AccessML

---

## The Problem

Learning machine learning is expensive and hard to start. Quality courses are paywalled, setting up Python environments scares off beginners, and when learners get stuck there is rarely anyone to explain a bug or a concept in plain language. Many people, especially in regions with limited access to paid courses, tools and mentors, are locked out of AI skills.

## Our Solution

AccessML is a free, browser-based platform that removes those barriers:

- **Nothing to install.** Python and NumPy run directly in the browser, so learners can start coding immediately.
- **A guided path.** A roadmap takes learners from Python basics to supervised learning, deep learning and cutting-edge AI.
- **A tutor that is always available.** An AI Tutor answers questions in simple language, and an AI Mentor reads your code and output, then gives a hint first and the fix second.
- **Practice and proof.** Quizzes check understanding, and a certificate is awarded on completion.
- **Open-weight models.** The tutor runs on an open-weight model (`openai/gpt-oss-20b`), keeping the platform affordable to run and free to learners.

## Features

- **Roadmap**: visual learning path split into tracks (Python & NumPy, Supervised Learning, Deep Learning, Cutting-Edge AI) with progress tracking.
- **Lessons**: step-by-step lessons linked to related quizzes and labs.
- **Playground**: write and run Python in the browser with preset templates and a terminal output panel.
- **AI Mentor**: Socratic debugging help on your code (hint first, then the fix).
- **AI Tutor**: ask any ML or Python question from the header panel.
- **Quizzes**: multiple-choice quizzes with a configurable pass mark.
- **Certificate**: issued when the course is completed.
- **Progress and streaks**: completed lessons, percentage progress and daily streak.

## AI Models and Tools Used

| Purpose | Tool / Model |
| --- | --- |
| AI Tutor and AI Mentor | `openai/gpt-oss-20b` (open-weight) served through the **Groq API** (OpenAI-compatible) |
| In-browser Python | **Pyodide** (Python and NumPy compiled to WebAssembly) |
| Backend | **FastAPI** + Uvicorn |
| Database | **SQLite** via SQLAlchemy |
| Frontend | **React**, **Vite**, **Tailwind CSS**, lucide-react |

The Groq API key stays on the backend and is never exposed to the browser.

## How It Works

1. The learner opens a lesson or the Playground in the React frontend.
2. Python code runs locally in the browser through Pyodide.
3. When the learner asks the AI Tutor or AI Mentor for help, the frontend sends the question (or the code and output) to the FastAPI backend.
4. The backend adds a tutoring prompt, calls the open-weight model through Groq, and returns a short answer.

## Project Structure

```
AccessML/
├── backend/
│   ├── main.py              # App entry point: settings, DB, CORS, routers
│   ├── config.py            # Settings loaded from environment / .env
│   ├── database.py          # SQLAlchemy engine and session
│   ├── models.py            # Database tables
│   ├── schemas.py           # Request/response models
│   ├── seed_data.py         # Seeds lessons, quizzes and labs
│   ├── routers/             # users, lessons, quizzes, progress, certificates, tutor, lab
│   ├── services/            # tutor_service.py (talks to Groq)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    └── src/
        ├── App.jsx          # Header, tabs, AI Tutor panel
        ├── api.js           # Backend API calls
        ├── pages/           # Roadmap, Lessons, Playground, Quizzes, Certificate
        └── components/      # AIMentor, TutorPanel, SectionLab
```

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- A free [Groq](https://console.groq.com) API key

### 1. Clone the repository

```bash
git clone https://github.com/TitobiDave/AccessML.git
cd AccessML
```

### 2. Backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

Copy the example environment file and add your key (**never commit `.env`**):

```bash
# Windows
copy .env.example .env
# macOS / Linux
cp .env.example .env
```

```env
DATABASE_URL=sqlite:///./accessml.db
CORS_ORIGINS=["http://localhost:5173","http://localhost:5174"]

GROQ_API_KEY=your-groq-api-key-here
GROQ_MODEL=openai/gpt-oss-20b
GROQ_BASE_URL=https://api.groq.com/openai/v1

QUIZ_PASS_RATIO=0.7
REQUIRE_COMPLETION_FOR_CERTIFICATE=false
COURSE_TITLE=Supervised Machine Learning & Python Foundations
```

Start the server:

```bash
uvicorn main:app --reload
```

The API runs at http://127.0.0.1:8000 with interactive docs at http://127.0.0.1:8000/docs. Tables are created and seeded automatically on startup.

### 3. Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the URL Vite prints (usually http://localhost:5173).

## Configuration

| Variable | Description | Default |
| --- | --- | --- |
| `DATABASE_URL` | Database connection string | `sqlite:///./accessml.db` |
| `CORS_ORIGINS` | Frontend origins allowed to call the API | `["http://localhost:5173"]` |
| `GROQ_API_KEY` | Groq API key (server only) | none |
| `GROQ_MODEL` | Model used by the AI tutor | `openai/gpt-oss-20b` |
| `GROQ_BASE_URL` | Groq OpenAI-compatible base URL | `https://api.groq.com/openai/v1` |
| `QUIZ_PASS_RATIO` | Fraction of correct answers needed to pass | `0.7` |
| `REQUIRE_COMPLETION_FOR_CERTIFICATE` | Require all lessons before issuing a certificate | `false` |
| `COURSE_TITLE` | Title shown on the certificate | Supervised Machine Learning & Python Foundations |

## API Overview

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Health check |
| `POST` | `/api/tutor/ask` | Ask the AI tutor a question (`{"question": "...", "lesson_id": 0}`) |
| `POST` | `/api/tutor/debug` | Send code and output to the AI Mentor for debugging help |

Lessons, quizzes, progress, certificates, users and labs have their own routers. Full list at `/docs`.

## Troubleshooting

- **"Failed to fetch" in the AI Tutor panel:** usually CORS. Add the frontend port (5173 or 5174) to `CORS_ORIGINS` and restart the backend.
- **502 with "Invalid API Key":** the key in `backend/.env` is wrong or revoked. Update it and fully restart uvicorn (`--reload` does not re-read `.env`).
- **Push blocked by GitHub secret scanning:** never put a real key in `.env.example`.

## Team

| Name | Role |
| --- | --- |
| ADD NAME | ADD ROLE |
| ADD NAME | ADD ROLE |

## Future Improvements

- Add more lessons and labs across each track
- Support more languages for the AI Tutor
- Offline-friendly lessons for low-bandwidth users

## License

Add a license of your choice here (for example MIT).
