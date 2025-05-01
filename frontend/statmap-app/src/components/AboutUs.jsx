import React from 'react'

const AboutUs = () => {
  return (
    <div className="space-y-6 text-center">
      <h1 className="text-3xl font-bold">About StatMap</h1>

      <p className="text-base text-white/90">
        StatMap was created by six UW – Madison students in Software Engineering (ECE 506) who love maps, trivia, and competition. Our goal is to make learning about different countries fun and engaging for everyone.
      </p>

      <p className="text-base text-white/90">
        Whether you’re here to test your knowledge, compete with friends, or just explore global facts, we’re building this game for curious minds like yours.
      </p>

      <p className="text-base text-white/90">
        Check out our full source code on GitHub:&nbsp;
        <a
          href="https://github.com/hogantyler/StatMap/tree/main"
          target="_blank"
          rel="noopener noreferrer"
          className="underline text-sky-400 hover:text-sky-300 transition-colors"
        >
          github.com/hogantyler/StatMap
        </a>
      </p>
    </div>
  )
}

export default AboutUs
