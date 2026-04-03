from flask import Flask, request, jsonify, render_template
import numpy as np
from PIL import Image
import io
import base64
import json
import os

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 10 * 1024 * 1024  # 10MB max

# ── Bacteria database ──────────────────────────────────────────────────────────
BACTERIA_DB = {
    "Staphylococcus aureus": {
        "family": "Staphylococcaceae",
        "gram": "positive",
        "shape": "cocci",
        "arrangement": "clusters",
        "color": "#4ade80",
        "tags": ["gram +", "cocci", "aerobic", "facultative anaerobe"],
        "clinical": (
            "A leading cause of hospital-acquired infections. Produces toxins responsible "
            "for food poisoning and toxic shock syndrome. MRSA strains are resistant to "
            "most beta-lactam antibiotics, making treatment challenging."
        ),
        "habitat": "Skin, nasal passages, environment",
        "diseases": ["Skin infections", "Pneumonia", "Septicemia", "Food poisoning", "MRSA"],
        "treatment": "Vancomycin (MRSA), Penicillin-resistant penicillins"
    },
    "Escherichia coli": {
        "family": "Enterobacteriaceae",
        "gram": "negative",
        "shape": "rod",
        "arrangement": "single/pairs",
        "color": "#f87171",
        "tags": ["gram –", "rod", "facultative anaerobe", "motile"],
        "clinical": (
            "Normally a harmless commensal in the gut, but pathogenic strains such as "
            "O157:H7 cause severe hemorrhagic colitis. UPEC strains are the most common "
            "cause of urinary tract infections globally."
        ),
        "habitat": "Human/animal intestinal tract",
        "diseases": ["UTIs", "Food poisoning", "Neonatal meningitis", "Traveler's diarrhea"],
        "treatment": "Fluoroquinolones, Trimethoprim-sulfamethoxazole"
    },
    "Bacillus anthracis": {
        "family": "Bacillaceae",
        "gram": "positive",
        "shape": "rod",
        "arrangement": "chains",
        "color": "#fbbf24",
        "tags": ["gram +", "rod", "spore-forming", "aerobic"],
        "clinical": (
            "The causative agent of anthrax. Forms extremely resistant endospores that can "
            "survive in soil for decades. Has three forms of infection: cutaneous, inhalation "
            "(most lethal), and gastrointestinal."
        ),
        "habitat": "Soil, infected animal carcasses",
        "diseases": ["Cutaneous anthrax", "Inhalation anthrax", "Gastrointestinal anthrax"],
        "treatment": "Ciprofloxacin, Doxycycline, Anthrax antitoxin"
    },
    "Mycobacterium tuberculosis": {
        "family": "Mycobacteriaceae",
        "gram": "acid-fast",
        "shape": "rod",
        "arrangement": "single/clusters",
        "color": "#93c5fd",
        "tags": ["acid-fast", "rod", "aerobic", "slow-growing"],
        "clinical": (
            "Responsible for tuberculosis, one of the world's deadliest infectious diseases. "
            "Has a unique waxy cell wall (mycolic acids) making it resistant to standard gram "
            "staining. Latent TB can reactivate when immunity is compromised."
        ),
        "habitat": "Human lungs, lymph nodes",
        "diseases": ["Pulmonary TB", "Extrapulmonary TB", "Miliary TB", "TB meningitis"],
        "treatment": "RIPE therapy (Rifampicin, Isoniazid, Pyrazinamide, Ethambutol)"
    },
    "Streptococcus pyogenes": {
        "family": "Streptococcaceae",
        "gram": "positive",
        "shape": "cocci",
        "arrangement": "chains",
        "color": "#c4b5fd",
        "tags": ["gram +", "cocci", "beta-hemolytic", "Group A"],
        "clinical": (
            "Group A Streptococcus causing a wide spectrum from mild pharyngitis to "
            "life-threatening necrotizing fasciitis. Post-infection complications include "
            "rheumatic fever and glomerulonephritis."
        ),
        "habitat": "Human throat, skin",
        "diseases": ["Strep throat", "Scarlet fever", "Necrotizing fasciitis", "Rheumatic fever"],
        "treatment": "Penicillin, Amoxicillin (still universally sensitive)"
    },
    "Salmonella typhi": {
        "family": "Enterobacteriaceae",
        "gram": "negative",
        "shape": "rod",
        "arrangement": "single",
        "color": "#f97316",
        "tags": ["gram –", "rod", "motile", "facultative anaerobe"],
        "clinical": (
            "Causative agent of typhoid fever, a systemic illness characterized by high "
            "sustained fever, abdominal pain, and rose spots. Transmitted via the fecal-oral "
            "route through contaminated water and food in endemic regions."
        ),
        "habitat": "Human gastrointestinal tract",
        "diseases": ["Typhoid fever", "Bacteremia", "Intestinal perforation"],
        "treatment": "Fluoroquinolones, Third-generation cephalosporins, Azithromycin"
    },
    "Klebsiella pneumoniae": {
        "family": "Enterobacteriaceae",
        "gram": "negative",
        "shape": "rod",
        "arrangement": "single/pairs",
        "color": "#34d399",
        "tags": ["gram –", "rod", "encapsulated", "non-motile"],
        "clinical": (
            "An opportunistic pathogen with a distinctive mucoid capsule. A major cause of "
            "nosocomial pneumonia, especially in immunocompromised and alcoholic patients. "
            "Carbapenem-resistant strains (CRKP) pose a serious global health threat."
        ),
        "habitat": "Human gut, respiratory tract, environment",
        "diseases": ["Pneumonia", "UTIs", "Bacteremia", "Liver abscess"],
        "treatment": "Carbapenems (sensitive strains), Polymyxins (resistant strains)"
    },
    "Clostridium tetani": {
        "family": "Clostridiaceae",
        "gram": "positive",
        "shape": "rod",
        "arrangement": "single (drumstick)",
        "color": "#e879f9",
        "tags": ["gram +", "rod", "spore-forming", "obligate anaerobe"],
        "clinical": (
            "Produces tetanospasmin, one of the most potent toxins known to science. The toxin "
            "blocks inhibitory neurotransmitters, causing spastic paralysis. Highly preventable "
            "through the DTP vaccine."
        ),
        "habitat": "Soil, animal intestines",
        "diseases": ["Tetanus", "Neonatal tetanus", "Local tetanus"],
        "treatment": "Antitoxin, Metronidazole, Supportive care"
    },
}

