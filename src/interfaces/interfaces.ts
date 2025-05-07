import { User } from "firebase/auth"; //type User import

//IAuth context
export interface IAuth {
  user: User | null; //type User comes from firebase
  loading: boolean;
  isAuthLoading: boolean; // Added for initial auth state check
  signIn: (creds: LoginFormValues) => Promise<void>; // Updated to return Promise for async handling
  signUp: (creds: UserFormValues) => Promise<void>; // Updated to return Promise for async handling
  signOut: () => Promise<void>; // Updated to return Promise for async handling
}

export interface LoginFormValues {
  email: string;
  password: string;
}

// UserFormValues from your LoginModal included a displayName, 
// but your original interface did not. I'm keeping it simple without displayName for now.
// If you need it for sign-up, we can add it back to the form and here.
export interface UserFormValues {
  email: string;
  password: string;
  // displayName?: string; // Optional: uncomment if you plan to use it
}
