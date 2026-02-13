import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, Pause, Volume2, VolumeX, Maximize, 
  Users, MessageSquare, Video, Mic, MicOff, PhoneOff,
  Send, MoreVertical, Copy, Check, LogOut,
  Crown, UserPlus, UserMinus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { api } from '@/lib/api';
import type { Room, Message, Participant } from '@/types';
import { toast } from 'sonner';

// Screenfull stub
const screenfull = {
  isEnabled: typeof document !== 'undefined' && (document.fullscreenEnabled || (document as any).webkitFullscreenEnabled),
  toggle: (element: HTMLElement) => {
    if (!document.fullscreenElement) {
      element.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
};

// YouTube Player Component
function YouTubePlayer({ 
  videoUrl, 
  videoState, 
  onStateChange, 
  isHost 
}: { 
  videoUrl: string | null; 
  videoState: any;
  onStateChange: (state: any) => void;
  isHost: boolean;
}) {
  const playerRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [localState, setLocalState] = useState({
    isPlaying: false,
    currentTime: 0,
    volume: 100,
    isMuted: false,
  });

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/);
    return match?.[1] || null;
  };

  const videoId = videoUrl ? extractVideoId(videoUrl) : null;

  const handleFullscreen = () => {
    if (containerRef.current && screenfull.isEnabled) {
      screenfull.toggle(containerRef.current);
    }
  };

  // Sync with server state
  useEffect(() => {
    if (videoState) {
      setLocalState(prev => ({
        ...prev,
        isPlaying: videoState.isPlaying,
        currentTime: videoState.currentTime,
      }));
    }
  }, [videoState]);

  if (!videoId) {
    return (
      <div ref={containerRef} className="aspect-video bg-[#0a0a0a] rounded-xl flex items-center justify-center border border-white/5">
        <div className="text-center">
          <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-500">No video loaded</p>
          {isHost && (
            <p className="text-gray-600 text-sm mt-2">Paste a YouTube URL to start watching</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative group">
      <div className="aspect-video bg-black rounded-xl overflow-hidden">
        <iframe
          ref={playerRef}
          src={`https://www.youtube.com/embed/${videoId}?autoplay=${localState.isPlaying ? 1 : 0}&start=${Math.floor(localState.currentTime)}&controls=${isHost ? 1 : 0}&disablekb=${isHost ? 0 : 1}`}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Custom Controls Overlay */}
      {isHost && (
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onStateChange({ isPlaying: !localState.isPlaying })}
              className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white"
            >
              {localState.isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-2 flex-1">
              <button
                onClick={() => setLocalState(prev => ({ ...prev, isMuted: !prev.isMuted }))}
                className="text-white"
              >
                {localState.isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <Slider
                value={[localState.volume]}
                max={100}
                step={1}
                className="w-24"
                onValueChange={(value) => setLocalState(prev => ({ ...prev, volume: value[0] }))}
              />
            </div>

            <button
              onClick={handleFullscreen}
              className="text-white hover:text-gray-300"
            >
              <Maximize className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Chat Component
function ChatPanel({ 
  messages, 
  onSendMessage
}: { 
  messages: Message[]; 
  onSendMessage: (message: string) => void;
}) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#141414] rounded-xl border border-white/5">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No messages yet</p>
            <p className="text-gray-600 text-xs">Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-2 ${msg.username === user?.username ? 'flex-row-reverse' : ''}`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white text-xs font-semibold flex-shrink-0">
                {msg.username[0]?.toUpperCase()}
              </div>
              <div className={`max-w-[70%] ${msg.username === user?.username ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-gray-500">{msg.username}</span>
                  <span className="text-xs text-gray-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                  msg.username === user?.username 
                    ? 'bg-[#e50914] text-white' 
                    : 'bg-[#1a1a1a] text-gray-300'
                }`}>
                  {msg.message}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-white/5">
        <div className="flex gap-2">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#0a0a0a] border-white/10 text-white"
          />
          <Button
            type="submit"
            disabled={!message.trim()}
            className="bg-[#e50914] hover:bg-[#b20710] text-white"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}

// Participants Panel
function ParticipantsPanel({ 
  participants, 
  isHost,
  onKickUser,
  onMakeCoHost 
}: { 
  participants: Participant[]; 
  isHost: boolean;
  onKickUser: (socketId: string) => void;
  onMakeCoHost: (userId: string) => void;
}) {
  return (
    <div className="h-full bg-[#141414] rounded-xl border border-white/5 p-4">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Users className="w-4 h-4" />
        Participants ({participants.length})
      </h3>

      <div className="space-y-2">
        {participants.map((participant) => (
          <div
            key={participant.socketId}
            className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white text-xs font-semibold">
                  {participant.username[0]?.toUpperCase()}
                </div>
                {participant.isVideoOn && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#141414]" />
                )}
              </div>
              <div>
                <p className="text-white text-sm flex items-center gap-1">
                  {participant.username}
                  {participant.isHost && <Crown className="w-3 h-3 text-yellow-500" />}
                  {participant.isCoHost && <Crown className="w-3 h-3 text-blue-500" />}
                </p>
                <p className="text-gray-500 text-xs">
                  {participant.isHost ? 'Host' : participant.isCoHost ? 'Co-host' : 'Member'}
                </p>
              </div>
            </div>

            {isHost && !participant.isHost && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-[#1a1a1a] border-white/10">
                  <DropdownMenuItem
                    onClick={() => onMakeCoHost(participant.user!)}
                    className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Make Co-host
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onKickUser(participant.socketId)}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Kick
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Video Call Grid
function VideoCallGrid({ 
  participants, 
  localStream 
}: { 
  participants: Participant[]; 
  localStream: MediaStream | null;
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 p-2">
      {/* Local Video */}
      <div className="aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden relative">
        {localStream ? (
          <video
            autoPlay
            muted
            playsInline
            ref={(el) => {
              if (el) el.srcObject = localStream;
            }}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-600" />
          </div>
        )}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
          You
        </div>
      </div>

      {/* Remote Videos (placeholder) */}
      {participants.filter(p => p.isVideoOn).map((participant) => (
        <div key={participant.socketId} className="aspect-video bg-[#1a1a1a] rounded-lg overflow-hidden relative">
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white font-semibold">
              {participant.username[0]?.toUpperCase()}
            </div>
          </div>
          <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-xs text-white">
            {participant.username}
          </div>
        </div>
      ))}
    </div>
  );
}

// Main Room Page
export default function RoomPage() {
  const { roomCode } = useParams<{ roomCode: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    joinRoom, 
    leaveRoom, 
    currentRoom, 
    participants, 
    messages, 
    videoState,
    sendMessage,
    updateVideoState,
    changeVideo,
    kickUser,
    makeCoHost,
    isConnected 
  } = useSocket();

  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [videoUrl, setVideoUrl] = useState('');
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if user is host
  const isHost = room?.host === user?.id || participants.find(p => p.user === user?.id)?.isHost;

  // Fetch room data
  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.getRoom(roomCode!);
        setRoom(response.data.room);
      } catch (error: any) {
        toast.error(error.message || 'Room not found');
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode, navigate]);

  // Join socket room
  useEffect(() => {
    if (roomCode && isConnected && !currentRoom) {
      joinRoom(roomCode);
    }

    return () => {
      if (currentRoom) {
        leaveRoom();
      }
    };
  }, [roomCode, isConnected, currentRoom, joinRoom, leaveRoom]);

  // Copy room code
  const copyCode = () => {
    navigator.clipboard.writeText(roomCode!);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room code copied!');
  };

  // Handle video change
  const handleChangeVideo = () => {
    if (!videoUrl.trim()) return;
    changeVideo(videoUrl.trim());
    setVideoUrl('');
  };

  // Toggle video
  const toggleVideo = async () => {
    if (!localStream) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setLocalStream(stream);
        setIsVideoOn(true);
        setShowVideoCall(true);
      } catch (error) {
        toast.error('Could not access camera');
      }
    } else {
      localStream.getVideoTracks().forEach(track => track.stop());
      setLocalStream(null);
      setIsVideoOn(false);
    }
  };

  // Toggle audio
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  // Leave room
  const handleLeave = () => {
    leaveRoom();
    navigate('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Room not found</h2>
          <p className="text-gray-400 mb-4">The room you're looking for doesn't exist</p>
          <Link to="/dashboard">
            <Button className="bg-[#e50914] hover:bg-[#b20710] text-white">
              Go to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/5 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
            </Link>
            <div>
              <h1 className="text-white font-semibold">{room.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button
                  onClick={copyCode}
                  className="flex items-center gap-1 hover:text-gray-300"
                >
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                  <span className="font-mono">{roomCode}</span>
                </button>
                <span>•</span>
                <span>{participants.length} watching</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isHost && (
              <div className="flex items-center gap-2 mr-4">
                <Input
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  placeholder="Paste YouTube URL..."
                  className="w-64 bg-[#0a0a0a] border-white/10 text-white text-sm"
                />
                <Button
                  onClick={handleChangeVideo}
                  size="sm"
                  className="bg-[#e50914] hover:bg-[#b20710] text-white"
                >
                  Load
                </Button>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowVideoCall(!showVideoCall)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Video className="w-4 h-4 mr-2" />
              Video
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLeave}
              className="border-red-500/50 text-red-500 hover:bg-red-500/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Leave
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        <div className="grid lg:grid-cols-4 gap-4 h-[calc(100vh-80px)]">
          {/* Video & Video Call */}
          <div className="lg:col-span-3 flex flex-col gap-4">
            {/* Video Player */}
            <div className="flex-1">
              <YouTubePlayer
                videoUrl={room.videoUrl}
                videoState={videoState}
                onStateChange={updateVideoState}
                isHost={!!isHost}
              />
            </div>

            {/* Video Call */}
            {showVideoCall && (
              <div className="h-48 bg-[#141414] rounded-xl border border-white/5">
                <div className="flex items-center justify-between p-2 border-b border-white/5">
                  <span className="text-white text-sm font-medium">Video Call</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={toggleAudio}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white'}`}
                    >
                      {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={toggleVideo}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${isVideoOn ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-white'}`}
                    >
                      <Video className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setShowVideoCall(false)}
                      className="w-8 h-8 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center"
                    >
                      <PhoneOff className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <VideoCallGrid participants={participants} localStream={localStream} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Tabs defaultValue="chat" className="h-full">
              <TabsList className="w-full bg-[#141414] border border-white/5">
                <TabsTrigger value="chat" className="flex-1 data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="users" className="flex-1 data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
                  <Users className="w-4 h-4 mr-2" />
                  Users
                </TabsTrigger>
              </TabsList>

              <TabsContent value="chat" className="h-[calc(100%-40px)] mt-0">
                <ChatPanel
                  messages={messages}
                  onSendMessage={sendMessage}
                />
              </TabsContent>

              <TabsContent value="users" className="h-[calc(100%-40px)] mt-0">
                <ParticipantsPanel
                  participants={participants}
                  isHost={!!isHost}
                  onKickUser={kickUser}
                  onMakeCoHost={makeCoHost}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
