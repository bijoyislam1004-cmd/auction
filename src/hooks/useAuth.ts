import { useState, useEffect, useCallback } from 'react';
import { UserAccount, UserRole } from '../types/auction';

export interface AuthenticatedUser {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  teamId?: string;
}

const STORAGE_KEY = 'jpl_auth_session';

export function useAuth(accounts?: UserAccount[]) {
  const [user, setUser] = useState<AuthenticatedUser | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Keep user sync if account data changes in state
  useEffect(() => {
    if (user && accounts) {
      const current = accounts.find(a => a.id === user.id || a.username.toLowerCase() === user.username.toLowerCase());
      if (current) {
        const updated: AuthenticatedUser = {
          id: current.id,
          username: current.username,
          role: current.role,
          name: current.name,
          teamId: current.teamId
        };
        setUser(updated);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        } catch {
          // ignore
        }
      }
    }
  }, [accounts]);

  const login = useCallback(
    async (usernameInput: string, passwordInput: string, requiredRole?: UserRole): Promise<{ success: boolean; error?: string }> => {
      const cleanUsername = usernameInput.trim();
      const cleanPassword = passwordInput.trim();

      if (!cleanUsername || !cleanPassword) {
        return { success: false, error: 'User ID এবং Password দুটিই পূরণ করুন!' };
      }

      // Check locally in state.accounts first if available
      if (accounts && accounts.length > 0) {
        const found = accounts.find(
          a => a.username.toLowerCase() === cleanUsername.toLowerCase() && a.password === cleanPassword
        );

        if (!found) {
          return { success: false, error: 'ভুল User ID অথবা Password! অনুগ্রহ করে সঠিক তথ্য দিন।' };
        }

        if (requiredRole && found.role !== requiredRole && found.role !== 'admin') {
          return {
            success: false,
            error: requiredRole === 'admin'
              ? 'এই অ্যাকাউন্টটি Admin নয়! শুধুমাত্র Admin Panel ব্যবহারকারী প্রবেশ করতে পারবেন।'
              : 'এই অ্যাকাউন্ট দিয়ে Team War Room-এ প্রবেশাধিকার নেই!'
          };
        }

        const authUser: AuthenticatedUser = {
          id: found.id,
          username: found.username,
          role: found.role,
          name: found.name,
          teamId: found.teamId
        };

        setUser(authUser);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
        } catch {
          // ignore
        }
        return { success: true };
      }

      // Fallback to REST API if accounts not yet loaded
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: cleanUsername,
            password: cleanPassword,
            requiredRole
          })
        });
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.user));
          } catch {
            // ignore
          }
          return { success: true };
        } else {
          return { success: false, error: data.message || 'লগইন ব্যর্থ হয়েছে!' };
        }
      } catch (err: any) {
        return { success: false, error: 'সার্ভারের সাথে সংযোগ স্থাপন করা সম্ভব হয়নি।' };
      }
    },
    [accounts]
  );

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    user,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isTeam: user?.role === 'team',
    login,
    logout
  };
}
