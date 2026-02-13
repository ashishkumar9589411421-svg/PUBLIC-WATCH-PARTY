// Stub type declarations for missing modules

declare module 'react-router-dom' {
  import * as React from 'react';
  
  export interface BrowserRouterProps {
    children?: React.ReactNode;
  }
  
  export interface RouteProps {
    path?: string;
    element?: React.ReactNode;
    children?: React.ReactNode;
  }
  
  export interface LinkProps {
    to: string;
    children?: React.ReactNode;
    className?: string;
  }
  
  export interface NavLinkProps extends LinkProps {
    end?: boolean;
  }
  
  export interface NavigateProps {
    to: string;
    replace?: boolean;
  }
  
  export function BrowserRouter(props: BrowserRouterProps): JSX.Element;
  export function Routes(props: { children?: React.ReactNode }): JSX.Element;
  export function Route(props: RouteProps): JSX.Element;
  export function Link(props: LinkProps): JSX.Element;
  export function NavLink(props: NavLinkProps): JSX.Element;
  export function Navigate(props: NavigateProps): JSX.Element;
  export function useNavigate(): (to: string, options?: { replace?: boolean }) => void;
  export function useParams<T = {}>(): T;
  export function useLocation(): { pathname: string; search: string; hash: string };
}

declare module 'socket.io-client' {
  export interface Socket {
    id: string;
    connected: boolean;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback?: (...args: any[]) => void): void;
    emit(event: string, ...args: any[]): void;
    connect(): void;
    disconnect(): void;
    join(room: string): void;
    leave(room: string): void;
  }
  
  export interface ManagerOptions {
    transports?: string[];
    autoConnect?: boolean;
  }
  
  export function io(url?: string, options?: ManagerOptions): Socket;
  export default io;
}

declare module 'screenfull' {
  interface Screenfull {
    isEnabled: boolean;
    isFullscreen: boolean;
    element: Element | null;
    request(element?: Element): Promise<void>;
    exit(): Promise<void>;
    toggle(element?: Element): Promise<void>;
    on(event: string, callback: (event: Event) => void): void;
    off(event: string, callback: (event: Event) => void): void;
  }
  
  const screenfull: Screenfull;
  export default screenfull;
}
