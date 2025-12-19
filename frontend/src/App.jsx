import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import Dashboard from './components/Dashboard';

function App() {
  const [uploadResult, setUploadResult] = useState(null);
  const [showDashboard, setShowDashboard] = useState(false);

  const handleUploadSuccess = (result) => {
    setUploadResult(result);
    setShowDashboard(true);
  };

  const handleReset = () => {
    setUploadResult(null);
    setShowDashboard(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">⚡</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">EcoSmart Insights</h1>
                <p className="text-sm text-gray-600">Analyse intelligente de votre consommation énergétique</p>
              </div>
            </div>
            
            {showDashboard && (
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Nouvelle Analyse
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="py-8">
        {!showDashboard ? (
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        ) : (
          <Dashboard uploadResult={uploadResult} />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="text-center text-gray-600 text-sm">
            <p className="mb-2">
              <span className="font-semibold">EcoSmart Insights</span> - Mini-Projet Data Mining 3DNI
            </p>
            <p className="text-xs text-gray-500">
              Algorithmes utilisés: K-Means Clustering, Random Forest, Isolation Forest
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;