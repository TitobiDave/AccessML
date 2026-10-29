"""Talks to Groq on the server so the API key never ships to the browser."""
import httpx
from fastapi import HTTPException

from config import settings

DEBUG_PROMPT = (
    "You are a Socratic ML tutor. Find bugs in the Python code, "
    "give a short hint first, then the fix."
)
ASK_PROMPT = (
    "You are a friendly machine-learning tutor for beginners. Answer concisely and "
    "accurately. Use the lesson context if it is provided."
)


async def chat(system: str, user: str) -> str:
    print(settings.groq_api_key)
    if not settings.groq_api_key:
        raise HTTPException(503, "AI tutor is not configured. Set GROQ_API_KEY on the server.")

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            res = await client.post(
                f"{settings.groq_base_url}/chat/completions",
                headers={"Authorization": f"Bearer {settings.groq_api_key}"},
                json={
                    "model": settings.groq_model,
                    "messages": [
                        {"role": "system", "content": system},
                        {"role": "user", "content": user},
                    ],
                },
            )
    except httpx.HTTPError:
        raise HTTPException(502, "Could not reach the AI service.")

    if res.status_code != 200:
        print(res.text)
        raise HTTPException(502, f"AI service returned an error ({res.status_code}).")
    try:
        return res.json()["choices"][0]["message"]["content"]
    except (KeyError, IndexError, ValueError):
        raise HTTPException(502, "AI service returned an unexpected response.")


async def debug_code(code: str, output: str) -> str:
    return await chat(DEBUG_PROMPT, f"Code:\n{code}\n\nOutput:\n{output}")


async def ask(question: str, lesson_context: str | None) -> str:
    prompt = f"Lesson context:\n{lesson_context}\n\nQuestion: {question}" if lesson_context else question
    return await chat(ASK_PROMPT, prompt)