import os
from werkzeug.utils import secure_filename
from datetime import datetime

ALLOWED_EXTENSIONS = {'csv'}

def allowed_file(filename):
    """
    Vérifier si l'extension du fichier est autorisée
    """
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_uploaded_file(file, upload_folder):
    """
    Sauvegarder un fichier uploadé de manière sécurisée
    """
    filename = secure_filename(file.filename)
    
    # Ajouter timestamp pour éviter les conflits
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    name, ext = os.path.splitext(filename)
    filename = f"{name}_{timestamp}{ext}"
    
    filepath = os.path.join(upload_folder, filename)
    file.save(filepath)
    
    return filepath

def format_number(number, decimals=2):
    """
    Formater un nombre avec des décimales
    """
    return round(number, decimals)

def calculate_cost(kwh, price_per_kwh=0.25):
    """
    Calculer le coût en euros
    """
    return round(kwh * price_per_kwh, 2)