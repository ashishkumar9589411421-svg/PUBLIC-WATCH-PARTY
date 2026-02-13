import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, User, Mail, Camera, Lock, Bell, 
  Moon, Sun, Monitor, Save, Loader2, Play
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { toast } from 'sonner';

export default function ProfilePage() {
  const { user, updateProfile, changePassword } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatar: user?.avatar || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    notifications: user?.preferences?.notifications ?? true,
    soundEffects: user?.preferences?.soundEffects ?? true,
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await updateProfile({
      username: profileData.username,
      avatar: profileData.avatar,
    });

    setIsLoading(false);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    const success = await changePassword(passwordData.currentPassword, passwordData.newPassword);

    if (success) {
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }

    setIsLoading(false);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to server/cloud storage
      // For now, use a placeholder
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header */}
      <header className="bg-[#141414] border-b border-white/5 px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-lg flex items-center justify-center">
              <Play className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="text-lg font-bold text-white">
              WATCH<span className="text-[#e50914]">PARTY</span>
            </span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Profile Settings</h1>
          <p className="text-gray-400">Manage your account and preferences</p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="bg-[#141414] border border-white/5 mb-6">
            <TabsTrigger value="profile" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
              <User className="w-4 h-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="security" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
              <Lock className="w-4 h-4 mr-2" />
              Security
            </TabsTrigger>
            <TabsTrigger value="preferences" className="data-[state=active]:bg-[#e50914] data-[state=active]:text-white">
              <Bell className="w-4 h-4 mr-2" />
              Preferences
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6">
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                {/* Avatar */}
                <div className="flex flex-col items-center mb-8">
                  <div 
                    onClick={handleAvatarClick}
                    className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center cursor-pointer group overflow-hidden"
                  >
                    {profileData.avatar ? (
                      <img 
                        src={profileData.avatar} 
                        alt="Avatar" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-3xl font-bold text-white">
                        {profileData.username[0]?.toUpperCase()}
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-gray-400 text-sm mt-2">Click to change avatar</p>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-gray-300">Username</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="username"
                      value={profileData.username}
                      onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                      className="pl-10 bg-[#0a0a0a] border-white/10 text-white"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="pl-10 bg-[#0a0a0a] border-white/10 text-gray-500"
                    />
                  </div>
                  <p className="text-gray-500 text-xs">Email cannot be changed</p>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#e50914] hover:bg-[#b20710] text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save Changes
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security">
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6">
              <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-gray-300">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-gray-300">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                    required
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-gray-300">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="bg-[#0a0a0a] border-white/10 text-white"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-[#e50914] hover:bg-[#b20710] text-white"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  Change Password
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <div className="bg-[#141414] rounded-xl border border-white/5 p-6 space-y-6">
              {/* Theme */}
              <div>
                <h3 className="text-white font-semibold mb-4">Appearance</h3>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => setTheme('light')}
                    className={`p-4 rounded-xl border transition-all ${
                      theme === 'light' 
                        ? 'border-[#e50914] bg-[#e50914]/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
                    <p className="text-white text-sm">Light</p>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`p-4 rounded-xl border transition-all ${
                      theme === 'dark' 
                        ? 'border-[#e50914] bg-[#e50914]/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                    <p className="text-white text-sm">Dark</p>
                  </button>
                  <button
                    onClick={() => setTheme('auto')}
                    className={`p-4 rounded-xl border transition-all ${
                      theme === 'auto' 
                        ? 'border-[#e50914] bg-[#e50914]/10' 
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <Monitor className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-white text-sm">Auto</p>
                  </button>
                </div>
              </div>

              {/* Notifications */}
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white font-semibold mb-4">Notifications</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Enable Notifications</p>
                    <p className="text-gray-500 text-sm">Receive notifications about room activity</p>
                  </div>
                  <Switch
                    checked={preferences.notifications}
                    onCheckedChange={(checked) => {
                      setPreferences(prev => ({ ...prev, notifications: checked }));
                      const currentPrefs = user?.preferences || { theme: 'dark' as const, notifications: true, soundEffects: true };
                      updateProfile({ preferences: { ...currentPrefs, notifications: checked } });
                    }}
                    className="data-[state=checked]:bg-[#e50914]"
                  />
                </div>
              </div>

              {/* Sound Effects */}
              <div className="pt-6 border-t border-white/5">
                <h3 className="text-white font-semibold mb-4">Sound</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white">Sound Effects</p>
                    <p className="text-gray-500 text-sm">Play sounds for notifications and actions</p>
                  </div>
                  <Switch
                    checked={preferences.soundEffects}
                    onCheckedChange={(checked) => {
                      setPreferences(prev => ({ ...prev, soundEffects: checked }));
                      const currentPrefs = user?.preferences || { theme: 'dark' as const, notifications: true, soundEffects: true };
                      updateProfile({ preferences: { ...currentPrefs, soundEffects: checked } });
                    }}
                    className="data-[state=checked]:bg-[#e50914]"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
