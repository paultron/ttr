import React, { useState, useContext } from 'react';
import { AuthContext } from '../store/AuthContext'; // Import AuthContext
import { UserFormValues, LoginFormValues } from '../interfaces/interfaces'; // Import form value interfaces

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, loading } = useContext(AuthContext); // Use context

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    try {
      if (isSignUp) {
        // Assuming UserFormValues for signUp doesn't require displayName for now
        // If it does, you'll need to add a displayName field to the form
        await signUp({ email, password } as UserFormValues);
      } else {
        await signIn({ email, password } as LoginFormValues);
      }
      onClose(); // Close modal on successful login/signup
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred.');
      }
      console.error(err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center" id="login-modal">
      <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white">
        <button
          onClick={onClose}
          className="absolute top-0 right-0 mt-2 mr-2 text-gray-700 hover:text-gray-900"
          aria-label="Close login modal"
          disabled={loading} // Disable close button during auth operation
        >
          &times;
        </button>
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
          {isSignUp ? 'Sign Up' : 'Login'}
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              id="email"
              className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
            />
          </div>
          <div className="mb-4">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              className="mt-1 p-2 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-required="true"
              disabled={loading}
            />
          </div>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <div className="flex items-center justify-between mb-4">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
              disabled={loading}
            >
              {loading ? (isSignUp ? 'Signing Up...' : 'Logging In...') : (isSignUp ? 'Sign Up' : 'Login')}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null); 
              }}
              className="text-sm text-blue-500 hover:text-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Login' : 'Need an account? Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
