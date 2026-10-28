const API_BASE_URL = "http://127.0.0.1:8000/api";

// Fetch all modules
export async function fetchModules() {
  const response = await fetch(`${API_BASE_URL}/modules`);
  if (!response.ok) throw new Error("Failed to fetch modules");
  return response.json();
}

// Ask the AI Tutor
export async function askAITutor(prompt, lessonId = null) {
  const response = await fetch(`${API_BASE_URL}/tutor/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: prompt,
      lesson_id: lessonId,
    }),
  });
  if (!response.ok) throw new Error("Failed to reach AI tutor");
  return response.json();
}