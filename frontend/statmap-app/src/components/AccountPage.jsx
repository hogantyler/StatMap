import React, { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';

const AccountPage = ({ isOpen, onModalClose }) => {
    const [account, setAccount] = useState(null);
    const [gameLogs, setGameLogs] = useState([]);

    const supabase = useContext(SupabaseContext);

    async function getAccount() {
        const tempAccount = await supabase.auth.getUser();
        setAccount(tempAccount);
        // console.log(tempAccount)

        if (tempAccount && tempAccount.data.user) {
            getGameLogs(tempAccount.data.user.id);
        }
    }

    async function getGameLogs(user_id) {
        let { data, error } = await supabase
        .from('Game Logs')
        .select("*")
        .eq('User_ID', user_id)

        if (error) {
            alert(error)
        } else {
            setGameLogs(data);
        }
    }

    useEffect(() => {
        getAccount();
    }, [])

    return (
            <div>
                {/* <button onClick={onModalClose}>X</button> */}
                <h5 className="text-xl font-medium text-black">Account Page</h5>
                <br />
                {
                    account ?
                        account.data.user ?
                            <div>
                                <div>
                                    <p>Display Name: {account.data.user.user_metadata.display_name}</p>
                                    <p>Email: {account.data.user.user_metadata.email}</p>
                                    <p>Email Verified: {String(account.data.user.user_metadata.email_verified)}</p>
                                    <p>Created On: {(new Date(account.data.user.created_at)).toLocaleDateString()}</p>
                                </div>
                                <br />
                                <div>
                                    <h5>Game Logs</h5>
                                    <div>
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Questions</th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Questions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {
                                                    gameLogs.map((game) => {
                                                        return (
                                                            <tr key={game.Game_ID}>
                                                                <td className="px-6 py-4 whitespace-nowrap">{game.Mode}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{game.Score}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{game.Num_Correct}</td>
                                                                <td className="px-6 py-4 whitespace-nowrap">{game.Num_Questions}</td>
                                                            </tr>
                                                        )
                                                    })
                                                }
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                            :
                            <p>Sign In To View Your Account</p>
                        :
                        <p>Sign In To View Your Account</p>
                }
                
            </div>
    );
};

export default AccountPage;