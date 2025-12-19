import pandas as pd
import numpy as np
from datetime import datetime

def preprocess_data(df):
    """
    Nettoyer et préparer les données pour l'analyse
    """
    # Copie pour éviter les modifications
    df = df.copy()
    
    # Convertir timestamp en datetime
    df['timestamp'] = pd.to_datetime(df['timestamp'])
    
    # Trier par date
    df = df.sort_values('timestamp')
    
    # Gérer les valeurs manquantes - MÉTHODE CORRIGÉE
    df['consumption_kwh'] = df['consumption_kwh'].ffill().bfill()
    
    # Supprimer les valeurs négatives (erreurs de mesure)
    df = df[df['consumption_kwh'] >= 0]
    
    # Feature engineering
    df['hour'] = df['timestamp'].dt.hour
    df['day_of_week'] = df['timestamp'].dt.dayofweek
    df['day_name'] = df['timestamp'].dt.day_name()
    df['month'] = df['timestamp'].dt.month
    df['date'] = df['timestamp'].dt.date
    df['is_weekend'] = df['day_of_week'].isin([5, 6]).astype(int)
    
    # Période de la journée
    df['time_period'] = pd.cut(
        df['hour'],
        bins=[0, 6, 12, 18, 24],
        labels=['Nuit', 'Matin', 'Après-midi', 'Soirée'],
        include_lowest=True
    )
    
    # Consommation précédente (pour prédictions)
    df['prev_consumption'] = df['consumption_kwh'].shift(1)
    df['prev_consumption'] = df['prev_consumption'].fillna(df['consumption_kwh'].mean())
    
    # Moyenne mobile sur 24h
    df['rolling_avg_24h'] = df['consumption_kwh'].rolling(window=24, min_periods=1).mean()
    
    # Écart à la moyenne
    df['consumption_deviation'] = df['consumption_kwh'] - df['rolling_avg_24h']
    
    return df

def aggregate_daily(df):
    """
    Agréger les données par jour
    """
    daily = df.groupby('date').agg({
        'consumption_kwh': ['sum', 'mean', 'max', 'min', 'std'],
        'is_weekend': 'first'
    }).reset_index()
    
    daily.columns = ['date', 'total_kwh', 'avg_kwh', 'max_kwh', 'min_kwh', 'std_kwh', 'is_weekend']
    
    return daily

def get_consumption_stats(df):
    """
    Calculer les statistiques de consommation
    """
    stats = {
        'total_consumption': float(df['consumption_kwh'].sum()),
        'avg_consumption': float(df['consumption_kwh'].mean()),
        'max_consumption': float(df['consumption_kwh'].max()),
        'min_consumption': float(df['consumption_kwh'].min()),
        'std_consumption': float(df['consumption_kwh'].std()),
        
        # Par période
        'avg_by_period': df.groupby('time_period')['consumption_kwh'].mean().to_dict(),
        
        # Week-end vs semaine
        'avg_weekend': float(df[df['is_weekend'] == 1]['consumption_kwh'].mean()),
        'avg_weekday': float(df[df['is_weekend'] == 0]['consumption_kwh'].mean()),
        
        # Par heure
        'avg_by_hour': df.groupby('hour')['consumption_kwh'].mean().to_dict(),
    }
    
    return stats