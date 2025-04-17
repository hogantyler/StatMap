import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "./GlobeComponents/Globe";
import HoverDropMenu from "./HoverDropMenu";
import Modal from "./Modal";
import { X, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Loading from "./Loading";
import { supabase } from "./SupabaseContext";
import {
  CountrySelectionProvider,
  useCountrySelection,
} from "./CountrySelectionContext";
import { playClickSound } from "../utils/soundUtils";
import { cn } from "../lib/utils";

const QuizModeContent = () => {
  // --- Quiz Logic States ---
  const { selectedCountry } = useCountrySelection();
  const [currentFact, setCurrentFact] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState("");
  const [quizComplete, setQuizComplete] = useState(false);
  const [questionFinished, setQuestionFinished] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [questionsCorrect, setQuestionsCorrect] = useState(0);
  const [hintOneUsed, setHintOneUsed] = useState(0);
  const [hintTwoUsed, setHintTwoUsed] = useState(0);
  const [hintThreeUsed, setHintThreeUsed] = useState(0);
  const [startTime, setStartTime] = useState(new Date());
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- Functions for Quiz Logic ---
  const loadNewFact = async () => {
    try {
      const { data, error } = await supabase.rpc("random_fact");
      if (error) {
        console.error("Error fetching fact:", error);
        return;
      }
      setCurrentFact(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    setAttempts(0);
    setFeedback("");
    setFeedbackType("");
    setIsAnswered(false);
    setQuestionFinished(false);
  };

  const handleNextQuestion = () => {
    if (questionNumber < 10) {
      setQuestionNumber((prev) => prev + 1);
      loadNewFact();
    } else {
      setQuizComplete(true);
      submitGameResult();
    }
  };

  const submitGameResult = async () => {
    const user = await supabase.auth.getUser();
    if (user) {
      if (user.data.user && user.data.user.id) {
        const { data, error } = await supabase
          .from("Game Logs")
          .insert([
            {
              User_ID: user.data.user.id,
              Display_Name: user.data.user.user_metadata.display_name,
              Mode: "Quiz",
              Score: score,
              Num_Correct: questionsCorrect,
              Num_Questions: 10,
              Hint_One_Used: hintOneUsed,
              Hint_Two_Used: hintTwoUsed,
              Hint_Three_Used: hintThreeUsed,
              Start_Time: String(startTime),
              End_Time: String(new Date()),
            },
          ])
          .select();

        if (error) {
          console.log(error);
          alert("An error occurred, unable to save score");
        }
      }
    }
  };

  useEffect(() => {
    loadNewFact();
  }, []);

  const handleReportFact = async (reportType) => {
    if (!currentFact) return;
    try {
      const { error } = await supabase.from("Fact Reports").insert([
        {
          Fact_ID: currentFact.Fact_ID,
          Report_Type: reportType,
        },
      ]);
      if (error) {
        console.error("Error reporting fact:", error);
      } else {
        alert("Thank you for reporting this fact. We'll review it shortly!");
      }
    } catch (err) {
      console.error("Unexpected error reporting fact:", err);
    }
    setIsReportModalOpen(false);
  };

  const handleSubmitAnswer = useCallback(() => {
    playClickSound();
    if (isAnswered) return;
    if (!selectedCountry.name) {
      alert("Please select a country on the globe first.");
      return;
    }
    setIsCollapsed(false);
    setIsAnswered(true);
    const answer = selectedCountry.name;
    if (answer.includes(currentFact?.Correct_Country) || currentFact?.Correct_Country.includes(answer)) {
      const points = attempts === 0 ? 1000 : attempts === 1 ? 750 : attempts === 2 ? 500 : 250;
      setScore((prev) => prev + points);
      setFeedback("Correct!");
      setFeedbackType("correct");
      setQuestionsCorrect((prev) => prev + 1);
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
        setFeedback(`Incorrect! The correct answer is ${currentFact?.Correct_Country}.`);
        setFeedbackType("incorrect");
      }
      setIsAnswered(false);
    }
    setQuestionFinished(true);
  }, [isAnswered, selectedCountry, currentFact, attempts]);

  const handleRestartQuiz = () => {
    playClickSound();
    setQuizComplete(false);
    setQuestionNumber(1);
    setScore(0);
    setQuestionsCorrect(0);
    loadNewFact();
    setFeedback("");
    setFeedbackType("");
  };

  const handleBack = () => {
    playClickSound();
    navigate("/");
  };

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen w-full">
        {/* Globe Background */}
        <Globe />

        {/* Back Button in top right */}
        <button
          onClick={handleBack}
          className="absolute top-0 right-0 md:top-2 md:right-2 z-50 bg-zinc-900/80 border border-white/10 p-2 rounded-full text-white/70 hover:text-red-400 hover:bg-zinc-800/80 transition-all duration-200"
          title="Return to Home"
        >
          <X size={20} />
        </button>

        {/* Hover Menu in top left */}
        <div className="absolute top-0 left-0 z-50">
          <HoverDropMenu />
        </div>

        {/* Quiz Overlay Container */}
        {quizComplete ? (
          // Final Quiz Popup
          <div className="absolute inset-0 flex justify-center items-center z-30">
            <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 p-6 rounded-lg max-w-sm w-full shadow-2xl">
              <div className="mb-4 text-2xl font-bold text-white text-center">Quiz Complete!</div>
              <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-white/70">Final Score</span>
                  <span className="text-2xl font-bold text-white">{score}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg">
                  <span className="text-white/70">Correct Answers</span>
                  <span className="text-xl font-medium text-white">{questionsCorrect} / 10</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRestartQuiz}
                  className="flex-1 bg-sky-500/50 text-sky-400 border border-sky-500/60 rounded-lg py-3 px-6 hover:bg-sky-500/60 transition-colors text-lg font-medium flex items-center justify-center gap-2"
                >
                  <ArrowRight size={18} />
                  <span>Play Again</span>
                </button>
                <button
                  onClick={handleBack}
                  className="flex-1 bg-zinc-800/50 text-white/70 border border-white/10 rounded-lg py-3 px-6 hover:bg-zinc-700/50 hover:text-white transition-colors text-lg font-medium"
                >
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          // Normal Quiz Content with collapsible functionality
          <div className="absolute inset-x-0 top-10 flex flex-col items-center z-30">
            <div className="max-w-xl w-full px-4">
              {/* Combined Progress, Score, and Fact Box */}
              <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden mb-3">
                {/* Header with Question Number, Score, and Toggle */}
                <div className="flex justify-between items-center p-3">
                  <div className="flex items-center gap-2">
                    <div className="text-white/70 text-sm">Question</div>
                    <div className="bg-zinc-800 text-white px-2 py-1 rounded text-sm font-medium">
                      {questionNumber} / 10
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="text-white/70 text-sm">Score</div>
                      <div className="bg-zinc-800 text-white px-3 py-1 rounded text-sm font-medium">{score}</div>
                    </div>
                    <button
                      onClick={() => {
                        playClickSound();
                        setIsCollapsed(!isCollapsed);
                      }}
                      className="text-white/60 hover:text-white"
                    >
                      {isCollapsed ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                    </button>
                  </div>
                </div>

                {/* Collapsible Fact Content */}
                {!isCollapsed && currentFact && (
                  <div className="p-3 border-t border-white/10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium text-white">Country Fact</div>
                    </div>
                    <p className="text-white/90 text-base leading-relaxed">{currentFact.Fact}</p>
                  </div>
                )}
              </div>

              {/* Selected Country and Submit */}
              <div className="mt-3 bg-zinc-900/60 backdrop-blur-sm border border-white/10 rounded-lg p-3">
                <div className="flex flex-col gap-4">
                  <div className="flex justify-between items-center">
                    <div className="text-white/70">Selected Country</div>
                    <div className="text-white font-medium">{selectedCountry.name || "None"}</div>
                  </div>

                  <button
                    onClick={handleSubmitAnswer}
                    className="w-full bg-emerald-500/50 text-emerald-400 border border-emerald-500/60 rounded-lg py-2 px-4 hover:bg-emerald-500/60 transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    Submit Answer
                  </button>
                </div>
              </div>

              {/* Feedback Box */}
              {feedback && (
                <div
                  className={cn(
                    "mt-3 p-2 rounded-lg border backdrop-blur-sm flex items-center justify-between min-w-0",
                    feedbackType === "correct"
                      ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400"
                      : "bg-red-500/20 border-red-500/30 text-red-400",
                  )}
                >
                  <p className="text-sm overflow-hidden text-ellipsis whitespace-nowrap">{feedback}</p>
                </div>
              )}

              {/* End of Question Actions */}
              {questionFinished && (
                <div className="mt-3 grid grid-cols-3 gap-3">
                  <a
                    href={currentFact.Source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-zinc-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2 px-3 text-white/70 hover:text-white hover:bg-zinc-800/60 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <ExternalLink size={14} />
                    <span>Source</span>
                  </a>
                  <button
                    onClick={() => setIsReportModalOpen(true)}
                    className="bg-zinc-900/60 backdrop-blur-sm border border-white/10 rounded-lg py-2 px-3 text-white/70 hover:text-white hover:bg-zinc-800/60 transition-colors text-sm flex items-center justify-center gap-1"
                  >
                    <AlertTriangle size={14} />
                    <span>Report</span>
                  </button>
                  <button
                    onClick={() => {
                      setQuestionFinished(false);
                      handleNextQuestion();
                    }}
                    className="bg-sky-500/50 text-sky-400 border border-sky-500/60 rounded-lg py-2 px-3 hover:bg-sky-500/60 transition-colors text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <ArrowRight size={14} />
                    <span>Next</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Report Fact Modal */}
        <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)}>
          <p className="text-white/70 mb-4">Please select a reason for reporting this fact:</p>
          <div className="space-y-2">
            <button
              onClick={() => handleReportFact("INCORRECT_INFORMATION")}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-left px-4 py-3 rounded-md transition-colors"
            >
              Incorrect information
            </button>
            <button
              onClick={() => handleReportFact("CLUE_IN_FACT")}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-left px-4 py-3 rounded-md transition-colors"
            >
              Clue in the fact
            </button>
            <button
              onClick={() => handleReportFact("INAPPROPRIATE_CONTENT")}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-left px-4 py-3 rounded-md transition-colors"
            >
              Inappropriate content
            </button>
            <button
              onClick={() => handleReportFact("MULTIPLE_COUNTRIES")}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-left px-4 py-3 rounded-md transition-colors"
            >
              Fact holds true for more than one country
            </button>
          </div>
        </Modal>
      </div>
    </Suspense>
  );
};

// Wrapping the component with the country selection context provider
function QuizMode() {
  return (
    <CountrySelectionProvider>
      <QuizModeContent />
    </CountrySelectionProvider>
  );
}

export default QuizMode;
