import React, { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';

const AccountPage = ({ isOpen, onModalClose }) => {
    const [account, setAccount] = useState(null);
    const [gameLogs, setGameLogs] = useState([]);
    const [accountStats, setAccountStats] = useState(null);

    const supabase = useContext(SupabaseContext);

    async function getAccount() {
        const tempAccount = await supabase.auth.getUser();
        setAccount(tempAccount);
        console.log(tempAccount)

        if (tempAccount && tempAccount.data.user) {
            getGameLogs(tempAccount.data.user.id);
            getAccountStats(tempAccount.data.user.id);
        }
    }

    async function getGameLogs(user_id) {
        let { data, error } = await supabase
            .from('Game Logs')
            .select("*")
            .eq('User_ID', user_id)
            .limit(10)

        if (error) {
            alert(error)
        } else {
            setGameLogs(data);
        }
    }

    async function getAccountStats(user_id) {
        let { data, error } = await supabase.rpc('account_stats', { user_id: String(user_id) });

        if (error) {
            alert(error)
        } else {
            setAccountStats(data[0]);
        }
    }

    useEffect(() => {
        getAccount();
    }, [])

    return (
        <div className="w-full">
            <div className="text-white bg-black text-center">
                {/* <button onClick={onModalClose}>X</button> */}
                <h5 className="text-2xl font-bold">Account Page</h5>
                <br />
                {
                    account ?
                        account.data.user ?
                            <div>
                                <div className='grid grid-cols-3 gap-4'> 
                                    <div className="col-span-3 sm:col-span-1">
                                        <p className="text-xl font-semibold underline">Account Info</p>
                                        <p>Display Name: {account.data.user.user_metadata.display_name}</p>
                                        <p>Email: {account.data.user.user_metadata.email}</p>
                                        <p>Email Verified: {String(account.data.user.user_metadata.email_verified)}</p>
                                        <p>Created On: {(new Date(account.data.user.created_at)).toLocaleDateString()}</p>
                                    </div>
                                    <div className="col-span-3 sm:col-span-1">
                                        <p className="text-xl font-semibold underline">Account Stats</p>
                                        {
                                            accountStats ?
                                            <>
                                                <p>Games played: {accountStats.Total_Games_Played}</p>
                                                <p>Average Score: {accountStats.Avg_Score}</p>
                                                <p>Total Correct: {accountStats.Total_Correct}</p>
                                                <p>Total Questions: {accountStats.Total_Questions}</p>
                                                <p>Correct %: {(accountStats.Total_Correct / accountStats.Total_Questions).toFixed(2)}</p>
                                            </>
                                            :
                                            <></>
                                        }
                                    </div>
                                    <div className="col-span-3 sm:col-span-1">
                                        <p className="text-xl font-semibold underline">Account Management</p>
                                        <p>Reset Password Coming Soon</p>
                                    </div>
                                </div>
                                <br />
                                <div>
                                    <p className="text-xl font-semibold">Game Logs</p>
                                    <div>
                                        <table className="min-w-full divide-y divide-gray-200 border-gray-300 rounded-lg">
                                            <thead className="">
                                                <tr>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Mode</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Questions</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Questions</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hint One Used</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hint Two Used</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Hint Three Used</th>
                                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Game Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody className= "">
                                                {
                                                    gameLogs.map((game) => {
                                                        return (
                                                            <tr key={game.Game_ID}>
                                                                <td className="px-6 py-2 whitespace-nowrap">{(new Date(game.Start_Time)).toLocaleDateString()}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Mode}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Score}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Num_Correct}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Num_Questions}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Hint_One_Used}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Hint_Two_Used}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">{game.Hint_Three_Used}</td>
                                                                <td className="px-6 py-2 whitespace-nowrap">
                                                                    {(new Date(game.End_Time).getHours()) - (new Date(game.Start_Time).getHours()) !== 0 ? (new Date(game.End_Time).getHours()) - (new Date(game.Start_Time).getHours()) + " Hours " : ""}
                                                                    {(new Date(game.End_Time).getMinutes()) - (new Date(game.Start_Time).getMinutes()) !== 0 ? (new Date(game.End_Time).getMinutes()) - (new Date(game.Start_Time).getMinutes()) + " Minutes " : ""}
                                                                    {(new Date(game.End_Time).getSeconds()) - (new Date(game.Start_Time).getSeconds()) !== 0 ? (new Date(game.End_Time).getSeconds()) - (new Date(game.Start_Time).getSeconds()) + " Seconds" : ""}
                                                                </td>
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
        </div>
    );
};

export default AccountPage;