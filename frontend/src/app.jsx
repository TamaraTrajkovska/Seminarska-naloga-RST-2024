import { h } from 'preact';
import { Router, Route } from "preact-router";
import Companies from './components/CompaniesComponent';
import ResultsComponent from './components/ResultsComponent';
import CombinedAnalysisForm from './components/CombinedComponent';
import SidebarNavigation from './components/SidebarNavigation';
import ComparisonComponent from './components/ComparisonComponent';

export function App() {
  return (<>
    <SidebarNavigation>
      <Router>
        <Route path="/analiza" component={CombinedAnalysisForm} />
        <Route path="/companieslist" component={Companies} />
        <Route path="/resanalysis" component={ResultsComponent} />
        <Route path="/analysiscomparison" component={ComparisonComponent} />
      </Router>
    </SidebarNavigation>
  </>
  );
}

export default App