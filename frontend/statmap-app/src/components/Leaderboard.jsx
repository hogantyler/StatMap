import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "./SupabaseContext";


const Leaderboard = () => {

    const supabase = useContext(SupabaseContext);
    const [topFive, setTopFive] = useState([]);
    // const [quizzesPlayed, setQuizzesPlayed] = useState([]);
    const [avgScore, setAvgScore] = useState([]);

    async function getTopFiveQuizMode() {
        let { data, error } = await supabase
            .from('Game Logs')
            .select('*')
            .limit(5)
            .order('Score', {ascending: false})

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
        <div className="py-5">
            <h5 className="text-xl font-medium text-black">Leaderboard</h5>
            <br />
            {/* Quiz Mode High Score */}
            <div>
                Quiz Mode High Score
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Correct Questions</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Date Achieved</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {
                            topFive ? 
                                topFive.map((score) => {
                                    return (
                                        <tr key={score.Game_ID}>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{score.Display_Name}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{score.Score}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{score.Num_Correct}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{(new Date(score.End_Time)).toLocaleDateString()}</td>
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
                Quiz Mode Average Score
                <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Average Score</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Games Played</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {
                            avgScore ?
                                avgScore.map((record) => {
                                    return (
                                        <tr key={record.User_ID}>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{record.Display_Name}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{record.Average_Score}</td>
                                            <td className="px-6 py-4 text-center whitespace-nowrap">{record.Total_Games_Played}</td>
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