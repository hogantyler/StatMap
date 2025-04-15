import React, {useRef, useEffect} from "react";
import { FaTimes } from "react-icons/fa";

/**
 * Modal component that displays account login/sign up
 * 
 * @param {*} param0 Object containing isOpen (boolean), onClose (function), and children (JSX content)
 * @returns {JSX.Element|null} The modal if open, otherwise null
 */
const Modal = ({ isOpen, onClose, children }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) { //checks if the click is outside the modal
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside); //adds event listener to detect clicks outside the modal
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside); //cleans up the event listener when the modal is closed
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null; //if the modal is not open, return null to not render anything

  return ( //background div that detects clicks outside the modal and calls closing modal function
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div ref={modalRef} className="flex justify-center items-center p-6 bg-black rounded-lg shadow-lg relative border border-white">
        <div className="absolute top-0 right-0 z-0">
            <button
                onClick={onClose}
                className="text-white rounded-full p-2 hover:text-red-600 transition-colors"
            >
                <FaTimes size={30} />
            </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default Modal;