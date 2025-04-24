import React from 'react';
import { FaTimes } from "react-icons/fa";
import { playClickSound } from "../utils/soundUtils";
import { useNavigate } from 'react-router-dom';


const AboutUs = () => {
  const navigate = useNavigate();

  const handleBack = () => {
      playClickSound();
      navigate("/");
  };

  return (
    <div className="p-8 max-w-4xl mx-auto text-center text-black">
        <div className="absolute top-0 right-0 z-50">
          <button
            onClick={handleBack}
            className="text-black rounded-full p-2 hover:text-red-600 transition-colors"
          >
            <FaTimes size={50} />
          </button>
        </div>
      <h1 className="text-4xl font-bold mb-4">About StatMap</h1>
      <p className="text-lg mb-6">
        StatMap was created by 6 UW-Madison students taking Software Engineering (ECE 506) who love maps, trivia, and competition. Our goal is to make learning about different countries fun and engaging for everyone.
      </p>
      <p className="text-md">
        Whether you're here to test your knowledge, compete with friends, or just explore global facts, we're building this game for curious minds like yours.
      </p>
    </div>
  );
};

export default AboutUs;
