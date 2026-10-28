"""Course content that used to be hardcoded in the React pages. Seeded on first start."""
from sqlalchemy.orm import Session

from models import Lesson, Module, QuizQuestion, User


def seed(db: Session) -> None:
    if db.query(Module).first():
        return

    module = Module(id=3, title="Module 3: Supervised Learning & Linear Regression", order=3)
    module.lessons = [
        Lesson(
            number="3.2",
            title="Introduction to Supervised Learning",
            topic="Cost Function & Gradient Descent",
            duration_seconds=14 * 60 + 20,
            video_url=None,
            order=1,
            content={
                "summary": (
                    "Supervised learning involves training a model on labeled input/output data "
                    "pairs so it can predict outputs for unobserved inputs."
                ),
                "formula": "ŷ = w · X + b",
                "key_components": [
                    {"term": "Weights (w)", "description": "Slopes representing feature impact."},
                    {"term": "Bias (b)", "description": "Offset term shifting the decision boundary."},
                    {
                        "term": "Loss Function (MSE)",
                        "description": "Quantifies squared errors between actual target y and predicted ŷ.",
                    },
                ],
                "closing": (
                    "In the Code Lab, we will use Python and Scikit-Learn to fit a model to "
                    "dataset points automatically."
                ),
                "badges": [
                    "Mean Squared Error (MSE)",
                    "Gradient Descent Optimization",
                    "NumPy Feature Matrices",
                ],
            },
        )
    ]
    module.questions = [
        QuizQuestion(
            prompt="Which loss function is most commonly used for evaluating standard Linear Regression models?",
            options=["Cross-Entropy Loss", "Mean Squared Error (MSE)", "Binary Log-Loss", "Kullback-Leibler Divergence"],
            answer_index=1,
            order=1,
        ),
        QuizQuestion(
            prompt="What does the bias term (b) do in ŷ = w · X + b?",
            options=["Scales every feature", "Shifts the prediction up or down", "Measures the error", "Sets the learning rate"],
            answer_index=1,
            order=2,
        ),
        QuizQuestion(
            prompt="In gradient descent, which direction do the weights move at each step?",
            options=["Along the gradient", "Against the gradient", "Randomly", "Toward zero always"],
            answer_index=1,
            order=3,
        ),
    ]
    db.add(module)
    db.add(User(name="Alex Rivera"))  # demo learner (id 1) so the frontend works out of the box
    db.commit()