import React, { useContext, useEffect, useState } from "react";
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
import { SupabaseContext } from "./SupabaseContext";
import SettingsModal from "./SettingsModal";
import { playClickSound, playHoverSound } from "../utils/soundUtils";
import SignIn from "./SignIn";
import AccountPage from "./AccountPage";
import SignUp from "./SignUp";
import Modal from "./Modal";
import Leaderboard from "./Leaderboard";

/**
 * Renders a hovered dropdown menu that provides navigation options for the user.
 * 
 * @param {*} param0 Contains a callback function for sign-in click event
 * @returns {JSX.Element} A dropdown menu trigger
 */
const HoverDropMenu = ({ onSignInClick, onAccountPageClick, onModalClose }) => {
  const [modalContent, setModalContent] = useState(null); //modal content decides what is shown when modal is open
  const [isModalOpen, setIsModalOpen] = useState(false); //state of whether the modal is open or closed

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

  return (
    <div className="group top-1 left-1 m-1 cursor-pointer z-50">
      <FlyoutLink href="#" FlyoutContent={FlyoutContent}
        onSignInClick={(e) => handleOpenModal(<SignIn onSignUpClick={(e) => handleOpenModal(<SignUp onModalClose={handleCloseModal} />)} onModalClose={handleCloseModal} />)}
        onAccountPageClick={(e) => handleOpenModal(<AccountPage onModalClose={handleCloseModal} />)}
        onModalClose={handleCloseModal}
        onLeaderboardClick={(e) => handleOpenModal(<Leaderboard onModalClose={handleCloseModal}/>)}
      >
        <div className="w-18 h-18 flex items-center justify-center bg-black rounded-lg shadow-xl">
          <HiMenu size={72} className="text-white" />
        </div>
      </FlyoutLink>

      {/* Modal compoent that gets opened when handleOpenModal is called and displays the passed content */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        {modalContent}
      </Modal>
    </div>
  );
};

/**
 * Handles the dropdown menu functionality.
 * 
 * @param {*} param0 Contains children elements, link href, flyout content component, and sign-in click event handler
 * @returns {JSX.Element} A link with hover-triggered dropdown content
 */
const FlyoutLink = ({ children, href, FlyoutContent, onSignInClick, onAccountPageClick, onModalClose, onLeaderboardClick }) => {
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
            <FlyoutContent onSignInClick={onSignInClick} onAccountPageClick={onAccountPageClick} onModalCose={onModalClose} onLeaderboardClick={onLeaderboardClick}/>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Provides the content for the dropdown menu, including navigation buttons and sign-in functionality.
 * 
 * @param {*} param0 Contains a callback function for handling sign-in clicks
 * @returns {JSX.Element} A styled menu with various navigation options
 */
const FlyoutContent = ({ onSignInClick, onAccountPageClick, onModalClose, onLeaderboardClick }) => {
  const [account, setAccount] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const supabase = useContext(SupabaseContext);

  const handleButtonClick = (callback) => {
    playClickSound();
    callback();
  };

  const handleSettingsClick = () => {
    playClickSound();
    setIsSettingsOpen(true);
  };

  async function getAccount() {
    const tempAccount = await supabase.auth.getUser()
    if (tempAccount.data.user) {
      setAccount(tempAccount);
    }
  }

  useEffect(() => {
    getAccount()
  }, [])

  const onSignOutClick = async () => {
    let { error } = await supabase.auth.signOut();
    if (error) {
      alert(error);
    } else {
      setAccount(null);
    }
  }

  return (
    <>
      <div className="w-96 bg-black p-9 shadow-xl text-white text-lg space-y-6 rounded-lg">
        <div className="mb-6 space-y-6">
          <h3 className="font-semibold text-xl flex items-center">
            <FaMapMarkedAlt className="mr-2 w-6 h-6" />
            STATMAP MENU
          </h3>

          {
            account ? (
              /* Not Signed In */
              !account.data.user ? (
                <button
                  onClick={() => handleButtonClick(onSignInClick)}
                  onMouseEnter={playHoverSound}
                  className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
                >
                  <div className="flex items-center">
                    <FaSignInAlt className="mr-4 w-6 h-6" />
                    <span>SIGN IN</span>
                  </div>
                  <p className="ml-10 text-sm">Access Your Account</p>
                </button>
              )
              :
              /* Signed In */
              (
                <button
                  onClick={onSignOutClick}
                  onMouseEnter={playHoverSound}
                  className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
                >
                  <div className="flex items-center">
                    <FaSignInAlt className="mr-4 w-6 h-6" />
                    <span>SIGN OUT</span>
                  </div>
                  <p className="ml-10 text-sm">Sign out of Your Account</p>
                </button>
              )
            )
            :
            /* Not Signed In */
            (
              <button
                onClick={() => handleButtonClick(onSignInClick)}
                onMouseEnter={playHoverSound}
                className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
              >
                <div className="flex items-center">
                  <FaSignInAlt className="mr-4 w-6 h-6" />
                  <span>SIGN IN</span>
                </div>
                <p className="ml-10 text-sm">Access Your Account</p>
              </button>
            )
          }

            {/* Open Leaderboard */}
            <button
              onClick={() => handleButtonClick(onLeaderboardClick)}
              onMouseEnter={playHoverSound}
              className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
            >
              <div className="flex items-center">
                <FaTrophy className="mr-4 w-6 h-6" />
                <span>LEADERBOARDS</span>
              </div>
              <p className="ml-10 text-sm">View Top Players</p>
            </button>

            {/* Open Account Page */}
            <button
              onClick={() => handleButtonClick(onAccountPageClick)}
              onMouseEnter={playHoverSound}
              className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
            >
              <div className="flex items-center">
                <FaUserCircle className="mr-4 w-6 h-6" />
                <span>ACCOUNT</span>
              </div>
              <p className="ml-10 text-sm">Manage Your Profile</p>
            </button>

            {/* Open Settings Page */}
            <button
              onClick={handleSettingsClick}
              onMouseEnter={playHoverSound}
              className="group flex flex-col items-start text-lg hover:bg-white hover:text-black p-2 rounded w-full"
            >
              <div className="flex items-center">
                <FaCog className="mr-4 w-6 h-6" />
                <span>SETTINGS</span>
              </div>
              <p className="ml-10 text-sm">Adjust Your Preferences</p>
            </button>
        </div>
        
        <button
          onMouseEnter={playHoverSound}
          onClick={() => playClickSound()}
          className="group flex flex-col items-center justify-center w-full rounded-lg border-4 border-white px-4 py-2 font-semibold text-lg transition-colors hover:bg-white hover:text-black"
        >
          <div className="mr-4">
            <div className="flex items-center">
              <FaEnvelope className="mr-12 w-6 h-6" />
              <span>ABOUT US</span>
            </div>
            <p className="ml-8 text-sm">Learn More About Our Team</p>
          </div>
        </button>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </>
  );
};

export default HoverDropMenu;