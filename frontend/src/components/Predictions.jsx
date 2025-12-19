import React from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/helpers';

const Predictions = ({ predictionsData }) => {
  if (!predictionsData) return null;

  const dailyData = predictionsData.daily.map(day => ({
    jour: `Jour ${day.day}`,
    date: new Date(day.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
    Consommation: Number(day.total_kwh.toFixed(2)),
    Coût: Number(day.estimated_cost.toFixed(2)),
  }));

  // Calculer la moyenne journalière
  const avgDaily = predictionsData.total_predicted / predictionsData.daily.length;

  // Identifier les jours avec consommation élevée
  const highConsumptionDays = predictionsData.daily.filter(
    day => day.total_kwh > avgDaily * 1.15
  );

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="h-6 w-6 text-blue-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Prédictions de Consommation (7 prochains jours)
        </h3>
      </div>

      <p className="text-gray-600 mb-6">
        Prédictions générées par l'algorithme Random Forest basé sur vos patterns historiques
      </p>

      {/* Résumé global */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            <p className="text-sm text-gray-600">Consommation Totale</p>
          </div>
          <p className="text-3xl font-bold text-blue-700">
            {formatNumber(predictionsData.total_predicted)} kWh
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Moyenne: {formatNumber(avgDaily)} kWh/jour
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            <p className="text-sm text-gray-600">Coût Estimé</p>
          </div>
          <p className="text-3xl font-bold text-green-700">
            {formatCurrency(predictionsData.total_cost)}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Tarif: 0.25€/kWh
          </p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            <p className="text-sm text-gray-600">Jours Élevés</p>
          </div>
          <p className="text-3xl font-bold text-orange-700">
            {highConsumptionDays.length}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Consommation &gt; moyenne
          </p>
        </div>
      </div>

      {/* Graphique de prédiction par jour */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Consommation Prévue par Jour</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45} 
              textAnchor="end" 
              height={80}
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              label={{ value: 'kWh', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value, name) => {
                if (name === 'Consommation') return [`${value} kWh`, 'Consommation'];
                if (name === 'Coût') return [`${formatCurrency(value)}`, 'Coût estimé'];
                return [value, name];
              }}
            />
            <Legend />
            <Bar dataKey="Consommation" fill="#3B82F6" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Ligne de tendance de coût */}
      <div className="mb-6">
        <h4 className="font-semibold text-gray-700 mb-3">Évolution du Coût Journalier</h4>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" style={{ fontSize: '12px' }} />
            <YAxis 
              label={{ value: '€', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value) => [formatCurrency(value), 'Coût']}
            />
            <Line 
              type="monotone" 
              dataKey="Coût" 
              stroke="#10B981" 
              strokeWidth={3}
              dot={{ r: 4, fill: '#10B981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Détail jour par jour */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-semibold text-gray-800 mb-3">Détail par Jour</h4>
        <div className="space-y-2">
          {predictionsData.daily.map((day, index) => {
            const isHigh = day.total_kwh > avgDaily * 1.15;
            const isWeekend = new Date(day.date).getDay() === 0 || new Date(day.date).getDay() === 6;

            return (
              <div
                key={index}
                className={`flex justify-between items-center p-3 rounded-lg ${
                  isHigh ? 'bg-orange-100 border border-orange-300' : 'bg-white border border-gray-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-center">
                    <p className="text-xs text-gray-500">Jour {day.day}</p>
                    <p className="font-medium text-gray-800">
                      {new Date(day.date).toLocaleDateString('fr-FR', { 
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </p>
                  </div>
                  {isWeekend && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                      Week-end
                    </span>
                  )}
                  {isHigh && (
                    <span className="px-2 py-1 bg-orange-200 text-orange-800 text-xs rounded-full font-medium">
                      Élevé
                    </span>
                  )}
                </div>

                <div className="text-right">
                  <p className="text-lg font-bold text-gray-800">
                    {formatNumber(day.total_kwh)} kWh
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(day.estimated_cost)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerte si consommation élevée */}
      {highConsumptionDays.length > 0 && (
        <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 mb-1">Attention</p>
              <p className="text-orange-700 text-sm">
                {highConsumptionDays.length} jour(s) présentent une consommation supérieure à la moyenne.
                Pensez à optimiser votre utilisation pendant ces périodes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Note méthodologique */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">ℹ️ Méthodologie:</span> Ces prédictions sont basées sur un modèle
          Random Forest entraîné sur vos données historiques. La précision augmente avec la quantité de données
          disponibles. Les facteurs pris en compte incluent: l'heure, le jour de la semaine, les patterns passés
          et la saisonnalité.
        </p>
      </div>
    </div>
  );
};

export default Predictions;