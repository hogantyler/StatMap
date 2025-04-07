import React, { useState } from "react";
import { FaGlobe } from "react-icons/fa";
import { BsFillQuestionSquareFill, BsImage } from "react-icons/bs";
import BlackGlobe from "../../black_globe.svg";
import HoverDropMenu from "../HoverDropMenu";
import Login from "../Login";
import Modal from "../Modal";
import { useNavigate } from "react-router-dom";
import LandingGlobe from "../LandingGlobe";
import { CountrySelectionProvider } from "../CountrySelectionContext";

/**
 * Landing page component that provides navigation, game modes, leaderboards, and a help modal.
 *
 * @returns {JSX.Element} The main landing page layout
 */
const LandingTestContent = () => {
    const [modalContent, setModalContent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [use3DGlobe, setUse3DGlobe] = useState(true);
    const navigate = useNavigate();

    const NoOffSet = true;

    const handleOpenModal = (content) => {
        setModalContent(content);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalContent(null);
    };

    const toggleGlobeType = () => {
        setUse3DGlobe(prev => !prev);
    };

    const [leaderboard] = useState([
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
                    <LandingGlobe />
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
                className="fixed top-4 right-4 z-50 bg-white bg-opacity-80 p-2 rounded-full shadow-lg hover:bg-opacity-100 transition-all duration-150"
                title={use3DGlobe ? "Switch to SVG Globe" : "Switch to 3D Globe"}
            >
                {use3DGlobe ? <BsImage size={24} /> : <FaGlobe size={24} />}
            </button>

            {/* Main content positioned on top of Globe */}
            <div className="relative z-10 w-full h-full">
                <HoverDropMenu onSignInClick={(e) => handleOpenModal(<Login />)} />

                <div className="flex flex-col justify-start items-center gap-4 p-4">
                    {/* Game Card */}
                    <div className="flex flex-col items-center gap-4 bg-white bg-opacity-60 bg-checkered text-black p-6 m-4 rounded-xl shadow-lg w-full max-w-[30rem] border border-gray-300">
                        <h1 className="text-3xl font-serif font-extrabold">STATMAP</h1>
                        <p className="text-base font-serif">
                            Discover fascinating facts about countries around the world.
                        </p>
                        <button
                            className="w-full bg-black text-white font-serif py-2 px-4 rounded-lg border border-black transform hover:scale-105 hover:shadow-lg transition-all duration-150"
                            onClick={() => navigate("/quiz")}
                        >
                            QUIZ
                        </button>
                        <button
                            className="w-full bg-black text-white font-serif py-2 px-4 rounded-lg border border-black transform hover:scale-105 hover:shadow-lg transition-all duration-150"
                            onClick={() => navigate("/unlimited")}
                        >
                            UNLIMITED
                        </button>
                        <button
                            className="w-full bg-black text-white font-serif py-2 px-4 rounded-lg border border-black transform hover:scale-105 hover:shadow-lg transition-all duration-150"
                            onClick={() => navigate("/lobbyTest")}
                        >
                            MULTIPLAYER (COMING SOON)
                        </button>
                    </div>
                </div>

                <button
                    className="fixed bottom-1 right-1 text-opacity-0 text-transparent py-2 px-4 mt-40 rounded-lg hover:text-blue-500"
                    onClick={() => navigate("/globeModeTest")}
                >
                    GlobeModeTest
                </button>

                {/* Help button */}
                <button
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
                    <BsFillQuestionSquareFill size={50} className="bg-white text-black hover:text-green-600" />
                </button>
            </div>

            {/* Modal component */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
                {modalContent}
            </Modal>
        </div>
    );
};

function LandingTest() {
    return (
        <CountrySelectionProvider>
            <LandingTestContent />
        </CountrySelectionProvider>
    )
}

export default LandingTest;