import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "./GlobeComponents/Globe";
import HoverDropMenu from "./HoverDropMenu";
import { FaTimes } from "react-icons/fa";
import Loading from "./Loading";
import { supabase } from "./SupabaseContext";
import {
  CountrySelectionProvider,
  useCountrySelection,
} from "./CountrySelectionContext";
import { playClickSound } from "../utils/soundUtils";

const MultiplayerGameScreenContent = () => {
  const { selectedCountry, selectCountry } = useCountrySelection();
  const navigate = useNavigate();

  const [userId, setUserId] = useState(null);
  const [lobbyId, setLobbyId] = useState(null);
  const [isHost, setIsHost] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [currentFact, setCurrentFact] = useState(null);
  const [timer, setTimer] = useState(60);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [players, setPlayers] = useState([]);

  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Get userId
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setUserId(user.id);
    });
  }, []);


  //Cleanup lobby when game is closed or people leave 
  useEffect(() => {
    const cleanup = async () => {
      if (userId) {
        await supabase.from("Players").delete().eq("id", userId);
      }
    };
  
    window.addEventListener("beforeunload", cleanup);
    window.addEventListener("unload", cleanup);
    return () => {
      window.removeEventListener("beforeunload", cleanup);
      window.removeEventListener("unload", cleanup);
    };
  }, [userId]);

  const removePlayerAndCleanupLobby = async () => {
  if (!lobbyId || !userId) return;

  await supabase.from("Players").delete().eq("id", userId);

  const { data: remaining } = await supabase
    .from("Players")
    .select("id")
    .eq("lobby_id", lobbyId);

  if (remaining.length === 0) {
    await supabase.from("Lobbies").delete().eq("id", lobbyId);
  }
};
useEffect(() => {
  const handleUnload = async () => {
    await removePlayerAndCleanupLobby();
  };

  window.addEventListener("beforeunload", handleUnload);
  return () => window.removeEventListener("beforeunload", handleUnload);
}, []);

  

  // Get lobbyId from Players table
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("Players")
      .select("lobby_id")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        setLobbyId(data?.lobby_id || null);
        setScore(0);
        setAttempts(0);
        setQuestionNumber(1);
      });
  }, [userId]);

  // Load questions, subscribe to lobby changes
  useEffect(() => {
    if (!lobbyId || !userId) return;

    const loadLobby = async () => {
      const { data: lobby } = await supabase
        .from("Lobbies")
        .select("questions, host_id, question_number, question_started_at")
        .eq("id", lobbyId)
        .single();

      const isCurrentHost = lobby?.host_id === userId;
      setIsHost(isCurrentHost);

      if ((!lobby.questions || lobby.questions.length === 0) && isCurrentHost) {
        const arr = [];
        for (let i = 0; i < 10; i++) {
          const { data } = await supabase.rpc("random_fact");
          if (data) arr.push(data);
        }
        await supabase
          .from("Lobbies")
          .update({
            questions: arr,
            question_number: 1,
            question_started_at: new Date().toISOString(),
          })
          .eq("id", lobbyId);
      } else if (lobby?.questions?.length) {
        setQuestions(lobby.questions);
        setQuestionNumber(lobby.question_number);
        setCurrentFact(lobby.questions[lobby.question_number - 1] || null);
        setTimer(
          60 - Math.floor((new Date() - new Date(lobby.question_started_at)) / 1000)
        );
      }
    };

    loadLobby();

    const chan = supabase
      .channel(`lobby_${lobbyId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Lobbies",
          filter: `id=eq.${lobbyId}`,
        },
        ({ new: l }) => {
          if (!l.questions || !l.questions[l.question_number - 1]) return;
          setQuestions(l.questions);
          setQuestionNumber(l.question_number);
          setCurrentFact(l.questions[l.question_number - 1]);
          setTimer(60);
          setShowLeaderboard(false);
          setAttempts(0);
          setFeedback("");
          setIsCollapsed(false);
        }
      )
      .subscribe();

    return () => supabase.removeChannel(chan);
  }, [lobbyId, userId]);

  // Load player scores & live updates
  useEffect(() => {
    if (!lobbyId) return;

    const loadPlayers = async () => {
      const { data } = await supabase
        .from("Players")
        .select("id, display_name, score, last_answered")
        .eq("lobby_id", lobbyId);
      setPlayers(data || []);
    };

    loadPlayers();

    const pchan = supabase
      .channel(`players_${lobbyId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Players", filter: `lobby_id=eq.${lobbyId}` },
        ({ new: p }) => {
          setPlayers((prev) => {
            const idx = prev.findIndex((x) => x.id === p.id);
            if (idx > -1) {
              const a = [...prev];
              a[idx] = p;
              return a;
            }
            return [...prev, p];
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(pchan);
  }, [lobbyId]);

  // Timer logic and host advancing
  useEffect(() => {
    if (quizComplete || showLeaderboard || timer <= 0 || !currentFact) return;
  
    const allAnswered = players.length > 0 && players.every(p => p.last_answered >= questionNumber);
  
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1 || allAnswered) {
          clearInterval(interval);
          setShowLeaderboard(true);
          if (isHost) {
            setTimeout(async () => {
              if (questionNumber < questions.length) {
                await supabase
                  .from("Lobbies")
                  .update({
                    question_number: questionNumber + 1,
                    question_started_at: new Date().toISOString(),
                  })
                  .eq("id", lobbyId);
                await supabase
                  .from("Players")
                  .update({ last_answered: 0 })
                  .eq("lobby_id", lobbyId);
              } else {
                setQuizComplete(true);
              }
            }, 5000);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  
    return () => clearInterval(interval);
  }, [timer, players, questionNumber, isHost, quizComplete, showLeaderboard, currentFact]);

  const handleSubmitAnswer = useCallback(() => {
    playClickSound();
    if (!currentFact || timer <= 0) return;
    if (!selectedCountry.name) {
      alert("Select a country");
      return;
    }

    const correct =
      selectedCountry.name.includes(currentFact.Correct_Country) ||
      currentFact.Correct_Country.includes(selectedCountry.name);
    let pts = [1000, 750, 500, 250][attempts] || 250;

    if (correct) {
      setScore((s) => s + pts);
      setFeedback("Correct!");
      setFeedbackType("correct");
    } else if (attempts < 3) {
      setAttempts((a) => a + 1);
      const hintParts = [];
      if (attempts >= 0) hintParts.push(`Continent - ${currentFact.CC_Continent}`);
      if (attempts >= 1) hintParts.push(`Capital - ${currentFact.CC_Capital}`);
      if (attempts >= 2) hintParts.push(`Abbreviation - ${currentFact.CC_Abbrev}`);
      setFeedback(`Incorrect! Hint: ${hintParts.join(" | ")}`);
      setFeedbackType("incorrect");
      return;
    } else {
      const hintParts = [
        `Continent - ${currentFact.CC_Continent}`,
        `Capital - ${currentFact.CC_Capital}`,
        `Abbreviation - ${currentFact.CC_Abbrev}`,
      ];
      setFeedback(`Incorrect! The answer was ${currentFact.Correct_Country}. Hints: ${hintParts.join(" | ")}`);
      setFeedbackType("incorrect");
    }

    // Always update player score + last_answered:
    supabase
      .from("Players")
      .update({ score: score + pts, last_answered: questionNumber })
      .eq("id", userId);
  }, [selectedCountry.name, currentFact, attempts, score, questionNumber, timer, userId]);

  const handleBack = async () => {
    playClickSound();
    await removePlayerAndCleanupLobby();  //cleanup first
    navigate("/");  // then navigate away
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen w-full">
        <Globe />
        <div className="absolute top-0 right-0 z-50">
          <button onClick={handleBack} className="text-white p-2 hover:text-red-600">
            <FaTimes size={50} />
          </button>
        </div>
        <div className="absolute top-0 left-0 z-50">
          <HoverDropMenu />
        </div>

        {quizComplete ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
            <div className="bg-transparent p-10 rounded-xl w-11/12 max-w-3xl border-2 border-white shadow-xl text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Quiz Complete!</h2>
              <ul className="text-white mb-6">
                {players.sort((a, b) => b.score - a.score).map((p) => (
                  <li key={p.id}>{p.display_name || "Player"}: {p.score}</li>
                ))}
              </ul>
              {isHost ? (
                <div className="space-x-4">
                  <button
                    onClick={() =>
                      supabase.from("Lobbies").update({
                        question_number: 1,
                        question_started_at: new Date().toISOString(),
                        questions: questions,
                      }).eq("id", lobbyId)
                    }
                    className="px-6 py-2 bg-green-600 text-white rounded-full"
                  >
                    Restart Quiz
                  </button>
                  <button
                    onClick={() => {
                      supabase.from("Lobbies").delete().eq("id", lobbyId);
                      navigate("/");
                    }}
                    className="px-6 py-2 bg-red-600 text-white rounded-full"
                  >
                    Disband Lobby
                  </button>
                </div>
              ) : (
                <button onClick={handleBack} className="px-6 py-2 bg-gray-600 text-white rounded-full">Back Home</button>
              )}
            </div>
          </div>
        ) : showLeaderboard ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-30">
            <div className="bg-white bg-opacity-80 p-8 rounded-xl w-11/12 max-w-2xl text-center">
              <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
              <ul className="text-black mb-4">
                {players.sort((a, b) => b.score - a.score).map((p) => (
                  <li key={p.id}>{p.display_name || "Player"}: {p.score}</li>
                ))}
              </ul>
              <p>Next question shortly...</p>
            </div>
          </div>
        ) : (
          <div className="absolute top-0 left-0 w-full flex flex-col items-center mt-2 z-30">
            <div className="bg-white bg-opacity-0 p-4 rounded-xl w-11/12 max-w-3xl">
              <div className="text-center text-white font-bold text-sm">
                Question: {questionNumber} of {questions.length}
              </div>
              <div className="text-center text-white text-xl font-bold mb-1">Score: {score}</div>
              <div className="text-center text-white mb-2">Time left: {timer}s</div>
              {!isCollapsed && currentFact && (
                <div className="mb-2 p-2 border border-white rounded">
                  <p className="text-center font-semibold text-white">{currentFact.Fact}</p>
                </div>
              )}
              <div className="mb-2 text-center text-white text-sm">
                Selected Country: {selectedCountry.name || "None"}
              </div>
              <div className="flex justify-center items-center mb-4">
                <button
                  onClick={handleSubmitAnswer}
                  className="bg-green-600 text-white py-2 px-4 rounded-full hover:bg-green-500"
                >
                  Submit Answer
                </button>
                {!isCollapsed && (
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsCollapsed(true);
                    }}
                    className="ml-4 bg-white text-black rounded-full p-1 hover:bg-green-600 transition-colors"
                  >
                    Hide Fact
                  </button>
                )}
                {isCollapsed && (
                  <button
                    onClick={() => {
                      playClickSound();
                      setIsCollapsed(false);
                    }}
                    className="bg-white text-black rounded-full p-1 hover:bg-green-600 transition-colors"
                  >
                    Show Fact
                  </button>
                )}
              </div>
              {feedback && (
                <div className={`mt-2 p-2 rounded text-center text-sm ${feedbackType === "correct" ? "bg-green-300 text-green-900" : "bg-red-300 text-red-900"}`}>
                  {feedback}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Suspense>
  );
};

export default function MultiplayerGameScreen() {
  return (
    <CountrySelectionProvider>
      <MultiplayerGameScreenContent />
    </CountrySelectionProvider>
  );
}
