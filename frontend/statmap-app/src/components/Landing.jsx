import React, { useState } from "react";
import { FaUser } from "react-icons/fa"; // Added profile icon import
import { BsFillQuestionSquareFill } from "react-icons/bs"; //question mark icon 
import BlackGlobe from '../black_globe.svg';
import HoverDropMenu from "./HoverDropMenu";
import Login from "./Login";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

/**
 * Landing page component that provides navigation, game modes, leaderboards, and a help modal.
 * 
 * @returns {JSX.Element} The main landing page layout
 */
const Landing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false); //modal for side bar menu
  const [isInstructionsModalOpen, setInstructionsModalOpen] = useState(false); //modal for instructions
  const navigate = useNavigate();

  const handleOpenModal = () => {
    console.log("Opening modal");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Modal close handler called");
    setIsModalOpen(false);
  };

  //instructions open/close handler
  const handleOpenInstructions = () => {
    console.log("Opening instructions modal");
    setInstructionsModalOpen(true);
  };

  const handleCloseInstructions = () => {
    console.log("Closing instructions modal");
    setInstructionsModalOpen(false);
  };

  const [leaderboard] = useState([ //arbitrary leaderboard placeholder data
    { name: 'GeoMaster', score: 985 },
    { name: 'MapExpert', score: 920 },
    { name: 'CountryPro', score: 875 },
    { name: 'CapitalWhiz', score: 810 }
  ]);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BlackGlobe})` }}
    >
      <HoverDropMenu onSignInClick={handleOpenModal} />

      <div className="flex flex-col justify-start items-center gap-4 p-4 w-full min-h-screen">

        <div className="flex flex-col justify-center items-center gap-2 bg-gradient-to-r from-gray-400 to-white text-black bg-opacity-90 p-4 rounded-lg shadow-lg m-1 mr-4 w-full max-w-[30rem]">
          <div><h3 className="text-xl font-semibold py-1">STATMAP</h3></div>
          <p className="text-sm py-1">Learn about different countries around the world.</p>
          <button className="bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black"
            onClick={() => navigate("/quiz")}>
            QUIZ
          </button>
          <button className="bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black"
            onClick={() => navigate("/unlimited")}>
            UNLIMITED
          </button>
        </div>

        <div className="flex flex-col justify-center items-center bg-gradient-to-r from-white to-gray-400 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">LEADERBOARDS</h3>
          <p className="text-sm mb-4">View the top players around the world.</p>

          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <div key={index} className="flex justify-between items-center text-base">
                <span className="w-6 font-medium">{index + 1}.</span>
                <span className="flex-1 ml-2 flex items-center gap-2">
                  <FaUser className="w-4 h-4" /> {/* Adds profile icon */}
                  {player.name}
                </span>
                <span className="font-medium">Score: {player.score}</span>
              </div>
            ))}
          </div>

          <button className=" bg-black text-white py-2 px-4 mt-4 rounded-lg hover:bg-white hover:text-black border border-black"
            onClick={() => alert("leaderboard in progress")}>
            VIEW
          </button>
        </div>


      </div>


      <button className="fixed bottom-1 right-1 text-black bg-gray-300 text-opacity-1 py-2 px-4 mt-40 rounded-lg hover:bg-black hover:text-blue-500"
        onClick={() => navigate("/globeModeTest")}>
        GlobeModeTest
      </button>


      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Login />
      </Modal>

      {/* Modal for Game Instructions */}
      <Modal isOpen={isInstructionsModalOpen} onClose={handleCloseInstructions}>
        <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Game Instructions</h2>
          <p className="text-sm">
            Welcome to STATMAP! To play the game, you will be presented with a fact or statistic about a country from our custom database.
            Your task is to choose the correct country from the dropdown menu. The game tests your knowledge of global geography and country-specific facts.
            Good luck and have fun!
          </p>
        </div>
      </Modal>

      {/* Question mark icon at the bottom left */}
      <button
        onClick={handleOpenInstructions}
        className="fixed bottom-4 left-6 z-50 focus:outline-none"
      >
        <BsFillQuestionSquareFill size={50} className="text-black" />
      </button>

    </div>
  );
};

export default Landing;