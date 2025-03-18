import React, { createContext } from "react";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ewqbknnhmhepuqjbkgmm.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3cWJrbm5obWhlcHVxamJrZ21tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Njg5MzUsImV4cCI6MjA1NzU0NDkzNX0.lwdm9ZFTc9KxzvI2gO1A_AmB54FDT0vKWdZReZ79p1c";

// global Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// context with the supabase client as the default value
const SupabaseContext = createContext(supabase);

export { SupabaseContext, supabase };