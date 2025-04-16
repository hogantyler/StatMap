import React, { useState, useEffect } from "react";
import { supabase } from "../SupabaseContext";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import SignIn from "../SignIn";
import SignUp from "../SignUp";
import Modal from "../Modal";

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

  // generate 6 character code (thanks gpt)
  const generateJoinCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
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
      .insert([{
        join_code: newJoinCode,
        player_count: 1,
        host_id: user.id
      }])
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
    const { error: playerError } = await supabase.from("Players").insert([
      {
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
      leaveLobby(currentId);
      localStorage.removeItem("currentLobbyId");
    };
  }, []);
  // runs once on mount

  // button goes back to landing
  const handleLeaveLobby = () => {
    leaveLobby(lobbyId);
    localStorage.removeItem("currentLobbyId");
    navigate("/lobbyTest");
  };

  const handleBack = () => navigate("/");

  const handleStart = async () => {
    await supabase.channel(`lobby_${joinCode}`).send({
      type: "broadcast",
      event: "start_game",
      payload: { message: "Let's go!" },
    });
  };

  return (
    <>
      {/* Back Button in top right */}
      {loggedIn ? (
        <>
          <div className="absolute top-0 right-0 z-50">
            <button
              onClick={handleBack}
              className=" text-black border border-white rounded-full p-2  hover:text-red-600 transition-colors"
            >
              <FaTimes size={50} />
            </button>
          </div>
          <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-r from-gray-400 to-white p-4">
            <div>Player Count: {playerCount}</div>
            <div className="text-4xl font-semibold mb-6 text-black">
              Your Lobby Code:
            </div>

            <div className="text-6xl font-extrabold bg-gradient-to-r from-white to-gray-300 p-6 rounded-lg shadow-lg border-2 border-black min-h-[33vh] flex items-center justify-center w-full max-w-md">
              {joinCode || "Loading..."}
            </div>

            <button
              onClick={handleLeaveLobby}
              className="mt-8 px-6 py-3 text-2xl bg-black text-white rounded-lg shadow-lg hover:bg-white hover:text-black border-2 border-black transition"
            >
              Disband Lobby
            </button>

            <button
              onClick={handleStart}
              className="mt-8 px-6 py-3 text-2xl bg-black text-white rounded-lg shadow-lg hover:bg-white hover:text-black border-2 border-black transition"
            >
              Start Game
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="absolute top-0 right-0 z-50">
            <button
              onClick={handleBack}
              className=" text-black border border-white rounded-full p-2  hover:text-red-600 transition-colors"
            >
              <FaTimes size={50} />
            </button>
          </div>
          <div className="h-screen w-screen flex flex-col justify-center items-center text-center bg-gradient-to-r from-gray-400 to-white px-4">
            <h2 className="text-3xl font-bold text-black mb-6">
              You must be signed in to create or join a lobby.
            </h2>
            <button
              onClick={() => setShowSignInModal(true)}
              className="px-6 py-3 text-xl bg-black text-white rounded-lg shadow-lg hover:bg-white hover:text-black border-2 border-black transition"
            >
              SIGN IN / SIGN UP
            </button>
          </div>
        </>
      )}
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
