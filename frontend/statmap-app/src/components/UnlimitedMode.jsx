import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { FaTimes } from "react-icons/fa";
import Globe from "./GlobeComponents/Globe";
//import GlobeTest from "./TestComponents/GlobeTest"; //don't delete used for integration testing. Commented out when not testing
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
  const [isCollapsed, setIsCollapsed] = useState(false); //making the fact box collapse
  const navigate = useNavigate();

  // Retrieve selected country from context
  const { selectedCountry } = useCountrySelection();
  const prevSelectedCountryRef = useRef(null); // ref for tracking country selection changes

  // Wrap modal handlers in useCallback to avoid unnecessary re-renders
  const handleOpenModal = useCallback(() => setIsModalOpen(true), []);
  const handleCloseModal = useCallback(() => setIsModalOpen(false), []);

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
    if (isAnswered) return; //prevent multiple submits
    if (!selectedCountry) {
      alert("Please select a country on the globe first.");
      return;
    }
    setIsCollapsed(false); //show fact after submission(if it was hidden)
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
      setIsAnswered(false);
    }
    setQuestionFinished(true);
  }, [isAnswered, selectedCountry, currentFact, attempts]);

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
            className="text-white rounded-full p-2 hover:text-red-600 transition-colors"
          >
            <FaTimes size={50} />
          </button>
        </div>

        {/* Hover Menu */}
        <div className="absolute top-0 left-0 z-50">
          <HoverDropMenu onSignInClick={handleOpenModal} />
        </div>

        {/* Overlay Container */}
        <div className="absolute top-0 left-0 w-full flex justify-center items-start mt-5 z-30 pointer-events-none">
          <div className="bg-white bg-opacity-0 p-4 rounded-xl w-11/12 max-w-3xl pointer-events-none">
            {/* When collapsed, show the "Show Fact" button at the absolute top */}
            {isCollapsed && (
              <div className="w-full flex justify-center pointer-events-auto mb-2">
                <button
                  onClick={() => setIsCollapsed(false)}
                  className="bg-white text-black rounded-full p-1 hover:bg-green-600 transition-colors"
                >
                  Show Fact
                </button>
              </div>
            )}
            {/* COLLAPSIBLE SECTION: Score, Instruction, Fact Box */}
            <div className={`${isCollapsed ? "hidden" : "block"}`}>
              <div className="mb-1 text-center font-bold text-white text-xl">Score: {score}</div>
              <div className="mb-1 text-center text-white">Guess the country based on the fact!</div>
              {currentFact && (
                <div className="mb-2 p-2 border border-white rounded relative">
                  <p className="text-center font-semibold text-white text-med">{currentFact.Fact}</p>
                </div>
              )}
            </div>
            {/* Non-collapsible Section */}
            <div className="mb-4 text-center text-white">
              Selected Country: {selectedCountry ? selectedCountry : "None"}
            </div>
            <div className="flex justify-center items-center">
              <button
                onClick={handleSubmitAnswer}
                className="bg-green-600 text-white border border-white rounded-full py-2 px-6 hover:bg-green-500 transition-colors pointer-events-auto"
              >
                Submit Answer
              </button>
              {/* When fact is expanded, place the hide fact button to the right */}
              {!isCollapsed && (
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="ml-4 bg-white text-black rounded-full p-1 hover:bg-green-600 transition-colors pointer-events-auto"
                >
                  Hide Fact
                </button>
              )}
            </div>
            {/* Feedback Popup */}
            {feedback && (
              <div className={`mt-4 p-2 rounded text-center text-sm pointer-events-auto ${feedbackType === "correct" ? "bg-green-300 text-green-900" : "bg-red-300 text-red-900"}`}>
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
                    loadNewFact();
                  }}
                  className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors text-sm"
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
