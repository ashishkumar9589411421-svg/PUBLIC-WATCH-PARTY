import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Play, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login(formData.email, formData.password);
    if (success) {
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 xl:px-12 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Back Button */}
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-xl flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              WATCH<span className="text-[#e50914]">PARTY</span>
            </span>
          </Link>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
            <p className="text-gray-400">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-300">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 bg-[#141414] border-white/10 text-white placeholder:text-gray-600 focus:border-[#e50914] focus:ring-[#e50914]/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-10 bg-[#141414] border-white/10 text-white placeholder:text-gray-600 focus:border-[#e50914] focus:ring-[#e50914]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={formData.rememberMe}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, rememberMe: checked as boolean })
                  }
                  className="border-white/20 data-[state=checked]:bg-[#e50914] data-[state=checked]:border-[#e50914]"
                />
                <Label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                  Remember me
                </Label>
              </div>
              <Link to="/forgot-password" className="text-sm text-[#e50914] hover:text-[#b20710] transition-colors">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e50914] hover:bg-[#b20710] text-white py-6 rounded-xl font-semibold"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#e50914] hover:text-[#b20710] font-semibold transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Image/Gradient */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/30 via-purple-900/30 to-[#0a0a0a]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center">
              <Play className="w-12 h-12 text-white fill-white" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Watch Together</h2>
            <p className="text-gray-300 max-w-sm">
              Join thousands of users enjoying synchronized watch parties with friends and family.
            </p>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#e50914]/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600/20 rounded-full blur-[100px]" />
      </div>
    </div>
  );
}
