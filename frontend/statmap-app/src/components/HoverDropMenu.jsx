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

const HoverDropMenu = () => {
  return (
    <div className="group absolute top-6 left-6 ml-6 cursor-pointer z-50 shadow-xl">
      <FlyoutLink href="#" FlyoutContent={MenuContent}>
        <div className="w-18 h-18 flex items-center justify-center bg-black rounded-lg shadow-xl">
          <HiMenu size={72} className="text-white" />
        </div>
      </FlyoutLink>
    </div>
  );
};

const FlyoutLink = ({ children, href, FlyoutContent }) => {
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
            className="absolute top-0 left-0 bg-black text-white shadow-lg rounded-md"
          >
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MenuContent = () => {
  return (
    <div className="w-96 bg-black p-9 shadow-xl text-white text-lg space-y-6 rounded-lg">
      <div className="mb-6 space-y-6">
        <h3 className="font-semibold text-xl flex items-center">
          <FaMapMarkedAlt className="mr-2 w-6 h-6" />
          STATMAP MENU
        </h3>
        <a href="#" className="flex items-center text-lg hover:bg-white hover:text-black p-2 rounded">
          <FaSignInAlt className="mr-4 w-6 h-6" />
          SIGN-IN
        </a>
        <a href="#" className="flex items-center text-lg hover:bg-white hover:text-black p-2 rounded">
          <FaGamepad className="mr-4 w-6 h-6" />
          GAMEPLAY
        </a>
        <a href="#" className="flex items-center text-lg hover:bg-white hover:text-black p-2 rounded">
          <FaTrophy className="mr-4 w-6 h-6" />
          LEADERBOARDS
        </a>
        <a href="#" className="flex items-center text-lg hover:bg-white hover:text-black p-2 rounded">
          <FaUserCircle className="mr-4 w-6 h-6" />
          ACCOUNT
        </a>
        <a href="#" className="flex items-center text-lg hover:bg-white hover:text-black p-2 rounded">
          <FaCog className="mr-4 w-6 h-6" />
          SETTINGS
        </a>
      </div>
      <button className="flex items-center justify-center w-full rounded-lg border-4 border-white px-4 py-2 font-semibold text-lg transition-colors hover:bg-white hover:text-black">
        <FaEnvelope className="mr-4 w-6 h-6" />
        CONTACT US
      </button>
    </div>
  );
};

export default HoverDropMenu;