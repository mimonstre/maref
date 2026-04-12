"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getUser, onAuthChange } from "@/lib/auth";

type User = {
  id: string;
  email?: string;
  created_at?: string;
  user_metadata?: { name?: string };
} | null;

const AuthContext = createContext<{
  user: User;
  loading: boolean;
}>({ user: null, loading: true });

export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUser().then((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    const { data } = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
    });
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
