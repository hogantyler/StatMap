import React, { useState } from "react";
import { FaUser } from "react-icons/fa"; // Added profile icon import
import BlackGlobe from '../black_globe.svg';
import HoverDropMenu from "./HoverDropMenu";
import Login from "./Login";
import Modal from "./Modal";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  const handleOpenModal = () => {
    console.log("Opening modal");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Modal close handler called");
    setIsModalOpen(false);
  };

  const [leaderboard] = useState([ //arbitrary leaderboard placeholder data
    { name: 'GeoMaster', score: 985 },
    { name: 'MapExpert', score: 920 },
    { name: 'CountryPro', score: 875 },
    { name: 'CapitalWhiz', score: 810 }
  ]);

  return (
    <div className="relative flex flex-col items-center justify-center gap-4 p-4 w-full min-h-screen">
    
    <div className="absolute top-4 right-4 bg-white border border-black p-4 rounded-lg shadow-lg w-[36rem] h-40">
        <h3 className="text-xl font-semibold">STATMAP</h3>
        <p className="text-sm">A game to learn more about the countries around the world.</p>
        <button className="absolute bottom-4 left-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black">
          SIGN IN
        </button>
    </div>

    <div className="absolute top-56 right-4 bg-white border border-black p-4 rounded-lg shadow-lg w-[32rem] h-[24rem]">
        <h3 className="text-xl font-semibold">LEADERBOARDS</h3>
        <p className="text-sm mb-4">View the top players around the world.</p>
        
        <div className="space-y-4">
            {leaderboard.map((player, index) => (
                <div key={index} className="flex justify-between items-center text-base">
                <span className="w-6 font-medium">{index + 1}.</span>
                <span className="flex-1 ml-2 flex items-center gap-2">
                    <FaUser className="w-4 h-4" /> {/* Added profile icon */}
                    {player.name}
                </span>
                <span className="font-medium">Score: {player.score}</span>
                </div>
            ))}
        </div>

        <button className="absolute bottom-4 left-4 bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black">
            VIEW
        </button>
    </div>

    <div className="absolute top-[40rem] right-4">
        <button className="bg-black text-white py-2 px-4 rounded-lg hover:bg-white hover:text-black border border-black"
        onClick={() => navigate("/play")}>
            PLAY
        </button>
    </div>
      <div className="flex justify-start w-full h-full">
        <img 
          src={BlackGlobe} 
          alt="black globe" 
          className="h-screen max-h-screen w-auto ml-0 sm:ml-0 md:ml-16 lg:ml-32 xl:ml-32" 
        />
    </div>

      <HoverDropMenu onSignInClick={handleOpenModal} />
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <Login />
      </Modal>
    </div>
  );
};

export default Landing;