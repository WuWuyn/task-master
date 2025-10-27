import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import type { UserData } from '../services/authService';
import { 
  getCurrentUserData, 
  isAuthenticated, 
  getStoredUserInfo 
} from '../services/authService';

interface AuthContextType {
  user: UserData | null;
  firebaseUser: User | null;
  loading: boolean;
  isLoggedIn: boolean;
  login: (userData: UserData) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser && isAuthenticated()) {
        const userData = await getCurrentUserData(firebaseUser.uid);
        setUser(userData);
      } else if (isAuthenticated()) {
        const { userId } = getStoredUserInfo();
        if (userId) {
          const userData = await getCurrentUserData(userId);
          setUser(userData);
        } else {
          localStorage.removeItem('userToken');
          localStorage.removeItem('userId');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (userData: UserData) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      setUser(null);
      setFirebaseUser(null);
      
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    firebaseUser,
    loading,
    isLoggedIn: !!user,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
