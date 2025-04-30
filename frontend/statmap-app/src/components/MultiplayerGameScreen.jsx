import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
//import Globe from "./GlobeComponents/Globe";
import HoverDropMenu from "./HoverDropMenu";
import { FaTimes } from "react-icons/fa";
import Loading from "./Loading";
import { supabase } from "./SupabaseContext";
import {
  CountrySelectionProvider,
  useCountrySelection,
} from "./CountrySelectionContext";
import { playClickSound } from "../utils/soundUtils";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Suspense } from "react";
import RotationButton from "./RotationButton";

const Globe = React.lazy(() => import("./GlobeComponents/Globe"));

const MultiplayerGameScreenContent = () => {
  const { selectedCountry } = useCountrySelection();
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
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [typingDone, setTypingDone] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [hintOneUsed, setHintOneUsed] = useState(0);
  const [hintTwoUsed, setHintTwoUsed] = useState(0);
  const [hintThreeUsed, setHintThreeUsed] = useState(0);

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
    if (isHost) {
      handleDisbandLobby();
    } else {
      await supabase.from("Players").delete().eq("id", userId);

      const { data: remaining } = await supabase
        .from("Players")
        .select("id")
        .eq("lobby_id", lobbyId);

      if (remaining.length === 0) {
        await supabase.from("Lobbies").delete().eq("id", lobbyId);
      }
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
          60 -
          Math.floor(
            (new Date() - new Date(lobby.question_started_at)) / 1000
          )
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
          setIsAnswered(false);
          setShowLeaderboard(false);
          setAttempts(0);
          setFeedback("");
          setIsCollapsed(false);
        }
      )
      // Add this in the same broadcast subscription that handles 'disband_lobby'
      .on("broadcast", { event: "restart_quiz" }, () => {
        // Reset local state to get fresh lobby data and re-enter the game screen
        setScore(0);
        setAttempts(0);
        setFeedback("");
        setFeedbackType("");
        setQuizComplete(false);
        setShowLeaderboard(false);
        setIsCollapsed(false);
        // You could optionally reload the page or re-fetch lobby state here
        navigate("/multiplayer");
      })
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
        {
          event: "*",
          schema: "public",
          table: "Players",
          filter: `lobby_id=eq.${lobbyId}`,
        },
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

    const allAnswered =
      players.length > 0 &&
      players.every((p) => p.last_answered >= questionNumber);

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
  }, [
    timer,
    players,
    questionNumber,
    isHost,
    quizComplete,
    showLeaderboard,
    currentFact,
  ]);

  const handleSubmitAnswer = useCallback(async () => {
    let points = 0;
    playClickSound();
    if (isAnswered) return;
    if (!selectedCountry.name) {
      alert("Please select a country on the globe first.");
      return;
    }
    setIsCollapsed(false);
    setIsAnswered(true);
    const answer = selectedCountry;
    if (answer.code === currentFact?.CC_Abbrev) {
      points =
        attempts === 0
          ? 1000
          : attempts === 1
            ? 750
            : attempts === 2
              ? 500
              : 250;
      setScore((prev) => prev + points);
      setFeedback("Correct!");
      setFeedbackType("correct");
    } else {
      if (attempts < 3) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        let hint = "";
        if (newAttempts === 1) {
          hint = `Hint: Continent - ${currentFact.CC_Continent}`;
          setHintOneUsed((prev) => prev + 1);
        } else if (newAttempts === 2) {
          hint = `Hint: Continent - ${currentFact.CC_Continent}, Capital - ${currentFact.CC_Capital}`;
          setHintTwoUsed((prev) => prev + 1);
        } else if (newAttempts === 3) {
          hint = `Hint: Continent - ${currentFact.CC_Continent}, Capital - ${currentFact.CC_Capital}, Abbreviation - ${currentFact.CC_Abbrev}`;
          setHintThreeUsed((prev) => prev + 1);
        }
        setFeedback(`Incorrect! Try again. ${hint}`);
        setFeedbackType("incorrect");
        setIsAnswered(false);
        return;
      } else {
        setFeedback(
          `Incorrect! The correct answer is ${currentFact?.Correct_Country}.`
        );
        setFeedbackType("incorrect");
      }
      setIsAnswered(false);
    }

    try {
      if (attempts > 3) points = 0;
      const { error } = await supabase.rpc("increment_score", {
        player_id: userId,
        points: points,
        question: questionNumber,
      });
      if (error) throw error;
      console.log("Score updated!");
    } catch (err) {
      console.error("Failed to update score:", err);
    }
  }, [
    selectedCountry.name,
    currentFact,
    attempts,
    score,
    questionNumber,
    timer,
    userId,
  ]);

  const handleBack = async () => {
    playClickSound();
    await removePlayerAndCleanupLobby(); //cleanup first
    navigate("/", {
      state: {
        loadingMessage: "Returning to main menu...",
      },
    }); // then navigate away
  };

  useEffect(() => {
    if (!lobbyId || !userId) return;

    const channel = supabase
      .channel(`lobby_${lobbyId}_broadcast`)
      .on("broadcast", { event: "disband_lobby" }, async () => {
        await supabase.from("Players").delete().eq("id", userId);
        navigate("/");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyId, userId]);

  const handleDisbandLobby = async () => {
    if (!lobbyId) return;

    // broadcast to disband lobby
    await supabase.channel(`lobby_${lobbyId}_broadcast`).send({
      type: "broadcast",
      event: "disband_lobby",
      payload: { message: "Lobby is being disbanded." },
    });

    await supabase.from("Players").delete().eq("id", userId);
    await supabase.from("Lobbies").delete().eq("id", lobbyId);

    navigate("/");
  };

  //load assets while animating the loading screen
  useEffect(() => {
    // Simulate a delay to mimic loading assets (or wait on real setup)
    const loadAssets = async () => {
      await new Promise((res) => setTimeout(res, 1000));
      setAssetsLoaded(true);
    };
    loadAssets();
  }, []);

  //show loading screen until done animating and assets are loaded
  if (!typingDone || !assetsLoaded) {
    return (
      <Loading
        message="Loading multiplayer... answer in under a minute!"
        onComplete={() => setTypingDone(true)}
      />
    );
  }

  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen bg-black">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <div className="relative min-h-screen w-full">
        {/* Globe Background */}
        <Globe />

        {/* Back Button */}
        <div className="fixed top-6 right-6 z-50 flex items-center">
          <button
            onClick={handleBack}
            className="bg-zinc-900/80 border border-red-400 p-2 rounded-full text-white/70 hover:text-red-400 hover:bg-zinc-800/80 transition-all duration-200"
            title="Return to Home"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Rotation Button in top center */}
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <RotationButton />
        </div>

        {/* Hover Menu */}
        <div className="fixed top-0 left-0 z-50 flex items-center">
          <HoverDropMenu />
        </div>

        {/* Main Gameplay UI */}
        {quizComplete ? (
          // Post-Game Screen
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="bg-zinc-900/80 border border-white/10 rounded-lg p-6 max-w-lg w-full text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Quiz Complete!
              </h2>
              <ul className="text-white/70 mb-6">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((p) => {
                    console.log(p);
                    return (
                      <li key={p.id} className="text-lg">
                        {p.display_name || "Player"}: {p.score}
                      </li>
                    );
                  })}
              </ul>
              {isHost ? (
                <div className="flex justify-center gap-4">
                  <button
                    onClick={async () => {
                      playClickSound();
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
                      await supabase
                        .from("Players")
                        .update({ score: 0, last_answered: 0 })
                        .eq("lobby_id", lobbyId);
                      setQuizComplete(false);
                      setScore(0);
                      setAttempts(0);
                      setFeedback("");
                      setFeedbackType("");
                      setShowLeaderboard(false);
                      setIsCollapsed(false);
                      setQuestionNumber(1);
                      setCurrentFact(arr[0]);
                      setQuestions(arr);
                    }}
                    className="bg-emerald-500/50 text-emerald-400 border border-emerald-500/60 rounded-lg py-2 px-4 hover:bg-emerald-500/60 transition-colors font-medium"
                  >
                    Restart Quiz
                  </button>
                  <button
                    onClick={handleDisbandLobby}
                    className="bg-red-500/50 text-red-400 border border-red-500/60 rounded-lg py-2 px-4 hover:bg-red-500/60 transition-colors font-medium"
                  >
                    Disband Lobby
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleBack}
                  className="bg-zinc-900/60 text-white/70 border border-white/10 rounded-lg py-2 px-4 hover:bg-zinc-800/60 transition-colors font-medium"
                >
                  Back Home
                </button>
              )}
            </div>
          </div>
        ) : showLeaderboard ? (
          // Leaderboard Screen
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
            <div className="bg-zinc-900/80 border border-white/10 rounded-lg p-6 max-w-lg w-full text-center">
              <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
              <ul className="text-white/70 mb-4">
                {players
                  .sort((a, b) => b.score - a.score)
                  .map((p) => {
                    console.log(p);
                    return (
                      <li key={p.id} className="text-lg">
                        {p.display_name || "Player"}: {p.score}
                      </li>
                    );
                  })}
              </ul>
              <p className="text-white/60">Next question starting shortly...</p>
            </div>
          </div>
        ) : (
          // Gameplay UI
          <div className="fixed inset-x-0 bottom-2 flex flex-col items-center z-30 pointer-events-none">
            <div className="max-w-md w-full px-2 pointer-events-auto">
              {/* Score and Collapsible Fact Box */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden mb-2">
                <div className="flex justify-between items-center p-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-zinc-800 text-white px-2 py-1 rounded text-xs font-medium">
                      Question {questionNumber} of {questions.length}
                    </div>
                    <div className="bg-zinc-800 text-white px-2 py-1 rounded text-xs font-medium">
                      Score: {score}
                    </div>
                  </div>
                  <div className="text-white/70 text-xs">Time Left: {timer}s</div>
                  <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="text-white/60 hover:text-white transition-all"
                  >
                    {isCollapsed ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </button>
                </div>
                {!isCollapsed && (
                  <div className="p-2 border-t border-white/10">
                    <div className="text-center text-white text-sm font-medium">
                      {currentFact?.Fact || "Loading question..."}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-2 bg-zinc-900/60 backdrop-blur-sm border border-white/10 rounded-lg p-2">
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <div className="text-white/70 text-sm">Selected Country</div>
                    <div className="text-white font-medium text-sm">
                      {selectedCountry.name || "None"}
                    </div>
                  </div>
                  <button
                    onClick={handleSubmitAnswer}
                    className="w-full bg-emerald-500/50 text-emerald-400 border border-emerald-500/60 rounded-lg py-1.5 px-3 hover:bg-emerald-500/60 transition-colors font-medium flex items-center justify-center gap-2 text-sm"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>

              {/* Feedback Box */}
              {feedback && (
                <div
                  className={`mt-2 p-2 rounded-lg border backdrop-blur-sm flex flex-col items-center justify-center min-w-0 text-center ${feedbackType === "correct"
                    ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                    : "bg-red-500/20 border-red-500/30 text-red-400"
                    }`}
                  style={{ wordWrap: "break-word", whiteSpace: "normal" }}
                >
                  <p className="text-sm">{feedback}</p>
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
