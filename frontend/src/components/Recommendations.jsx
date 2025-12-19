import React, { useState } from 'react';
import { Lightbulb, ChevronDown, ChevronUp, Zap, Clock, Thermometer, Power, CheckCircle } from 'lucide-react';

const Recommendations = ({ recommendations }) => {
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [completedItems, setCompletedItems] = useState([]);

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Recommandations</h3>
        <p className="text-gray-600">Aucune recommandation disponible pour le moment.</p>
      </div>
    );
  }

  const toggleExpand = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const toggleComplete = (index) => {
    if (completedItems.includes(index)) {
      setCompletedItems(completedItems.filter(i => i !== index));
    } else {
      setCompletedItems([...completedItems, index]);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-green-100 text-green-800 border-green-300',
    };
    return colors[priority] || colors.low;
  };

  const getPriorityLabel = (priority) => {
    const labels = {
      high: '🔴 Priorité Haute',
      medium: '🟡 Priorité Moyenne',
      low: '🟢 Priorité Basse',
    };
    return labels[priority] || labels.low;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      heating: <Thermometer className="h-5 w-5" />,
      timing: <Clock className="h-5 w-5" />,
      standby: <Power className="h-5 w-5" />,
      lighting: <Zap className="h-5 w-5" />,
      automation: <Zap className="h-5 w-5" />,
    };
    return icons[category] || <Lightbulb className="h-5 w-5" />;
  };

  // Calculer les économies totales potentielles
  const totalSavings = recommendations.reduce((sum, rec) => {
    const amount = parseFloat(rec.potential_savings.replace(/[^\d.-]/g, ''));
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="h-6 w-6 text-yellow-600" />
        <h3 className="text-xl font-bold text-gray-800">
          Recommandations Personnalisées
        </h3>
      </div>

      <p className="text-gray-600 mb-6">
        Conseils d'optimisation basés sur votre profil de consommation
      </p>

      {/* Résumé des économies */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border-2 border-green-200 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600 mb-1">Économies Potentielles Totales</p>
            <p className="text-3xl font-bold text-green-700">
              ~{totalSavings.toFixed(0)}€/mois
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Soit par an</p>
            <p className="text-2xl font-bold text-blue-700">
              {(totalSavings * 12).toFixed(0)}€
            </p>
          </div>
        </div>
      </div>

      {/* Liste des recommandations */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedIndex === index;
          const isCompleted = completedItems.includes(index);

          return (
            <div
              key={index}
              className={`border-2 rounded-lg overflow-hidden transition-all ${
                isCompleted 
                  ? 'border-green-300 bg-green-50 opacity-75' 
                  : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              {/* Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleExpand(index)}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    {/* Checkbox */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleComplete(index);
                      }}
                      className={`mt-1 flex-shrink-0 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        isCompleted
                          ? 'bg-green-500 border-green-500'
                          : 'border-gray-300 hover:border-green-500'
                      }`}
                    >
                      {isCompleted && <CheckCircle className="h-4 w-4 text-white" />}
                    </button>

                    {/* Icône de catégorie */}
                    <div className="flex-shrink-0 mt-1">
                      {getCategoryIcon(rec.category)}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className={`font-semibold text-gray-800 ${isCompleted ? 'line-through' : ''}`}>
                          {rec.title}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(rec.priority)}`}>
                          {getPriorityLabel(rec.priority).split(' ')[0]}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">
                        {rec.description}
                      </p>
                    </div>

                    {/* Économies */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm text-gray-500">Économies</p>
                      <p className="text-lg font-bold text-green-600">
                        {rec.potential_savings}
                      </p>
                    </div>

                    {/* Icône expand/collapse */}
                    <div className="flex-shrink-0">
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Détails expandables */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  <div className="pt-4 space-y-3">
                    {/* Actions concrètes */}
                    <div>
                      <p className="font-semibold text-gray-700 mb-2">Actions à mettre en place:</p>
                      <ul className="space-y-1 text-sm text-gray-600">
                        {getActionItems(rec.category, rec.priority).map((action, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5">•</span>
                            <span>{action}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Délai de mise en œuvre */}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-gray-600">
                        Temps de mise en œuvre: <span className="font-medium">{getImplementationTime(rec.priority)}</span>
                      </span>
                    </div>

                    {/* ROI */}
                    {rec.priority === 'high' && (
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <span className="font-semibold">💰 Retour sur investissement:</span> Cette action
                          est prioritaire car elle offre le meilleur rapport économies/effort.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Progression */}
      {completedItems.length > 0 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-green-800">Progression</span>
            <span className="text-green-700 font-bold">
              {completedItems.length}/{recommendations.length}
            </span>
          </div>
          <div className="w-full bg-green-200 rounded-full h-3">
            <div
              className="bg-green-600 h-3 rounded-full transition-all duration-500"
              style={{ width: `${(completedItems.length / recommendations.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-sm text-green-700 mt-2">
            {completedItems.length === recommendations.length
              ? '🎉 Félicitations! Vous avez complété toutes les recommandations!'
              : `Plus que ${recommendations.length - completedItems.length} action(s) à réaliser!`}
          </p>
        </div>
      )}

      {/* Note */}
      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          <span className="font-semibold">💡 Conseil:</span> Commencez par les recommandations
          prioritaires (haute priorité) qui offrent le meilleur retour sur investissement.
          Les résultats s'accumulent dans le temps!
        </p>
      </div>
    </div>
  );
};

// Fonctions helpers
const getActionItems = (category) => {
  const actions = {
    heating: [
      'Baisser le thermostat de 1-2°C',
      'Programmer le chauffage selon vos horaires',
      'Vérifier l\'isolation des fenêtres et portes',
      'Éteindre le chauffage dans les pièces inoccupées'
    ],
    timing: [
      'Programmer le lave-linge pour les heures creuses (22h-6h)',
      'Lancer le lave-vaisselle avant de se coucher',
      'Charger les appareils électroniques la nuit',
      'Utiliser un programmateur pour les appareils énergivores'
    ],
    standby: [
      'Installer des multiprises avec interrupteur',
      'Débrancher les chargeurs non utilisés',
      'Éteindre complètement TV, box internet, console',
      'Activer le mode économie d\'énergie sur tous les appareils'
    ],
    lighting: [
      'Remplacer les ampoules par des LED',
      'Installer des détecteurs de présence',
      'Privilégier la lumière naturelle',
      'Éteindre les lumières en quittant les pièces'
    ],
    automation: [
      'Installer un thermostat connecté',
      'Programmer les volets roulants électriques',
      'Utiliser des prises connectées',
      'Configurer des scénarios d\'automatisation'
    ]
  };

  return actions[category] || ['Suivre les recommandations du fabricant'];
};

const getImplementationTime = (priority) => {
  const times = {
    high: 'Immédiat (aujourd\'hui)',
    medium: '1-2 semaines',
    low: '1 mois'
  };
  return times[priority] || 'Variable';
};

export default Recommendations;