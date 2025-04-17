import React, {  } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { X } from "lucide-react"

export default function Modal ({ isOpen, onClose, children, title, icon: Icon, iconColor = "amber" }) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            onClose()
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-zinc-900/90 border border-white/10 text-white p-6 rounded-lg w-full max-w-3xl shadow-2xl max-h-[90%] overflow-y-scroll"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-${iconColor}-500/10 flex items-center justify-center text-${iconColor}-400`}>
                <Icon size={20} />
              </div>
              <h2 className="text-2xl font-bold">{title}</h2>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white rounded-full p-2 transition-colors">
              <X size={24} />
            </button>
          </div>
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}