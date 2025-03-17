
import React, { useState } from "react";
import { HashRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Login";
import './App.css';
import Landing from './components/Landing';
import QuizMode from "./components/QuizMode";
import LandingTest from "./components/TestComponents/LandingTest";
import UnlimitedMode from "./components/UnlimitedMode";
import GlobeModeTest from "./components/TestComponents/GlobeModeTest";

import { createClient } from "@supabase/supabase-js";
import SupabaseContext from "./components/SupabaseContext";

/* Global Supabase object - DO NOT CHANGE */
const supabase = createClient("https://ewqbknnhmhepuqjbkgmm.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cWJrbm5obWhlcHVxamJrZ21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njg5MzUsImV4cCI6MjA1NzU0NDkzNX0.lwdm9ZFTc9KxzvI2gO1A_AmB54FDT0vKWdZReZ79p1c");

/* To use in any other component you must have these */
// import SupabaseContext from "./SupabaseContext";
// const supabase = useContext(SupabaseContext);

/* Example Functions */
// all countries
const testSupaFetchCountries = async () => {
  const data = await supabase.from("api_country").select();
  console.log(data);
}

// random fact
const testSupaFetchFact = async () => {
  const { data, error } = await supabase.rpc('random_fact');
  console.log(data);
}

// insert fact
const testSupaInsertFact = async () => {
  const { error } = await supabase
    .from('api_fact')
    .insert({Fact: "test fact", Country_ID: 2}) // Source is optional
  console.log(error)
}

// insert report
const testSupaInsertReport = async () => {
  const { error } = await supabase
    .from('fact_reports')
    .insert({Fact_ID: 2, Report_Type: "too easy"}) // User_ID is optional
  console.log(error)
}

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