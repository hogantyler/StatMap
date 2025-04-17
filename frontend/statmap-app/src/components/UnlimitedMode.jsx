import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { X, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import Globe from "./GlobeComponents/Globe";
//import GlobeTest from "./TestComponents/GlobeTest"; //don't delete used for integration testing. Commented out when not testing
import SignIn from "./SignIn";
import SignUp from "./SignUp";
import AccountPage from "./AccountPage";
import Modal from "./Modal";
import Loading from "./Loading";
import { supabase } from "./SupabaseContext";
import { CountrySelectionProvider, useCountrySelection } from "./CountrySelectionContext";
import { playClickSound } from "../utils/soundUtils";
import { cn } from "../lib/utils";

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
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

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
    playClickSound();
    if (isAnswered) return; //prevent multiple submits
    if (!selectedCountry.name) {
      alert("Please select a country on the globe first.");
      return;
    }
    setIsCollapsed(false); //show fact after submission(if it was hidden)
    setIsAnswered(true);
    const answer = selectedCountry.name || "";
    if (answer.code == currentFact?.Correct_Country.CC_Abbrev) {
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

  // Modified handleReportFact to accept a report type parameter
  const handleReportFact = async (reportType) => {
    playClickSound();
    if (!currentFact) return;
    try {
      const { error } = await supabase.from("Fact Reports").insert([
        {
          Fact_ID: currentFact.Fact_ID, // Adjust this if your field name is different
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

  const handleBack = useCallback(() => {
    playClickSound();
    navigate("/");
  }, [navigate]);

  return (
    <Suspense fallback={<Loading />}>
      <div className="relative min-h-screen w-full">
        {/* Globe Background */}
        <Globe />

        {/* Back Button in top right */}
        <button
          onClick={handleBack}
          className="absolute top-6 right-6 z-50 bg-zinc-900/80 border border-white/10 p-2 rounded-full text-white/70 hover:text-red-400 hover:bg-zinc-800/80 transition-all duration-200"
          title="Return to Home"
        >
          <X size={20} />
        </button>

        {/* Hover Menu in top left */}
        <div className="absolute top-0 left-0 z-50">
          {/* <HoverDropMenu onSignInClick={(e) => handleOpenModal(<SignIn onSignUpClick={(e) => handleOpenModal(<SignUp onModalClose={handleCloseModal}/>)} onModalClose={handleCloseModal}/>)} onAccountPageClick={(e) => handleOpenModal(<AccountPage onModalClose={handleCloseModal}/>)} onModalClose={handleCloseModal}/> */}
          <HoverDropMenu />
        </div>

        {/* Game Overlay Container */}
        <div className="absolute inset-x-0 top-10 flex flex-col items-center z-30">
          <div className="max-w-xl w-full px-4">
            {/* Combined Score and Fact Box */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden mb-3">
              {/* Header with Score and Toggle */}
              <div className="flex justify-between items-center p-3">
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
                    loadNewFact();
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

        {/* <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <SignIn />
        </Modal> */}
        
        {/* Report Fact Modal */}
        <Modal
          isOpen={isReportModalOpen}
          onClose={() => {
            playClickSound();
            setIsReportModalOpen(false);
          }}
        >
          <div className="p-4">
            <h2 className="mb-4 text-lg font-bold text-white">Report Fact</h2>
            <p className="mb-4 text-white/70">
              Please select a reason for reporting this fact:
            </p>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleReportFact("INCORRECT_INFORMATION")}
                className="bg-zinc-800/50 text-white/70 rounded py-2 px-4 hover:bg-zinc-700/50 hover:text-white transition-colors"
              >
                Incorrect information
              </button>
              <button
                onClick={() => handleReportFact("CLUE_IN_FACT")}
                className="bg-zinc-800/50 text-white/70 rounded py-2 px-4 hover:bg-zinc-700/50 hover:text-white transition-colors"
              >
                Clue in the fact
              </button>
              <button
                onClick={() => handleReportFact("INAPPROPRIATE_CONTENT")}
                className="bg-zinc-800/50 text-white/70 rounded py-2 px-4 hover:bg-zinc-700/50 hover:text-white transition-colors"
              >
                Inappropriate content
              </button>
              <button
                onClick={() => handleReportFact("MULTIPLE_COUNTRIES")}
                className="bg-zinc-800/50 text-white/70 rounded py-2 px-4 hover:bg-zinc-700/50 hover:text-white transition-colors"
              >
                Fact holds true for more than one country
              </button>
            </div>
          </div>
        </Modal>
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
