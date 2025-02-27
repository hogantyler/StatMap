
import React, { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import './App.css';
import Landing from './components/Landing';
import PlayScreen from "./components/PlayScreen";
import LandingTest from "./components/LandingTest";
import Globe from "./components/Globe";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<PlayScreen />} />
        <Route path="/globe" element={<Globe />} />
      </Routes>
    </Router>
  );
}

export default App;