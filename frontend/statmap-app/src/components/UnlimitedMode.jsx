import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { FaArrowLeft } from "react-icons/fa";
import Select from "react-select";
import factsData from "../data/data.json";
import Globe from "./Globe";
import Login from "./Login";
import Modal from "./Modal";

// Sample list of countries
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

const countryOptions = countries.sort().map((country) => ({
    value: country,
    label: country,
}));

function UnlimitedMode() {
    const [isModalOpen, setIsModalOpen] = useState(false); //modal for side bar menu
    const [selectedOption, setSelectedOption] = useState(null);
    const [unusedFacts, setUnusedFacts] = useState([...factsData]); // copy of all facts
    const [currentFact, setCurrentFact] = useState(null);
    const [attempts, setAttempts] = useState(0);
    const [score, setScore] = useState(0);
    const [feedback, setFeedback] = useState("");
    const [feedbackType, setFeedbackType] = useState(""); // "correct" or "incorrect"
    const [isAnswered, setIsAnswered] = useState(false);
    const navigate = useNavigate();

    const handleOpenModal = () => {
        console.log("Opening modal");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        console.log("Modal close handler called");
        setIsModalOpen(false);
    };

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

    const handleBack = () => {
        navigate("/"); // Navigate back to the main PlayScreen if desired
    };

    // Globe-specific logic
    const globeRef = useRef();
    const texture = new THREE.TextureLoader().load("/earth_texture.jpg", (texture) => {
        texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.repeat.set(1, 1);
    }, undefined, (err) => {
        console.error("Error loading texture:", err);
    });

    return (
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
                            <div className="absolute bottom-0 right-0">
                                <a
                                    href={currentFact.Source}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-white underline"
                                >
                                    Source
                                </a>
                            </div>
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
                                    placeholder="-- Choose a country --"
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
            <Globe />
        </div>
    );
}

export default UnlimitedMode;