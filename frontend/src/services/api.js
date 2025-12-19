import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

// Instance axios configurée
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Service API
export const apiService = {
  // Vérifier l'état de l'API
  healthCheck: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  },

  // Upload de fichier
  uploadFile: async (file) => {
    try {
      console.log('📤 Upload fichier:', file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      console.log('✅ Upload réussi:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  },

  // Analyser les données
  analyzeData: async (filepath) => {
    try {
      console.log('📊 Analyse avec filepath:', filepath);
      
      const payload = { filepath: filepath };
      console.log('📤 Envoi de:', payload);
      
      const response = await api.post('/analyze', payload);
      console.log('✅ Analyse reçue:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Analysis failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Prédictions
  predictConsumption: async (filepath, days = 7) => {
    try {
      console.log('🔮 Prédiction avec filepath:', filepath, 'days:', days);
      
      const payload = { filepath: filepath, days: days };
      console.log('📤 Envoi de:', payload);
      
      const response = await api.post('/predict', payload);
      console.log('✅ Prédictions reçues:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Prediction failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Recommandations
  getRecommendations: async (cluster, stats) => {
    try {
      console.log('💡 Recommandations pour cluster:', cluster);
      
      const payload = { cluster: cluster, stats: stats };
      console.log('📤 Envoi de:', payload);
      
      const response = await api.post('/recommendations', payload);
      console.log('✅ Recommandations reçues:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Recommendations failed:', error.response?.data || error.message);
      throw error;
    }
  },

  // Générer des données d'exemple
  generateSampleData: async (days = 30) => {
    try {
      console.log('🔧 Génération de données exemple:', days, 'jours');
      
      const response = await api.get(`/generate-sample?days=${days}`);
      console.log('✅ Données générées:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Sample generation failed:', error.response?.data || error.message);
      throw error;
    }
  },
};

export default apiService;