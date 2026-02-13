import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, Users, MessageSquare, Video, Shield, 
  ChevronRight, Star, Zap, Globe, Lock,
  Monitor, Smartphone, Headphones, Radio
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

// Navigation Component
function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#features', label: 'Features' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#testimonials', label: 'Testimonials' },
    { href: '#faq', label: 'FAQ' },
  ];

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/5 py-3' 
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">
              WATCH<span className="text-[#e50914]">PARTY</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-gray-400 hover:text-white transition-colors relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#e50914] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <Link to="/dashboard">
                <Button className="bg-[#e50914] hover:bg-[#b20710] text-white px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-white hover:text-white hover:bg-white/10">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#e50914] hover:bg-[#b20710] text-white px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
              <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`w-full h-0.5 bg-white transition-all ${isMobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-white/10 pt-4">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-gray-400 hover:text-white transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
              <div className="flex gap-3 pt-4 border-t border-white/10">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="w-full">
                    <Button className="w-full bg-[#e50914] hover:bg-[#b20710] text-white">
                      Dashboard
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="flex-1">
                      <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10">
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/register" className="flex-1">
                      <Button className="w-full bg-[#e50914] hover:bg-[#b20710] text-white">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

// Hero Section
function HeroSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#e50914]/10 via-transparent to-purple-900/10" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#e50914]/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-gray-400">Now with HD Video Calls</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-tight mb-6">
              Watch Together{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-purple-600">
                Anywhere
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-gray-400 mb-8 max-w-xl mx-auto lg:mx-0">
              Create private rooms, sync YouTube videos, and enjoy real-time voice & video calls with friends worldwide.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button 
                    size="lg" 
                    className="bg-[#e50914] hover:bg-[#b20710] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#e50914]/25 hover:shadow-[#e50914]/40 transition-all"
                  >
                    <Play className="w-5 h-5 mr-2 fill-white" />
                    Go to Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button 
                      size="lg" 
                      className="bg-[#e50914] hover:bg-[#b20710] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#e50914]/25 hover:shadow-[#e50914]/40 transition-all"
                    >
                      <Play className="w-5 h-5 mr-2 fill-white" />
                      Create Free Room
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                    >
                      Join Room
                      <ChevronRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Social Proof */}
            <div className="flex items-center justify-center lg:justify-start gap-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border-2 border-[#0a0a0a] flex items-center justify-center"
                  >
                    <Users className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-sm text-gray-400">Join 50,000+ users watching together</p>
              </div>
            </div>
          </div>

          {/* Hero Image/Preview */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
              <div className="aspect-video bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-[#e50914]/20 flex items-center justify-center">
                    <Play className="w-10 h-10 text-[#e50914] fill-[#e50914]" />
                  </div>
                  <p className="text-gray-500">Your video will appear here</p>
                </div>
              </div>
              
              {/* Overlay UI */}
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                      <Play className="w-4 h-4 fill-white" />
                    </Button>
                    <div className="w-32 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="w-1/3 h-full bg-[#e50914]" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-400">12 watching</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 p-4 bg-[#141414] rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Video className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">HD Video</p>
                  <p className="text-xs text-gray-400">Crystal clear calls</p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 p-4 bg-[#141414] rounded-xl border border-white/10 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Perfect Sync</p>
                  <p className="text-xs text-gray-400">Millisecond precision</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const features = [
    {
      icon: Play,
      title: 'Perfect Sync',
      description: 'Millisecond-precision playback synchronization. Everyone sees the exact same frame.',
      color: 'from-[#e50914] to-red-600',
    },
    {
      icon: Video,
      title: 'HD Video Calls',
      description: 'Crystal-clear video calling with up to 8 simultaneous participants.',
      color: 'from-green-500 to-emerald-600',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Real-time messaging with reactions, emojis, and GIF support.',
      color: 'from-blue-500 to-cyan-600',
    },
    {
      icon: Shield,
      title: 'Host Controls',
      description: 'Lock rooms, manage participants, and control playback permissions.',
      color: 'from-purple-500 to-violet-600',
    },
    {
      icon: Monitor,
      title: 'Screen Sharing',
      description: 'Share your screen with everyone in the room seamlessly.',
      color: 'from-orange-500 to-amber-600',
    },
    {
      icon: Lock,
      title: 'Private Rooms',
      description: 'Password protection and private room codes for secure viewing.',
      color: 'from-pink-500 to-rose-600',
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#e50914] text-sm font-semibold tracking-wider uppercase">Features</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Everything You Need
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            A complete suite of tools designed for the ultimate shared viewing experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group p-6 rounded-2xl bg-[#141414] border border-white/5 hover:border-[#e50914]/30 transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// How It Works Section
function HowItWorksSection() {
  const steps = [
    {
      number: '01',
      icon: Users,
      title: 'Create a Room',
      description: 'Set up your private watch party room in one click. Choose your settings and you\'re ready to go.',
    },
    {
      number: '02',
      icon: Globe,
      title: 'Invite Friends',
      description: 'Share your unique room code or send invitation links. Friends join instantly from any device.',
    },
    {
      number: '03',
      icon: Play,
      title: 'Paste YouTube Link',
      description: 'Drop any YouTube URL and the video loads for everyone simultaneously.',
    },
    {
      number: '04',
      icon: Headphones,
      title: 'Enjoy Together',
      description: 'Chat, call, and watch in perfect sync. Control playback or let the host manage it.',
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#141414]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#e50914] text-sm font-semibold tracking-wider uppercase">Simple & Fast</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            How It Works
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get started in seconds. No downloads, no complicated setup.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="p-6 rounded-2xl bg-[#0a0a0a] border border-white/5 h-full">
                <span className="text-5xl font-bold text-white/10 absolute top-4 right-4">
                  {step.number}
                </span>
                <div className="w-12 h-12 rounded-xl bg-[#e50914]/20 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-[#e50914]" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.description}</p>
              </div>
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-[#e50914] to-transparent" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Testimonials Section
function TestimonialsSection() {
  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Movie Enthusiast',
      content: 'This app has completely changed how my friends and I watch movies together. The sync is perfect and the video quality is amazing!',
      avatar: 'S',
    },
    {
      name: 'James K.',
      role: 'Long-distance Couple',
      content: 'My girlfriend and I use this every weekend. It feels like we\'re in the same room even though we\'re miles apart.',
      avatar: 'J',
    },
    {
      name: 'The Gaming Squad',
      role: 'Friend Group',
      content: 'We\'ve tried every watch party app out there. This is by far the best. The host controls and chat features are game-changers.',
      avatar: 'G',
    },
  ];

  return (
    <section id="testimonials" className="py-24 bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#e50914] text-sm font-semibold tracking-wider uppercase">Testimonials</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Loved by Users
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See what our community has to say about their watch party experiences.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-[#141414] border border-white/5"
            >
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                ))}
              </div>
              <p className="text-gray-300 mb-6">"{testimonial.content}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#e50914] to-purple-600 flex items-center justify-center text-white font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-gray-500 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// FAQ Section
function FAQSection() {
  const faqs = [
    {
      question: 'Is WatchParty free to use?',
      answer: 'Yes! WatchParty is completely free for all users. Create unlimited rooms, invite unlimited friends, and enjoy all features without any subscription fees.',
    },
    {
      question: 'What devices and browsers are supported?',
      answer: 'WatchParty works on all modern browsers including Chrome, Firefox, Safari, and Edge. You can use it on desktop, laptop, tablet, and mobile devices.',
    },
    {
      question: 'How many people can join a room?',
      answer: 'Our rooms support up to 50 viewers and 8 simultaneous video call participants. Perfect for small gatherings or larger watch parties!',
    },
    {
      question: 'Do my friends need an account?',
      answer: 'No! Your friends can join as guests using just the room code. However, creating an account unlocks additional features like room history and personalized settings.',
    },
  ];

  return (
    <section id="faq" className="py-24 bg-[#141414]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-[#e50914] text-sm font-semibold tracking-wider uppercase">FAQ</span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mt-4 mb-6">
            Common Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about WatchParty.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="p-6 rounded-xl bg-[#0a0a0a] border border-white/5"
            >
              <h3 className="text-lg font-semibold text-white mb-2">{faq.question}</h3>
              <p className="text-gray-400">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// CTA Section
function CTASection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-24 bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-[#e50914]/20 to-purple-900/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#e50914]/10 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Watch Together?
        </h2>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Join thousands of users enjoying synchronized watch parties. Create your room in seconds — no credit card required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          {isAuthenticated ? (
            <Link to="/dashboard">
              <Button 
                size="lg" 
                className="bg-[#e50914] hover:bg-[#b20710] text-white px-8 py-6 text-lg rounded-xl"
              >
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <Link to="/register">
                <Button 
                  size="lg" 
                  className="bg-[#e50914] hover:bg-[#b20710] text-white px-8 py-6 text-lg rounded-xl"
                >
                  Create Free Room
                </Button>
              </Link>
              <Link to="/login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
                >
                  Sign In
                </Button>
              </Link>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-500" />
            <span>No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-green-500" />
            <span>Free forever</span>
          </div>
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-green-500" />
            <span>Works on all devices</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="py-12 bg-[#0a0a0a] border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-lg flex items-center justify-center">
                <Play className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="text-lg font-bold text-white">
                WATCH<span className="text-[#e50914]">PARTY</span>
              </span>
            </Link>
            <p className="text-gray-400 text-sm max-w-sm">
              Watch together, anywhere. The ultimate platform for synchronized viewing experiences with friends and family.
            </p>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-400 hover:text-white text-sm transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-400 hover:text-white text-sm transition-colors">How It Works</a></li>
              <li><a href="#testimonials" className="text-gray-400 hover:text-white text-sm transition-colors">Testimonials</a></li>
              <li><a href="#faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 WatchParty. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Globe className="w-5 h-5" />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <MessageSquare className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// Main Landing Page
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FAQSection />
      <CTASection />
      <Footer />
    </div>
  );
}
