import React from "react";

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOutsideClick}
    >
      <div className="bg-white p-6 rounded-lg shadow-lg relative">
        <button
          onClick={() => {
            console.log("Close button clicked");
            onClose();
          }}
          className="absolute top-2 right-2 text-black"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;