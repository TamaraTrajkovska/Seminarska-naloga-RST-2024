from flask import Blueprint, jsonify, request
from app import mongo
import numpy as np
import pandas as pd
from pyDecision.algorithm import topsis_method, saw_method, vikor_method, macbeth_method
from datetime import datetime
from app.helpers import parse_number
from app.promethee import promethee
from bson.objectid import ObjectId

methods_bp = Blueprint('methods', __name__, url_prefix='/methods')

##############################################################################
# IZBIRA METODE
##############################################################################
@methods_bp.route('/', methods=['GET','POST'])
def methods():
    if request.method == 'POST':
        try:
            data = request.json
            selected_ids = data.get('selected_companies', [])
            chosen_method = data.get('method')
            analysis_name = data.get('analysis_name')        

            # Preveri minimalno število podjetij
            if len(selected_ids) < 3:
                return jsonify({"error": "Izberite vsaj 3 podjetja za analizo."}), 400
            
            all_companies_ita = list(mongo.db.companies.find({}))
            for comp in all_companies_ita:
                comp_id_str = str(comp["_id"])
                if comp_id_str in selected_ids:
                    mongo.db.companies.update_one(
                        {"_id": comp["_id"]},
                        {"$set": {"include_to_analysis": True}}
                    )
                else:
                    mongo.db.companies.update_one(
                        {"_id": comp["_id"]},
                        {"$set": {"include_to_analysis": False}}
                    )

            # Pridobitev podatkov iz baze
            all_criteria = list(mongo.db.criteria.find({"include_to_analysis": True}))
            excluded_criteria_ids = [str(c["_id"]) for c in all_criteria]
            all_weights = list(mongo.db.weights.find({"id_kriterija": {"$in": excluded_criteria_ids}}))
            all_companies = list(mongo.db.companies.find({"_id": {"$in": [ObjectId(cid) for cid in selected_ids]}}))

            # Priprava uteži in kriterijev
            weights_dict = {w['id_kriterija']: w['weight_value'] for w in all_weights}
            weights = [weights_dict.get(str(c["_id"]), 0.0) for c in all_criteria]
            weight_sum = sum(weights)
            if weight_sum == 0:
                return jsonify({"error": "Vsota uteži je 0. Preverite uteži."}), 400
            weights = [w / weight_sum for w in weights]

            # Priprava matrike odločanja
            sorted_criteria = sorted(all_criteria, key=lambda c: c["name"])
            criteria_mapping = {
                "prihodek": "Prihodek",
                "dobiček": "Dobiček",
                "finančna sredstva": "Finančna sredstva",
                "sprememba dobička": "Sprememba dobička",
                "sprememba prihodkov": "Sprememba prihodkov",
                "število zaposlenih": "Število zaposlenih"
            }
            decision_matrix = []
            company_names = []
            for comp in all_companies:
                row = []
                for c in sorted_criteria:
                    cname = c["name"].strip().lower().replace("\t", "")
                    key = criteria_mapping.get(cname, None)
                    val = parse_number(comp.get(key)) if key else 0
                    row.append(val or 0)
                decision_matrix.append(row)
                company_names.append(comp["Ime podjetja"])
            decision_matrix = np.array(decision_matrix, dtype=int)

            benefit = ["max" if c.get("type", "").lower() == "korist" else "min" for c in sorted_criteria]
            
            matrix_html = pd.DataFrame(decision_matrix, index=company_names, columns=[c["name"].strip() for c in sorted_criteria]).to_html(justify="inherit", classes='table table-striped table-hover border-primary table-sm')
            match chosen_method: 
                case "TOPSIS":
                    try:
                        topsis_result = topsis_method(decision_matrix, weights, benefit, graph=False, verbose=False)
                        print("[DEBUG-TOPSIS-RESULT]: ", topsis_result)
                        sorted_indices = np.argsort(-topsis_result)                
                        ranking = [{"company": company_names[idx], "score": round(float(topsis_result[idx]), 2)} for idx in sorted_indices]
                    except Exception as e:
                        return jsonify({"error": f"Napaka pri izvajanju TOPSIS metode: {str(e)}"}), 400
                case "WSM":
                    try:
                        wsm_result = saw_method(decision_matrix, benefit, weights, graph=False, verbose=False)
                        # Ekstrakcija drugega stolpca z uporabo np.concatenate
                        scores = np.concatenate(wsm_result[:, 1:].reshape(1, -1))
                        # Razvrstitev po ocenah v padajočem vrstnem redu
                        sorted_indices = np.argsort(-scores)
                        ranking = [{"company": company_names[idx], "score" : round(float(scores[idx]), 2)} for idx in sorted_indices]
                    except Exception as e:
                        return jsonify({"error": f"Napaka pri izvajanju WSM metode: {str(e)}"}), 400
                case "PROMETHEE":                
                    try:
                        promethee_result = promethee(weights, benefit, [[company_names[i]] + list(decision_matrix[i]) for i in range(len(company_names))])
                        ranking = [{"company": alt, "score": round(promethee_result["net_flows"][alt], 2)} for alt in promethee_result["rankings"]]
                        print("[DEBUG-PROMETHEE-RESULT]:", promethee_result)
                    except Exception as e:
                        return jsonify({"error": f"Napaka pri izvajanju PROMETHEE metode: {str(e)}"}), 400
                case "MACBETH":
                    try:
                        macbeth_result = macbeth_method(decision_matrix, weights, benefit, graph=False, verbose=False)
                        print("[DEBUG-MACBETH-RESULT]: ", macbeth_result)
                        sorted_indices = np.argsort(-macbeth_result)                
                        ranking = [{"company": company_names[idx], "score": round(float(macbeth_result[idx]), 2)} for idx in sorted_indices]
                    except Exception as e:
                        return jsonify({"error": f"Napaka pri izvajanju MACBETH metode: {str(e)}"}), 400
                case _:
                    return jsonify({"error": "Izbrana metoda ni veljavna."}), 400
                    
            # Vstavljanje rezultata v bazo
            formatted_date = datetime.now().strftime("[%d.%m.%Y]_[%H:%M:%S]")
            analysis_doc = {
                "analysis_name": f"[{analysis_name}]_[{chosen_method}]_{formatted_date}",
                "method": chosen_method,
                "criteria_chosen_to_analysis": [c["name"] for c in sorted_criteria],
                "weights": weights,
                "companies_chosen": company_names,
                "decision_matrix": decision_matrix.tolist(),
                "ranking": ranking,
                "matrix_html": matrix_html

            }
            mongo.db.analysis_results.insert_one(analysis_doc)

            return jsonify({"message": "Analiza uspešno izvedena.", "analysis_id": str(analysis_doc["_id"])}), 201

        except Exception as e:
            return jsonify({"error": f"Napaka pri obdelavi zahteve: {str(e)}"}), 500
    else:
        return jsonify({"message": "GET is not implemented on this route."}), 405
