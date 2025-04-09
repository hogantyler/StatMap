import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import { supabase } from "../SupabaseContext";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LobbyTest = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [lobbyId, setLobbyId] = useState(null);
  const [userId, setUserId] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User is not authenticated!");
      return;
    }
    setUserId(user.id);
    await joinLobbyByCode(joinCode, user.id);
  }

  async function joinLobbyByCode(joinCode, userId) {
    // find the lobby by join code, and if it doesnt exist then dont do anything
    const { data: lobby, error } = await supabase
      .from("Lobbies")
      .select("id, player_count, join_code")
      .eq("join_code", joinCode)
      .single();

    if (error || !lobby) {
      console.error("Lobby not found!");
      return;
    }

    // check the number of players in the lobby (max 2 for now)
    const { count, error: countError } = await supabase
      .from("Players")
      .select("*", { count: "exact" })
      .eq("lobby_id", lobby.id);

    if (countError || count >= 2) {
      console.error("Lobby is full!");
      return;
    }

    // Add the user to the lobby
    const { data, error: joinError } = await supabase
      .from("Players")
      .insert([{ lobby_id: lobby.id, score: 0, id: userId }]);

    if (joinError) console.error("Error joining lobby:", joinError);
    else console.log("Joined lobby:", data);

    console.log(lobby.player_count);
    const updatedPlayerCount = lobby.player_count + 1;
    const { error: updateError } = await supabase
      .from("Lobbies")
      .update({ player_count: updatedPlayerCount })
      .eq("id", lobby.id);

    const newChannel = supabase
      .channel(`lobby_${lobby.join_code}`)
      .on("broadcast", { event: "player_joined" }, (payload) => {
        console.log("New player joined:", payload);
      })
      .on("broadcast", { event: "player_left" }, (payload) => {
        console.log("A player left:", payload);
      })
      .on("UPDATE", { schema: "public", table: "Lobbies" }, (payload) => {
        // Handle real-time updates here (e.g., update UI)
        console.log("Lobby updated:", payload.new);
        if (payload.new.id === lobby.id) {
          // Update the local state with the updated player count
          setLobbyId(payload.new.id); // Example: update lobbyId in the state
        }
      })
      .subscribe();

    setLobbyId(lobby.id);
  }

  const handleBack = () => {
    leaveLobby();
    navigate("/");
  };

  window.onpopstate = () => {
    handleBack();
  };

  const leaveLobby = async () => {
    if (!lobbyId) return;

    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user.id;

      console.log("Attempting to delete player with ID:", userId);
      console.log("From lobby ID:", lobbyId);

      // 1. Remove player from Players table - notice we're querying by both user ID and lobby ID
      const { data: playerData, error: playerError } = await supabase
        .from("Players")
        .delete()
        .eq("id", userId)
        .eq("lobby_id", lobbyId); // This ensures we're deleting the right record

      console.log("Delete response:", { playerData, playerError });

      if (playerError) {
        console.error("Error removing player:", playerError);
        return;
      }

      // 2. Fetch the current player count from Lobbies
      const { data: lobby, error: lobbyError } = await supabase
        .from("Lobbies")
        .select("player_count")
        .eq("id", lobbyId)
        .single();

      if (lobbyError || !lobby) {
        console.error("Error fetching lobby:", lobbyError);
        return;
      }

      // 3. Decrement player count and update Lobbies table
      const updatedPlayerCount = Math.max(lobby.player_count - 1, 0); // Avoid negative player count

      const { error: updateError } = await supabase
        .from("Lobbies")
        .update({ player_count: updatedPlayerCount })
        .eq("id", lobbyId);

      if (updateError) {
        console.error("Error updating player count:", updateError);
        return;
      }

      console.log("Player count decremented successfully");

      // Reset local state
      setLobbyId(null);
      setJoinCode("");
    } catch (err) {
      console.error("Leave lobby error:", err);
    }
  };

  // Real-time subscriptions for lobby updates
  useEffect(() => {
    const channel = supabase
      .channel(`lobby_${joinCode}`)
      .on("broadcast", { event: "player_joined" }, (payload) => {
        console.log("New player joined:", payload);
      })
      .on("broadcast", { event: "player_left" }, (payload) => {
        console.log("A player left:", payload);
      })
      .on("broadcast", { event: "start_game" }, (payload) => {
        console.log("Start game received:", payload);
        navigate("/quiz");
      })
      .on("UPDATE", { schema: "public", table: "Lobbies" }, (payload) => {
        console.log("Lobby updated:", payload.new);
        if (payload.new.id === lobbyId) {
          setLobbyId(payload.new.id);
        }
      })
      .subscribe();

    // Cleanup real-time subscription on component unmount
    return () => {
      supabase.removeChannel(channel);
    };
  }, [lobbyId]);

  return !lobbyId ? (
    <>
      <div className="absolute top-0 right-0 z-50">
        <button
          onClick={handleBack}
          className="text-black border border-white rounded-full p-2 hover:text-red-600 transition-colors"
        >
          <FaTimes size={50} />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-gray-400 to-white p-6">
        <button
          onClick={() => navigate("/createLobby")}
          className="mb-8 px-6 py-3 text-2xl bg-black text-white rounded-lg shadow-lg hover:bg-white hover:text-black border-2 border-black transition"
        >
          Create Lobby
        </button>

        <div className="bg-gradient-to-r from-white to-gray-300 p-8 rounded-lg shadow-lg border-2 border-black w-full max-w-md text-center">
          <form
            onSubmit={joinLobbyByCode}
            className="flex flex-col items-center"
          >
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Insert Join Code"
              className="text-center text-xl p-3 border-2 border-black rounded-lg w-full mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 text-2xl bg-black text-white rounded-lg shadow-lg hover:bg-white hover:text-black border-2 border-black transition"
            >
              Join Lobby
            </button>
          </form>
        </div>
      </div>
    </>
  ) : (
    <>
      <div>Join Code: {joinCode}</div>
      <button
        onClick={handleBack}
        className="px-6 py-3 text-2xl bg-black text-white rounded-lg shadow-lg hover:bg-white hover:text-black border-2 border-black transition"
      >
        Leave Lobby
      </button>
    </>
  );
};

export default LobbyTest;
