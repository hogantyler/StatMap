import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorldMap from "../World_map.svg";
import HoverDropMenu from "./HoverDropMenu";
import Modal from "./Modal";
import Login from "./Login";
import { FaArrowLeft } from "react-icons/fa";
import factsData from "../data/data.json";
import Select from "react-select";

//Sample list of countries
const countries = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Argentina",
  "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
  "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin",
  "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil",
  "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cambodia", "Cameroon",
  "Canada", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo",
  "Costa Rica", "Croatia", "Cuba", "Cyprus", "Czechia", "Denmark",
  "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland",
  "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece",
  "Grenada", "Guatemala", "Guinea", "Guyana", "Haiti", "Honduras", "Hungary",
  "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati",
  "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia",
  "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Mauritania", "Mauritius", "Mexico",
  "Moldova", "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique",
  "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua",
  "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan",
  "Palau", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Saint Kitts and Nevis",
  "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino",
  "Sao Tome and Principe", "Saudi Arabia", "Senegal", "Serbia", "Seychelles",
  "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia",
  "South Africa", "South Korea", "Spain", "Sri Lanka", "Sudan", "Suriname",
  "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand",
  "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey",
  "Turkmenistan", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates",
  "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu",
  "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"
];

// Convert countries array to options for react-select
const countryOptions = countries.sort().map((country) => ({
  value: country,
  label: country,
}));


const PlayScreen = () => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [unusedFacts, setUnusedFacts] = useState([...factsData]); // all facts copy
  const [currentFact, setCurrentFact] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "correct" or "incorrect"
  const [isAnswered, setIsAnswered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // Function to load a new fact:
  const loadNewFact = () => {
    setUnusedFacts((prevUnused) => {
      let available = prevUnused;
      // Reset if we've used all facts
      if (available.length === 0) {
        available = [...factsData];
      }
      const randomIndex = Math.floor(Math.random() * available.length);
      const chosen = available[randomIndex];
      // Remove the chosen fact from the list
      const newUnused = available.filter((_, i) => i !== randomIndex);
      // Update currentFact with the chosen fact
      setCurrentFact(chosen);
      return newUnused;
    });
    // Reset other states for the new question
    setAttempts(0);
    setSelectedOption("");
    setFeedback("");
    setFeedbackType("");
    setIsAnswered(false);
  };

  // Load an initial fact on mount:
  useEffect(() => {
    if (!currentFact) {
      loadNewFact();
    }
  }, [currentFact]);

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
      setTimeout(() => {
        loadNewFact();
      }, 2000);
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
        setIsAnswered(false); // allow another try
      } else {
        setFeedback(`Incorrect! The correct answer is ${currentFact.Correct_Country}.`);
        setFeedbackType("incorrect");
        setTimeout(() => {
          loadNewFact();
        }, 2000);
      }
    }
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);
  const handleBack = () => navigate("/");

  return (
    <div
      className="min-h-screen relative bg-cover bg-center"
      style={{ backgroundImage: `url(${WorldMap})` }}
    >
      {/* Hover Menu in top left */}
      <HoverDropMenu onSignInClick={handleOpenModal} />

      {/* Back Button in top right */}
      <div className="absolute top-0 right-0 z-50">
        <button
          onClick={handleBack}
          className="bg-black text-white border border-white rounded-full p-2 hover:bg-white hover:text-black transition-colors"
        >
          <FaArrowLeft size={40} />
        </button>
      </div>

      {/* Overlay container */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white bg-opacity-90 p-12 rounded-xl w-11/12 max-w-3xl shadow-lg">
        {/* Score Display Above the Fact */}
        <div className="mb-4 text-center font-bold text-gray-800 text-xl">
          Score: {score}
        </div>
        {/* Instruction text */}
        <div className="mb-4 text-center text-lg text-gray-800">
          Guess the country based on the fact!
        </div>
        {/* Fact Display */}
        {currentFact && (
          <div className="mb-6 p-4 border border-gray-300 rounded">
            <p className="text-center font-semibold text-gray-800">{currentFact.Fact}</p>
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
        {/* Country Selection Form using react-select */}
        <form onSubmit={handleSubmit}>
          <div className="text-center">
            <div className="mb-2 inline-block text-left max-w-xs w-full">
              <label htmlFor="countrySelect" className="font-bold block mb-2">
                Select a country:
              </label>
              <Select
                id="countrySelect"
                options={countryOptions}
                value={selectedOption}
                onChange={setSelectedOption}
                placeholder="-- Choose a country --"
                className="w-full"
              />
            </div>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-black text-white border border-white rounded-full py-2 hover:bg-white hover:text-black transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-center items-center">
        <button className="bg-gradient-to-r from-black to-blue-400 text-white py-2 px-4 mx-1 rounded-lg"
          onClick={() => navigate("/globe")}>
          GLOBE MODE
        </button>
      </div>


      {/* Login Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Login />
      </Modal>
    </div>
  );
};

export default PlayScreen;



