import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { FaArrowLeft } from "react-icons/fa";
import Globe from "./GlobeComponents/Globe";
import Login from "./Login";
import Modal from "./Modal";
import Loading from "./Loading";
import { supabase } from "./SupabaseContext";
import { CountrySelectionProvider, useCountrySelection } from "./CountrySelectionContext";

function UnlimitedModeContent() {
  const [isModalOpen, setIsModalOpen] = useState(false); // modal for side bar menu
  const [currentFact, setCurrentFact] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "correct" or "incorrect"
  const [isAnswered, setIsAnswered] = useState(false);
  const [questionFinished, setQuestionFinished] = useState(false); // for 'next' and 'source' buttons
  const navigate = useNavigate();

  // Retrieve selected country from context
  const { selectedCountry } = useCountrySelection();
  const prevSelectedCountryRef = useRef(null); // ref for tracking country selection changes

  // Wrap modal handlers in useCallback to avoid unnecessary re-renders
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

  // Track selected country changes fed from globe component via countryselection context
  useEffect(() => {
    if (selectedCountry && selectedCountry !== prevSelectedCountryRef.current && !isAnswered) {
      prevSelectedCountryRef.current = selectedCountry;
      console.log(
        `logging ${selectedCountry} from unlimited mode page`
      );
    }
  }, [selectedCountry, isAnswered]);

  // Memoize loadNewFact handler
  const loadNewFact = useCallback(async () => {
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
    prevSelectedCountryRef.current = null; // reset after answering question
  }, []);

  useEffect(() => {
    loadNewFact();
  }, [loadNewFact]);

  // Handler for submitting the answer based solely on globe selection
  const handleSubmitAnswer = useCallback(() => {
    if (!selectedCountry) {
      alert("Please select a country on the globe first.");
      return;
    }
    setIsAnswered(true);
    const answer = selectedCountry || "";
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
        setIsAnswered(false);
        return;
      } else {
        setFeedback(`Incorrect! The correct answer is ${currentFact?.Correct_Country}.`);
        setFeedbackType("incorrect");
      }
    }
    setQuestionFinished(true);
  }, [selectedCountry, currentFact, attempts]);

  const handleBack = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative w-full h-full">
        {/* Back Button */}
        <div className="absolute top-0 right-0 z-50">
          <button
            onClick={handleBack}
            className="bg-black text-white border border-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
          >
            <FaArrowLeft size={40} />
          </button>
        </div>

        {/* Hover Menu */}
        <div className="absolute top-0 left-0 z-50">
          <HoverDropMenu onSignInClick={handleOpenModal} />
        </div>

        {/* Overlay Container */}
        <div className="absolute top-0 left-0 w-full flex justify-center items-start mt-5 z-30">
          <div className="bg-white bg-opacity-0 p-4 rounded-xl w-11/12 max-w-3xl">
            {/* Score Display */}
            <div className="mb-1 text-center font-bold text-white text-xl">Score: {score}</div>
            {/* Instruction Text */}
            <div className="mb-1 text-center text-med text-white">Guess the country based on the fact!</div>
            {/* Fact Box */}
            {currentFact && (
              <div className="mb-4 p-4 border border-white rounded relative">
                <p className="text-center font-semibold text-white">{currentFact.Fact}</p>
              </div>
            )}
            {/* Display the currently selected country */}
            <div className="mb-4 text-center text-white">
              Selected Country:{" "}
              {selectedCountry
                ? selectedCountry
                : "None"}
            </div>
            {/* Submit Answer Button in green */}
            <div className="text-center">
              <button
                onClick={handleSubmitAnswer}
                className="bg-green-600 text-white border border-white rounded-full py-2 px-6 hover:bg-green-500 transition-colors"
              >
                Submit Answer
              </button>
            </div>
            {/* Feedback Popup */}
            {feedback && (
              <div
                className={`mt-4 p-2 rounded text-center ${
                  feedbackType === "correct" ? "bg-green-300 text-green-900" : "bg-red-300 text-red-900"
                }`}
              >
                {feedback}
              </div>
            )}
            {/* End of Question/Source Popup */}
            {questionFinished && (
              <div className="flex justify-around mt-4">
                <a
                  href={currentFact.Source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors"
                >
                  Source
                </a>
                <button
                  onClick={() => {
                    setQuestionFinished(false);
                    loadNewFact();
                  }}
                  className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <Login />
        </Modal>

        {/* Globe Canvas */}
        <Globe />
      </div>
    </Suspense>
  );
}

// Wrapping the component with the country selection context provider
function UnlimitedMode() {
  return (
    <CountrySelectionProvider>
      <UnlimitedModeContent />
    </CountrySelectionProvider>
  );
}

export default UnlimitedMode;