# ── Simulated AI prediction (realistic for demo) ───────────────────────────────
def analyze_image(image_bytes):
    """
    In a production system, this would load your trained MobileNetV2 .h5 model.
    For demo purposes, we analyze image properties to generate realistic predictions.
    Replace this function with: model.predict(preprocessed_image)
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        img_array = np.array(img.resize((224, 224))) / 255.0

        # Use image statistics to deterministically pick a bacteria
        mean_r = float(np.mean(img_array[:, :, 0]))
        mean_g = float(np.mean(img_array[:, :, 1]))
        mean_b = float(np.mean(img_array[:, :, 2]))
        std_all = float(np.std(img_array))

        bacteria_names = list(BACTERIA_DB.keys())
        idx = int((mean_r * 3 + mean_g * 5 + mean_b * 2 + std_all * 7) * 100) % len(bacteria_names)

        # Generate confidence scores that sum to 1
        np.random.seed(int(mean_r * 1000 + mean_b * 500))
        raw_scores = np.random.dirichlet(np.ones(len(bacteria_names)) * 0.3)
        raw_scores[idx] = raw_scores[idx] + 0.6
        raw_scores = raw_scores / raw_scores.sum()

        top_indices = np.argsort(raw_scores)[::-1][:3]
        top_predictions = [
            {
                "name": bacteria_names[i],
                "confidence": round(float(raw_scores[i]) * 100, 1)
            }
            for i in top_indices
        ]

        primary = bacteria_names[top_indices[0]]
        bacteria_info = BACTERIA_DB[primary].copy()
        bacteria_info["name"] = primary
        bacteria_info["confidence"] = top_predictions[0]["confidence"]
        bacteria_info["top_predictions"] = top_predictions

        return {"success": True, "result": bacteria_info}

    except Exception as e:
        return {"success": False, "error": str(e)}


# ── Routes ─────────────────────────────────────────────────────────────────────
@app.route('/')
def index():
    return render_template('index.html')


@app.route('/api/analyze', methods=['POST'])
def analyze():
    if 'image' not in request.files:
        return jsonify({"success": False, "error": "No image provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400

    allowed = {'png', 'jpg', 'jpeg', 'tiff', 'tif', 'bmp'}
    ext = file.filename.rsplit('.', 1)[-1].lower()
    if ext not in allowed:
        return jsonify({"success": False, "error": "Invalid file type"}), 400

    image_bytes = file.read()
    result = analyze_image(image_bytes)
    return jsonify(result)


@app.route('/api/bacteria', methods=['GET'])
def get_bacteria():
    bacteria_list = [
        {"name": name, **{k: v for k, v in info.items()}}
        for name, info in BACTERIA_DB.items()
    ]
    return jsonify({"bacteria": bacteria_list})


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
