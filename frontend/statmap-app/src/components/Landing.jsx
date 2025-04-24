import React, { useContext, useEffect, useState, Suspense } from "react";
import { Globe, ImageIcon, User, HelpCircle, ArrowRight } from "lucide-react";
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
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import { useLocation } from "react-router-dom";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
    },
  },
};

/**
 * Landing page component that provides navigation, game modes, leaderboards, and a help modal.
 *
 * @returns {JSX.Element} The main landing page layout
 */
const Landing = () => {
  const { graphicsSettings, updateSettings } = useGraphicsSettings();
  const use3DGlobe = graphicsSettings.globeBackGround;
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalIcon, setModalIcon] = useState(null);
  const [modalContent, setModalContent] = useState(null);
  const [hoveredMode, setHoveredMode] = useState(null);
  const [typingDone, setTypingDone] = useState(false);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  //logic for giving right loading screen message
  const location = useLocation();
  const loadingMessage =
    location.state?.loadingMessage ||
    "Welcome to StatMap, the world's next great online trivia game.";

  const handleOpenModal = ({ title, icon, content }) => {
    playClickSound();
    setModalTitle(title);
    setModalIcon(icon);
    setModalContent(content);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    playClickSound();
    setIsModalOpen(false);
  };

  const toggleGlobeType = () => {
    updateSettings({ globeBackGround: !use3DGlobe });
  };

  const handleNavigate = (path) => {
    playClickSound();
    navigate(path);
  };

  const [leaderboard] = useState([
    //arbitrary leaderboard placeholder data
    { name: "GeoMaster", score: 985 },
    { name: "MapExpert", score: 920 },
    { name: "CountryPro", score: 875 },
    { name: "CapitalWhiz", score: 810 },
  ]);

  //attempting to load assets in background while loading screen is running
  useEffect(() => {
    // Simulate a delay to mimic loading assets (or wait on real setup)
    const loadAssets = async () => {
      await new Promise((res) => setTimeout(res, 1000));
      setAssetsLoaded(true);
    };
    loadAssets();
  }, []);
  //show loading screen until assets are loaded and animation is done
  if (!typingDone || !assetsLoaded) {
    return <Loading message={loadingMessage} onComplete={() => setTypingDone(true)} />;
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Background with overlay */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        {use3DGlobe ? (
          <LandingGlobe />
        ) : (
          <div
            className="min-h-screen bg-black"
          >
            <div
              className="min-h-screen bg-cover bg-center opacity-30"
              style={{
                backgroundImage: `url(${BlackGlobe})`,
                filter: 'invert(100%)'
              }}
            />
          </div>
        )}
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
      </div>

      {/* Toggle button */}
      <button
        onClick={toggleGlobeType}
        className="fixed top-6 right-6 z-50 bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800/80 transition-all duration-200"
        title={use3DGlobe ? "Switch to SVG Globe" : "Switch to 3D Globe"}
      >
        <div className="flex items-center gap-2">
          {use3DGlobe ? <Globe size={16} /> : <ImageIcon size={16} />}
          <span className="text-sm font-medium">{use3DGlobe ? "3D" : "2D"}</span>
        </div>
      </button>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center justify-center">
        <div className="fixed top-0 left-0 z-50">
          <HoverDropMenu />
        </div>

        <div className="max-w-screen-md w-full px-6 py-12">
          {/* Modern title section */}
          <motion.div
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white tracking-tight">
              STAT<span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 to-blue-500">MAP</span>
            </h1>
            <p className="mt-4 text-white/60 text-lg sm:text-xl max-w-md mx-auto">
              Discover the world through data
            </p>
          </motion.div>

          {/* Modern menu options */}
          <motion.div
            className="space-y-3"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Quiz Mode */}
            <motion.div
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 pointer-events-auto cursor-pointer",
                hoveredMode === "quiz" ? "bg-zinc-900/80" : "bg-zinc-900/40",
              )}
              onMouseEnter={() => setHoveredMode("quiz")}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleNavigate("/quiz")}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-sky-500/10 to-blue-500/10 opacity-0 transition-opacity duration-300",
                  hoveredMode === "quiz" && "opacity-100",
                )}
              />

              <div className="w-full p-6 flex items-center justify-between text-left">
                <div>
                  <h2 className="text-2xl font-medium text-white">Quiz Mode</h2>
                  <p className="text-white/60 mt-1 max-w-md">Test your knowledge with geography challenges</p>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center bg-sky-500/20 text-sky-400 transition-all duration-300 transform",
                    hoveredMode === "quiz" ? "translate-x-0" : "translate-x-2 opacity-70",
                  )}
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>

            {/* Unlimited Mode */}
            <motion.div
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 pointer-events-auto cursor-pointer",
                hoveredMode === "unlimited" ? "bg-zinc-900/80" : "bg-zinc-900/40",
              )}
              onMouseEnter={() => setHoveredMode("unlimited")}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleNavigate("/unlimited")}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 opacity-0 transition-opacity duration-300",
                  hoveredMode === "unlimited" && "opacity-100",
                )}
              />

              <div className="w-full p-6 flex items-center justify-between text-left">
                <div>
                  <h2 className="text-2xl font-medium text-white">Unlimited</h2>
                  <p className="text-white/60 mt-1 max-w-md">Endless exploration of global statistics</p>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center bg-indigo-500/20 text-indigo-400 transition-all duration-300 transform",
                    hoveredMode === "unlimited" ? "translate-x-0" : "translate-x-2 opacity-70",
                  )}
                >
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>

            {/* Multiplayer Mode */}
            <motion.div
              variants={itemVariants}
              className={cn(
                "group relative overflow-hidden border border-white/10 rounded-lg transition-all duration-300 pointer-events-auto cursor-pointer",
                hoveredMode === "multiplayer" ? "bg-zinc-900/80" : "bg-zinc-900/40",
              )}
              onMouseEnter={() => setHoveredMode("multiplayer")}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleNavigate("/lobbyTest")}
            >
              <div
                className={cn(
                  "absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 opacity-0 transition-opacity duration-300",
                  hoveredMode === "multiplayer" && "opacity-100",
                )}
              />

              <button
                className="w-full p-6 flex items-center justify-between text-left"
                onClick={() => handleNavigate("/lobbyTest")}
              >
                <div>
                  <h2 className="text-2xl font-medium text-white">Multiplayer</h2>
                  <p className="text-white/60 mt-1 max-w-md">
                    Compete with friends in real-time challenges{" "}
                    <span className="text-xs ml-2 py-0.5 px-2 bg-white/10 rounded-full">BETA</span>
                  </p>
                </div>
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center bg-emerald-500/20 text-emerald-400 transition-all duration-300 transform",
                    hoveredMode === "multiplayer" ? "translate-x-0" : "translate-x-2 opacity-70",
                  )}
                >
                  <ArrowRight size={18} />
                </div>
              </button>
            </motion.div>
          </motion.div>
        </div>

        {/* Help button */}
        <button
          className="fixed bottom-6 left-6 z-50 focus:outline-none bg-zinc-900/80 border border-white/10 p-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800/80 transition-all duration-200"
          onClick={() =>
            handleOpenModal(
              {
                title: "Game Instructions",
                icon: HelpCircle,
                content: (
                  <p className="text-sm">
                    Welcome to STATMAP! To play the game, you will be presented with
                    a fact or statistic about a country from our custom database.
                    Your task is to choose the correct country on the interactive globe.
                    The game tests your knowledge of global geography and
                    country-specific facts. Good luck and have fun!
                  </p>
                ),
              }
            )
          }
        >
          <HelpCircle size={20} />

        </button>
      </div>

      {/* Modal component */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={modalTitle}
        icon={modalIcon}>
        {modalContent}
      </Modal>
    </div>

  );
};

export default Landing;
