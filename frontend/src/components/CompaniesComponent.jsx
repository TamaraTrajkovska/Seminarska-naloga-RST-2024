import { useState, useEffect } from 'preact/hooks';

const Companies = () => {
    const [companies, setCompanies] = useState([]);

    // Fetch companies
    useEffect(() => {
        fetch('/api/companies')
            .then((res) => res.json())
            .then((data) => setCompanies(data))
            .catch((error) => console.error('Napaka pri pridobivanju podjetij:', error));
    }, []);

    return (
        <div className="max-w-7xl mx-auto p-6 bg-gray-50 shadow-md rounded-md">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Seznam Podjetij</h1>
            {companies.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200 shadow-sm rounded-md">
                        <thead>
                            <tr className="bg-gray-200 text-gray-700 text-left">
                                <th className="py-3 px-6">Ime Podjetja</th>
                                <th className="py-3 px-6">Prihodki ($)</th>
                                <th className="py-3 px-6">Dobiček ($)</th>
                                <th className="py-3 px-6">Finančna sredstva ($)</th>
                                <th className="py-3 px-6">Število Zaposlenih</th>
                                <th className="py-3 px-6">Sprememba prihodkov(%)</th>
                                <th className="py-3 px-6">Sprememba dobička(%)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {companies.map((company, index) => (
                                <tr
                                    key={company._id}
                                    className={`border-t hover:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                                        }`}
                                >
                                    <td className="py-3 px-6">{company['Ime podjetja']}</td>
                                    <td className="py-3 px-6">{company['Prihodki']}</td>
                                    <td className="py-3 px-6">{company['Dobiček']}</td>
                                    <td className="py-3 px-6">{company['Finančna sredstva']}</td>
                                    <td className="py-3 px-6">{company['Število zaposlenih']}</td>
                                    <td className="py-3 px-6">{company['Sprememba prihodkov']}</td>
                                    <td className="py-3 px-6">{company['Sprememba dobička']}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-gray-600">Nalaganje podatkov...</p>
            )}
        </div>
    );
};

export default Companies;
