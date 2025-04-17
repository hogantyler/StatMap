import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "./SupabaseContext";
import { FaTimes } from "react-icons/fa";


const Leaderboard = ({ onModalClose }) => {

    const supabase = useContext(SupabaseContext);
    const [topFive, setTopFive] = useState([]);
    // const [quizzesPlayed, setQuizzesPlayed] = useState([]);
    const [avgScore, setAvgScore] = useState([]);

    async function getTopFiveQuizMode() {
        let { data, error } = await supabase
            .from('Game Logs')
            .select('*')
            .limit(5)
            .order('Score', { ascending: false })

        setTopFive(data);
    }

    async function getTopFiveAvgScore() {
        let { data, error } = await supabase.rpc("avg_score");

        setAvgScore(data);
    }

    useEffect(() => {
        getTopFiveQuizMode();
        getTopFiveAvgScore();
    }, [])

    return (
        <div className="py-5 text-white bg-black w-full">
            <h5 className="text-3xl font-bold text-center">Leaderboard</h5>
            <br />
            {/* Quiz Mode High Score */}
            <div>
                <p className="text-xl font-semibold">Quiz Mode High Score</p>
                <table className="divide-y rounded-lg w-full">
                    <thead className="">
                        <tr>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Questions</th>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date Achieved</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {
                            topFive ?
                                topFive.map((score) => {
                                    return (
                                        <tr key={score.Game_ID}>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{score.Display_Name}</td>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{score.Score}</td>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{score.Num_Correct}</td>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{(new Date(score.End_Time)).toLocaleDateString()}</td>
                                        </tr>
                                    )
                                })
                                :
                                <></>
                        }
                    </tbody>
                </table>
            </div>

            {/* Average Score */}
            <div className="py-5">
                <p className="text-xl font-semibold">Quiz Mode Average Score</p>
                <table className="min-w-full divide-y rounded-lg">
                    <thead className="">
                        <tr>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                            <th className="px-1 md:px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Games Played</th>
                        </tr>
                    </thead>
                    <tbody className="">
                        {
                            avgScore ?
                                avgScore.map((record) => {
                                    return (
                                        <tr key={record.User_ID}>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{record.Display_Name}</td>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{record.Average_Score}</td>
                                            <td className="px-1 md:px-6 py-2 text-center whitespace-nowrap">{record.Total_Games_Played}</td>
                                        </tr>
                                    )
                                })
                                :
                                <></>
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboard;