import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import "./App.css";
//import LandingTest from "./components/TestComponents/LandingTest.jsx" // Uncomment this line to use the test component. Recommend not to remove until final version is released
import Landing from "./components/Landing";
import QuizMode from "./components/GameplayComponents/QuizMode";
import UnlimitedMode from "./components/GameplayComponents/UnlimitedMode";
import GlobeModeTest from "./components/TestComponents/GlobeModeTest";
import GlobeModeTestPart2 from "./components/TestComponents/GlobeModeTestPart2.jsx";
import Lobby from "./components/MultiplayerComponents/Lobby.jsx";
import CreateLobby from "./components/MultiplayerComponents/CreateLobby.jsx";
import MultiplayerGameScreen from "./components/MultiplayerComponents/MultiplayerGameScreen.jsx";
import { SupabaseContext, supabase } from "./components/SupabaseContext.jsx";
import { LobbyProvider } from "./components/MultiplayerComponents/LobbyContext.jsx";
import { GraphicsContextProvider } from './components/GraphicsContext';
import AboutUs from "./components/MenuComponents/AboutUs";
import ChangePassword from "./components/MenuComponents/ChangePassword.jsx";
import FactReports from "./components/GameplayComponents/FactReports.jsx";

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
              <Route path="/lobby" element={<Lobby></Lobby>} />
              <Route path="/createLobby" element={<CreateLobby></CreateLobby>} />
              <Route path="/about" element={<AboutUs />} />
              <Route path="/multiplayer" element={<MultiplayerGameScreen/>}/>
              <Route path="/changepassword" element={<ChangePassword />} />
              <Route path="/factreports" element={<FactReports />} />
            </Routes>
          </SupabaseContext.Provider>
        </LobbyProvider>
      </GraphicsContextProvider>
    </Router>
  );
}

export default App;
