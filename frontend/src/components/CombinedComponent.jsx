import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';

const CombinedAnalysisForm = () => {
    const [criteria, setCriteria] = useState([]);
    const [weights, setWeights] = useState({});
    const [selectedCriteria, setSelectedCriteria] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState('TOPSIS');
    const [analysisName, setAnalysisName] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState(null);

    // Fetch data on component mount
    useEffect(() => {
        fetch('/api/criteria')
            .then((res) => res.json())
            .then((data) => {
                setCriteria(data);
                const preselected = data
                    .filter((crit) => crit.include_to_analysis)
                    .map((crit) => crit._id);
                setSelectedCriteria(preselected);
            })
            .catch(() => setError('Error fetching criteria'));

        fetch('/api/weights')
            .then((res) => res.json())
            .then((data) => {
                const initialWeights = data.criteria.reduce((acc, crit) => {
                    acc[crit._id] = crit.weight_value || 0.0;
                    return acc;
                }, {});
                setWeights(initialWeights);
            })
            .catch(() => setError('Error fetching weights'));

        fetch('/api/companies')
            .then((res) => res.json())
            .then((data) => {
                setCompanies(data);
                const preselectedCompanies = data
                    .filter((comp) => comp.include_to_analysis)
                    .map((comp) => comp._id);
                setSelectedCompanies(preselectedCompanies);
            })
            .catch(() => setError('Error fetching companies'));
    }, []);

    const handleCheckboxChange = (id) => {
        setSelectedCriteria((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const handleWeightChange = (id, value) => {
        setWeights((prev) => ({
            ...prev,
            [id]: parseFloat(value),
        }));
    };

    const handleCompanySelection = (id) => {
        setSelectedCompanies((prev) =>
            prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
        );
    };

    const handleSubmit = async () => {
        const payload = {
            selected_companies: selectedCompanies,
            method: selectedMethod,
            analysis_name: analysisName,
        };


        fetch('/api/weights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                weights: Object.entries(weights).map(([id, weight_value]) => ({
                    id_kriterija: id,
                    weight_value,
                }))
            }),

        }).then((response) => response.json())
            .then((data) => {
                setMessage(data.message); // Nastavi povratno sporočilo
            })
            .catch((error) => console.error('Error submitting criteria:', error));

        fetch('/api/criteria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ selected_criteria: selectedCriteria }),
        })
            .then((response) => response.json())
            .then((data) => {
                setMessage(data.message); // Nastavi povratno sporočilo
            })
            .catch((error) => console.error('Error submitting criteria:', error));

        try {
            const response = await fetch('/api/methods/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Error submitting analysis');
            }

            const data = await response.json();
            setMessage(data.message || 'Analysis successfully performed!');
            setError(null);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="max-w-8xl mx-auto p-6 bg-gray-50 shadow-md rounded-md">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Večkriterijska Analiza</h1>
            <hr/>

            {message && (
                <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{message}</div>
            )}
            {error && (
                <div className="bg-red-100 text-red-800 p-3 rounded mb-4">{error}</div>
            )}

            {/* Analysis Name and Method */}
            <div className=" mt-6 mb-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ime Analize
                    </label>
                    <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded"
                        value={analysisName}
                        onChange={(e) => setAnalysisName(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Izberite Metodo
                    </label>
                    <select
                        className="w-full p-2 border border-gray-300 rounded"
                        value={selectedMethod}
                        onChange={(e) => setSelectedMethod(e.target.value)}
                    >
                        <option value="TOPSIS">TOPSIS</option>
                        <option value="WSM">WSM</option>
                        <option value="PROMETHEE">PROMETHEE</option>
                        <option value="MACBETH">MACBETH</option>
                    </select>
                </div>
            </div>
            <hr/>


            {/* Criteria and Weights */}
            <div className="mt-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-3">Kriteriji in Uteži</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {criteria.map((crit) => (
                        <div>
                            <label
                                key={crit._id}
                                className="flex items-center bg-white p-4 shadow-sm rounded-md hover:shadow-md transition"
                            >
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 text-blue-600 rounded focus:ring focus:ring-blue-200"
                                    checked={selectedCriteria.includes(crit._id)}
                                    onChange={() => handleCheckboxChange(crit._id)}
                                />
                                <span className="ml-3 text-gray-700">{crit.name}</span>

                            </label>

                            {selectedCriteria.includes(crit._id) &&
                                <input
                                    type="number"
                                    id={`weight_${crit._id}`}
                                    className="mt-2 w-full p-2 border border-gray-300 rounded"
                                    placeholder="Vnesite utež"
                                    value={weights[crit._id] || 0.0}
                                    onChange={(e) => handleWeightChange(crit._id, e.target.value)}
                                    min="0"
                                    step="0.1"
                                />
                            }

                        </div>))}
                </div>
            </div>
            <hr/>

            {/* Companies Selection */}
            <div className="mt-6 mb-6">
                <h2 className="text-lg font-medium text-gray-800 mb-3">Izbor Podjetij</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {companies.map((company) => (
                        <label
                            key={company._id}
                            className="flex items-center bg-white p-3 shadow-sm rounded-md hover:shadow-md transition"
                        >
                            <input
                                type="checkbox"
                                className="h-5 w-5 text-blue-600 rounded focus:ring focus:ring-blue-200"
                                checked={selectedCompanies.includes(company._id)}
                                onChange={() => handleCompanySelection(company._id)}
                            />
                            <span className="ml-3 text-gray-700">{company['Ime podjetja']}</span>
                        </label>
                    ))}
                </div>
            </div>
            <hr/>


            {/* Submit Button */}
            <div className="mt-6">
                <button
                    onClick={handleSubmit}
                    className="w-full md:w-auto bg-blue-500 text-white px-6 py-2 rounded shadow hover:bg-blue-600 transition"
                >
                    Shrani in Izvedi Analizo
                </button>
            </div>
        </div>
    );
};

export default CombinedAnalysisForm;
