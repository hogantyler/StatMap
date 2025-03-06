
import React, { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import './App.css';
import Landing from './components/Landing';
import QuizMode from "./components/QuizMode";
import LandingTest from "./components/TestComponents/LandingTest";
import UnlimitedMode from "./components/UnlimitedMode";
import GlobeModeTest from "./components/TestComponents/GlobeModeTest";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<QuizMode />} />
        <Route path="/unlimited" element={<UnlimitedMode />} />
        <Route path="/globeModeTest" element={<GlobeModeTest />} />
      </Routes>
    </Router>
  );
}

export default App;