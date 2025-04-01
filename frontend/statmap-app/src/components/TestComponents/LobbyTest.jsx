import React, { useState } from "react";
import { Form, Button } from "react-bootstrap";
import { supabase } from "../SupabaseContext";
import { useNavigate } from "react-router-dom";

const LobbyTest = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    console.log(joinCode);
  }

  async function joinLobbyByCode(joinCode, userId) {
    // Find the lobby by join code
    const { data: lobby, error } = await supabase
      .from("lobbies")
      .select("id")
      .eq("join_code", joinCode)
      .single();

    if (error || !lobby) {
      console.error("Lobby not found!");
      return;
    }

    // Count the number of players in the lobby
    const { count, error: countError } = await supabase
      .from("players")
      .select("*", { count: "exact" })
      .eq("lobby_id", lobby.id);

    if (countError || count >= 2) {
      console.error("Lobby is full!");
      return;
    }

    // Add the user to the lobby
    const { data, error: joinError } = await supabase
      .from("players")
      .insert([{ lobby_id: lobby.id, user_id: userId }]);

    if (joinError) console.error("Error joining lobby:", joinError);
    else console.log("Joined lobby:", data);
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-6">
      <button
        onClick={() => navigate("/createLobby")}
        className="mb-8 px-6 py-3 text-2xl bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition"
      >
        Create Lobby
      </button>

      <div className="bg-white p-8 rounded-lg shadow-xl border-2 border-gray-300 w-full max-w-md text-center">
        <form onSubmit={joinLobbyByCode} className="flex flex-col items-center">
          <input
            type="text"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value)}
            placeholder="Insert Join Code"
            className="text-center text-xl p-3 border rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-3 text-2xl bg-green-500 text-white rounded-lg shadow-lg hover:bg-green-600 transition"
          >
            Join Lobby
          </button>
        </form>
      </div>
    </div>
  );
};

export default LobbyTest;
