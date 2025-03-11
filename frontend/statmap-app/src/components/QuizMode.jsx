import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Globe from "./Globe";
import HoverDropMenu from "./HoverDropMenu";
import Modal from "./Modal";
import Login from "./Login";
import { FaArrowLeft } from "react-icons/fa";
import Select from "react-select";
import factsData from "../data/data.json";

// Sample list of countries for the dropdown
const countries = [
  "Afghanistan",
  "Albania",
  "Algeria",
  "Andorra",
  "Angola",
  "Argentina",
  "Armenia",
  "Australia",
  "Austria",
  "Azerbaijan",
  "Bahamas",
  "Bahrain",
  "Bangladesh",
  "Barbados",
  "Belarus",
  "Belgium",
  "Belize",
  "Benin",
  "Bhutan",
  "Bolivia",
  "Bosnia and Herzegovina",
  "Botswana",
  "Brazil",
  "Brunei",
  "Bulgaria",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Cameroon",
  "Canada",
  "Chad",
  "Chile",
  "China",
  "Colombia",
  "Comoros",
  "Congo",
  "Costa Rica",
  "Croatia",
  "Cuba",
  "Cyprus",
  "Czechia",
  "Denmark",
  "Djibouti",
  "Dominica",
  "Dominican Republic",
  "Ecuador",
  "Egypt",
  "El Salvador",
  "Estonia",
  "Eswatini",
  "Ethiopia",
  "Fiji",
  "Finland",
  "France",
  "Gabon",
  "Gambia",
  "Georgia",
  "Germany",
  "Ghana",
  "Greece",
  "Grenada",
  "Guatemala",
  "Guinea",
  "Guyana",
  "Haiti",
  "Honduras",
  "Hungary",
  "Iceland",
  "India",
  "Indonesia",
  "Iran",
  "Iraq",
  "Ireland",
  "Israel",
  "Italy",
  "Jamaica",
  "Japan",
  "Jordan",
  "Kazakhstan",
  "Kenya",
  "Kiribati",
  "Kuwait",
  "Kyrgyzstan",
  "Laos",
  "Latvia",
  "Lebanon",
  "Lesotho",
  "Liberia",
  "Libya",
  "Liechtenstein",
  "Lithuania",
  "Luxembourg",
  "Madagascar",
  "Malawi",
  "Malaysia",
  "Maldives",
  "Mali",
  "Malta",
  "Mauritania",
  "Mauritius",
  "Mexico",
  "Moldova",
  "Monaco",
  "Mongolia",
  "Montenegro",
  "Morocco",
  "Mozambique",
  "Myanmar",
  "Namibia",
  "Nauru",
  "Nepal",
  "Netherlands",
  "New Zealand",
  "Nicaragua",
  "Niger",
  "Nigeria",
  "North Korea",
  "North Macedonia",
  "Norway",
  "Oman",
  "Pakistan",
  "Palau",
  "Panama",
  "Papua New Guinea",
  "Paraguay",
  "Peru",
  "Philippines",
  "Poland",
  "Portugal",
  "Qatar",
  "Romania",
  "Russia",
  "Rwanda",
  "Saint Kitts and Nevis",
  "Saint Lucia",
  "Saint Vincent and the Grenadines",
  "Samoa",
  "San Marino",
  "Sao Tome and Principe",
  "Saudi Arabia",
  "Senegal",
  "Serbia",
  "Seychelles",
  "Sierra Leone",
  "Singapore",
  "Slovakia",
  "Slovenia",
  "Solomon Islands",
  "Somalia",
  "South Africa",
  "South Korea",
  "Spain",
  "Sri Lanka",
  "Sudan",
  "Suriname",
  "Sweden",
  "Switzerland",
  "Syria",
  "Taiwan",
  "Tajikistan",
  "Tanzania",
  "Thailand",
  "Timor-Leste",
  "Togo",
  "Tonga",
  "Trinidad and Tobago",
  "Tunisia",
  "Turkey",
  "Turkmenistan",
  "Tuvalu",
  "Uganda",
  "Ukraine",
  "United Arab Emirates",
  "United Kingdom",
  "United States",
  "Uruguay",
  "Uzbekistan",
  "Vanuatu",
  "Venezuela",
  "Vietnam",
  "Yemen",
  "Zambia",
  "Zimbabwe",
];

const countryOptions = countries.sort().map((country) => ({
  value: country,
  label: country,
}));

