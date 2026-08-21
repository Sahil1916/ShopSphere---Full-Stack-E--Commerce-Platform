import { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../services/api';

const AuthContext = createContext(null);

function normalize(data) {
  if (!data) return null;
  return {
    id:     data.id     || data.userId || null,
    name:   data.name   || '',
    email:  data.email  || '',
    role:   data.role   || 'CUSTOMER',
    status: data.status || 'ACTIVE',
  };
}

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    auth.me()
      .then(r => setUser(normalize(r.data)))
      .catch(() => setUser(null))   // 401 = not logged in, stay on current page
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const r = await auth.login({ email, password });
    const u = normalize(r.data);
    // Block blocked users from entering the app
    if (u.status === 'BLOCKED') {
      await auth.logout().catch(() => {});
      throw new Error('BLOCKED');
    }
    setUser(u);
    return u;
  };

  const logout = async () => {
    await auth.logout().catch(() => {});
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
