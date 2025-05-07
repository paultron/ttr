import { firebaseAuth } from '../firebase/BaseConfig';
import { createContext, useEffect, useState, ReactNode } from 'react';
import { IAuth, LoginFormValues, UserFormValues } from '../interfaces/interfaces';
import { User, onAuthStateChanged } from 'firebase/auth';
import { firebaseSignIn, firebaseSignOut, firebaseSignUp } from '../firebase/AuthService';

// Initial context state
const initialAuthContext: IAuth = {
  user: null,
  loading: false,
  isAuthLoading: true, // Start with true until first auth check completes
  signIn: async () => { console.warn('signIn function not yet initialized'); },
  signUp: async () => { console.warn('signUp function not yet initialized'); },
  signOut: async () => { console.warn('signOut function not yet initialized'); },
};

export const AuthContext = createContext<IAuth>(initialAuthContext);

const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false); // For active sign-in/sign-up processes
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true); // For initial auth state check

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, (user) => {
      setCurrentUser(user);
      setIsAuthLoading(false);
    });
    return unsubscribe; // Cleanup subscription on unmount
  }, []);

  const signUp = async (creds: UserFormValues) => {
    setIsLoading(true);
    try {
      const result = await firebaseSignUp(creds);
      // onAuthStateChanged will update currentUser, no navigate here
      console.log('Sign up successful', result.user);
    } catch (error) {
      console.error('Sign up error:', error);
      // Let the calling component handle displaying the error
      throw error; // Re-throw to allow calling component to catch
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (creds: LoginFormValues) => {
    setIsLoading(true);
    try {
      const result = await firebaseSignIn(creds);
      // onAuthStateChanged will update currentUser, no navigate here
      console.log('Sign in successful', result.user);
    } catch (error) {
      console.error('Sign in error:', error);
      // Let the calling component handle displaying the error
      throw error; // Re-throw to allow calling component to catch
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await firebaseSignOut();
      // onAuthStateChanged will set currentUser to null, no navigate here
      console.log('Sign out successful');
    } catch (error) {
      console.error('Sign out error:', error);
      // Let the calling component handle displaying the error
      throw error; // Re-throw to allow calling component to catch
    } finally {
      setIsLoading(false);
    }
  };

  const authValues: IAuth = {
    user: currentUser,
    loading: isLoading,
    isAuthLoading,
    signIn,
    signUp,
    signOut,
  };

  if (isAuthLoading) {
    // You might want a more sophisticated loading screen later
    return <div className="flex justify-center items-center h-screen">Loading authentication...</div>;
  }

  return (
    <AuthContext.Provider value={authValues}>{children}</AuthContext.Provider>
  );
};

export default AuthProvider;
