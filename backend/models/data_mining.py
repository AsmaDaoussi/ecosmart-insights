import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta

class DataMiningEngine:
    def __init__(self):
        self.scaler = StandardScaler()
        self.kmeans = None
        self.isolation_forest = None
        
        # Profils de référence (moyennes pour ménages français)
        self.reference_profiles = {
            0: {'name': 'Économe', 'avg_kwh': 3.5, 'description': 'Consommation bien inférieure à la moyenne'},
            1: {'name': 'Moyen', 'avg_kwh': 5.0, 'description': 'Consommation dans la moyenne nationale'},
            2: {'name': 'Élevé', 'avg_kwh': 7.0, 'description': 'Consommation supérieure à la moyenne'},
            3: {'name': 'Irrégulier', 'avg_kwh': 6.0, 'description': 'Pattern de consommation imprévisible'}
        }
    
    def cluster_consumption_profiles(self, df):
        """
        Classification du profil de consommation
        Utilise des règles simples basées sur les statistiques
        """
        try:
            print("  → Calcul des features quotidiennes...")
            # Features pour le clustering
            daily = df.groupby('date').agg({
                'consumption_kwh': ['mean', 'std', 'max'],
                'is_weekend': 'first'
            }).reset_index()
            
            daily.columns = ['date', 'avg_consumption', 'std_consumption', 'max_consumption', 'is_weekend']
            
            print("  → Calcul des statistiques...")
            # Calculer des features supplémentaires
            avg_consumption = daily['avg_consumption'].mean()
            std_consumption = daily['std_consumption'].mean()
            max_consumption = daily['max_consumption'].mean()
            
            # Ratio week-end/semaine avec gestion division par zéro
            weekend_avg = daily[daily['is_weekend'] == 1]['avg_consumption'].mean()
            weekday_avg = daily[daily['is_weekend'] == 0]['avg_consumption'].mean()
            
            if pd.isna(weekend_avg):
                weekend_avg = avg_consumption
            if pd.isna(weekday_avg):
                weekday_avg = avg_consumption
                
            if weekday_avg > 0:
                weekend_ratio = weekend_avg / weekday_avg
            else:
                weekend_ratio = 1.0
            
            # Consommation heures de pointe
            peak_hours_mask = df['hour'].isin([18, 19, 20, 21])
            peak_hours_consumption = df[peak_hours_mask]['consumption_kwh'].mean()
            
            # Consommation nocturne
            night_hours_mask = df['hour'].isin([0, 1, 2, 3, 4, 5])
            night_consumption = df[night_hours_mask]['consumption_kwh'].mean()
            
            print("  → Détermination du profil basé sur la consommation...")
            
            # Déterminer le cluster basé sur la consommation moyenne
            # Classification basée sur des règles
            if avg_consumption < 4.0:
                cluster = 0  # Économe
            elif avg_consumption < 6.0:
                cluster = 1  # Moyen
            elif std_consumption < 2.0:
                cluster = 2  # Élevé mais régulier
            else:
                cluster = 3  # Irrégulier
            
            # Informations du cluster
            profile = self.reference_profiles[cluster]
            
            result = {
                'cluster': int(cluster),
                'profile_name': profile['name'],
                'description': profile['description'],
                'your_avg': float(avg_consumption),
                'reference_avg': profile['avg_kwh'],
                'difference_percent': float(
                    ((avg_consumption - profile['avg_kwh']) / profile['avg_kwh']) * 100
                ),
                'features': {
                    'avg_consumption': float(avg_consumption),
                    'std_consumption': float(std_consumption),
                    'weekend_ratio': float(weekend_ratio),
                    'peak_hours': float(peak_hours_consumption),
                    'night_consumption': float(night_consumption)
                }
            }
            
            print(f"  → Profil identifié: {profile['name']}")
            return result
            
        except Exception as e:
            print(f"❌ Erreur dans cluster_consumption_profiles: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def detect_anomalies(self, df):
        """
        Détection d'anomalies avec Isolation Forest
        """
        try:
            print("  → Préparation des features pour anomalies...")
            # Features pour la détection
            features = df[['consumption_kwh', 'hour', 'day_of_week']].copy()
            
            # Normaliser
            features_scaled = self.scaler.fit_transform(features)
            
            print("  → Application d'Isolation Forest...")
            # Isolation Forest
            self.isolation_forest = IsolationForest(
                contamination=0.05,  # 5% d'anomalies attendues
                random_state=42
            )
            
            df = df.copy()
            df['anomaly'] = self.isolation_forest.fit_predict(features_scaled)
            
            # Extraire les anomalies
            anomalies_df = df[df['anomaly'] == -1].copy()
            
            # Calculer la moyenne pour comparaison
            avg_by_hour = df.groupby('hour')['consumption_kwh'].mean()
            
            anomalies_list = []
            for _, row in anomalies_df.iterrows():
                expected = avg_by_hour[row['hour']]
                deviation_percent = ((row['consumption_kwh'] - expected) / expected) * 100
                
                anomalies_list.append({
                    'timestamp': row['timestamp'].isoformat(),
                    'consumption': float(row['consumption_kwh']),
                    'expected': float(expected),
                    'deviation_percent': float(deviation_percent),
                    'hour': int(row['hour']),
                    'day': row['day_name']
                })
            
            print(f"  → {len(anomalies_list)} anomalies détectées")
            return {
                'count': len(anomalies_list),
                'anomalies': sorted(anomalies_list, key=lambda x: abs(x['deviation_percent']), reverse=True)[:10]
            }
            
        except Exception as e:
            print(f"❌ Erreur dans detect_anomalies: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def analyze_hourly_patterns(self, df):
        """
        Analyser les patterns de consommation horaire
        """
        try:
            print("  → Analyse des patterns horaires...")
            hourly = df.groupby('hour')['consumption_kwh'].agg(['mean', 'std', 'max']).reset_index()
            
            patterns = []
            for _, row in hourly.iterrows():
                patterns.append({
                    'hour': int(row['hour']),
                    'avg': float(row['mean']),
                    'std': float(row['std']),
                    'max': float(row['max'])
                })
            
            # Identifier les heures de pointe
            peak_hours = hourly.nlargest(3, 'mean')['hour'].tolist()
            
            print(f"  → Heures de pointe: {peak_hours}")
            return {
                'hourly_data': patterns,
                'peak_hours': [int(h) for h in peak_hours],
                'off_peak_hours': [int(h) for h in range(24) if h not in peak_hours]
            }
            
        except Exception as e:
            print(f"❌ Erreur dans analyze_hourly_patterns: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def predict_future_consumption(self, df, days=7):
        """
        Prédiction avec Random Forest
        """
        try:
            print(f"  → Début de la prédiction pour {days} jours...")
            print(f"  → DataFrame shape: {df.shape}")
            
            # Préparer les données d'entraînement
            train_features = ['hour', 'day_of_week', 'is_weekend', 'prev_consumption', 'rolling_avg_24h']
            
            # Vérifier que toutes les colonnes existent
            missing_cols = [col for col in train_features if col not in df.columns]
            if missing_cols:
                raise ValueError(f"Colonnes manquantes: {missing_cols}")
            
            # Supprimer les lignes avec NaN
            X = df[train_features].dropna()
            
            if len(X) == 0:
                raise ValueError("Aucune donnée valide après suppression des NaN")
            
            y = df.loc[X.index, 'consumption_kwh']
            
            print(f"  → Données d'entraînement: {len(X)} échantillons")
            
            if len(X) < 24:
                raise ValueError(f"Pas assez de données pour l'entraînement: {len(X)} < 24")
            
            # Entraîner le modèle (VARIABLE LOCALE - Thread-safe)
            print("  → Entraînement du modèle Random Forest...")
            rf_model = RandomForestRegressor(
                n_estimators=50,
                random_state=42,
                max_depth=10,
                n_jobs=-1
            )
            rf_model.fit(X, y)
            print("  ✓ Modèle entraîné")
            
            # Utiliser les données filtrées (X.index) au lieu du DataFrame complet
            last_index = X.index[-1]
            last_date = df.loc[last_index, 'timestamp']
            last_consumption = df.loc[last_index, 'consumption_kwh']
            last_rolling_avg = df.loc[last_index, 'rolling_avg_24h']
            
            print(f"  → Dernière date: {last_date}")
            print(f"  → Dernière consommation: {last_consumption:.2f} kWh")
            
            predictions = []
            
            print(f"  → Génération des prédictions heure par heure...")
            
            for day in range(days):
                for hour in range(24):
                    future_date = last_date + timedelta(days=day, hours=hour+1)
                    
                    # Features pour la prédiction
                    prev_cons = last_consumption if len(predictions) == 0 else predictions[-1]['consumption']
                    
                    features_list = [
                        future_date.hour,                              # hour
                        future_date.dayofweek,                        # day_of_week
                        1 if future_date.dayofweek >= 5 else 0,       # is_weekend
                        prev_cons,                                     # prev_consumption
                        last_rolling_avg                               # rolling_avg_24h
                    ]
                    
                    # Créer un DataFrame avec les noms de colonnes (FIX WARNING sklearn)
                    X_future = pd.DataFrame(
                        [features_list],
                        columns=train_features
                    )
                    
                    # Prédire avec le modèle local
                    pred_value = rf_model.predict(X_future)[0]
                    
                    predictions.append({
                        'timestamp': future_date.isoformat(),
                        'consumption': float(max(0, pred_value)),
                        'day': day + 1,
                        'hour': hour
                    })
            
            print(f"  ✓ {len(predictions)} prédictions générées")
            
            # Agréger par jour
            print("  → Agrégation par jour...")
            daily_predictions = []
            
            for day in range(days):
                day_data = [p for p in predictions if p['day'] == day + 1]
                total = sum(p['consumption'] for p in day_data)
                
                daily_predictions.append({
                    'day': day + 1,
                    'date': (last_date + timedelta(days=day+1)).date().isoformat(),
                    'total_kwh': float(total),
                    'avg_kwh': float(total / 24),
                    'estimated_cost': float(total * 0.25)
                })
            
            result = {
                'hourly': predictions,
                'daily': daily_predictions,
                'total_predicted': float(sum(p['total_kwh'] for p in daily_predictions)),
                'total_cost': float(sum(p['estimated_cost'] for p in daily_predictions))
            }
            
            print(f"  ✅ Prédictions complètes: {result['total_predicted']:.2f} kWh sur {days} jours")
            
            return result
            
        except Exception as e:
            print(f"❌ Erreur dans predict_future_consumption: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def compare_with_averages(self, df, cluster):
        """
        Comparer avec les moyennes nationales
        """
        try:
            user_avg = df['consumption_kwh'].mean()
            reference = self.reference_profiles[cluster]['avg_kwh']
            
            return {
                'your_average': float(user_avg),
                'reference_average': float(reference),
                'difference': float(user_avg - reference),
                'difference_percent': float(((user_avg - reference) / reference) * 100),
                'status': 'above' if user_avg > reference else 'below'
            }
            
        except Exception as e:
            print(f"❌ Erreur dans compare_with_averages: {str(e)}")
            import traceback
            traceback.print_exc()
            raise
    
    def generate_recommendations(self, cluster, stats):
        """
        Générer des recommandations basées sur le profil
        """
        try:
            recommendations = []
            
            # Recommandations par profil
            if cluster == 2:  # Élevé
                recommendations.append({
                    'priority': 'high',
                    'title': 'Réduire le chauffage électrique',
                    'description': 'Votre consommation est élevée. Baisser le thermostat de 1°C peut économiser 7%.',
                    'potential_savings': '120€/mois',
                    'category': 'heating'
                })
                
                recommendations.append({
                    'priority': 'high',
                    'title': 'Optimiser les heures creuses',
                    'description': 'Programmer les appareils énergivores pendant les heures creuses.',
                    'potential_savings': '45€/mois',
                    'category': 'timing'
                })
            
            if cluster == 3:  # Irrégulier
                recommendations.append({
                    'priority': 'medium',
                    'title': 'Installer un thermostat programmable',
                    'description': 'Votre consommation est imprévisible. Un thermostat intelligent pourrait aider.',
                    'potential_savings': '30€/mois',
                    'category': 'automation'
                })
            
            # Recommandations générales
            recommendations.append({
                'priority': 'medium',
                'title': 'Éteindre les appareils en veille',
                'description': 'Les veilles consomment 10% de votre facture.',
                'potential_savings': '15€/mois',
                'category': 'standby'
            })
            
            recommendations.append({
                'priority': 'low',
                'title': 'Passer aux LED',
                'description': 'Remplacer toutes les ampoules par des LED.',
                'potential_savings': '10€/mois',
                'category': 'lighting'
            })
            
            return recommendations
            
        except Exception as e:
            print(f"❌ Erreur dans generate_recommendations: {str(e)}")
            import traceback
            traceback.print_exc()
            raise