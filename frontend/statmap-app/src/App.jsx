
import React, { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import './App.css';
import Landing from './components/Landing';
import PlayScreen from "./components/PlayScreen";
import LandingTest from "./components/LandingTest";
import GlobePage from "./components/GlobePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/globe" element={<GlobePage />} />
      </Routes>
    </Router>
  );
}

export default App;