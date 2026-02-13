// Simple router stub implementation
import React, { createContext, useContext, useState, useCallback } from 'react';

interface RouterContextType {
  pathname: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
  params: Record<string, string>;
}

const RouterContext = createContext<RouterContextType>({
  pathname: '/',
  navigate: () => {},
  params: {},
});

export function BrowserRouter({ children }: { children: React.ReactNode }) {
  const [pathname, setPathname] = useState(window.location.pathname);
  const [params, setParams] = useState<Record<string, string>>({});

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    if (options?.replace) {
      window.history.replaceState({}, '', to);
    } else {
      window.history.pushState({}, '', to);
    }
    setPathname(to);
    // Parse params from new path
    const pathParts = to.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      setParams({ roomCode: pathParts[pathParts.length - 1] });
    }
  }, []);

  // Handle browser back/forward
  React.useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  return (
    <RouterContext.Provider value={{ pathname, navigate, params }}>
      {children}
    </RouterContext.Provider>
  );
}

export function Routes({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Route({ path, element }: { path?: string; element?: React.ReactNode }) {
  const { pathname } = useContext(RouterContext);
  
  if (!path) return null;
  
  // Simple path matching
  const match = pathname === path || (path === '/' && pathname === '') ||
    (path.includes(':') && pathname.startsWith(path.split(':')[0]));
  
  return match ? <>{element}</> : null;
}

export function Link({ to, children, className }: { to: string; children?: React.ReactNode; className?: string }) {
  const { navigate } = useContext(RouterContext);
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate(to);
  };
  
  return (
    <a href={to} onClick={handleClick} className={className}>
      {children}
    </a>
  );
}

export function useNavigate() {
  const { navigate } = useContext(RouterContext);
  return navigate;
}

export function useParams<T = Record<string, string>>(): T {
  const { pathname } = useContext(RouterContext);
  const [params, setParams] = useState<T>({} as T);
  
  React.useEffect(() => {
    // Parse params from URL
    const pathParts = pathname.split('/').filter(Boolean);
    const newParams: Record<string, string> = {};
    
    // This is a simplified param parsing
    if (pathParts.length > 0) {
      newParams.roomCode = pathParts[pathParts.length - 1];
    }
    
    setParams(newParams as T);
  }, [pathname]);
  
  return params;
}

export function Navigate({ to, replace }: { to: string; replace?: boolean }) {
  const { navigate } = useContext(RouterContext);
  
  React.useEffect(() => {
    navigate(to, { replace });
  }, [navigate, to, replace]);
  
  return null;
}

export function useLocation() {
  const { pathname } = useContext(RouterContext);
  return { pathname, search: window.location.search, hash: window.location.hash };
}
