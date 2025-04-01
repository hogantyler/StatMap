import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
import Landing from "./components/Landing";
import QuizMode from "./components/QuizMode";
import UnlimitedMode from "./components/UnlimitedMode";
import GlobeModeTest from "./components/TestComponents/GlobeModeTest";
import GlobeModeTestPart2 from "./components/TestComponents/GlobeModeTestPart2.jsx";
import LobbyTest from "./components/TestComponents/LobbyTest.jsx";
import CreateLobby from "./components/TestComponents/CreateLobby.jsx";
import { SupabaseContext, supabase } from "./components/SupabaseContext.jsx";

function App() {
  return (
    <Router>
      <SupabaseContext.Provider value={supabase}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<QuizMode />} />
          <Route path="/unlimited" element={<UnlimitedMode />} />
          <Route path="/globeModeTest" element={<GlobeModeTest />} />
          <Route path="/globeModeTestPart2" element={<GlobeModeTestPart2 />} />
          <Route path="/lobbyTest" element={<LobbyTest></LobbyTest>} />
          <Route path="/createLobby" element={<CreateLobby></CreateLobby>} />
        </Routes>
      </SupabaseContext.Provider>
    </Router>
  );
}

export default App;
