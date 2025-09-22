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
import { auth, db } from "@/firebase/config";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";

import { Todo } from "@/models/Todo";
import { User } from "@/models/User";

// import { FirebaseError } from "firebase/auth";

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
      const usersCollection = collection(db, "users");

      // Check if user with email already exists
      const emailQuery = await getDocs(usersCollection);
      const userExistsArray = emailQuery.docs.map((doc) => doc.data().email);
      if (userExistsArray.includes(email)) {
        setIsLoading(false);
        return false;
      }

      const result = await createUserWithEmailAndPassword(email, password);
      if (!result) {
        setIsLoading(false);
        return false;
      }

      // Add user to firestore (this will create the collection if it doesn't exist)
      await setDoc(doc(db, "users", result.user.uid), {
        uid: result.user.uid,
        name: result.user.email?.split("@")[0] || "User",
        email: result.user.email,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${result.user.email}`,
        createdAt: new Date(),
      });

      const todosCollection = collection(db, "users", result.user.uid, "todos");
      await setDoc(doc(todosCollection), {
        title: "Welcome to Todo App 🎉",
        description: "This is your first task!",
        complete: false,
        dueDate: null,
        createdAt: new Date(),
      });

      console.log("User created:", result);

      setIsLoading(false);
      return true;
    } catch (err) {
      console.error("Error during signup:", err);
      setIsLoading(false);
      return false;
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();

      // Check if user was successfully authenticated
      if (result) {
        const { user } = result;

        // Check if user already exists in Firestore
        const userDoc = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDoc);

        // If user doesn't exist in Firestore, create them
        if (!userSnap.exists()) {
          // Add user to Firestore
          await setDoc(userDoc, {
            uid: user.uid,
            name: user.displayName || user.email?.split("@")[0] || "User",
            email: user.email,
            avatar:
              user.photoURL ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`,
            createdAt: new Date(),
          });

          // Create welcome todo
          const todosCollection = collection(db, "users", user.uid, "todos");
          await setDoc(doc(todosCollection), {
            title: "Welcome to Todo App 🎉",
            description: "This is your first task!",
            completed: false,
            dueDate: null,
            createdAt: new Date(),
          });

          console.log("Google user created in Firestore:", user.uid);
        }
      }

      setIsLoading(false);
      return !!result;
    } catch (err) {
      console.error("Google login error:", err);
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
