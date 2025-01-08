from flask import Blueprint, jsonify
from app import mongo

results_bp = Blueprint('results', __name__, url_prefix='/results')

##############################################################################
# 6) REZULTATI 
##############################################################################
@results_bp.route('/', methods=['GET'])
def results():
    all_analysis_results = list(mongo.db.analysis_results.find().sort('_id', -1))

    for analysis_doc in all_analysis_results:
        analysis_doc["_id"] = str(analysis_doc["_id"])
        for r in analysis_doc.get("ranking", []):
            score_val = r.get("score")
            if isinstance(score_val, dict) and "$numberDouble" in score_val:
                try:
                    r["score"] = float(score_val["$numberDouble"])
                except (ValueError, TypeError):
                    r["score"] = 0.0
            elif isinstance(score_val, str):
                try:
                    r["score"] = float(score_val)
                except ValueError:
                    r["score"] = 0.0

    return jsonify({"analysis_results": all_analysis_results}), 200


