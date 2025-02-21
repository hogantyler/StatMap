import React, { useState } from "react";
import BlackGlobe from '../black_globe.svg';
import HoverDropMenu from "./HoverDropMenu";
import Login from "./Login";
import Modal from "./Modal";

const Landing = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    console.log("Opening modal");
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Modal close handler called");
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4 w-full min-h-screen">
      <div className="flex justify-start w-full h-full">
        <img 
          src={BlackGlobe} 
          alt="black globe" 
          className="h-screen max-h-screen w-auto" 
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