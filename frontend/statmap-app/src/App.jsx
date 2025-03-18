
import React from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Landing from './components/Landing';
import QuizMode from "./components/QuizMode";
import UnlimitedMode from "./components/UnlimitedMode";
import GlobeModeTest from "./components/TestComponents/GlobeModeTest";

import { SupabaseContext, supabase } from "./components/SupabaseContext.jsx";


/* To use in any other component you must have these */
// import SupabaseContext from "./SupabaseContext";
// const supabase = useContext(SupabaseContext);

function App() {
  return (
    <Router>
      <SupabaseContext.Provider value={supabase}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/quiz" element={<QuizMode />} />
          <Route path="/unlimited" element={<UnlimitedMode />} />
          <Route path="/globeModeTest" element={<GlobeModeTest />} />
        </Routes>
      </SupabaseContext.Provider>
    </Router>
  );
}

export default App;