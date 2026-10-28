import React, { useState } from 'react';

const AIMentor = ({ currentCode, errorMessage }) => {
  const [feedback, setFeedback] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAskMentor = async () => {
    setLoading(true);
    setFeedback('');
    try {
      const response = await fetch("http://127.0.0.1:8000/api/debug", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: currentCode,
          error_message: errorMessage || "No error trace provided.",
        }),
      });

      const data = await response.json();
      setFeedback(data.feedback);
    } catch (error) {
      console.error("AI mentor error:", error);
      setFeedback("Unable to reach the backend server. Ensure Uvicorn is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 p-4 border border-gray-700 rounded-lg bg-gray-900 text-white">
      <button
        onClick={handleAskMentor}
        disabled={loading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded font-medium disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Analyzing code..." : "💡 Ask AI Mentor"}
      </button>

      {feedback && (
        <div className="mt-4 p-3 bg-gray-800 border border-gray-700 rounded whitespace-pre-wrap text-sm text-left">
          <h3 className="font-semibold text-indigo-300">AI Mentor Guidance:</h3>
          <p className="mt-2">{feedback}</p>
        </div>
      )}
    </div>
  );
};

export default AIMentor;