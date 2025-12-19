from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
import numpy as np
from datetime import datetime
import os
import json

from models.data_mining import DataMiningEngine
from models.preprocessing import preprocess_data
from utils.helpers import allowed_file, save_uploaded_file

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'csv'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max

# Créer le dossier uploads s'il n'existe pas
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Instance du moteur de Data Mining
dm_engine = DataMiningEngine()

@app.route('/')
def home():
    return jsonify({
        'message': 'EcoSmart Insights API',
        'version': '1.0.0',
        'status': 'running'
    })
@app.route('/uploads/<path:filename>')
def download_uploaded_file(filename):
    try:
        return send_file(
            os.path.join(app.config['UPLOAD_FOLDER'], filename),
            as_attachment=True
        )
    except FileNotFoundError:
        return jsonify({'error': 'Fichier non trouvé'}), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Vérifier l'état de l'API"""
    return jsonify({'status': 'healthy', 'timestamp': datetime.now().isoformat()})

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """Upload et validation du fichier CSV"""
    try:
        # Vérifier si un fichier est présent
        if 'file' not in request.files:
            return jsonify({'error': 'Aucun fichier fourni'}), 400
        
        file = request.files['file']
        
        if file.filename == '':
            return jsonify({'error': 'Nom de fichier vide'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Format de fichier non autorisé. Utilisez CSV'}), 400
        
        # Sauvegarder le fichier
        filepath = save_uploaded_file(file, app.config['UPLOAD_FOLDER'])
        
        # Lire et valider le CSV
        df = pd.read_csv(filepath)
        
        # Vérifier les colonnes requises
        required_columns = ['timestamp', 'consumption_kwh']
        if not all(col in df.columns for col in required_columns):
            return jsonify({
                'error': f'Colonnes requises: {required_columns}',
                'found': list(df.columns)
            }), 400
        
        # Statistiques de base
        stats = {
            'rows': len(df),
            'start_date': df['timestamp'].min(),
            'end_date': df['timestamp'].max(),
            'avg_consumption': float(df['consumption_kwh'].mean()),
            'max_consumption': float(df['consumption_kwh'].max()),
            'min_consumption': float(df['consumption_kwh'].min()),
            'total_consumption': float(df['consumption_kwh'].sum())
        }
        
        return jsonify({
            'success': True,
            'message': 'Fichier uploadé avec succès',
            'filename': file.filename,
            'filepath': filepath,
            'stats': stats
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur dans upload: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_data():
    """Analyse complète des données avec Data Mining"""
    try:
        data = request.get_json()
        filepath = data.get('filepath')
        
        if not filepath or not os.path.exists(filepath):
            return jsonify({'error': 'Fichier non trouvé'}), 404
        
        print(f"📊 Analyse du fichier: {filepath}")
        
        # Charger les données
        df = pd.read_csv(filepath)
        print(f"✅ Données chargées: {len(df)} lignes")
        
        # Prétraitement
        df = preprocess_data(df)
        print(f"✅ Prétraitement terminé")
        
        # 1. Clustering - Profil utilisateur
        print("🔄 Clustering en cours...")
        cluster_result = dm_engine.cluster_consumption_profiles(df)
        print(f"✅ Cluster détecté: {cluster_result['profile_name']}")
        
        # 2. Détection d'anomalies
        print("🔄 Détection d'anomalies...")
        anomalies = dm_engine.detect_anomalies(df)
        print(f"✅ {anomalies['count']} anomalies détectées")
        
        # 3. Patterns horaires
        print("🔄 Analyse des patterns...")
        hourly_patterns = dm_engine.analyze_hourly_patterns(df)
        print(f"✅ Patterns analysés")
        
        # 4. Comparaison avec moyennes
        print("🔄 Comparaison...")
        comparison = dm_engine.compare_with_averages(df, cluster_result['cluster'])
        print(f"✅ Comparaison terminée")
        
        result = {
            'success': True,
            'cluster': cluster_result,
            'anomalies': anomalies,
            'hourly_patterns': hourly_patterns,
            'comparison': comparison,
            'timestamp': datetime.now().isoformat()
        }
        
        print("✅ Analyse complète terminée avec succès")
        return jsonify(result), 200
        
    except Exception as e:
        print(f"❌ ERREUR dans analyze_data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict_consumption():
    """Prédiction de la consommation future"""
    try:
        data = request.get_json()
        
        # Vérifications de base
        if not data:
            return jsonify({'error': 'Pas de données reçues'}), 400
            
        filepath = data.get('filepath')
        days = data.get('days', 7)
        
        print(f"🔮 Requête de prédiction reçue:")
        print(f"  → filepath: {filepath}")
        print(f"  → days: {days}")
        
        if not filepath:
            return jsonify({'error': 'Filepath manquant'}), 400
            
        # Normaliser le chemin (Windows/Linux)
        filepath = filepath.replace('/', os.sep).replace('\\', os.sep)
        
        # Vérifier si le fichier existe
        if not os.path.exists(filepath):
            # Essayer avec uploads/ en préfixe si pas déjà présent
            if not filepath.startswith('uploads'):
                alt_filepath = os.path.join('uploads', os.path.basename(filepath))
                if os.path.exists(alt_filepath):
                    filepath = alt_filepath
                else:
                    return jsonify({
                        'error': f'Fichier non trouvé: {filepath}',
                        'tried_paths': [filepath, alt_filepath]
                    }), 404
            else:
                return jsonify({'error': f'Fichier non trouvé: {filepath}'}), 404
        
        print(f"  ✓ Fichier trouvé: {filepath}")
        
        # Charger les données
        df = pd.read_csv(filepath)
        print(f"  ✓ {len(df)} lignes chargées")
        
        # Prétraitement
        df = preprocess_data(df)
        print(f"  ✓ Prétraitement terminé")
        
        # Vérifier qu'il y a assez de données
        if len(df) < 48:
            return jsonify({
                'error': 'Pas assez de données pour faire des prédictions',
                'minimum_required': 48,
                'found': len(df)
            }), 400
        
        # Prédiction
        print(f"  → Génération des prédictions pour {days} jours...")
        predictions = dm_engine.predict_future_consumption(df, days=days)
        
        print("  ✅ Prédictions générées avec succès")
        
        return jsonify({
            'success': True,
            'predictions': predictions,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        error_msg = str(e)
        print(f"❌ ERREUR dans predict_consumption:")
        print(f"  → Type: {type(e).__name__}")
        print(f"  → Message: {error_msg}")
        
        import traceback
        traceback.print_exc()
        
        return jsonify({
            'error': error_msg,
            'type': type(e).__name__,
            'success': False
        }), 500
    
@app.route('/api/recommendations', methods=['POST'])
def get_recommendations():
    """Générer des recommandations personnalisées"""
    try:
        data = request.get_json()
        cluster = data.get('cluster')
        consumption_stats = data.get('stats')
        
        print("💡 Génération des recommandations...")
        recommendations = dm_engine.generate_recommendations(cluster, consumption_stats)
        
        return jsonify({
            'success': True,
            'recommendations': recommendations,
            'timestamp': datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"❌ ERREUR dans recommendations: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/api/generate-sample', methods=['GET'])
def generate_sample_data():
    """Générer des données d'exemple"""
    try:
        from data.generate_sample_data import generate_energy_data
        
        days = request.args.get('days', default=30, type=int)
        print(f"🔧 Génération de {days} jours de données...")
        
        df = generate_energy_data(days=days, profile='normal')
        
        # Sauvegarder
        filename = f'sample_data_{days}days.csv'
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        df.to_csv(filepath, index=False)
        
        print(f"✅ Fichier généré: {filename}")
        return jsonify({
            'success': True,
            'message': 'Données d\'exemple générées',
            'filename': filename,
            'filepath': filepath,
            'rows': len(df)
        }), 200
        
    except Exception as e:
        print(f"❌ Erreur dans generate_sample_data: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("🚀 EcoSmart Insights Backend démarré")
    print("📍 API disponible sur : http://localhost:5000")
    app.run(debug=True, host='0.0.0.0', port=5000)