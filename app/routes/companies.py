from flask import Blueprint, jsonify
from app import mongo

companies_bp = Blueprint('companies', __name__, url_prefix='/companies')

##############################################################################
# PODJETJA
##############################################################################
@companies_bp.route('/', methods=['GET'])
def get_companies():
    """
    Pridobi seznam vseh podjetij
    """
    all_companies = list(mongo.db.companies.find())
    companies_list = [
         {"_id": str(comp["_id"]), "Finančna sredstva":comp["Finančna sredstva"], 
          "Število zaposlenih":comp["Število zaposlenih"], "Ime podjetja":comp["Ime podjetja"], 
          "Dobiček":comp["Dobiček"], "Sprememba dobička":comp["Sprememba dobička"], 
          "Prihodek":comp["Prihodek"], "Sprememba prihodkov":comp["Sprememba prihodkov"],  
          "include_to_analysis": comp.get("include_to_analysis", False)} for comp in all_companies      
    ]
    return jsonify(companies_list), 200
    


    

    
    
    