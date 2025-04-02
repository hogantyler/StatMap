import React, { useState, useEffect, Suspense, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "./GlobeComponents/Globe";
import HoverDropMenu from "./HoverDropMenu";
import Modal from "./Modal";
import Login from "./Login";
import { FaTimes } from "react-icons/fa";
import Loading from "./Loading"
import { supabase } from "./SupabaseContext";
import { CountrySelectionProvider, useCountrySelection } from "./CountrySelectionContext";

const QuizModeContent = () => {
  // --- Quiz Logic States ---
  const { selectedCountry } = useCountrySelection();
  const [currentFact, setCurrentFact] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1); // Question counter
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "correct", "incorrect", or "final"
  const [quizComplete, setQuizComplete] = useState(false); // Flag for quiz completion
  const [questionFinished, setQuestionFinished] = useState(false); //for 'next' and 'source' buttons

  // --- Navigation & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- Functions for Quiz Logic ---
  const loadNewFact = async () => {
    try {
      const { data, error } = await supabase.rpc('random_fact');
      if (error) {
        console.error("Error fetching fact:", error);
        return;
      }
      setCurrentFact(data);
    } catch (err) {
      console.error("Unexpected error:", err);
    }
    // Reset other states for the new question
    setAttempts(0);
    setFeedback("");
    setFeedbackType("");
  };

  const handleNextQuestion = () => {
    if (questionNumber < 10) {
      setQuestionNumber((prev) => prev + 1);
      loadNewFact();
    } else {
      //Instead of auto-reset, mark quiz complete to show final popup
      setQuizComplete(true);
    }
  };

  // Load initial fact on mount:
  useEffect(() => {
    loadNewFact();
  }, []);

  // Handler for submitting the answer based solely on globe selection
  const handleSubmitAnswer = useCallback(() => {
    if (!selectedCountry) {
      alert("Please select a country on the globe first.");
      return;
    }
    const answer = selectedCountry;
    if (answer.includes(currentFact?.Correct_Country) || currentFact?.Correct_Country.includes(answer)) {
      let points = attempts === 0 ? 1000 : attempts === 1 ? 750 : attempts === 2 ? 500 : 250;
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
        } else if (newAttempts === 2) {
          hint = `Hint: Continent - ${currentFact.CC_Continent}, Capital - ${currentFact.CC_Capital}`;
        } else if (newAttempts === 3) {
          hint = `Hint: Continent - ${currentFact.CC_Continent}, Capital - ${currentFact.CC_Capital}, Abbreviation - ${currentFact.CC_Abbrev}`;
        }
        setFeedback(`Incorrect! Try again. ${hint}`);
        setFeedbackType("incorrect");
        return;
      } else {
        setFeedback(`Incorrect! The correct answer is ${currentFact?.Correct_Country}.`);
        setFeedbackType("incorrect");
      }
    }
    setQuestionFinished(true);
  }, [selectedCountry, currentFact, attempts]);

  // Function to restart the quiz after completion
  const handleRestartQuiz = () => {
    setQuizComplete(false);
    setQuestionNumber(1);
    setScore(0);
    loadNewFact();
    setFeedback("");
    setFeedbackType("");
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleBack = () => navigate("/");

  return (
    //suspense for loading screen
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen w-full">
        {/* Globe Background */}
        <Globe />

        {/* Back Button in top right */}
        <div className="absolute top-0 right-0 z-50">
          <button
            onClick={handleBack}
            className="text-white rounded-full p-2 hover:text-red-600 transition-colors"
          >
            <FaTimes size={50} />
          </button>
        </div>

        {/* Hover Menu in top left */}
        <div className="absolute top-0 left-0 z-50">
          <HoverDropMenu onSignInClick={handleOpenModal} />
        </div>

        {/* Quiz Overlay Container */}
        {quizComplete ? (
          // Final Quiz Popup - restored as before
          <div className="absolute top-0 left-0 w-full flex justify-center items-center mt-2 z-30 pointer-events-auto">
            <div className="bg-transparent p-10 rounded-xl w-11/12 max-w-3xl border-2 border-white shadow-xl text-center">
              <div className="mb-6 text-3xl font-bold text-white">Quiz Complete!</div>
              <div className="mb-6 text-2xl text-white">Final Score: {score}</div>
              <button
                onClick={handleRestartQuiz}
                className="bg-black text-white border border-white rounded-full py-3 px-6 hover:bg-white hover:text-black transition-colors text-lg"
              >
                Restart Quiz
              </button>
            </div>
          </div>
        ) : (
          // Normal Quiz Content with a wider, reactive container
          <div className="absolute top-0 left-0 w-full flex justify-center items-start mt-2 z-30 pointer-events-none">
            <div className="bg-white bg-opacity-0 p-4 rounded-xl w-11/12 max-w-3xl">
              {/* Question Indicator */}
              <div className="mb-1 text-center font-bold text-white text-sm">
                Question: {questionNumber} of 10
              </div>
              {/* Score Display */}
              <div className="mb-1 text-center font-bold text-white text-xl">Score: {score}</div>
              {/* Instruction Text */}
              <div className="mb-1 text-center text-med text-white">
                Guess the country based on the fact!
              </div>
              {/* Fact Box */}
              {currentFact && (
                <div className="mb-2 p-2 border border-white rounded relative">
                  <p className="text-center font-semibold text-white text-med">
                    {currentFact.Fact}
                  </p>
                </div>
              )}
              {/* Selected Country Indicator */}
              <div className="mb-4 text-center text-white text-sm">
                Selected Country:{" "}
                {selectedCountry
                  ? selectedCountry
                  : "None"}
              </div>
              {/* Submit Answer Button in green */}
              <div className="text-center pointer-events-auto">
                <button
                  onClick={handleSubmitAnswer}
                  className="bg-green-600 text-white border border-white rounded-full py-2 px-4 hover:bg-green-500 transition-colors text-sm"
                >
                  Submit Answer
                </button>
              </div>
              {/* Feedback Popup */}
              {feedback && (
                <div
                  className={`mt-4 p-2 rounded text-center text-sm ${feedbackType === "correct"
                    ? "bg-green-300 text-green-900"
                    : "bg-red-300 text-red-900"
                    } pointer-events-auto`}
                >
                  {feedback}
                </div>
              )}
              {/* End of Question/Source Popup */}
              {questionFinished && (
                <div className="flex justify-around mt-4 pointer-events-auto">
                  <a
                    href={currentFact.Source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors text-sm"
                  >
                    Source
                  </a>
                  <button
                    onClick={() => {
                      setQuestionFinished(false);
                      handleNextQuestion();
                    }}
                    className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors text-sm"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Login Modal */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <Login />
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
