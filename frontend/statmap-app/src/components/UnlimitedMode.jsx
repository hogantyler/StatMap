import { useState, useEffect, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { FaArrowLeft } from "react-icons/fa";
import Select from "react-select";
import Globe from "./Globe";
import Login from "./Login";
import Modal from "./Modal";
import Loading from "./Loading";
import { supabase } from "./SupabaseContext";
import GlobeTest from "./TestComponents/GlobeTest";


function UnlimitedMode() {
    const [isModalOpen, setIsModalOpen] = useState(false); //modal for side bar menu
    const [selectedOption, setSelectedOption] = useState(null);
    const [currentFact, setCurrentFact] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState(""); // "correct" or "incorrect"
    const [isAnswered, setIsAnswered] = useState(false);
    const [questionFinished, setQuestionFinished] = useState(false); //for 'next' and 'source' buttons
    const navigate = useNavigate();
    const [countryOptions, setCountryOptions] = useState([]);
    
      useEffect(() => {
        async function fetchCountries() {
          const { data, error } = await supabase.from("Countries").select();
          if (error) {
            console.error("Error fetching countries:", error);
          } else if (data) {
            const options = data.map(item => ({
              value: item.Country,
              label: item.Country,
            }));
            setCountryOptions(options);
          }
        }
        fetchCountries();
      }, []);
    

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    // Function to load a new fact:
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
        setSelectedOption(null);
        setFeedback("");
        setFeedbackType("");
        setIsAnswered(false);
      };

    useEffect(() => {
        loadNewFact();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isAnswered || !selectedOption) return;

        setIsAnswered(true);
        if (selectedOption.value === currentFact.Correct_Country) {
            let points = 0;
            if (attempts === 0) points = 1000;
            else if (attempts === 1) points = 750;
            else if (attempts === 2) points = 500;
            else if (attempts === 3) points = 250;
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
            } else {
                setFeedback(`Incorrect! The correct answer is ${currentFact.Correct_Country}.`);
                setFeedbackType("incorrect");
                setQuestionFinished(true);
            }
        }
        setSelectedOption(null);
    };

    const handleBack = () => {
        navigate("/"); // Navigate back to the main PlayScreen if desired
    };


    return (
        <Suspense fallback={<Loading />}>
            <div className="relative w-full h-full">

                {/* Back Button in top right */}
                <div className="absolute top-0 right-0 z-50">
                    <button
                        onClick={handleBack}
                        className="bg-black text-white border border-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
                    >
                        <FaArrowLeft size={40} />
                    </button>
                </div>

                {/* Hover Menu in top left */}
                <div className="absolute top-0 left-0 z-50">
                    <HoverDropMenu onSignInClick={handleOpenModal} />
                </div>

                {/* Overlay container */}
                <div className="absolute top-0 left-0 w-full flex justify-center items-start mt-5 z-30">
                    <div className="bg-white bg-opacity-0 p-4 rounded-xl w-11/12 max-w-3xl">
                        {/* Score Display */}
                        <div className="mb-1 text-center font-bold text-white text-xl">
                            Score: {score}
                        </div>
                        {/* Instruction Text */}
                        <div className="mb-1 text-center text-med text-white">
                            Guess the country based on the fact!
                        </div>
                        {/* Fact Box */}
                        {currentFact && (
                            <div className="mb-6 p-4 border border-white rounded relative">
                                <p className="text-center font-semibold text-white">
                                    {currentFact.Fact}
                                </p>
                            </div>
                        )}
                        {/* Feedback Popup */}
                        {feedback && (
                            <div
                                className={`mb-4 p-2 rounded text-center ${feedbackType === "correct"
                                    ? "bg-green-300 text-green-900"
                                    : "bg-red-300 text-red-900"
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
                                    onClick={() => { setQuestionFinished(false); loadNewFact(); }}
                                    className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                        {/* Country Selection Form */}
                        <form onSubmit={handleSubmit}>
                            <div className="text-center">
                                <div className="mb-2 inline-block text-left max-w-xs w-full">
                                    <label
                                        htmlFor="countrySelect"
                                        className="font-bold block mb-2 text-white"
                                    >
                                        Select a country:
                                    </label>
                                    <Select
                                        id="countrySelect"
                                        options={countryOptions}
                                        value={selectedOption}
                                        onChange={setSelectedOption}
                                        placeholder="-- Search/Choose a country --"
                                        styles={{
                                            control: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: "transparent",
                                                border: "1px solid white",
                                                boxShadow: state.isFocused ? "0 0 0 1px white" : provided.boxShadow,
                                                "&:hover": {
                                                    border: "1px solid white",
                                                },
                                            }),
                                            input: (provided) => ({
                                                ...provided,
                                                color: "white", // Typed text is white
                                            }),
                                            singleValue: (provided) => ({
                                                ...provided,
                                                color: "white",
                                            }),
                                            placeholder: (provided) => ({
                                                ...provided,
                                                color: "white",
                                            }),
                                            menu: (provided) => ({
                                                ...provided,
                                                backgroundColor: "transparent",
                                                border: "1px solid white",
                                            }),
                                            option: (provided, state) => ({
                                                ...provided,
                                                backgroundColor: state.isSelected
                                                    ? "rgba(255,255,255,0.3)"
                                                    : state.isFocused
                                                        ? "rgba(255,255,255,0.2)"
                                                        : "transparent",
                                                color: "white",
                                                "&:hover": {
                                                    backgroundColor: "rgba(255,255,255,0.2)",
                                                },
                                            }),
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="text-center">
                                <button
                                    type="submit"
                                    className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors"
                                >
                                    Submit
                                </button>

                            </div>
                        </form>
                    </div>
                </div>

                <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                    <Login />
                </Modal>

                {/* Globe Canvas */}
                <GlobeTest />
            </div>
        </Suspense>
    );
}

export default UnlimitedMode;