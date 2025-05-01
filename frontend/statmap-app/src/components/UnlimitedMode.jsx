import React, { useState, useEffect, Suspense, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { X, AlertTriangle, ArrowRight, ChevronDown, ChevronUp, ExternalLink, User } from "lucide-react";
//import Globe from "./GlobeComponents/Globe";
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
import RotationButton from "./RotationButton";

const Globe = React.lazy(() => import("./GlobeComponents/Globe")); // Lazy load the Globe component

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
  const [typingDone, setTypingDone] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

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
    const answer = selectedCountry;
    if (answer.code === currentFact?.CC_Abbrev) {
      let points = attempts === 0 ? 1000 : attempts === 1 ? 750 : attempts === 2 ? 500 : 250;
      setScore((prev) => prev + points);
      setFeedback("Correct!");
      setFeedbackType("correct");
      setQuestionFinished(true);
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
        setQuestionFinished(true);
      }
      setIsAnswered(false);
    }
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
    navigate("/", {
      state: {
        loadingMessage: "Returning to main menu..."
      }
    });
  }, [navigate]);

  useEffect(() => {
    // Simulate a delay to mimic loading assets (or wait on real setup)
    const loadAssets = async () => {
      await new Promise((res) => setTimeout(res, 1000));
      setAssetsLoaded(true);
    };
    loadAssets();
  }, []);

  if (!typingDone || !assetsLoaded) {
    return <Loading message="Loading unlimited mode... select your guess on the globe." onComplete={() => setTypingDone(true)} />;
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

        {/* Back Button in top right */}
        <button
          onClick={handleBack}
          className="fixed top-6 right-6 z-50 bg-zinc-900/80 border border-red-400 p-2 rounded-full text-white/70 hover:text-red-400 hover:bg-zinc-800/80 transition-all duration-200"
          title="Return to Home"
        >
          <X size={20} />
        </button>

        {/* Rotation Button in top center */}
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50">
          <RotationButton />
        </div>

        {/* Hover Menu in top left */}
        <div className="fixed top-0 left-0 z-50">
          {/* <HoverDropMenu onSignInClick={(e) => handleOpenModal(
          <SignIn onSignUpClick={(e) => handleOpenModal(<SignUp onModalClose={handleCloseModal}/>)} onModalClose={handleCloseModal}/>)} 
          onAccountPageClick={(e) => handleOpenModal(<AccountPage onModalClose={handleCloseModal}/>)} onModalClose={handleCloseModal}/> */}
          <HoverDropMenu />
        </div>

        {/* UI Container - Moved to bottom of screen */}
        <div className="fixed inset-x-0 bottom-2 flex flex-col items-center z-30 pointer-events-none">
          <div className="max-w-sm w-full px-2 pointer-events-auto">
            {/* Score and Collapsible Fact Box */}
            <div className="bg-zinc-900/40 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden mb-2">
              {/* Header with Score and Toggle */}
              <div className="flex justify-between items-center p-2">
                <div className="flex items-center gap-1">
                  <div className="text-white/70 text-xs">Score</div>
                  <div className="bg-zinc-800 text-white px-2 py-1 rounded text-xs font-medium">{score}</div>
                </div>
                <button
                  onClick={() => {
                    playClickSound();
                    setIsCollapsed(!isCollapsed);
                  }}
                  className="text-white/60 hover:text-white"
                >
                  {isCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              </div>

              {/* Collapsible Fact Content */}
              {!isCollapsed && currentFact && (
                <div className="p-2 border-t border-white/10">
                  <div className="flex items-center gap-1 mb-1">
                    <div className="font-medium text-white text-sm">Country Fact</div>
                  </div>
                  <p className="text-white/90 text-sm leading-relaxed">{currentFact.Fact}</p>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="mt-2 bg-zinc-900/60 backdrop-blur-sm border border-white/10 rounded-lg p-2">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center">
                  <div className="text-white/70 text-sm">Selected Country</div>
                  <div className="text-white font-medium text-sm">{selectedCountry.name || "None"}</div>
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
                {/* Buttons directly under the feedback banner */}
                {questionFinished && (
                  <div className="grid grid-cols-3 gap-0 w-full mt-2">
                    <a
                      href={currentFact.Source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-zinc-900/60 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-zinc-800/60 transition-colors text-sm flex items-center justify-center py-2"
                    >
                      <ExternalLink size={14} />
                      <span>Source</span>
                    </a>
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="bg-zinc-900/60 backdrop-blur-sm border border-white/10 text-white/70 hover:text-white hover:bg-zinc-800/60 transition-colors text-sm flex items-center justify-center py-2"
                    >
                      <AlertTriangle size={14} />
                      <span>Report</span>
                    </button>
                    <button
                      onClick={() => {
                        setQuestionFinished(false);
                        loadNewFact();
                      }}
                      className="bg-sky-500/50 text-sky-400 border border-sky-500/60 hover:bg-sky-500/60 transition-colors text-sm font-medium flex items-center justify-center py-2"
                    >
                      <ArrowRight size={14} />
                      <span>Next</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          <SignIn />
        </Modal> */}

        {/* Report Fact Modal */}
        <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title={"Report"} icon={User} iconColor={"sky"}>
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