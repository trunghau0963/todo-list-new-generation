"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithEmailAndPassword,
  useSignInWithGoogle,
  useSignOut,
} from "react-firebase-hooks/auth";
import { auth } from "@/firebase/config";
// import { FirebaseError } from "firebase/auth";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string) => Promise<boolean>;
  loginWithGoogle: () => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [
    createUserWithEmailAndPassword,
    userCredential,
    createUserLoading,
    createUserError,
  ] = useCreateUserWithEmailAndPassword(auth);
  const [signInWithEmailAndPassword, signInUser, signInLoading, signInError] =
    useSignInWithEmailAndPassword(auth);
  const [signInWithGoogle, googleUser, googleLoading, googleError] =
    useSignInWithGoogle(auth);
  const [signOut] = useSignOut(auth);

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Simulate checking auth state on mount
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        // Create user object from Firebase user
        const currentUser: User = {
          id: firebaseUser.uid,
          name:
            firebaseUser.displayName ||
            firebaseUser.email?.split("@")[0] ||
            "User",
          email: firebaseUser.email || "",
          avatar:
            firebaseUser.photoURL ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${firebaseUser.email}`,
        };
        setUser(currentUser);
        // You can still store in localStorage if needed
        localStorage.setItem("todo-app-user", JSON.stringify(currentUser));
      } else {
        setUser(null);
        localStorage.removeItem("todo-app-user");
      }
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  // Update error state when Firebase errors change
  // useEffect(() => {
  //   const currentError = createUserError || signInError || googleError;
  //   if (currentError) {
  //     if (currentError instanceof FirebaseError) {
  //       // Handle Firebase specific errors
  //       switch (currentError.code) {
  //         case 'auth/email-already-in-use':
  //           setError('Email is already in use');
  //           break;
  //         case 'auth/invalid-email':
  //           setError('Invalid email format');
  //           break;
  //         case 'auth/weak-password':
  //           setError('Password is too weak');
  //           break;
  //         case 'auth/user-not-found':
  //         case 'auth/wrong-password':
  //           setError('Invalid email or password');
  //           break;
  //         default:
  //           setError(currentError.message);
  //       }
  //     } else {
  //       setError(currentError.message);
  //     }
  //   } else {
  //     setError(null);
  //   }
  // }, [createUserError, signInError, googleError]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(email, password);
      setIsLoading(false);
      return !!result;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(email, password);
      console.log("Sign up result:", result);
      setIsLoading(false);
      return !!result;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      setIsLoading(false);
      return !!result;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    await signOut();
    setUser(null);
    localStorage.removeItem("todo-app-user");
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, login, signUp, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
