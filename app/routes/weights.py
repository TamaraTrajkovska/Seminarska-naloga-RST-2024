from flask import Blueprint, request, jsonify
from app import mongo

weights_bp = Blueprint('weights', __name__, url_prefix='/weights')


##############################################################################
# UTEŽI
##############################################################################
@weights_bp.route('/', methods=['GET', 'POST'])
def weights():
    if request.method == 'POST':
        # Sprejmi JSON telo iz zahteve
        data = request.get_json()
        weights = data.get("weights", [])

        if not isinstance(weights, list):
            return jsonify({"error": "Invalid format for weights."}), 400

        # Posodobimo uteži v bazi
        for weight_entry in weights:
            crit_id = weight_entry.get("id_kriterija")
            weight_value = weight_entry.get("weight_value")

            if crit_id is not None and weight_value is not None:
                mongo.db.weights.update_one(
                    {"id_kriterija": crit_id},
                    {
                        "$set": {
                            "id_kriterija": crit_id,
                            "weight_value": float(weight_value)
                        }
                    },
                    upsert=True
                )
        return jsonify({"message": "Uteži so uspešno nastavljeni!"}), 200
    else:
        # GET
        all_criteria = list(mongo.db.criteria.find())
        for c in all_criteria:
            c["_id"] = str(c["_id"])

            w_doc = mongo.db.weights.find_one({"id_kriterija": str(c["_id"])})
            c["weight_value"] = w_doc.get("weight_value", 0.0) if w_doc else 0.0
        return jsonify({"criteria": all_criteria}), 200

