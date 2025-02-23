
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import './App.css';
import Landing from './components/Landing';
import PlayScreen from "./components/PlayScreen";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/play" element={<PlayScreen />} />
      </Routes>
    </Router>
  );
}

export default App;