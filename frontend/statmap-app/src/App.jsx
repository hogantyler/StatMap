
import React, { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import './App.css';
import Landing from './components/Landing';
import QuizMode from "./components/QuizMode";
import LandingTest from "./components/LandingTest";
import UnlimitedMode from "./components/UnlimitedMode";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/quiz" element={<QuizMode />} />
        <Route path="/unlimited" element={<UnlimitedMode />} />
      </Routes>
    </Router>
  );
}

export default App;