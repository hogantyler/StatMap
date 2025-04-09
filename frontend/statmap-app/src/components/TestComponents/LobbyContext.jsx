// src/contexts/LobbyContext.js
import { createContext, useContext, useState } from "react";

export const LobbyContext = createContext();

export const LobbyProvider = ({ children }) => {
  const [channel, setChannel] = useState(null);
  const [lobbyId, setLobbyId] = useState(null);
  const [joinCode, setJoinCode] = useState(null);

  return (
    <LobbyContext.Provider
      value={{
        channel,
        setChannel,
        lobbyId,
        setLobbyId,
        joinCode,
        setJoinCode,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobby = () => useContext(LobbyContext);
