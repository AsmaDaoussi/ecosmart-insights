import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { formatNumber } from '../utils/helpers';

const ClusterProfile = ({ clusterData }) => {
  if (!clusterData) return null;

  const getProfileColor = (name) => {
    const colors = {
      'Économe': 'bg-green-100 text-green-800 border-green-300',
      'Moyen': 'bg-blue-100 text-blue-800 border-blue-300',
      'Élevé': 'bg-orange-100 text-orange-800 border-orange-300',
      'Irrégulier': 'bg-purple-100 text-purple-800 border-purple-300',
    };
    return colors[name] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getDifferenceIcon = () => {
    const diff = clusterData.difference_percent;
    if (diff > 10) return <TrendingUp className="h-5 w-5 text-red-600" />;
    if (diff < -10) return <TrendingDown className="h-5 w-5 text-green-600" />;
    return <Minus className="h-5 w-5 text-gray-600" />;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Votre Profil de Consommation</h3>

      {/* Badge du profil */}
      <div className={`inline-flex items-center px-4 py-2 rounded-full border-2 ${getProfileColor(clusterData.profile_name)} font-semibold text-lg mb-4`}>
        {clusterData.profile_name}
      </div>

      <p className="text-gray-600 mb-6">{clusterData.description}</p>

      {/* Comparaison */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-1">Votre moyenne</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatNumber(clusterData.your_avg)} kWh
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Moyenne du profil</p>
          <p className="text-2xl font-bold text-gray-700">
            {formatNumber(clusterData.reference_avg)} kWh
          </p>
        </div>

        <div className={`p-4 rounded-lg border ${
          clusterData.difference_percent > 0 
            ? 'bg-red-50 border-red-200' 
            : 'bg-green-50 border-green-200'
        }`}>
          <p className="text-sm text-gray-600 mb-1">Différence</p>
          <div className="flex items-center gap-2">
            {getDifferenceIcon()}
            <p className={`text-2xl font-bold ${
              clusterData.difference_percent > 0 ? 'text-red-700' : 'text-green-700'
            }`}>
              {clusterData.difference_percent > 0 ? '+' : ''}
              {formatNumber(clusterData.difference_percent)}%
            </p>
          </div>
        </div>
      </div>

      {/* Caractéristiques détaillées */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Caractéristiques détectées</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Consommation moyenne horaire:</span>
            <span className="font-medium">{formatNumber(clusterData.features.avg_consumption)} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Variabilité:</span>
            <span className="font-medium">{formatNumber(clusterData.features.std_consumption)} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Heures de pointe:</span>
            <span className="font-medium">{formatNumber(clusterData.features.peak_hours)} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Consommation nocturne:</span>
            <span className="font-medium">{formatNumber(clusterData.features.night_consumption)} kWh</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ratio week-end/semaine:</span>
            <span className="font-medium">{formatNumber(clusterData.features.weekend_ratio, 1)}x</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClusterProfile;