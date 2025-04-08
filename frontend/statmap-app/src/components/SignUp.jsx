import React, { useContext, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';
import { useDeprecatedAnimatedState } from 'motion/react';
import { AuthApiError, AuthWeakPasswordError } from '@supabase/supabase-js';
import { BooleanKeyframeTrack } from 'three';

/**
 * Sign In component for accounts that allows users to enter their credentials and sign in.
 * 
 * @returns {JSX.Element} A sign in form with email and password fields
 */
const SignUp = ({ isOpen, onModalClose }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');

    const supabase = useContext(SupabaseContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                data: {display_name: displayName}
            }
        })
        
        if (error) {
            switch (error.name) {
                case 'AuthApiError':
                    switch (error.code) {
                        case 'user_already_exists':
                            alert("Email already in use");
                            break;
                        
                        default:
                            alert(error.code);
                    }
                    break;
                
                case 'AuthWeakPasswordError':
                    alert("Password Too Weak");
                    break;

                default:
                    alert(error.name + ' ' + error.code);
            }
        } else {
            onModalClose();
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                <button onClick={onModalClose}>X</button>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h5 className="text-xl font-medium text-black">STATMAP SIGN UP</h5>
                    <div>
                        <label htmlFor="display_name" className="block mb-2 text-sm font-medium text-black">Display Name</label>
                        <input
                            type="text"
                            name="display_name"
                            id="display_name"
                            className="bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="john123"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-black">Email</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            placeholder="name@company.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-black">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            placeholder="••••••••"
                            className="bg-white border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="w-full text-white bg-black hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Create account</button>
                </form>
            </div>
        </div>
    );
};

export default SignUp;