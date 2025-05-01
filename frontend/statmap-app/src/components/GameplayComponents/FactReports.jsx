import { useContext, useEffect, useState } from "react"
import { SupabaseContext } from "../SupabaseContext"

export default function FactReports(props) {
    const [allReports, setAllReports] = useState([]);

    const supabase = useContext(SupabaseContext);

    const getFactReports = async () => {
        let { data, error } = await supabase
            .from('Fact Reports')
            .select('*, Facts(Fact)')

        if (error) {
            alert(error);
        } else {
            console.log(data);
            setAllReports(data);
        }
    }

    useEffect(() => {
        getFactReports();
    }, [])

    return (
        <div>
            <h1>Fact Reports</h1>
            <div>
                {
                    allReports ?
                        allReports.map(report => {
                            return <div key={report.Report_ID}>
                                <p>{report.Report_Type} = {report.Facts.Fact}</p>
                            </div>
                        })
                        :
                        <></>
                }
            </div>
        </div>
    )
}