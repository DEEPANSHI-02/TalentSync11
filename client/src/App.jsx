import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import BrowsePage from './pages/BrowsePage';
import StatsPage from './pages/StatsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/browse" element={<BrowsePage />} />
            <Route path="/stats" element={<StatsPage />} />
          </Routes>
        </main>
        
        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <p className="text-gray-600 mb-2">
                Built with ❤️ for BreadButter Assignment
              </p>
              <p className="text-sm text-gray-500">
                Created by Deepanshi Kadian • Task 1: Talent Matchmaker Lite
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;