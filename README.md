\..\..\FTITS>
```bash
python .\run.py   
```

\..\..\FTITS\frontend>
```bash
npm run dev
```

\..\..\FTITS\frontend>
```bash
 npx tailwindcss -i ./src/index.css -o ./src/output.css --watch
```

# FTITS - Multi-Criteria Decision Analysis (MCDA) Application

FTITS is a web-based application for **Multi-Criteria Decision Analysis (MCDA)**. It supports methods like **TOPSIS**, **WSM**, **PROMETHEE**, **VIKOR**, and **MACBETH**, combining a Flask backend with a Preact frontend for seamless decision-making and analysis.

---

## Features

- **Criteria Management**: Select and manage criteria for analysis.
- **Weight Assignment**: Assign and normalize weights for criteria.
- **Company Analysis**: Evaluate companies based on selected criteria and weights.
- **Result Visualization**: View results in tables and bar charts.
- **Analysis Comparison**: Compare the results of two analyses under the same criteria, weights, and companies.
- **Dynamic Sidebar Navigation**: Easy navigation with a responsive sidebar.
- **Modern Frontend**: Built with **Preact** and styled using **Tailwind CSS**.
- **Backend Integration**: Powered by **Flask** and MongoDB.

---

## Installation

### Prerequisites

- Python 3.8 or higher
- Node.js and npm
- MongoDB instance (local or cloud-based)


# Project Structure
## Backend
- Framework: Flask
Routes:
/companies: Manage company data.
/criteria: Manage and select criteria.
/weights: Manage criteria weights.
/methods: Execute MCDA methods.
/results: View analysis results.
/comparison: Compare two analyses.

# Frontend
## Framework: Preact
Components:
CompaniesComponent: View company data.
CombinedComponent: Handle criteria selection, weights, and analysis.
ComparisonComponent: Compare analyses.
ResultsComponent: Display analysis results.
SidebarNavigation: Navigational menu.
Styling: Tailwind CSS
