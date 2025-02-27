import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { useNavigate } from "react-router-dom";
import HoverDropMenu from "./HoverDropMenu";
import { FaArrowLeft } from "react-icons/fa";
import Select from "react-select";
import factsData from "../data/data.json";

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

function Globe() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [unusedFacts, setUnusedFacts] = useState([...factsData]); // copy of all facts
  const [currentFact, setCurrentFact] = useState(null);
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [feedbackType, setFeedbackType] = useState(""); // "correct" or "incorrect"
  const [isAnswered, setIsAnswered] = useState(false);
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
    navigate("/play"); // Navigate back to the main PlayScreen if desired
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
        <HoverDropMenu onSignInClick={() => {}} />
      </div>
      {/* Overlay container */}
      <div className="absolute top-0 left-0 w-full flex justify-center items-start mt-10 z-50">
        <div className="bg-white bg-opacity-0 p-6 rounded-xl w-11/12 max-w-3xl shadow-lg">
          {/* Score Display */}
          <div className="mb-4 text-center font-bold text-white text-xl">
            Score: {score}
          </div>
          {/* Instruction Text */}
          <div className="mb-4 text-center text-lg text-white">
            Guess the country based on the fact!
          </div>
          {/* Fact Display */}
          {currentFact && (
            <div className="mb-6 p-4 border border-white rounded">
              <p className="text-center font-semibold text-white">
                {currentFact.Fact}
              </p>
            </div>
          )}
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
                <label htmlFor="countrySelect" className="font-bold block mb-2 text-white">
                  Select a country:
                </label>
                <Select
                  id="countrySelect"
                  options={countryOptions}
                  value={selectedOption}
                  onChange={setSelectedOption}
                  placeholder="-- Choose a country --"
                />
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
      </div>
      {/* Globe Canvas */}
      <div className="absolute top-0 left-0 w-full h-full">
        <Canvas
          camera={{ position: [0, 2.5, 2.5], near: 0.01, far: 1000 }}
          style={{ background: "black", width: "100vw", height: "100vh" }}
        >
          <ambientLight intensity={1.5} />
          <directionalLight position={[2, 2, 2]} intensity={1.5} />
          <directionalLight position={[-2, -2, -2]} intensity={1.5} />
          <directionalLight position={[-1, 2, 0]} intensity={1.0} />
          <OrbitControls
            enableZoom={true}
            enableRotate={true}
            minDistance={1.05}
            maxDistance={4}
            zoomSpeed={0.5}
          />
          <Stars radius={50} depth={50} count={2000} factor={4} saturation={0} fade />
          <mesh ref={globeRef}>
            <sphereGeometry args={[1, 50, 50]} />
            <meshStandardMaterial map={texture} roughness={2} />
          </mesh>
          <RotateGlobe globeRef={globeRef} />
        </Canvas>
      </div>
    </div>
  );
}

function RotateGlobe({ globeRef }) {
  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.001;
    }
  });
  return null;
}

export default Globe;