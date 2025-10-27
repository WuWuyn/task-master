import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  collection,
  query,
  where,
  getDocs,
  addDoc,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '../firebase';

// Helper function to convert undefined values to null for Firebase
const sanitizeForFirebase = (obj: any): any => {
  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    sanitized[key] = value === undefined ? null : value;
  }
  return sanitized;
};

export interface UserData {
  uid: string;
  email: string;
  username: string;
  name: string;
  token: string;
  createdAt: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
  name: string;
}

export interface LoginData {
  username: string;
  password: string;
}

// Generate 6-digit token
const generateToken = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Default categories for new users
const DEFAULT_CATEGORIES = ['Homework', 'Housework', 'Sport', 'Others'];

// Initialize default categories for new user
const initializeDefaultCategories = async (userId: string): Promise<void> => {
  try {
    const categoriesRef = collection(db, 'users', userId, 'categories');
    const now = Timestamp.now();
    
    for (const categoryName of DEFAULT_CATEGORIES) {
      await addDoc(categoriesRef, {
        name: categoryName,
        createdAt: now,
        userId: userId
      });
    }
  } catch (error) {
    console.error('Failed to initialize default categories:', error);
  }
};

// Check if username already exists
const checkUsernameExists = async (username: string): Promise<boolean> => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('username', '==', username));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty;
};

// Get user by username
const getUserByUsername = async (username: string): Promise<UserData | null> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();
    
    // Remove password field if it exists (security fix)
    if ('password' in userData) {
      delete userData.password;
    }
    
    return userData as UserData;
  } catch (error) {
    throw error;
  }
};

// Register new user
export const registerUser = async (data: RegisterData): Promise<UserData> => {
  try {
    
    // Check if username already exists
    const usernameExists = await checkUsernameExists(data.username);
    if (usernameExists) {
      throw new Error('Username already exists. Please choose a different username.');
    }


    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    const user = userCredential.user;
    const token = generateToken();


    // Create user document in Firestore (without password for security)
    const userData: UserData = {
      uid: user.uid,
      email: data.email,
      username: data.username,
      name: data.name,
      token: token,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'users', user.uid), sanitizeForFirebase(userData));

    // Initialize default categories for new user
    await initializeDefaultCategories(user.uid);

    // Store token in localStorage
    localStorage.setItem('userToken', token);
    localStorage.setItem('userId', user.uid);

    return userData;
  } catch (error: any) {
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email is already in use. Please use a different email or login.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password is too weak. Please use a password with at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email. Please check again.');
    }
    
    throw new Error(error.message || 'Registration failed. Please try again.');
  }
};

// Login user
export const loginUser = async (data: LoginData): Promise<UserData> => {
  try {
    
    // Get user by username from Firestore
    const userData = await getUserByUsername(data.username);
    
    if (!userData) {
      throw new Error('Username does not exist. Please check again or register a new account.');
    }


    // Sign in with email and password using Firebase Auth
    await signInWithEmailAndPassword(auth, userData.email, data.password);

    // Store token in localStorage
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userId', userData.uid);

    return userData;
  } catch (error: any) {
    
    // Handle specific Firebase Auth errors
    if (error.code === 'auth/invalid-credential') {
      throw new Error('Login credentials are incorrect. Please check your username and password.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('Account does not exist in the authentication system. Please contact admin.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many login attempts. Please try again in a few minutes.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network connection error. Please check your internet and try again.');
    }
    
    throw new Error(error.message || 'Login failed. Please try again.');
  }
};


// Get current user data
export const getCurrentUserData = async (uid: string): Promise<UserData | null> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data() as UserData;
    }
    return null;
  } catch (error) {
    return null;
  }
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = localStorage.getItem('userToken');
  const userId = localStorage.getItem('userId');
  return !!(token && userId);
};

// Get stored user info
export const getStoredUserInfo = () => {
  return {
    token: localStorage.getItem('userToken'),
    userId: localStorage.getItem('userId')
  };
};

