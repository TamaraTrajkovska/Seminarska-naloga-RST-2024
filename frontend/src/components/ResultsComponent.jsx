import { useEffect, useState, useRef } from 'preact/hooks';
import Chart from 'chart.js/auto';
import { parseAnalysisString } from '../helpers/ParseAnalysisName'

const ResultsComponent = () => {
  const [results, setResults] = useState([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const chartRef = useRef(null); // Reference for the chart

  useEffect(() => {
    // Fetch all analysis results from the API
    fetch('/api/results')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Napaka pri pridobivanju rezultatov');
        }
        return response.json();
      })
      .then((data) => {
        setResults(data.analysis_results);
        setSelectedAnalysis(data.analysis_results[0]); // Privzeto izberi prvo analizo
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Update the chart when selectedAnalysis changes
    if (selectedAnalysis && chartRef.current) {
      const ctx = chartRef.current.getContext('2d');

      // Destroy existing chart to avoid overlaps
      if (chartRef.current.chartInstance) {
        chartRef.current.chartInstance.destroy();
      }

      chartRef.current.chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: selectedAnalysis.ranking.map((rank) => rank.company),
          datasets: [
            {
              label: 'MCDA Score',
              data: selectedAnalysis.ranking.map((rank) => rank.score),
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          scales: {
            y: {
              beginAtZero: true,
              max: Math.max(...selectedAnalysis.ranking.map((rank) => rank.score)) + 0.1,
            },
          },
        },
      });
    }
  }, [selectedAnalysis]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl text-gray-700">
        Nalagam podatke...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-red-500 text-xl">
        Napaka: {error}
      </div>
    );
  }

  const handleDropdownChange = (e) => {
    const selectedId = e.target.value;
    const selected = results.find((result) => result._id === selectedId);
    setSelectedAnalysis(selected);
  };

  const handleAnalysisName = (input) => parseAnalysisString(input);

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 shadow-md rounded-md">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Rezultati Analiz</h1>

      {/* Dropdown za izbiro analize */}
      <div className="mb-6">
        <label
          htmlFor="analysisSelect"
          className="block text-lg font-medium text-gray-700 mb-2"
        >
          Izberite Analizo
        </label>
        <select
          id="analysisSelect"
          className="w-full p-2 border border-gray-300 rounded focus:ring focus:ring-blue-200 focus:outline-none"
          onChange={handleDropdownChange}
          value={selectedAnalysis?._id || ''}
        >
          {results.map((result) => (
            <option key={result._id} value={result._id}>
              {handleAnalysisName(result.analysis_name)}
            </option>
          ))}
        </select>
      </div>

      {/* Prikaz izbranega rezultata */}
      {selectedAnalysis && (
        <div className="mb-6 bg-white shadow rounded-md p-6">
          <div className="border-b pb-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {handleAnalysisName(selectedAnalysis.analysis_name)}
            </h2>
          </div>

          {/* Ranking Table */}
          <h3 className="text-lg font-medium text-gray-700 mb-3">Razvrstitev:</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 shadow rounded-md">
              <thead>
                <tr className="bg-gray-200 text-gray-700">
                  <th className="py-3 px-6 text-left">Rang</th>
                  <th className="py-3 px-6 text-left">Podjetje</th>
                  <th className="py-3 px-6 text-left">Rezultat</th>
                </tr>
              </thead>
              <tbody>
                {selectedAnalysis.ranking.map((rank, idx) => (
                  <tr
                    key={idx}
                    className={`${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                      } border-t hover:bg-gray-100`}
                  >
                    <td className="py-3 px-6">{idx + 1}</td>
                    <td className="py-3 px-6">{rank.company}</td>
                    <td className="py-3 px-6">{rank.score.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Normalized Weights */}
          <h3 className="text-lg font-medium text-gray-700 mt-6 mb-3">
            Uteži (Normalizirane):
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedAnalysis.weights.map((weight, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full shadow-sm"
              >
                {weight.toFixed(2)}
              </span>
            ))}
          </div>

          {/* Chart */}
          <div className="relative h-96">
            <canvas ref={chartRef} className="h-full w-full"></canvas>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultsComponent;
