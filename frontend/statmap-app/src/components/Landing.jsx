import React, { useContext, useEffect, useState, Suspense } from "react";
import { FaUser, FaGlobe } from "react-icons/fa"; // Added profile icon import
import { BsFillQuestionSquareFill, BsImage } from "react-icons/bs"; //question mark icon
import BlackGlobe from "../black_globe.svg";
import HoverDropMenu from "./HoverDropMenu";
import SignIn from "./SignIn";
import Modal from "./Modal";
import Loading from "./Loading";
import LandingGlobe from "./GlobeComponents/LandingGlobe";
import { useNavigate } from "react-router-dom";
import SignUp from "./SignUp";
import AccountPage from "./AccountPage";
import { useGraphicsSettings } from "./GraphicsContext";
import { playClickSound } from "../utils/soundUtils";

/**
 * Landing page component that provides navigation, game modes, leaderboards, and a help modal.
 *
 * @returns {JSX.Element} The main landing page layout
 */
const Landing = () => {
  // const [modalContent, setModalContent] = useState(null); //modal content decides what is shown when modal is open
  const { graphicsSettings, updateSettings } = useGraphicsSettings();
  const use3DGlobe = graphicsSettings.globeBackGround; //use3DGlobe is set to the value of globeBackGround in the graphicsSettings context
  
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  const handleOpenModal = (content) => {
    playClickSound();
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playClickSound();
    setIsModalOpen(false);
  };

  // toggleGlobeType is a function that toggles between 3D globe and 2D BlackGlobe svg for background of landing page
  const toggleGlobeType = () => {
    //setUse3DGlobe(prev => !prev);
    updateSettings({ globeBackGround: !use3DGlobe });
  };

  const [leaderboard] = useState([
    //arbitrary leaderboard placeholder data
    { name: "GeoMaster", score: 985 },
    { name: "MapExpert", score: 920 },
    { name: "CountryPro", score: 875 },
    { name: "CapitalWhiz", score: 810 },
  ]);

  return (
    <div className="relative w-full h-full">
      {/* Position background based on toggle state */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        {use3DGlobe ? (
          <Suspense fallback={<Loading />}>
            <LandingGlobe />
          </Suspense>
        ) : (
          <div
            className="min-h-screen bg-cover bg-center"
            style={{ backgroundImage: `url(${BlackGlobe})` }}
          />
        )}
      </div>

      {/* Toggle button for switching between globe types */}
      <button
        onClick={toggleGlobeType}
        className="fixed top-4 right-4 z-50 bg-white bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-150 transform hover:scale-105 hover:shadow-lg"
        title={use3DGlobe ? "Switch to SVG Globe" : "Switch to 3D Globe"}
      >
        {use3DGlobe ?  <BsImage size={24} /> : <FaGlobe size={24} />}
        {use3DGlobe ? "2D" : "3D"}
      </button>

      {/* Main content positioned on top of Globe */}
      <div className="relative z-10 w-full h-full ">
        {/* <HoverDropMenu onSignInClick={(e) => handleOpenModal(<SignIn onSignUpClick={(e) => handleOpenModal(<SignUp onModalClose={handleCloseModal}/>)} onModalClose={handleCloseModal}/>)} onAccountPageClick={(e) => handleOpenModal(<AccountPage onModalClose={handleCloseModal}/>)} onModalClose={handleCloseModal}/> */}
        <HoverDropMenu />

        <div className="flex flex-col justify-start items-center gap-4 p-4">
          {/* Game Card */}
          <div className="flex flex-col items-center gap-4 bg-white bg-opacity-50 text-black p-6 m-4 rounded-xl shadow-lg w-full max-w-[30rem] border border-gray-300">
            <h1 className="text-3xl font-helvetica font-extrabold">STATMAP</h1>
            <p className="text-base font-helvetica">
              Discover fascinating facts about countries around the world.
            </p>
            <button
              className="w-full bg-black text-white font-helvetica py-2 px-4 rounded-lg border border-black transform hover:scale-105 hover:shadow-lg transition-all duration-150"
              onClick={() => {
                playClickSound();
                navigate("/quiz");
              }}
            >
              QUIZ
            </button>
            <button
              className="w-full bg-black text-white font-helvetica py-2 px-4 rounded-lg border border-black transform hover:scale-105 hover:shadow-lg transition-all duration-150"
              onClick={() => {
                playClickSound();
                navigate("/unlimited");
              }}
            >
              UNLIMITED
            </button>
            <button
              className="w-full bg-black text-white font-helvetica py-2 px-4 rounded-lg border border-black transform hover:scale-105 hover:shadow-lg transition-all duration-150"
              onClick={() => {
                playClickSound();
                navigate("/lobbyTest");
              }}
            >
              MULTIPLAYER (COMING SOON)
            </button>
          </div>

          {/* Leaderboard Card */}
          {/* Commenting out leaderboard card until implemented
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
                <span className="flex-1 ml-2 flex items-center gap-2"> */}
          {/*} <FaUser className="w-4 h-4" /> */} {/* Adds profile icon */}
          {/*  {player.name}
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
        </div> */}
        </div>

        <button
          className="fixed bottom-1 right-1 text-opacity-0 text-transparent py-2 px-4 mt-40 rounded-lg hover:text-blue-500"
          onClick={() => navigate("/globeModeTest")}
        >
          GlobeModeTest
        </button>

        {/* Modal compoent that gets opened when handleOpenModal is called and displays the passed content */}
        <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
          {modalContent}
        </Modal>

        {/* <button //calls modal to open and passes the instructions as content to display
          onClick={() =>
            handleOpenModal(
              <div className="w-full max-w-sm p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold mb-2">Game Instructions</h2>
                <p className="text-sm">
                  Welcome to STATMAP! To play the game, you will be presented with
                  a fact or statistic about a country from our custom database.
                  Your task is to choose the correct country on the interactive globe.
                  The game tests your knowledge of global geography and
                  country-specific facts. Good luck and have fun!
                </p>
              </div>
            )
          }
          className="fixed bottom-4 left-6 z-50 focus:outline-none"
        >
          <BsFillQuestionSquareFill size={50} className="bg-black text-white text-opacity-75 hover:text-green-600" />
        </button> */}
      </div>
    </div>
  );
};

export default Landing;
