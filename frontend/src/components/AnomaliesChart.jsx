import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { formatDate, formatTime, formatNumber } from '../utils/helpers';

const AnomaliesChart = ({ anomaliesData }) => {
  if (!anomaliesData || anomaliesData.count === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Anomalies Détectées</h3>
        <div className="text-center py-8">
          <p className="text-green-600 font-medium">✓ Aucune anomalie significative détectée</p>
          <p className="text-gray-500 text-sm mt-2">Votre consommation est régulière</p>
        </div>
      </div>
    );
  }

  const getSeverityColor = (deviation) => {
    const absDeviation = Math.abs(deviation);
    if (absDeviation > 200) return 'bg-red-100 border-red-300 text-red-800';
    if (absDeviation > 100) return 'bg-orange-100 border-orange-300 text-orange-800';
    return 'bg-yellow-100 border-yellow-300 text-yellow-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="h-6 w-6 text-orange-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Anomalies Détectées ({anomaliesData.count})
        </h3>
      </div>

      <p className="text-gray-600 mb-6">
        Pics de consommation inhabituels identifiés par l'algorithme Isolation Forest
      </p>

      <div className="space-y-4">
        {anomaliesData.anomalies.map((anomaly, index) => (
          <div
            key={index}
            className={`p-4 rounded-lg border-2 ${getSeverityColor(anomaly.deviation_percent)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <p className="font-semibold text-lg">
                  {formatDate(anomaly.timestamp)}
                </p>
                <p className="text-sm opacity-75">
                  {anomaly.day} à {formatTime(anomaly.timestamp)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatNumber(anomaly.consumption)} kWh
                </p>
                <p className="text-sm opacity-75">
                  Normal: {formatNumber(anomaly.expected)} kWh
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-current border-opacity-20">
              <span className="text-sm font-medium">Écart détecté:</span>
              <span className="text-lg font-bold">
                {anomaly.deviation_percent > 0 ? '+' : ''}
                {formatNumber(anomaly.deviation_percent)}%
              </span>
            </div>

            {/* Suggestion de cause */}
            <div className="mt-3 pt-3 border-t border-current border-opacity-20">
              <p className="text-sm">
                💡 <span className="font-medium">Cause probable:</span>{' '}
                {getProbableCause(anomaly)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {anomaliesData.count > 10 && (
        <p className="text-sm text-gray-500 mt-4 text-center">
          Affichage des 10 anomalies les plus importantes
        </p>
      )}
    </div>
  );
};

// Fonction helper pour suggérer la cause
const getProbableCause = (anomaly) => {
  const hour = anomaly.hour;
  
  if (hour >= 0 && hour < 6) {
    return "Appareil laissé allumé pendant la nuit";
  } else if (hour >= 6 && hour < 9) {
    return "Utilisation intensive le matin (chauffage, préparation)";
  } else if (hour >= 9 && hour < 18) {
    return "Chauffage électrique ou appareil énergivore en journée";
  } else {
    return "Utilisation simultanée de plusieurs appareils en soirée";
  }
};

export default AnomaliesChart;