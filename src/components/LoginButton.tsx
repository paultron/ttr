import React from 'react';

interface LoginButtonProps {
  onClick: () => void;
}

const LoginButton: React.FC<LoginButtonProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      aria-label="Login or Sign up"
    >
      Login / Sign Up
    </button>
  );
};

export default LoginButton;
