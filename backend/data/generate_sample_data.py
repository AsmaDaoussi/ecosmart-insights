import pandas as pd
import numpy as np
from datetime import datetime, timedelta

def generate_energy_data(days=30, profile='normal'):
    """
    Générer des données synthétiques de consommation énergétique
    
    Args:
        days: Nombre de jours à générer
        profile: Type de profil ('economical', 'normal', 'high', 'irregular')
    """
    
    # Configuration des profils
    profiles = {
        'economical': {'base': 40, 'variance': 5, 'peak_factor': 1.3},
        'normal': {'base': 50, 'variance': 8, 'peak_factor': 1.6},
        'high': {'base': 70, 'variance': 12, 'peak_factor': 1.8},
        'irregular': {'base': 55, 'variance': 20, 'peak_factor': 2.0}
    }
    
    config = profiles.get(profile, profiles['normal'])
    
    # Générer les timestamps
    start_date = datetime.now() - timedelta(days=days)
    timestamps = pd.date_range(start=start_date, periods=days*24, freq='h')
    
    consumption = []
    
    for ts in timestamps:
        # Consommation de base
        base = config['base']
        
        # Facteur horaire (plus élevé le soir)
        if 6 <= ts.hour <= 8:  # Matin
            hour_factor = 1.4
        elif 9 <= ts.hour <= 17:  # Journée
            hour_factor = 0.8
        elif 18 <= ts.hour <= 22:  # Soirée (pic)
            hour_factor = config['peak_factor']
        else:  # Nuit
            hour_factor = 0.4
        
        # Facteur week-end (légèrement plus élevé)
        weekend_factor = 1.1 if ts.dayofweek >= 5 else 1.0
        
        # Bruit aléatoire
        noise = np.random.normal(0, config['variance'])
        
        # Consommation finale
        value = base * hour_factor * weekend_factor + noise
        
        # Ajouter quelques anomalies aléatoires (5% de chance)
        if np.random.random() < 0.05:
            value *= np.random.uniform(1.5, 2.5)
        
        consumption.append(max(0, value))
    
    # Créer le DataFrame
    df = pd.DataFrame({
        'timestamp': timestamps,
        'consumption_kwh': consumption
    })
    
    return df

def generate_multiple_profiles():
    """
    Générer des datasets pour différents profils
    """
    profiles = ['economical', 'normal', 'high', 'irregular']
    datasets = {}
    
    for profile in profiles:
        df = generate_energy_data(days=30, profile=profile)
        datasets[profile] = df
        
        # Sauvegarder
        filename = f'sample_{profile}_30days.csv'
        df.to_csv(filename, index=False)
        print(f"✅ Généré: {filename}")
    
    return datasets

if __name__ == '__main__':
    print("🔧 Génération des données d'exemple...")
    generate_multiple_profiles()
    print("✅ Terminé!")