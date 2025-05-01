import { useContext, useEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { SupabaseContext } from "../SupabaseContext";
import { User } from "lucide-react";
import { motion } from 'framer-motion';


export default function ChangePassword (props) {
    const newPass = useRef();
    const confirmNewPass = useRef();
    const [account, setAccount] = useState(null);

    const navigate = useNavigate();

    const supabase = useContext(SupabaseContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        // await supabase.auth.updateUser({ password: newPass.current.value })
        console.log(newPass.current.value);
        console.log(confirmNewPass.current.value);

        if (newPass.current.value !== confirmNewPass.current.value) {
            alert("Your passwords do not match");
        } else {
            await supabase.auth.updateUser({ password: confirmNewPass.current.value })
            alert("Your password has been updated");
            navigate("/");
        }
    }

    const handleBack = () => {
        navigate("/");
    };

    async function getAccount() {
        const tempAccount = await supabase.auth.getUser();
        setAccount(tempAccount);
    }

    useEffect(() => {
        getAccount();
    }, []);

    if (!account || !account.data.user) {
        return (
          <div className="w-full max-w-md mx-auto py-12 px-4">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="bg-zinc-900/60 rounded-lg p-8 backdrop-blur-sm">
                <User className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h2 className="text-xl font-medium text-white mb-2">
                  Sign In Required
                </h2>
                <p className="text-white/60 mb-6">
                  Please sign in to view your account information and statistics.
                </p>
              </div>
            </motion.div>
          </div>
        );
      }

    return (
        <div className="fixed inset-0 bg-black backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-zinc-900/90 border border-white/10 text-white p-6 rounded-lg w-full max-w-3xl shadow-2xl">
                <div className="text-white">
                <div className="absolute top-0 right-0 z-50">
                    <button
                        onClick={handleBack}
                        className="text-white rounded-full p-2 hover:text-red-600 transition-colors"
                    >
                        <FaTimes size={50} />
                    </button>
                    </div>
                    <p className="text-2xl font-bold text-center">Reset Password</p>
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="newPass" className="block mb-2 text-sm font-medium">
                                New Password
                            </label>
                            <input
                                type="password"
                                name="newPass"
                                id="newPass"
                                className="bg-gray-800 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                ref={newPass}
                                placeholder="•••••••••••••"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmNewPass" className="block mb-2 text-sm font-medium">
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                name="confirmNewPass"
                                id="confirmNewPass"
                                placeholder="•••••••••••••"
                                className="bg-gray-800 border border-gray-300 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                                ref={confirmNewPass}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="w-full text-white bg-zinc-900/95 border border-white/20 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                            >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    )
}