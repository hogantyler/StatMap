import React, { useContext, useEffect, useState } from "react";
import { FaUser } from "react-icons/fa"; // Added profile icon import
import { BsFillQuestionSquareFill } from "react-icons/bs"; //question mark icon
import BlackGlobe from "../black_globe.svg";
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
  const [modalContent, setModalContent] = useState(null); //modal content decides what is shown when modal is open
  const [isModalOpen, setIsModalOpen] = useState(false); //state of whether the modal is open or closed
  const navigate = useNavigate();

  const handleOpenModal = (content) => {
    //takes component, html, etc as content to display when the modal is open
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    //closes the modal and resets the content to null
    setIsModalOpen(false);
    setModalContent(null);
  };

  const [leaderboard] = useState([
    //arbitrary leaderboard placeholder data
    { name: "GeoMaster", score: 985 },
    { name: "MapExpert", score: 920 },
    { name: "CountryPro", score: 875 },
    { name: "CapitalWhiz", score: 810 },
  ]);

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${BlackGlobe})` }}
    >
      <HoverDropMenu onSignInClick={(e) => handleOpenModal(<Login />)} />

      <div className="flex flex-col justify-start items-center gap-4 p-4 w-full min-h-screen">
        {/* Game Card */}
        <div className="flex flex-col justify-center items-center gap-2 bg-gradient-to-r from-gray-400 to-white text-black bg-opacity-90 p-4 m-1 mb-4 rounded-lg shadow-lg  mr-4 w-full max-w-[30rem]">
          <div>
            <h3 className="text-xl font-semibold py-1">STATMAP</h3>
          </div>
          <p className="text-sm py-1">
            Learn about different countries around the world.
          </p>
          <button
            className="bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black"
            onClick={() => navigate("/quiz")}
          >
            QUIZ
          </button>
          <button
            className="bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black"
            onClick={() => navigate("/unlimited")}
          >
            UNLIMITED
          </button>
        </div>

        {/* Leaderboard Card */}
        <div className="flex flex-col justify-center items-center bg-gradient-to-r from-white to-gray-400 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-semibold">LEADERBOARDS</h3>
          <p className="text-sm mb-4">View the top players around the world.</p>

          <div className="space-y-4">
            {leaderboard.map((player, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-base"
              >
                <span className="w-6 font-medium">{index + 1}.</span>
                <span className="flex-1 ml-2 flex items-center gap-2">
                  <FaUser className="w-4 h-4" /> {/* Adds profile icon */}
                  {player.name}
                </span>
                <span className="font-medium">Score: {player.score}</span>
              </div>
            ))}
          </div>

          <button
            className=" bg-black text-white py-2 px-4 mt-4 rounded-lg hover:bg-white hover:text-black border border-black"
            onClick={() => alert("leaderboard in progress")}
          >
            VIEW
          </button>
        </div>
      </div>

      <button
        className="fixed left-1 top-1 text-white bg-black text-opacity-1 py-2 px-4 mt-40 rounded-lg hover:text-blue-500"
        onClick={() => navigate("/lobbyTest")}
      >
        LOBBY
      </button>

      <button
        className="fixed bottom-1 right-1 text-white bg-black text-opacity-1 py-2 px-4 mt-40 rounded-lg hover:text-blue-500"
        onClick={() => navigate("/globeModeTest")}
      >
        GlobeModeTest
      </button>

      <button
        className="fixed bottom-10 right-1 text-white bg-black text-opacity-1 my-2 py-2 px-4 mt-40 rounded-lg hover:text-blue-500"
        onClick={() => navigate("/globeModeTestPart2")}
      >
        GlobeModeTestPart2
      </button>

      {/* Modal compoent that gets opened when handleOpenModal is called and displays the passed content */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalContent}
      </Modal>

      <button //calls modal to open and passes the instructions as content to display
        onClick={() =>
          handleOpenModal(
            <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
              <h2 className="text-xl font-semibold mb-2">Game Instructions</h2>
              <p className="text-sm">
                Welcome to STATMAP! To play the game, you will be presented with
                a fact or statistic about a country from our custom database.
                Your task is to choose the correct country from the dropdown
                menu. The game tests your knowledge of global geography and
                country-specific facts. Good luck and have fun!
              </p>
            </div>
          )
        }
        className="fixed bottom-4 left-6 z-50 focus:outline-none"
      >
        <BsFillQuestionSquareFill size={50} className="text-black" />
      </button>
    </div>
  );
};

export default Landing;
