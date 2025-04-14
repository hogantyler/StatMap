import { useContext, useEffect, useState } from "react";
import { SupabaseContext } from "./SupabaseContext";


const Leaderboard = () => {

    const supabase = useContext(SupabaseContext);
    const [topFive, setTopFive] = useState([]);

    async function getTopFive() {
        let { data, error } = await supabase
            .from('Game Logs')
            .select('*')
            .limit(5)
            .order('Score', {ascending: false})

        setTopFive(data);
    }

    useEffect(() => {
        getTopFive();
    }, [])

    return (
        <div>
            <h5 className="text-xl font-medium text-black">Leaderboard</h5>
            <br />
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Username</th>
                            <th>Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            topFive.map((score) => {
                                return (
                                    <tr key={score.Game_ID}>
                                        <td>{score.Display_Name}</td>
                                        <td>{score.Score}</td>
                                    </tr>
                                )
                            })
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

export default Leaderboard;