const QuizMode = () => {
  // --- Quiz Logic States ---
  const [selectedOption, setSelectedOption] = useState(null);
  const [unusedFacts, setUnusedFacts] = useState([...factsData]);
  const [currentFact, setCurrentFact] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [questionNumber, setQuestionNumber] = useState(1); // NEW: Question counter
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "correct", "incorrect", or "final"
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false); //Flag for quiz completion
  const [questionFinished, setQuestionFinished] = useState(false); //for 'next' and 'source' buttons

  // --- Navigation & Modal States ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // --- Globe Background Setup (using existing Globe component) ---
  // (Globe component is imported and used below.)

  // --- Functions for Quiz Logic ---
  const loadNewFact = () => {
    fetch("https://statmapapi.world/api/random_fact/")
      .then(res => res.json())
      .then(fact => setCurrentFact(fact))
    /* setUnusedFacts((prevUnused) => {
      let available = prevUnused;
      if (available.length === 0) {
        available = [...factsData];
      }
      const randomIndex = Math.floor(Math.random() * available.length);
      const chosen = available[randomIndex];
      fetch("http://18.118.152.10:8000/api/random_fact/").then((res) =>
        console.log(res.json())
      );
      const newUnused = available.filter((_, i) => i !== randomIndex);
      setCurrentFact(chosen);
      return newUnused;
    }); */
    setAttempts(0);
    setSelectedOption(null);
    setFeedback("");
    setFeedbackType("");
    setIsAnswered(false);
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAnswered || !selectedOption) return;
    setIsAnswered(true);
    if (selectedOption.value === currentFact.country) {
      let points = 0;
      if (attempts === 0) points = 1000;
      else if (attempts === 1) points = 750;
      else if (attempts === 2) points = 500;
      else if (attempts === 3) points = 250;
      setScore((prev) => prev + points);
      setFeedback("Correct!");
      setFeedbackType("correct");
      setQuestionFinished(true)
    } else {
      if (attempts < 3) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        let hint = "";
        if (newAttempts === 1) {
          hint = `Hint: Continent - ${currentFact.continent}`;
        } else if (newAttempts === 2) {
          hint = `Hint: Continent - ${currentFact.continent}, Capital - ${currentFact.capital}`;
        } else if (newAttempts === 3) {
          hint = `Hint: Continent - ${currentFact.continent}, Capital - ${currentFact.capital}, Abbreviation - ${currentFact.abbrev}`;
        }
        setFeedback(`Incorrect! Try again. ${hint}`);
        setFeedbackType("incorrect");
        setIsAnswered(false);
      } else {
        setFeedback(
          `Incorrect! The correct answer is ${currentFact.country}.`
        );
        setFeedbackType("incorrect");
        setQuestionFinished(true);
      }
    }
    setSelectedOption(null);
  };

  // NEW: Function to restart the quiz after completion
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
    <div className="relative min-h-screen w-full">
      {/* Globe Background */}
      <Globe />
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
      {/* Quiz Overlay Container */}
      <div className="absolute top-0 left-0 w-full flex justify-center items-start mt-2 z-30">
        {quizComplete ? (
          // Final Quiz Popup
          <div className="bg-transparent p-10 rounded-xl w-11/12 max-w-3xl border-2 border-white shadow-xl text-center">
            <div className="mb-6 text-3xl font-bold text-white">
              Quiz Complete!
            </div>
            <div className="mb-6 text-2xl text-white">Final Score: {score}</div>
            <button
              onClick={handleRestartQuiz}
              className="bg-black text-white border border-white rounded-full py-3 px-6 hover:bg-white hover:text-black transition-colors text-lg"
            >
              Restart Quiz
            </button>
          </div>
        ) : (
          // Normal Quiz Content
          <div className="bg-transparent p-6 rounded-xl w-11/12 max-w-3xl border border-white shadow-lg">
            <div className="mb-2 text-center font-bold text-white text-med">
              Question: {questionNumber} of 10
            </div>
            <div className="mb-4 text-center font-bold text-white text-lg">
              Score: {score}
            </div>
            <div className="mb-4 text-center text-med text-white">
              Guess the country based on the fact!
            </div>
            {/* Fact Box */}
            {currentFact && (
              <div className="mb-6 p-4 border border-white rounded relative">
                <p className="text-center font-semibold text-white">
                  {currentFact.fact}
                </p>
              </div>
            )}
            {/* Feedback Popup */}
            {feedback && (
              <div
                className={`mb-4 p-2 rounded text-center ${feedbackType === "correct"
                  ? "bg-green-300 text-green-900"
                  : feedbackType === "final"
                    ? "bg-blue-300 text-blue-900"
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
                  href={currentFact.source}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-black text-white border border-white rounded-full py-2 px-4 hover:bg-white hover:text-black transition-colors"
                >
                  Source
                </a>
                <button
                  onClick={() => { setQuestionFinished(false); handleNextQuestion(); }}
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
        )}
      </div>

      {/* Login Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Login />
      </Modal>
    </div>
  );
};

export default QuizMode;
