import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { HiMenu } from "react-icons/hi";
import { 
  FaSignInAlt, 
  FaGamepad, 
  FaTrophy, 
  FaUserCircle, 
  FaCog, 
  FaEnvelope 
} from "react-icons/fa";
import { FaMapMarkedAlt } from "react-icons/fa";

const HoverDropMenu = ({ onSignInClick }) => {
  return (
    <div className="group top-1 left-1 m-1 cursor-pointer z-50">
      <FlyoutLink href="#" FlyoutContent={MenuContent} onSignInClick={onSignInClick}>
        <div className="w-18 h-18 flex items-center justify-center bg-black rounded-lg shadow-xl">
          <HiMenu size={72} className="text-white" />
        </div>
      </FlyoutLink>
    </div>
  );
};

const FlyoutLink = ({ children, href, FlyoutContent, onSignInClick }) => {
  const [open, setOpen] = useState(false);

  const showFlyout = FlyoutContent && open;

  return (
    <div
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      className="relative w-fit h-fit"
    >
      <a href={href} className="relative text-black">
        {children}
        <span
          style={{
            transform: showFlyout ? "scaleX(1)" : "scaleX(0)",
          }}
        />
      </a>
      <AnimatePresence>
        {showFlyout && (
          <motion.div
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute top-0 left-0 bg-black text-white shadow-lg rounded-md z-50"
          >
            <FlyoutContent onSignInClick={onSignInClick} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuContent = ({ onSignInClick }) => {
    return (
      <div className="w-96 bg-black p-9 shadow-xl text-white text-lg space-y-6 rounded-lg">
        <div className="mb-6 space-y-6">
          <h3 className="font-semibold text-xl flex items-center">
            <FaMapMarkedAlt className="mr-2 w-6 h-6" />
            STATMAP MENU
          </h3>
          <button
            onClick={onSignInClick}
            className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
          >
            <div className="flex items-center">
              <FaSignInAlt className="mr-4 w-6 h-6" />
              <span>SIGN IN</span>
            </div>
            <p className="ml-10 text-sm">Access your account</p>
          </button>
          <a
            href="#"
            className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
          >
            <div className="flex items-center">
              <FaGamepad className="mr-4 w-6 h-6" />
              <span>GAMEPLAY</span>
            </div>
            <p className="ml-10 text-sm">Start playing games</p>
          </a>
          <a
            href="#"
            className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
          >
            <div className="flex items-center">
              <FaTrophy className="mr-4 w-6 h-6" />
              <span>LEADERBOARDS</span>
            </div>
            <p className="ml-10 text-sm">View top players</p>
          </a>
          <a
            href="#"
            className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
          >
            <div className="flex items-center">
              <FaUserCircle className="mr-4 w-6 h-6" />
              <span>ACCOUNT</span>
            </div>
            <p className="ml-10 text-sm">Manage your profile</p>
          </a>
          <a
            href="#"
            className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
          >
            <div className="flex items-center">
              <FaCog className="mr-4 w-6 h-6" />
              <span>SETTINGS</span>
            </div>
            <p className="ml-10 text-sm">Adjust your preferences</p>
          </a>
        </div>
        <button className="group flex flex-col items-center justify-center w-full rounded-lg border-4 border-white px-4 py-2 font-semibold text-lg transition-colors hover:bg-white hover:text-black">
          <div className="mr-4">
          <div className="flex items-center">
            <FaEnvelope className="mr-4 w-6 h-6" />
            <span>CONTACT US</span>
          </div>
          <p className="ml-8 text-sm">Get in touch with us</p>
          </div>
        </button>
      </div>
    );
  };
  
  export default HoverDropMenu;