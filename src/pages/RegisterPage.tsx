import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, Play, ArrowLeft, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    agreeTerms: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeTerms) {
      return;
    }

    setIsLoading(true);

    const success = await register(formData.username, formData.email, formData.password);
    if (success) {
      navigate('/dashboard');
    }

    setIsLoading(false);
  };

  const passwordRequirements = [
    { label: 'At least 6 characters', met: formData.password.length >= 6 },
    { label: 'Contains a letter', met: /[a-zA-Z]/.test(formData.password) },
    { label: 'Contains a number', met: /\d/.test(formData.password) },
  ];

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
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-gray-400">Sign up to start watching together</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <Input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-10 bg-[#141414] border-white/10 text-white placeholder:text-gray-600 focus:border-[#e50914] focus:ring-[#e50914]/20"
                  required
                  minLength={3}
                />
              </div>
            </div>

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
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-2 space-y-1">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${req.met ? 'bg-green-500/20 text-green-500' : 'bg-gray-700 text-gray-500'}`}>
                        <Check className="w-3 h-3" />
                      </div>
                      <span className={req.met ? 'text-green-500' : 'text-gray-500'}>
                        {req.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={formData.agreeTerms}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, agreeTerms: checked as boolean })
                }
                className="mt-1 border-white/20 data-[state=checked]:bg-[#e50914] data-[state=checked]:border-[#e50914]"
              />
              <Label htmlFor="terms" className="text-sm text-gray-400 cursor-pointer">
                I agree to the{' '}
                <Link to="/terms" className="text-[#e50914] hover:text-[#b20710]">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#e50914] hover:text-[#b20710]">Privacy Policy</Link>
              </Label>
            </div>

            <Button
              type="submit"
              disabled={isLoading || !formData.agreeTerms}
              className="w-full bg-[#e50914] hover:bg-[#b20710] text-white py-6 rounded-xl font-semibold disabled:opacity-50"
            >
              {isLoading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="text-[#e50914] hover:text-[#b20710] font-semibold transition-colors">
                Sign in
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
            <h2 className="text-3xl font-bold text-white mb-4">Join the Community</h2>
            <p className="text-gray-300 max-w-sm">
              Create your free account and start watching together with friends in seconds.
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
