import { Link } from 'react-router-dom';
import { Play, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="text-center">
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-gradient-to-br from-[#e50914] to-[#b20710] rounded-xl flex items-center justify-center">
            <Play className="w-5 h-5 text-white fill-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            WATCH<span className="text-[#e50914]">PARTY</span>
          </span>
        </Link>

        {/* 404 */}
        <div className="mb-8">
          <h1 className="text-8xl sm:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#e50914] to-purple-600 mb-4">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Page Not Found
          </h2>
          <p className="text-gray-400 max-w-md mx-auto">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          <Link to="/">
            <Button className="bg-[#e50914] hover:bg-[#b20710] text-white">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
