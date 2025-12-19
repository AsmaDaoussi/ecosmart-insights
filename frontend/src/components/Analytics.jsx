import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatNumber } from '../utils/helpers';

const Analytics = ({ hourlyPatterns }) => {
  if (!hourlyPatterns) return null;

  // Préparer les données pour le graphique
  const chartData = hourlyPatterns.hourly_data.map(item => ({
    heure: `${item.hour}h`,
    Moyenne: Number(item.avg.toFixed(2)),
    Maximum: Number(item.max.toFixed(2)),
  }));

  // Identifier les périodes
  

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4">Analyse des Patterns de Consommation</h3>

      {/* Graphique de consommation horaire */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-3">Consommation Moyenne par Heure</h4>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="heure" angle={-45} textAnchor="end" height={80} />
            <YAxis label={{ value: 'kWh', angle: -90, position: 'insideLeft' }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value) => [`${value} kWh`, '']}
            />
            <Legend />
            <Line type="monotone" dataKey="Moyenne" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Maximum" stroke="#EF4444" strokeWidth={2} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Heures de pointe */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <h4 className="font-semibold text-red-800 mb-3">🔴 Heures de Pointe</h4>
          <div className="flex flex-wrap gap-2">
            {hourlyPatterns.peak_hours.map((hour) => (
              <span
                key={hour}
                className="px-3 py-1 bg-red-200 text-red-800 rounded-full font-medium text-sm"
              >
                {hour}h - {hour + 1}h
              </span>
            ))}
          </div>
          <p className="text-sm text-red-700 mt-3">
            💡 Évitez d'utiliser les appareils énergivores pendant ces heures
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-3">🟢 Heures Creuses Recommandées</h4>
          <div className="flex flex-wrap gap-2">
            {hourlyPatterns.off_peak_hours.slice(0, 6).map((hour) => (
              <span
                key={hour}
                className="px-3 py-1 bg-green-200 text-green-800 rounded-full font-medium text-sm"
              >
                {hour}h - {hour + 1}h
              </span>
            ))}
          </div>
          <p className="text-sm text-green-700 mt-3">
            💡 Programmez vos appareils pendant ces heures pour économiser
          </p>
        </div>
      </div>

      {/* Répartition par période */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Répartition par Période de la Journée</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Nuit', 'Matin', 'Après-midi', 'Soirée'].map((period, index) => {
            const hours = [
              [0, 6],
              [6, 12],
              [12, 18],
              [18, 24],
            ][index];
            
            const periodData = hourlyPatterns.hourly_data.filter(
              (item) => item.hour >= hours[0] && item.hour < hours[1]
            );
            
            const avgConsumption =
              periodData.reduce((sum, item) => sum + item.avg, 0) / periodData.length;

            return (
              <div key={period} className="text-center">
                <p className="text-sm text-gray-600 mb-1">{period}</p>
                <p className="text-2xl font-bold text-gray-800">
                  {formatNumber(avgConsumption)}
                </p>
                <p className="text-xs text-gray-500">kWh moyenne</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;