import React, { useState, useEffect } from "react";

function Loading({ message = "Welcome to StatMap, the world's next great online trivia game.", onComplete }) {
  const [typedText, setTypedText] = useState("");
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (index < message.length) {
      const timeout = setTimeout(() => {
        setTypedText((prev) => prev + message.charAt(index));
        setIndex((prev) => prev + 1);
      }, 60); // Adjust speed here
      return () => clearTimeout(timeout);
    } else {
      const doneTimeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 1000);
      return () => clearTimeout(doneTimeout);
    }
  }, [index, message, onComplete]);

  return (
    <div className="flex items-center justify-center h-screen bg-black w-screen px-4">
      <p className="text-blue-400 text-lg sm:text-xl md:text-2xl lg:text-3xl font-mono text-center max-w-screen-sm whitespace-pre-wrap">
        {typedText}
        <span className="animate-pulse">|</span>
      </p>
    </div>
  );
}

export default Loading;