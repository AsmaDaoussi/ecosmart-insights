import React, { useState, useEffect } from 'react';
import { Activity, Zap, TrendingUp, DollarSign } from 'lucide-react';
import { formatNumber, formatCurrency } from '../utils/helpers';
import LoadingSpinner from './LoadingSpinner';
import ClusterProfile from './ClusterProfile';
import AnomaliesChart from './AnomaliesChart';
import Analytics from './Analytics';
import Predictions from './Predictions';
import Recommendations from './Recommendations';
import { apiService } from '../services/api';

const Dashboard = ({ uploadResult }) => {
  const [loading, setLoading] = useState(true);
  const [analysisData, setAnalysisData] = useState(null);
  const [predictionsData, setPredictionsData] = useState(null);
  const [recommendationsData, setRecommendationsData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (uploadResult?.filepath) {
      loadAllData();
    }
  }, [uploadResult]);

  const loadAllData = async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Analyse des données
      const analysisResponse = await apiService.analyzeData(uploadResult.filepath);
      setAnalysisData(analysisResponse);

      // 2. Prédictions
      const predictionsResponse = await apiService.predictConsumption(uploadResult.filepath, 7);
      setPredictionsData(predictionsResponse);

      // 3. Recommandations
      const recsResponse = await apiService.getRecommendations(
        analysisResponse.cluster.cluster,
        uploadResult.stats
      );
      setRecommendationsData(recsResponse);

    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Analyse de vos données en cours..." />;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-800 font-medium">Erreur: {error}</p>
          <button
            onClick={loadAllData}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header avec statistiques globales */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-6">Tableau de Bord Énergétique</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Activity className="h-6 w-6" />}
              label="Consommation Moyenne"
              value={`${formatNumber(uploadResult.stats.avg_consumption)} kWh`}
              sublabel="par heure"
            />
            <StatCard
              icon={<Zap className="h-6 w-6" />}
              label="Pic Maximum"
              value={`${formatNumber(uploadResult.stats.max_consumption)} kWh`}
              sublabel={`${((uploadResult.stats.max_consumption / uploadResult.stats.avg_consumption) * 100 - 100).toFixed(0)}% au-dessus de la moyenne`}
            />
            <StatCard
              icon={<TrendingUp className="h-6 w-6" />}
              label="Consommation Totale"
              value={`${formatNumber(uploadResult.stats.total_consumption)} kWh`}
              sublabel={`${uploadResult.stats.rows} heures analysées`}
            />
            <StatCard
              icon={<DollarSign className="h-6 w-6" />}
              label="Coût Estimé"
              value={formatCurrency(uploadResult.stats.total_consumption * 0.25)}
              sublabel="période analysée"
            />
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Profil de consommation */}
        <ClusterProfile clusterData={analysisData.cluster} />

        {/* Analytics et Anomalies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Analytics hourlyPatterns={analysisData.hourly_patterns} />
          <AnomaliesChart anomaliesData={analysisData.anomalies} />
        </div>

        {/* Prédictions */}
        {predictionsData && (
          <Predictions predictionsData={predictionsData.predictions} />
        )}

        {/* Recommandations */}
        {recommendationsData && (
          <Recommendations recommendations={recommendationsData.recommendations} />
        )}
      </div>
    </div>
  );
};

// Composant StatCard
const StatCard = ({ icon, label, value, sublabel }) => {
  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-lg p-4 border border-white border-opacity-20">
      <div className="flex items-center gap-3 mb-2">
        {icon}
        <p className="text-sm opacity-90">{label}</p>
      </div>
      <p className="text-2xl font-bold mb-1">{value}</p>
      <p className="text-xs opacity-75">{sublabel}</p>
    </div>
  );
};

export default Dashboard;