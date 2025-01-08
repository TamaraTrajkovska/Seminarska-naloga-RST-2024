from flask import Blueprint, request, jsonify
from app import mongo
import pandas as pd

comparison_bp = Blueprint('comparison', __name__, url_prefix='/comparison')

##############################################################################
# PRIMERJAVA ANALIZE - API
##############################################################################
@comparison_bp.route('/', methods=['GET', 'POST'])
def comparison():
    try:
        # Fetch all analysis results
        analysis_results = list(mongo.db.analysis_results.find())
        for analysis in analysis_results:
            # Convert decision matrix to JSON-friendly format
            analysis['matrix_html'] = pd.DataFrame(
                analysis['decision_matrix'],
                columns=[c.strip() for c in analysis.get('criteria_chosen_to_analysis', [])],
                index=analysis.get('companies_chosen', [])
            ).to_json()

            # Convert ObjectId to string for JSON compatibility
            analysis['_id'] = str(analysis['_id'])

        if request.method == 'POST':
            # Extract data from request
            data = request.json
            first_index = int(data.get('first_analysis'))
            second_index = int(data.get('second_analysis'))

            first_analysis = analysis_results[first_index]
            second_analysis = analysis_results[second_index]

            # Validate compatibility for comparison
            if (first_analysis['criteria_chosen_to_analysis'] == second_analysis['criteria_chosen_to_analysis'] and
                first_analysis['weights'] == second_analysis['weights'] and
                first_analysis['companies_chosen'] == second_analysis['companies_chosen']):
                return jsonify({
                    "message": "Comparison successful.",
                    "first_analysis": first_analysis,
                    "second_analysis": second_analysis
                }), 200
            else:
                return jsonify({
                    "error": "Primerjava je dovoljena le med analizami z enakimi kriteriji, utežmi in alternativami."
                }), 400

        # Return all analysis results for the GET request
        return jsonify({"analysis_results": analysis_results}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
