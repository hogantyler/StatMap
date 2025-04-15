import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./SupabaseContext";

const MultiplayerGameScreen = () => {
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [timer, setTimer] = useState(60);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [playerScores, setPlayerScores] = useState({});
  const [answersSubmitted, setAnswersSubmitted] = useState({});
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const questions = [...Array(10).keys()]; // Placeholder

  // Countdown timer logic
  useEffect(() => {
    if (!showLeaderboard && timer > 0) {
      const interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
      return () => clearInterval(interval);
    } else if (timer === 0) {
      setShowLeaderboard(true);
      setTimeout(() => {
        setShowLeaderboard(false);
        setQuestionIndex((prev) => prev + 1);
        setTimer(60);
        setAnswersSubmitted({});
      }, 5000);
    }
  }, [timer, showLeaderboard]);

  useEffect(() => {
    // Simulate question retrieval (replace with Supabase shared question logic)
    setCurrentQuestion({
      text: `Question ${questionIndex + 1} goes here...`,
    });
  }, [questionIndex]);

  const handleSubmitAnswer = (playerId, isCorrect) => {
    setAnswersSubmitted((prev) => ({ ...prev, [playerId]: true }));
    if (isCorrect) {
      setPlayerScores((prev) => ({
        ...prev,
        [playerId]: (prev[playerId] || 0) + timer * 10, // score logic
      }));
    }
  };

  if (questionIndex >= 10) {
    return (
      <div className="text-center p-6">
        <h1 className="text-3xl mb-4">Final Leaderboard</h1>
        {Object.entries(playerScores)
          .sort((a, b) => b[1] - a[1])
          .map(([playerId, score], idx) => (
            <p key={playerId}>{idx + 1}. Player {playerId}: {score} pts</p>
          ))}
        <button onClick={() => navigate("/")} className="mt-6 px-4 py-2 bg-black text-white rounded">Back to Home</button>
      </div>
    );
  }

  return (
    <div className="text-center p-6">
      {!showLeaderboard ? (
        <>
          <h1 className="text-2xl font-bold mb-2">{currentQuestion?.text}</h1>
          <p className="text-lg mb-4">Time left: {timer}s</p>
          <button
            onClick={() => handleSubmitAnswer("you", true)}
            disabled={answersSubmitted["you"]}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Submit Correct Answer
          </button>
        </>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-2">Leaderboard</h2>
          {Object.entries(playerScores)
            .sort((a, b) => b[1] - a[1])
            .map(([playerId, score], idx) => (
              <p key={playerId}>{idx + 1}. Player {playerId}: {score} pts</p>
            ))}
        </div>
      )}
    </div>
  );
};

export default MultiplayerGameScreen;
