import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WorldMap from "../World_map.svg";
import HoverDropMenu from "./HoverDropMenu";
import Modal from "./Modal";
import Login from "./Login";
import { FaArrowLeft } from "react-icons/fa";

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

// Sample fact data
const facts = [
  {
    "Fact_ID": "14",
    "Fact": "The United States was gifted the Statue of Liberty by this country.",
    "Source": "https://en.wikipedia.org/wiki/Statue_of_Liberty",
    "CC_ID": "61",
    "Correct_Country": "France",
    "CC_Continent": "Europe",
    "CC_Capital": "Paris",
    "CC_Abbrev": "FRA"
  },
  {
    "Fact_ID": "95",
    "Fact": "Maintain three capital cities",
    "Source": "https://en.wikipedia.org/wiki/South_Africa",
    "CC_ID": "160",
    "Correct_Country": "South Africa",
    "CC_Continent": "Africa",
    "CC_Capital": "Cape Town",
    "CC_Abbrev": "ZAF"
  },
  {
    "Fact_ID": "90",
    "Fact": "More than half of the country is covered with forests, making it one of the greenest countries in the world",
    "Source": "https://the-slovenia.com/en/slovenia/top-100-facts-about-slovenia/",
    "CC_ID": "157",
    "Correct_Country": "Slovenia",
    "CC_Continent": "Europe",
    "CC_Capital": "Ljubljana",
    "CC_Abbrev": "SVN"
  },
  {
    "Fact_ID": "62",
    "Fact": "This country features historical underground vaults, often referred to as a prison, with legends of vast, maze-like chambers.",
    "Source": "https://en.wikipedia.org/wiki/Qara_Prison?utm_source=chatgpt.com",
    "CC_ID": "117",
    "Correct_Country": "Morocco",
    "CC_Continent": "Africa",
    "CC_Capital": "Rabat",
    "CC_Abbrev": "MAR"
  },
  {
    "Fact_ID": "123",
    "Fact": "This country is the second largest banana producer in the world",
    "Source": "https://www.safarisrwandasafari.com/information/facts-about-uganda-that-you-should-know/",
    "CC_ID": "183",
    "Correct_Country": "Uganda",
    "CC_Continent": "Africa",
    "CC_Capital": "Kampala",
    "CC_Abbrev": "UGA"
  }
];

// Helper to pick a random fact from our list.
const getRandomFact = () => {
  const randomIndex = Math.floor(Math.random() * facts.length);
  return facts[randomIndex];
};

const PlayScreen = () => {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [currentFact, setCurrentFact] = useState(getRandomFact());
  const [attempts, setAttempts] = useState(0); // counts wrong attempts for current fact
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "correct" or "incorrect"
  const [isAnswered, setIsAnswered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const loadNewFact = () => {
    setCurrentFact(getRandomFact());
    setAttempts(0);
    setSelectedCountry("");
    setFeedback("");
    setFeedbackType("");
    setIsAnswered(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isAnswered || !selectedCountry) return;

    // Prevent further submissions for the current fact.
    setIsAnswered(true);

    if (selectedCountry === currentFact.Correct_Country) {
      let points = 0;
      if (attempts === 0) points = 1000;
      else if (attempts === 1) points = 750;
      else if (attempts === 2) points = 500;
      else if (attempts === 3) points = 250;
      setScore(prev => prev + points);
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
        // Allow the user to try again
        setIsAnswered(false);
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
      <div className="absolute top-10 right-10 z-50">
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
        {/* Fact Display */}
        <div className="mb-6 p-4 border border-gray-300 rounded">
          <p className="text-center text-gray-800">{currentFact.Fact}</p>
        </div>
        {/* Feedback Popup */}
        {feedback && (
          <div
            className={`mb-4 p-2 rounded text-center ${
              feedbackType === "correct"
                ? "bg-green-300 text-green-900"
                : "bg-red-300 text-red-900"
            }`}
          >
            {feedback}
          </div>
        )}
        {/* Country Selection Form */}
        <form onSubmit={handleSubmit}>
          <div className="text-center">
            <div className="mb-4 inline-block text-left max-w-xs w-full">
              <label htmlFor="countrySelect" className="font-bold block mb-2">
                Select a country:
              </label>
              <select
                id="countrySelect"
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="w-full bg-gray-100 text-gray-800 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">-- Choose a country --</option>
                {[...countries].sort().map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="text-center">
            <button
              type="submit"
              className="bg-black text-white border border-white rounded-full w-3/5 py-3 hover:bg-white hover:text-black transition-colors"
            >
              Submit
            </button>
          </div>
        </form>
      </div>

      {/* Login Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Login />
      </Modal>
    </div>
  );
};

export default PlayScreen;




