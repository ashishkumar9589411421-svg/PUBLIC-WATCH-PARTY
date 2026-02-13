import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Plus, Users, Video, LogOut, 
  Clock, MessageSquare, Play, Copy, Check,
  TrendingUp, ChevronRight, MoreVertical,
  Trash2, Lock, Unlock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import type { Room } from '@/types';
import { toast } from 'sonner';

// Navigation Component
function DashboardNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-[#141414] border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white">
              WATCH<span className="text-[#e50914]">PARTY</span>
            </span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <Link to="/profile">
              <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-white text-sm hidden sm:block">{user?.username}</span>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-gray-400 hover:text-white hover:bg-white/10"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Create Room Dialog
function CreateRoomDialog({ open, onOpenChange, onRoomCreated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onRoomCreated: () => void;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: true,
    password: '',
    maxParticipants: 50,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await api.createRoom({
        name: formData.name,
        description: formData.description,
        isPrivate: formData.isPrivate,
        password: formData.password || undefined,
        maxParticipants: formData.maxParticipants,
      });
      
      toast.success('Room created successfully!');
      onOpenChange(false);
      onRoomCreated();
      setFormData({
        name: '',
        description: '',
        isPrivate: true,
        password: '',
        maxParticipants: 50,
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create room');
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Create New Room</DialogTitle>
          <DialogDescription className="text-gray-400">
            Set up your private watch party room
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Room Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Movie Night with Friends"
              className="bg-[#0a0a0a] border-white/10 text-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Description</label>
            <Input
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this room about?"
              className="bg-[#0a0a0a] border-white/10 text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300">Max Participants</label>
            <Input
              type="number"
              min={2}
              max={100}
              value={formData.maxParticipants}
              onChange={(e) => setFormData({ ...formData, maxParticipants: parseInt(e.target.value) })}
              className="bg-[#0a0a0a] border-white/10 text-white"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={formData.isPrivate}
              onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
              className="rounded border-white/20 bg-[#0a0a0a]"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-300">Private Room</label>
          </div>

          {formData.isPrivate && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Password (optional)</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Leave empty for no password"
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#e50914] hover:bg-[#b20710] text-white"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Join Room Dialog
function JoinRoomDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [requiresPassword, setRequiresPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await api.joinRoom(roomCode.toUpperCase(), password || undefined);
      
      if (response.success) {
        toast.success('Joining room...');
        onOpenChange(false);
        navigate(`/room/${roomCode.toUpperCase()}`);
      }
    } catch (error: any) {
      if (error.message?.includes('password')) {
        setRequiresPassword(true);
        toast.error('This room requires a password');
      } else {
        toast.error(error.message || 'Failed to join room');
      }
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#141414] border-white/10 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">Join Room</DialogTitle>
          <DialogDescription className="text-gray-400">
            Enter the room code to join
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Room Code *</label>
            <Input
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="e.g., ABC123"
              className="bg-[#0a0a0a] border-white/10 text-white uppercase"
              maxLength={6}
              required
            />
          </div>

          {(requiresPassword || password) && (
            <div className="space-y-2">
              <label className="text-sm text-gray-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter room password"
                className="bg-[#0a0a0a] border-white/10 text-white"
              />
            </div>
          )}

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || roomCode.length < 6}
              className="bg-[#e50914] hover:bg-[#b20710] text-white"
            >
              {isLoading ? 'Joining...' : 'Join Room'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Room Card Component
function RoomCard({ room, onDelete }: { room: Room; onDelete: () => void }) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Room code copied!');
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await api.deleteRoom(room.code);
      toast.success('Room deleted');
      onDelete();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  return (
    <div className="bg-[#141414] rounded-xl border border-white/5 p-5 hover:border-[#e50914]/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${room.isActive ? 'bg-green-500/20' : 'bg-gray-700/20'}`}>
            <Video className={`w-5 h-5 ${room.isActive ? 'text-green-500' : 'text-gray-500'}`} />
          </div>
          <div>
            <h3 className="text-white font-semibold truncate max-w-[150px]">{room.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className={room.isActive ? 'text-green-500' : 'text-gray-500'}>
                {room.isActive ? 'Active' : 'Ended'}
              </span>
              <span>•</span>
              <span>{new Date(room.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-[#1a1a1a] border-white/10">
            <DropdownMenuItem 
              onClick={copyCode}
              className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy Code
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={handleDelete}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{room.participantCount}/{room.maxParticipants}</span>
          </div>
          <div className="flex items-center gap-1">
            {room.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            <span>{room.isPrivate ? 'Private' : 'Public'}</span>
          </div>
        </div>
        
        <button
          onClick={copyCode}
          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
        >
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-gray-400" />}
          <span className="text-sm font-mono text-gray-300">{room.code}</span>
        </button>
      </div>

      <Button
        onClick={() => navigate(`/room/${room.code}`)}
        className="w-full bg-[#e50914] hover:bg-[#b20710] text-white"
      >
        {room.isActive ? 'Join Room' : 'View Room'}
        <ChevronRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
}

// Stats Card
function StatsCard({ title, value, icon: Icon, trend }: { title: string; value: string | number; icon: any; trend?: string }) {
  return (
    <div className="bg-[#141414] rounded-xl border border-white/5 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && (
            <p className="text-green-500 text-sm mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {trend}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-[#e50914]/20 flex items-center justify-center">
          <Icon className="w-5 h-5 text-[#e50914]" />
        </div>
      </div>
    </div>
  );
}

// Main Dashboard
export default function DashboardPage() {
  const { user } = useAuth();
  const [hostedRooms, setHostedRooms] = useState<Room[]>([]);
  const [joinedRooms, setJoinedRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [joinDialogOpen, setJoinDialogOpen] = useState(false);

  const fetchRooms = async () => {
    try {
      const response = await api.getMyRooms();
      setHostedRooms(response.data.hosted);
      setJoinedRooms(response.data.joined);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-gray-400">
            Create a room or join an existing one to start watching together.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Rooms Created" 
            value={user?.stats?.roomsCreated || 0} 
            icon={Video}
            trend="+2 this week"
          />
          <StatsCard 
            title="Rooms Joined" 
            value={user?.stats?.roomsJoined || 0} 
            icon={Users}
          />
          <StatsCard 
            title="Messages Sent" 
            value={user?.stats?.messagesSent || 0} 
            icon={MessageSquare}
          />
          <StatsCard 
            title="Watch Time" 
            value={`${Math.round((user?.stats?.totalWatchTime || 0) / 60)}h`} 
            icon={Clock}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-[#e50914] hover:bg-[#b20710] text-white px-6"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Room
          </Button>
          <Button
            onClick={() => setJoinDialogOpen(true)}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10 px-6"
          >
            <Users className="w-4 h-4 mr-2" />
            Join Room
          </Button>
        </div>

        {/* Rooms Tabs */}
        <Tabs defaultValue="hosted" className="w-full">
          <TabsList className="bg-[#141414] border border-white/5 mb-6">
            <TabsTrigger value="hosted" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
              My Rooms ({hostedRooms.length})
            </TabsTrigger>
            <TabsTrigger value="joined" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
              Joined Rooms ({joinedRooms.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hosted">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading rooms...</p>
              </div>
            ) : hostedRooms.length === 0 ? (
              <div className="text-center py-12 bg-[#141414] rounded-xl border border-white/5">
                <Video className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No rooms yet</h3>
                <p className="text-gray-400 mb-4">Create your first watch party room</p>
                <Button
                  onClick={() => setCreateDialogOpen(true)}
                  className="bg-[#e50914] hover:bg-[#b20710] text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Room
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostedRooms.map((room) => (
                  <RoomCard key={room.code} room={room} onDelete={fetchRooms} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="joined">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Loading rooms...</p>
              </div>
            ) : joinedRooms.length === 0 ? (
              <div className="text-center py-12 bg-[#141414] rounded-xl border border-white/5">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No joined rooms</h3>
                <p className="text-gray-400 mb-4">Join a room using a room code</p>
                <Button
                  onClick={() => setJoinDialogOpen(true)}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Join Room
                </Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {joinedRooms.map((room) => (
                  <RoomCard key={room.code} room={room} onDelete={fetchRooms} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      {/* Dialogs */}
      <CreateRoomDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
        onRoomCreated={fetchRooms}
      />
      <JoinRoomDialog 
        open={joinDialogOpen} 
        onOpenChange={setJoinDialogOpen}
      />
    </div>
  );
}
