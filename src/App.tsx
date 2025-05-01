import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BudgetProvider } from './context/BudgetContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomePage from './pages/IncomePage';
import SummaryPage from './pages/SummaryPage';
import GoalsPage from './pages/GoalsPage';

function App() {
  return (
    <BudgetProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/income" element={<IncomePage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/goals" element={<GoalsPage />} />
          </Routes>
        </Layout>
      </Router>
    </BudgetProvider>
  );
}

export default App;