import React, { useContext, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';
import { FaTimes } from 'react-icons/fa';

/**
 * Sign In component for accounts that allows users to enter their credentials and sign in.
 *
 * @returns {JSX.Element} A login form with email and password fields
 */
const SignIn = ({ isOpen, onSignUpClick, onModalClose, onSuccessfulLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const supabase = useContext(SupabaseContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    let { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      switch (error.name) {
        case 'AuthApiError':
          switch (error.code) {
            case 'invalid_credentials':
              alert('Your email or password is incorrect');
              break;

            default:
              alert(error.code);
          }
          break;

        default:
          alert(error.name + ' ' + error.code);
      }
    } else {
      onModalClose();
      if (onSuccessfulLogin) onSuccessfulLogin();
    }
  };

  return (
    <div className="text-white">
      <form className="space-y-6" onSubmit={handleSubmit}>
        <h5 className="text-2xl font-bold mx-auto px-[75px]">
          STATMAP SIGN IN
        </h5>
        <div>
          <label htmlFor="email" className="block mb-2 text-sm font-medium">
            Your email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            className="bg-gray-800 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block mb-2 text-sm font-medium">
            Your password
          </label>
          <input
            type="password"
            name="password"
            id="password"
            placeholder="••••••••"
            className="bg-gray-800 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full text-white bg-zinc-900/95 border border-white/20 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          Sign In to your account
        </button>
        <div className="text-sm font-medium text-center">
          Not registered?{' '}
          <button
            onClick={() => onSignUpClick()}
            className="text-blue-800 hover:underline"
          >
            Create account
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
