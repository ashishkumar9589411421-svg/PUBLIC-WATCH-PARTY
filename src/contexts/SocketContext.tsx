import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useCallback,
  useState,
} from "react";
import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";
import type { Message, Participant, VideoState } from "@/types";
import { toast } from "sonner";

// 🔥 Production-safe BASE URL (removes /api for socket)
const BASE_URL =
  import.meta.env.VITE_API_URL?.replace("/api", "") ||
  "https://watchparty-backend-jx6f.onrender.com";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  currentRoom: string | null;
  participants: Participant[];
  messages: Message[];
  videoState: VideoState | null;
  joinRoom: (roomCode: string, peerId?: string) => void;
  leaveRoom: () => void;
  sendMessage: (message: string, type?: "text" | "emoji" | "gif") => void;
  sendTyping: (isTyping: boolean) => void;
  updateVideoState: (state: Partial<VideoState>) => void;
  changeVideo: (videoUrl: string) => void;
  sendReaction: (emoji: string) => void;
  kickUser: (socketId: string) => void;
  makeCoHost: (userId: string) => void;
  updateRoomSettings: (settings: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [videoState, setVideoState] = useState<VideoState | null>(null);

  // =========================
  // 🔌 Initialize Socket
  // =========================
  useEffect(() => {
    const socket = io(BASE_URL, {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("🔌 Socket connected:", socket.id);
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("🔌 Socket disconnected");
      setIsConnected(false);
    });

    socket.on("connect_error", (error: Error) => {
      console.error("Socket connection error:", error);
      setIsConnected(false);
    });

    socket.on("error", (error: { message: string }) => {
      toast.error(error.message || "An error occurred");
    });

    // =========================
    // 📦 Room Events
    // =========================
    socket.on("room-joined", (data) => {
      setCurrentRoom(data.room.code);
      setParticipants(data.participants);
      setMessages(data.messages);
      setVideoState(data.room.videoState);
    });

    socket.on("user-joined", (data: Participant) => {
      setParticipants((prev) => [...prev, data]);
      toast.info(`${data.username} joined the room`);
    });

    socket.on("user-left", (data) => {
      setParticipants((prev) =>
        prev.filter((p) => p.socketId !== data.socketId)
      );
      toast.info(`${data.username} left the room`);
    });

    socket.on("kicked", (data) => {
      toast.error(data.message);
      setCurrentRoom(null);
      setParticipants([]);
    });

    socket.on("user-kicked", (data) => {
      setParticipants((prev) =>
        prev.filter((p) => p.socketId !== data.socketId)
      );
    });

    // =========================
    // 🎥 Video Sync Events
    // =========================
    socket.on("video-state-updated", (data) => {
      setVideoState((prev) =>
        prev ? { ...prev, ...data.state } : null
      );
    });

    socket.on("sync-data", (data) => {
      setVideoState(data.videoState);
    });

    socket.on("video-changed", () => {
      toast.info("Video changed by host");
    });

    // =========================
    // 💬 Chat Events
    // =========================
    socket.on("new-message", (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });

    // =========================
    // 👑 Admin / Control Events
    // =========================
    socket.on("cohost-assigned", (data) => {
      setParticipants((prev) =>
        prev.map((p) =>
          p.user === data.userId ? { ...p, isCoHost: true } : p
        )
      );
    });

    socket.on("room-settings-updated", () => {
      toast.info("Room settings updated");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // =========================
  // 🎯 Emit Functions
  // =========================
  const joinRoom = useCallback(
    (roomCode: string, peerId?: string) => {
      socketRef.current?.emit("join-room", {
        roomCode,
        userId: user?.id,
        username: user?.username || "Guest",
        avatar: user?.avatar,
        peerId,
      });
    },
    [user]
  );

  const leaveRoom = useCallback(() => {
    socketRef.current?.emit("leave-room");
    setCurrentRoom(null);
    setParticipants([]);
    setMessages([]);
    setVideoState(null);
  }, []);

  const sendMessage = useCallback(
    (message: string, type: "text" | "emoji" | "gif" = "text") => {
      if (!currentRoom) return;
      socketRef.current?.emit("send-message", {
        roomCode: currentRoom,
        message,
        type,
      });
    },
    [currentRoom]
  );

  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!currentRoom) return;
      socketRef.current?.emit("typing", {
        roomCode: currentRoom,
        isTyping,
      });
    },
    [currentRoom]
  );

  const updateVideoState = useCallback(
    (state: Partial<VideoState>) => {
      if (!currentRoom) return;
      socketRef.current?.emit("video-state-change", {
        roomCode: currentRoom,
        state,
        userId: user?.id,
      });
    },
    [currentRoom, user]
  );

  const changeVideo = useCallback(
    (videoUrl: string) => {
      if (!currentRoom) return;
      socketRef.current?.emit("change-video", {
        roomCode: currentRoom,
        videoUrl,
        userId: user?.id,
      });
    },
    [currentRoom, user]
  );

  const sendReaction = useCallback(
    (emoji: string) => {
      if (!currentRoom) return;
      socketRef.current?.emit("send-reaction", {
        roomCode: currentRoom,
        emoji,
      });
    },
    [currentRoom]
  );

  const kickUser = useCallback(
    (socketId: string) => {
      if (!currentRoom) return;
      socketRef.current?.emit("kick-user", {
        roomCode: currentRoom,
        targetSocketId: socketId,
        userId: user?.id,
      });
    },
    [currentRoom, user]
  );

  const makeCoHost = useCallback(
    (userId: string) => {
      if (!currentRoom) return;
      socketRef.current?.emit("make-cohost", {
        roomCode: currentRoom,
        targetUserId: userId,
        userId: user?.id,
      });
    },
    [currentRoom, user]
  );

  const updateRoomSettings = useCallback(
    (settings: any) => {
      if (!currentRoom) return;
      socketRef.current?.emit("update-room-settings", {
        roomCode: currentRoom,
        settings,
        userId: user?.id,
      });
    },
    [currentRoom, user]
  );

  const value: SocketContextType = {
    socket: socketRef.current,
    isConnected,
    currentRoom,
    participants,
    messages,
    videoState,
    joinRoom,
    leaveRoom,
    sendMessage,
    sendTyping,
    updateVideoState,
    changeVideo,
    sendReaction,
    kickUser,
    makeCoHost,
    updateRoomSettings,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
