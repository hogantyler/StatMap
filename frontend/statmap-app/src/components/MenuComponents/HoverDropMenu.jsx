import React, { useState, useEffect, useContext, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Menu, LogIn, LogOut, Trophy, User, Settings, Info, ChevronRight, X } from "lucide-react"
import SettingsModal from "./SettingsModal"
import { playClickSound } from "../../utils/soundUtils"
import { SupabaseContext } from "../SupabaseContext"
import { useNavigate } from "react-router-dom"
import Leaderboard from "./Leaderboard"
import AccountPage from "./AccountPage"
import SignIn from "./SignIn"
import SignUp from "./SignUp"
import Modal from "./Modal"
import AboutUs from "./AboutUs"

export default function HoverDropMenu() {
  const [modalContent, setModalContent] = useState(null)
  const [modalTitle, setModalTitle] = useState("")
  const [modalIcon, setModalIcon] = useState(null)
  const [modalIconColor, setModalIconColor] = useState("amber")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [account, setAccount] = useState(null)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const supabase = useContext(SupabaseContext)
  const navigate = useNavigate()

  const handleOpenModal = (content, title, icon, iconColor = "amber") => {
    setModalContent(content)
    setModalTitle(title)
    setModalIcon(icon)
    setModalIconColor(iconColor)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setModalContent(null)
  }

  const getAccount = async () => {
    const tempAccount = await supabase.auth.getUser()
    if (tempAccount.data.user) {
      setAccount(tempAccount)
    }
  }

  useEffect(() => {
    getAccount()
  }, [])

  const onSignOutClick = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      alert(error)
    } else {
      setAccount(null)
    }
  }

  const handleButtonClick = (callback) => {
    playClickSound()
    callback()
  }

  const handleSettingsClick = () => {
    playClickSound()
    setIsSettingsOpen(true)
  }

  return (
    <div className="group absolute top-6 left-6 z-50">
      <FlyoutLink
        FlyoutContent={() => (
          <FlyoutContent
            onSignInClick={() => 
              handleOpenModal(
                <SignIn 
                  onModalClose={handleCloseModal} 
                  onSuccessfulLogin={getAccount} 
                  onSignUpClick={() => 
                    handleOpenModal(
                      <SignUp 
                      onModalClose={handleCloseModal} 
                      onSuccessfulSignUp={getAccount} />,
                  "Sign Up", LogIn)}/>,
              "Sign In", LogIn, "sky")}
            onAccountPageClick={() => 
              handleOpenModal(
                <AccountPage onModalClose={handleCloseModal} />,
              "Account", User, "emerald")}
            onLeaderboardClick={() => 
              handleOpenModal(
                <Leaderboard onModalClose={handleCloseModal} />,
              "Leaderboard", Trophy, "indigo")}
            onAboutClick={() =>
                handleOpenModal(
                  <AboutUs onModalClose={handleCloseModal} />,
                  "About Us", Info, "sky")}
            account={account}
            onSignOutClick={onSignOutClick}
            handleSettingsClick={handleSettingsClick}
            navigate={navigate}
            handleButtonClick={handleButtonClick}
          />
        )}
      >
        <div className="flex items-center gap-2 text-white/80 hover:text-white transition-colors bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-lg">
          <Menu size={18} />
          <span className="text-sm font-medium">Menu</span>
        </div>
      </FlyoutLink>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal}
        title={modalTitle}
        icon={modalIcon}
        iconColor={modalIconColor}
      >
        {modalContent}
      </Modal>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  )
}

const FlyoutLink = ({ children, FlyoutContent }) => {
  const [open, setOpen] = useState(false)

  return (
    <div onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} className="relative w-fit h-fit">
      <div className="relative">{children}</div>
      <AnimatePresence>
        {open && FlyoutContent && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 z-50"
          >
            <FlyoutContent />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const FlyoutContent = ({
  onSignInClick,
  onAccountPageClick,
  onLeaderboardClick,
  onAboutClick,
  account,
  onSignOutClick,
  handleSettingsClick,
  navigate,
  handleButtonClick,
}) => {
  return (
    <div className="w-80 bg-zinc-900/95 backdrop-blur-md border border-white/10 p-4 shadow-xl text-white rounded-lg">
      <div className="mb-4">
        <h3 className="font-medium text-lg border-b border-white/10 pb-2 mb-3">STATMAP MENU</h3>

        <div className="space-y-1">
          {/* Sign In/Out Button */}
          {account && account.data.user ? (
            <button
              onClick={onSignOutClick}
              className="group w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sky-400">
                  <LogOut size={16} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Sign Out</div>
                  <div className="text-xs text-white/60">Exit your account</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
            </button>
          ) : (
            <button
              onClick={() => handleButtonClick(onSignInClick)}
              className="group w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-sky-400">
                  <LogIn size={16} />
                </div>
                <div className="text-left">
                  <div className="text-sm font-medium">Sign In</div>
                  <div className="text-xs text-white/60">Access your account</div>
                </div>
              </div>
              <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
            </button>
          )}

          {/* Leaderboards Button */}
          <button
            onClick={() => handleButtonClick(onLeaderboardClick)}
            className="group w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-indigo-400">
                <Trophy size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Leaderboards</div>
                <div className="text-xs text-white/60">View top players</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
          </button>

          {/* Account Button */}
          <button
            onClick={() => handleButtonClick(onAccountPageClick)}
            className="group w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-emerald-400">
                <User size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Account</div>
                <div className="text-xs text-white/60">Manage your profile</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
          </button>

          {/* Settings Button */}
          <button
            onClick={handleSettingsClick}
            className="group w-full flex items-center justify-between p-2 rounded-md hover:bg-white/10 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-amber-400">
                <Settings size={16} />
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">Settings</div>
                <div className="text-xs text-white/60">Adjust preferences</div>
              </div>
            </div>
            <ChevronRight size={16} className="text-white/40 group-hover:text-white/60 transition-colors" />
          </button>
        </div>
      </div>

      {/* About Us Button */}
      <button
        onClick={() => handleButtonClick(onAboutClick)}
        className="w-full py-2 px-3 border border-white/20 rounded-md text-center hover:bg-white/10 transition-colors"
      >
        <div className="flex items-center justify-center gap-2">
          <Info size={16} />
          <span className="text-sm font-medium">About Us</span>
        </div>
      </button>
    </div>
  )
}
