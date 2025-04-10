import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
//import LandingTest from "./components/TestComponents/LandingTest.jsx" // Uncomment this line to use the test component. Recommend not to remove until final version is released
import Landing from "./components/Landing";
import QuizMode from "./components/QuizMode";
import UnlimitedMode from "./components/UnlimitedMode";
import GlobeModeTest from "./components/TestComponents/GlobeModeTest";
import GlobeModeTestPart2 from "./components/TestComponents/GlobeModeTestPart2.jsx";
import LobbyTest from "./components/TestComponents/LobbyTest.jsx";
import CreateLobby from "./components/TestComponents/CreateLobby.jsx";
import { SupabaseContext, supabase } from "./components/SupabaseContext.jsx";
import { LobbyProvider } from "./components/TestComponents/LobbyContext";
import { GraphicsContextProvider } from './components/GraphicsContext';

function App() {
  return (
    <Router>
      <GraphicsContextProvider>
        <LobbyProvider>
          <SupabaseContext.Provider value={supabase}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/quiz" element={<QuizMode />} />
              <Route path="/unlimited" element={<UnlimitedMode />} />
              <Route path="/globeModeTest" element={<GlobeModeTest />} />
              <Route
                path="/globeModeTestPart2"
                element={<GlobeModeTestPart2 />}
              />
              <Route path="/lobbyTest" element={<LobbyTest></LobbyTest>} />
              <Route path="/createLobby" element={<CreateLobby></CreateLobby>} />
            </Routes>
          </SupabaseContext.Provider>
        </LobbyProvider>
      </GraphicsContextProvider>
    </Router>
  );
}

export default App;
