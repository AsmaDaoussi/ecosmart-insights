// Formater les nombres
export const formatNumber = (num, decimals = 2) => {
  return Number(num).toFixed(decimals);
};

// Formater la monnaie
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
};

// Formater la date
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

// Formater l'heure
export const formatTime = (dateString) => {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

// Calculer le pourcentage
export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(1);
};

// Obtenir la couleur selon le statut
export const getStatusColor = (status) => {
  const colors = {
    low: 'text-green-600 bg-green-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
    economical: 'text-green-600',
    normal: 'text-blue-600',
    elevated: 'text-orange-600',
    very_high: 'text-red-600',
  };
  return colors[status] || 'text-gray-600';
};

// Obtenir le nom du jour
export const getDayName = (dayIndex) => {
  const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  return days[dayIndex];
};

// Valider le fichier CSV
export const validateCSVFile = (file) => {
  const validTypes = ['text/csv', 'application/vnd.ms-excel'];
  const maxSize = 16 * 1024 * 1024; // 16MB

  if (!validTypes.includes(file.type) && !file.name.endsWith('.csv')) {
    return { valid: false, error: 'Le fichier doit être au format CSV' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Le fichier est trop volumineux (max 16MB)' };
  }

  return { valid: true };
};