from flask import Blueprint, request, jsonify
from app import mongo

criteria_bp = Blueprint('criteria', __name__, url_prefix='/criteria')

##############################################################################
# KRITERIJI
##############################################################################
@criteria_bp.route('/', methods=['GET', 'POST'])
def criteria():
    if request.method == 'POST':
        try:
            # Preberemo izbrane ID-je iz obrazca (checkbox: name="selected_criteria")
            selected_ids = request.json.get("selected_criteria", [])  # pričakujemo JSON s seznamom
            # Pridobimo vse kriterije iz baze
            all_criteria = list(mongo.db.criteria.find())
            
            # Sprehodimo se in za vsak kriterij določimo "include_to_analysis" = True/False
            for crit in all_criteria:
                crit_id_str = str(crit["_id"])
                include = crit_id_str in selected_ids
                # Posodobimo kriterij
                mongo.db.criteria.update_one(
                    {"_id": crit["_id"]},
                    {"$set": {"include_to_analysis": include}}
                )

            return jsonify({"message": "Izbira kriterijev je uspešno shranjena!"}), 200
        except Exception as e:
            return jsonify({"error": f"Napaka pri shranjevanju kriterijev: {str(e)}"}), 500

    elif request.method == 'GET':
        try:
            # GET -> pridobimo vse kriterije in jih pošljemo kot JSON
            all_criteria = list(mongo.db.criteria.find())
            # Pretvorimo v seznam slovarjev, ki so serializirani kot JSON
            criteria_list = [
                {"_id": str(c["_id"]), "name": c["name"], "include_to_analysis": c.get("include_to_analysis", False)}
                for c in all_criteria
            ]
            return jsonify(criteria_list), 200
        except Exception as e:
            return jsonify({"error": f"Napaka pri pridobivanju kriterijev: {str(e)}"}), 500
