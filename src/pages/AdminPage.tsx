import { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Video, 
  Shield, LogOut, Search, Ban, UserCheck, Trash2, 
  Crown, ChevronLeft, Activity, Server,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { toast } from 'sonner';

// Stats Card
function StatCard({ title, value, icon: Icon, trend, color }: { 
  title: string; 
  value: string | number; 
  icon: any; 
  trend?: string;
  color: string;
}) {
  return (
    <Card className="bg-[#141414] border-white/5">
      <CardContent className="p-6">
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
          <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Overview
function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getAdminDashboard();
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.stats?.users?.total || 0}
          icon={Users}
          trend={`+${stats?.stats?.users?.newToday || 0} today`}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Active Users"
          value={stats?.stats?.users?.active || 0}
          icon={Activity}
          color="bg-green-500/20"
        />
        <StatCard
          title="Total Rooms"
          value={stats?.stats?.rooms?.total || 0}
          icon={Video}
          trend={`+${stats?.stats?.rooms?.newToday || 0} today`}
          color="bg-purple-500/20"
        />
        <StatCard
          title="Active Rooms"
          value={stats?.stats?.rooms?.active || 0}
          icon={TrendingUp}
          color="bg-[#e50914]/20"
        />
      </div>

      {/* Most Active Room */}
      {stats?.mostActiveRoom && (
        <Card className="bg-[#141414] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              Most Active Room
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">{stats.mostActiveRoom.name}</p>
                <p className="text-gray-400 text-sm">Code: {stats.mostActiveRoom.code}</p>
                <p className="text-gray-500 text-sm">Host: {stats.mostActiveRoom.host}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{stats.mostActiveRoom.peakParticipants}</p>
                <p className="text-gray-400 text-sm">peak participants</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#141414] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity?.users?.slice(0, 5).map((user: any) => (
                <div key={user._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                      {user.username[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-white text-sm">{user.username}</p>
                      <p className="text-gray-500 text-xs">{user.email}</p>
                    </div>
                  </div>
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                    {user.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/5">
          <CardHeader>
            <CardTitle className="text-white">Recent Rooms</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentActivity?.rooms?.slice(0, 5).map((room: any) => (
                <div key={room._id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5">
                  <div>
                    <p className="text-white text-sm">{room.name}</p>
                    <p className="text-gray-500 text-xs">Code: {room.code}</p>
                  </div>
                  <Badge variant={room.isActive ? 'default' : 'secondary'} className={room.isActive ? 'bg-green-500/20 text-green-500' : ''}>
                    {room.isActive ? 'Active' : 'Ended'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Users Management
function UsersManagement() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [, setIsLoadingUsers] = useState(true);
  const [currentPage] = useState(1);

  const fetchUsers = async () => {
    try {
      const response = await api.getAdminUsers({ page: currentPage, search, limit: 20 });
      setUsers(response.data.users);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, search]);

  const handleBan = async (userId: string) => {
    try {
      await api.banUser(userId, 'Violation of terms');
      toast.success('User banned');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to ban user');
    }
  };

  const handleUnban = async (userId: string) => {
    try {
      await api.unbanUser(userId);
      toast.success('User unbanned');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to unban user');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.deleteUser(userId);
      toast.success('User deleted');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete user');
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      await api.updateUserRole(userId, 'admin');
      toast.success('User promoted to admin');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="pl-10 w-64 bg-[#141414] border-white/10 text-white"
            />
          </div>
        </div>
      </div>

      <Card className="bg-[#141414] border-white/5">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">User</th>
                <th className="text-left p-4 text-gray-400 font-medium">Role</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Joined</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                        {user.username[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-white text-sm">{user.username}</p>
                        <p className="text-gray-500 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-xs">
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4">
                    {user.isBanned ? (
                      <Badge variant="destructive" className="text-xs">Banned</Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-green-500 border-green-500">Active</Badge>
                    )}
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {user.isBanned ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleUnban(user._id)}
                          className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                        >
                          <UserCheck className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleBan(user._id)}
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Ban className="w-4 h-4" />
                        </Button>
                      )}
                      {user.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleMakeAdmin(user._id)}
                          className="text-blue-500 hover:text-blue-400 hover:bg-blue-500/10"
                        >
                          <Shield className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(user._id)}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// Rooms Management
function RoomsManagement() {
  const [rooms, setRooms] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [, setIsLoadingRooms] = useState(true);

  const fetchRooms = async () => {
    try {
      const response = await api.getAdminRooms({ search, limit: 50 });
      setRooms(response.data.rooms);
    } catch (error) {
      toast.error('Failed to load rooms');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [search]);

  const handleDelete = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    try {
      await api.delete(`/admin/rooms/${roomId}`);
      toast.success('Room deleted');
      fetchRooms();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Room Management</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search rooms..."
            className="pl-10 w-64 bg-[#141414] border-white/10 text-white"
          />
        </div>
      </div>

      <Card className="bg-[#141414] border-white/5">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="border-b border-white/5">
              <tr>
                <th className="text-left p-4 text-gray-400 font-medium">Room</th>
                <th className="text-left p-4 text-gray-400 font-medium">Host</th>
                <th className="text-left p-4 text-gray-400 font-medium">Status</th>
                <th className="text-left p-4 text-gray-400 font-medium">Participants</th>
                <th className="text-right p-4 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => (
                <tr key={room._id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="p-4">
                    <div>
                      <p className="text-white text-sm">{room.name}</p>
                      <p className="text-gray-500 text-xs font-mono">{room.code}</p>
                    </div>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {room.host?.username || 'Unknown'}
                  </td>
                  <td className="p-4">
                    <Badge variant={room.isActive ? 'default' : 'secondary'} className={room.isActive ? 'bg-green-500/20 text-green-500' : ''}>
                      {room.isActive ? 'Active' : 'Ended'}
                    </Badge>
                  </td>
                  <td className="p-4 text-gray-400 text-sm">
                    {room.participantCount} / {room.maxParticipants}
                  </td>
                  <td className="p-4 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(room._id)}
                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// System Status
function SystemStatus() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getSystemStats();
        setStats(response.data);
      } catch (error) {
        toast.error('Failed to load system stats');
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#e50914] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">System Status</h2>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-[#141414] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Server className="w-5 h-5" />
              Server Info
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Platform</span>
              <span className="text-white">{stats.platform}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Node Version</span>
              <span className="text-white">{stats.nodeVersion}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Environment</span>
              <span className="text-white capitalize">{stats.environment}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Uptime</span>
              <span className="text-white">{Math.floor(stats.uptime / 3600)}h {Math.floor((stats.uptime % 3600) / 60)}m</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#141414] border-white/5">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-400">Used</span>
              <span className="text-white">{stats.memory.used} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Free</span>
              <span className="text-white">{stats.memory.free} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total</span>
              <span className="text-white">{stats.memory.total} MB</span>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#e50914] rounded-full"
                style={{ width: `${(stats.memory.used / stats.memory.total) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Admin Page
export default function AdminPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/users', label: 'Users', icon: Users },
    { path: '/admin/rooms', label: 'Rooms', icon: Video },
    { path: '/admin/system', label: 'System', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#141414] border-r border-white/5 z-50">
        <div className="p-4">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-lg flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Admin<span className="text-[#e50914]">Panel</span>
            </span>
          </Link>

          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/5">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors mb-2">
            <ChevronLeft className="w-5 h-5" />
            Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-red-500 hover:text-red-400 hover:bg-red-500/10 transition-colors w-full"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/users" element={<UsersManagement />} />
          <Route path="/rooms" element={<RoomsManagement />} />
          <Route path="/system" element={<SystemStatus />} />
        </Routes>
      </main>
    </div>
  );
}
