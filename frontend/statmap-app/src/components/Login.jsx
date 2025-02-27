import React, { useState } from 'react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Handle login logic here
        console.log('Email:', email);
        console.log('Password:', password);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <h5 className="text-xl font-medium text-black">STATMAP SIGN IN</h5>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-black">Your email</label>
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
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-black">Your password</label>
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
                    <div className="flex items-start">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                                <input
                                    id="remember"
                                    type="checkbox"
                                    className="w-4 h-4 border border-gray-300 rounded-sm bg-white focus:ring-3 focus:ring-blue-600"
                                />
                            </div>
                            <label htmlFor="remember" className="ml-2 text-sm font-medium text-black">Remember me</label>
                        </div>
                        <a href="#" className="ml-auto text-sm text-black hover:underline">Lost Password?</a>
                    </div>
                    <button type="submit" className="w-full text-white bg-black hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Login to your account</button>
                    <div className="text-sm font-medium text-black">
                        Not registered? <a href="#" className="text-blue-800 hover:underline">Create account</a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;