import React, { useState, useEffect, useRef } from "react";
import { supabase } from "../SupabaseContext";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import SignIn from "../MenuComponents/SignIn";
import SignUp from "../MenuComponents/SignUp";
import Modal from "../MenuComponents/Modal";
import { motion } from "framer-motion";

/**
 * This outputs a 6 character digit code, which is immediately integrated into the
 * supabase DB (if it doesn't exist already). Then, this player is counted as being
 * within the lobby within the DB.
 *
 * Generates a new lobby code every time the component mounts.
 * Deletes lobby if player_count of lobby in DB is zero, and decrements when the
 * "Leave Lobby" or the back arrow is pressed.
 *
 * On refresh page, it would delete the current lobby join code, generate a new one,
 * and place that new one into the DB.
 * @returns functional lobby
 */
function CreateLobby() {
  const [joinCode, setJoinCode] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [channel, setChannel] = useState(null);
  const [playerCount, setPlayerCount] = useState(0);
  const [lobbyId, setLobbyId] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const navigate = useNavigate();
  const navigatingToMultiplayer = useRef(false);

  // generate 6 character code (thanks gpt)
  const generateJoinCode = () => {
    const chars = "0123456789";
    return Array.from({ length: 6 }, () =>
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join("");
  };

  // handle leaving lobby (for manual navigation or unmounting)
  const leaveLobby = async (id) => {
    if (!id) return;
    const user = await supabase.auth.getUser();
    // console.log(user.data.user.id);

    try {
      // Check if lobby exists
      const { data: lobby, error } = await supabase
        .from("Lobbies")
        .select("player_count")
        .eq("id", id)
        .single();

      if (error || !lobby) return;

      // Option 1: Make sure the ID is a valid UUID
      const userId = user.data.user.id;
      const { data: playerData, error: playerError } = await supabase
        .from("Players")
        .delete()
        .eq("id", userId);

      console.log("Delete response:", { playerData, playerError });
      console.log("ID used:", userId);
      if (playerError) {
        console.error("Error removing player:", playerError);
        return;
      } else {
        console.log("Player removed:", playerData);
      }

      // delete lobby if player_count == 0
      if (lobby.player_count <= 1) {
        await supabase.from("Lobbies").delete().eq("id", id);
        console.log("Lobby deleted:", id);
        setPlayerCount(0);
      } else {
        // else just decrement
        await supabase
          .from("Lobbies")
          .update({ player_count: lobby.player_count - 1 })
          .eq("id", id);
        setPlayerCount(playerCount - 1);
      }
    } catch (err) {
      console.error("Cleanup error:", err);
    }

    if (channel) {
      channel.unsubscribe();
      console.log("Unsubscribed from lobby channel.");
    }
  };

  // always create a new lobby on mount
  const createLobby = async () => {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      setLoggedIn(false);
      return;
    } else {
      console.log("work");
      setLoggedIn(true);
      setPlayerCount(1);
    }
    const newJoinCode = generateJoinCode();

    const { data, error } = await supabase
      .from("Lobbies")
      .insert([
        {
          join_code: newJoinCode,
          player_count: 1,
          host_id: user.id,
        },
      ])
      .select();

    if (error) {
      console.error("Failed to create lobby:", error);
      return;
    }

    const newLobbyId = data[0].id;

    // save state that would help on refresh (for deleting and re-adding)
    setLobbyId(newLobbyId);
    setJoinCode(newJoinCode);
    localStorage.setItem("currentLobbyId", newLobbyId);

    // add player to the Players table
    const { } = await supabase.from("Players").insert([
      {
        display_name: user.user_metadata.display_name,
        id: user.id,
        lobby_id: newLobbyId,
        score: 0, // start at 0
      },
    ]);

    // join the realtime channel for this specific lobby for this player
    const newChannel = supabase
      .channel(`lobby_${newJoinCode}`)
      .on("broadcast", { event: "player_joined" }, (payload) => {
        console.log("New player joined:", payload);
      })
      .on("broadcast", { event: "player_left" }, (payload) => {
        console.log("A player left:", payload);
      })
      .on("broadcast", { event: "start_game" }, (payload) => {
        console.log("Start game");
        navigate("/multiplayer");
      })
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "Lobbies",
          filter: `id=eq.${newLobbyId}`, // Only listen to changes for this lobby
        },
        (payload) => {
          // Update the player count when the Lobbies table is updated
          const updatedLobby = payload.new;
          console.log(payload);
          console.log("Player count updated:", updatedLobby.player_count);
          // Optionally, update your UI state if needed
          setPlayerCount(updatedLobby.player_count);
        }
      )
      .subscribe();

    setChannel(newChannel);
  };

  useEffect(() => {
    const checkLoginAndCreateLobby = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) createLobby();
    };

    checkLoginAndCreateLobby();

    const oldLobbyId = localStorage.getItem("currentLobbyId");
    if (oldLobbyId) {
      leaveLobby(oldLobbyId);
      localStorage.removeItem("currentLobbyId");
    }

    return () => {
      const currentId = localStorage.getItem("currentLobbyId");
      if (!navigatingToMultiplayer.current && currentId) {
        leaveLobby(currentId);
        localStorage.removeItem("currentLobbyId");
      } else {
        console.log("Skipping lobby leave due to navigation to /multiplayer");
      }
    };
  }, []);

  // runs once on mount

  // button goes back to landing
  const handleLeaveLobby = () => {
    leaveLobby(lobbyId);
    localStorage.removeItem("currentLobbyId");
    navigate("/lobby");
  };

  const handleBack = () => navigate("/");

  const handleStart = async () => {
    navigatingToMultiplayer.current = true;
    await supabase.channel(`lobby_${joinCode}`).send({
      type: "broadcast",
      event: "start_game",
      payload: { message: "Let's go!" },
    });
    navigate("/multiplayer");
  };

  return (
    <>
      {loggedIn ? (
        <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center px-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="fixed top-6 right-6 z-50 bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800/80 transition-all duration-200"
          >
            <FaTimes size={24} />
          </button>

          {/* Lobby Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-8 w-full max-w-xl text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-2">Your Lobby Code</h2>
            <div className="text-5xl font-extrabold tracking-widest mb-4">
              {joinCode || "Loading..."}
            </div>

            <p className="text-white/60 mb-6">
              Share this code with your friends so they can join your game.
            </p>

            <div className="mb-4 text-white/80">
              Players in Lobby: {playerCount}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleStart}
                className="px-6 py-3 rounded-lg text-lg font-semibold bg-emerald-500 hover:bg-emerald-600 text-white transition"
              >
                Start Game
              </button>
              <button
                onClick={handleLeaveLobby}
                className="px-6 py-3 rounded-lg text-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition"
              >
                Disband Lobby
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <div className="relative w-full h-screen bg-black flex flex-col items-center justify-center px-4">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="fixed top-6 right-6 z-50 bg-zinc-900/80 border border-white/10 px-3 py-2 rounded-full text-white/70 hover:text-white hover:bg-zinc-800/80 transition-all duration-200"
          >
            <FaTimes size={24} />
          </button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white/10 backdrop-blur-lg border border-white/10 rounded-xl p-8 w-full max-w-xl text-center text-white"
          >
            <h2 className="text-2xl font-bold mb-4">
              You must be signed in to create or join a lobby.
            </h2>
            <button
              onClick={() => setShowSignInModal(true)}
              className="px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              SIGN IN / SIGN UP
            </button>
          </motion.div>
        </div>
      )}

      {/* SignIn Modal */}
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
            onSuccessfulLogin={async () => {
              setShowSignInModal(false);
              await createLobby();
            }}
          />
        </Modal>
      )}

      {/* SignUp Modal */}
      {showSignUpModal && (
        <Modal
          isOpen={showSignUpModal}
          onClose={() => setShowSignUpModal(false)}
        >
          <SignUp
            onModalClose={() => setShowSignUpModal(false)}
            onSuccessfulSignUp={async () => {
              setShowSignUpModal(false);
              await createLobby();
            }}
          />
        </Modal>
      )}
    </>
  );
}

export default CreateLobby;
