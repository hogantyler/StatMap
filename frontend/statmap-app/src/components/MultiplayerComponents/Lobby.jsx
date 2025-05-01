import React, { useState, useEffect } from "react";
import { supabase } from "../SupabaseContext";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SignIn from "../MenuComponents/SignIn";
import SignUp from "../MenuComponents/SignUp";
import Modal from "../MenuComponents/Modal";
import { motion } from "framer-motion";

const Lobby = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [lobbyId, setLobbyId] = useState(null);
  const [userId, setUserId] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [userIsHost, setUserIsHost] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      alert("You must be signed in to join a lobby.");
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

    // check the number of players in the lobby
    const { count, error: countError } = await supabase
      .from("Players")
      .select("*", { count: "exact" })
      .eq("lobby_id", lobby.id);

    // removing limit of 2 players in a lobby
    // if (countError || count >= 2) {
    //   console.error("Lobby is full!");
    //   return;
    // }
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Add the user to the lobby
    const { data, error: joinError } = await supabase.from("Players").insert([
      {
        display_name: user.user_metadata.display_name,
        lobby_id: lobby.id,
        score: 0,
        id: userId,
      },
    ]);

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
    setPlayerCount(updatedPlayerCount);
    setUserIsHost(updatedPlayerCount === 1); // assumes first to join is host
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
        navigate("/multiplayer");
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

  const startGameInLobby = async () => {
    const { data: fact, error } = await supabase.rpc("random_fact");
    if (error) return console.error("Error fetching question:", error);

    await supabase
      .from("Lobbies")
      .update({ current_question: fact, question_number: 1 })
      .eq("id", lobbyId);

    await supabase.channel(`lobby_${joinCode}`).send({
      type: "broadcast",
      event: "start_game",
      payload: {},
    });
  };

  return !lobbyId ? (
    <>
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleBack}
          className="bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800/80 transition-all duration-200"
        >
          <FaTimes size={24} />
        </button>
      </div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 px-4">
        <motion.div
          className="text-center text-white mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-4xl font-bold mb-2">Multiplayer Lobby</h2>
          <p className="text-white/60">Join or create a new game lobby</p>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => navigate("/createLobby")}
          className="mb-6 px-8 py-3 text-xl bg-gradient-to-r from-green-600 to-emerald-500 text-white rounded-full shadow-lg border border-white/10 transition"
        >
          Create Lobby
        </motion.button>

        <motion.div
          className="bg-white/10 p-6 rounded-xl border border-white/20 shadow-md max-w-md w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={joinLobbyByCode} className="flex flex-col gap-4">
            <input
              type="text"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter Join Code"
              className="text-center text-lg p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition"
            >
              Join Lobby
            </button>
          </form>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={() => setShowSignInModal(true)}
          className="mt-6 px-6 py-3 text-md bg-white/10 text-white rounded-full shadow hover:bg-white/20 border border-white/20 transition"
        >
          SIGN IN / SIGN UP
        </motion.button>
      </div>

      {showSignInModal && (
        <Modal
          isOpen={showSignInModal}
          onClose={() => setShowSignInModal(false)}
        >
          <SignIn
            onModalClose={() => setShowSignInModal(false)}
            onSignUpClick={() => {
              setShowSignInModal(false);
              setShowSignUpModal(true);
            }}
          />
        </Modal>
      )}

      {showSignUpModal && (
        <Modal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
        >
          <SignUp onModalClose={() => setShowSignUpModal(false)} />
        </Modal>
      )}
    </>
  ) : (
    <>
      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={handleBack}
          className="bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800/80 transition-all duration-200"
        >
          <FaTimes size={24} />
        </button>
      </div>

      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-zinc-900 via-black to-zinc-800 px-4 text-white text-center">
        <h2 className="text-3xl font-bold mb-2">Lobby Code:</h2>
        <div className="text-5xl font-extrabold bg-gradient-to-r from-white/20 to-white/10 px-6 py-4 rounded-lg border border-white/20 shadow-inner mb-8">
          {joinCode}
        </div>

        <button
          onClick={handleBack}
          className="mb-4 px-6 py-3 bg-white/10 text-white rounded-full hover:bg-white/20 border border-white/20 transition"
        >
          Leave Lobby
        </button>

        {userIsHost && (
          <button
            onClick={startGameInLobby}
            className="px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-500 transition border border-green-500"
          >
            Start Game
          </button>
        )}
      </div>
    </>
  );
};

export default Lobby;
