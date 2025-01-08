import { useEffect, useState } from 'preact/hooks';
import Chart from 'chart.js/auto';
import { parseAnalysisString } from '../helpers/ParseAnalysisName';

const ComparisonComponent = () => {
    const [analyses, setAnalyses] = useState([]);
    const [selectedFirst, setSelectedFirst] = useState('');
    const [filteredSecondOptions, setFilteredSecondOptions] = useState([]);
    const [selectedSecond, setSelectedSecond] = useState('');
    const [firstAnalysis, setFirstAnalysis] = useState(null);
    const [secondAnalysis, setSecondAnalysis] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Fetch analyses from the backend
        fetch('/api/comparison/')
            .then((res) => res.json())
            .then((data) => setAnalyses(data.analysis_results))
            .catch(() => setError('Error fetching analyses.'));
    }, []);

    const handleFirstSelection = (index) => {
        setSelectedFirst(index);
        setFirstAnalysis(analyses[index]);

        // Filter second analysis options based on the first analysis
        const firstCriteria = analyses[index].criteria_chosen_to_analysis;
        const firstWeights = analyses[index].weights;
        const firstCompanies = analyses[index].companies_chosen;

        const filteredOptions = analyses.filter((analysis, idx) => {
            return (
                idx !== parseInt(index, 10) && // Exclude the selected first analysis
                JSON.stringify(analysis.criteria_chosen_to_analysis) === JSON.stringify(firstCriteria) &&
                JSON.stringify(analysis.weights) === JSON.stringify(firstWeights) &&
                JSON.stringify(analysis.companies_chosen) === JSON.stringify(firstCompanies)
            );
        });

        setFilteredSecondOptions(filteredOptions);
        setSelectedSecond('');
        setSecondAnalysis(null);
    };

    const handleSecondSelection = (index) => {
        setSelectedSecond(index);
        setSecondAnalysis(filteredSecondOptions[index]);
    };

    const handleAnalysisName = (input) => parseAnalysisString(input);


    useEffect(() => {
        if (firstAnalysis && secondAnalysis) {
            const ctx = document.getElementById('comparisonChart').getContext('2d');
            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: firstAnalysis.ranking.map((r) => r.company),
                    datasets: [
                        {
                            label: firstAnalysis.analysis_name,
                            data: firstAnalysis.ranking.map((r) => r.score),
                            backgroundColor: 'rgba(54, 162, 235, 0.5)',
                            borderColor: 'rgba(54, 162, 235, 1)',
                            borderWidth: 1,
                        },
                        {
                            label: secondAnalysis.analysis_name,
                            data: secondAnalysis.ranking.map((r) => r.score),
                            backgroundColor: 'rgba(28, 245, 201, 0.5)',
                            borderColor: 'rgb(7, 241, 46)',
                            borderWidth: 1,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                        },
                    },
                },
            });
        }
    }, [firstAnalysis, secondAnalysis]);

    return (
        <div className="max-w-6xl mx-auto p-6 bg-gray-50 shadow-md rounded-md">
            <h1 className="text-3xl font-bold mb-6">Primerjava Analiz</h1>

            {error && <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Analysis Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Izberite prvo analizo</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedFirst}
                        onChange={(e) => handleFirstSelection(e.target.value)}
                    >
                        <option value="" disabled>
                            Izberite analizo
                        </option>
                        {analyses.map((analysis, index) => (
                            <option key={index} value={index}>
                                {handleAnalysisName(analysis.analysis_name)}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Second Analysis Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Izberite drugo analizo</label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedSecond}
                        onChange={(e) => handleSecondSelection(e.target.value)}
                        disabled={!selectedFirst}
                    >
                        <option value="" disabled>
                            Izberite analizo
                        </option>
                        {filteredSecondOptions.map((analysis, index) => (
                            <option key={index} value={index}>
                                {handleAnalysisName(analysis.analysis_name)}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {firstAnalysis && secondAnalysis && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4">Rezultati Primerjave</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">{handleAnalysisName(firstAnalysis.analysis_name)}</h3>
                            <table className="min-w-full bg-white border border-gray-200 rounded">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="py-2 px-4 text-left">Rang</th>
                                        <th className="py-2 px-4 text-left">Podjetje</th>
                                        <th className="py-2 px-4 text-left">Rezultat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {firstAnalysis.ranking.map((rank, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="py-2 px-4">{idx + 1}</td>
                                            <td className="py-2 px-4">{rank.company}</td>
                                            <td className="py-2 px-4">{rank.score.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-800 mb-2">{handleAnalysisName(secondAnalysis.analysis_name)}</h3>
                            <table className="min-w-full bg-white border border-gray-200 rounded">
                                <thead>
                                    <tr className="bg-gray-100 border-b">
                                        <th className="py-2 px-4 text-left">Rang</th>
                                        <th className="py-2 px-4 text-left">Podjetje</th>
                                        <th className="py-2 px-4 text-left">Rezultat</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {secondAnalysis.ranking.map((rank, idx) => (
                                        <tr key={idx} className="border-b">
                                            <td className="py-2 px-4">{idx + 1}</td>
                                            <td className="py-2 px-4">{rank.company}</td>
                                            <td className="py-2 px-4">{rank.score.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="text-lg font-medium text-gray-800 mb-2">Graf Primerjave</h3>
                        <canvas id="comparisonChart" className="w-full h-64"></canvas>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ComparisonComponent;
