import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import SummaryPage from './pages/SummaryPage';
import UserInputPage from './pages/UserInputPage';
import NotFoundPage from './pages/NotFoundPage';
import TooltipProvider from './components/common/TooltipProvider';
import './App.css';
// SEO component is imported in each page where needed

// GlobalTooltipContainer moved to TooltipProvider component

function App() {
  return (
    <TooltipProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<SummaryPage />} />
            <Route path="/contribute" element={<UserInputPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </TooltipProvider>
  );
}

export default App;
