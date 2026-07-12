from flask import Flask, render_template, request, jsonify
import torch
import torch.nn as nn
import os

app = Flask(__name__)

# ──────────────────────────────────────────────
# Model Tanımı (eğitimde kullanılan ile aynı)
# ──────────────────────────────────────────────
class MultiClassClassification(nn.Module):
    def __init__(self):
        super().__init__()
        self.linear_layers = nn.Sequential(
            nn.Linear(11, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(128, 256),
            nn.BatchNorm1d(256),
            nn.ReLU(),
            nn.Dropout(0.3),

            nn.Linear(256, 128),
            nn.BatchNorm1d(128),
            nn.ReLU(),
            nn.Dropout(0.2),

            nn.Linear(128, 4)
        )

    def forward(self, x):
        return self.linear_layers(x)


# ──────────────────────────────────────────────
# Model Yükleme
# ──────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "bodyPerformance_classification_model.pth")

model = MultiClassClassification()
try:
    # State dict olarak kaydedilmişse
    state = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    if isinstance(state, dict):
        model.load_state_dict(state)
    else:
        model = state
except Exception:
    # Tam model olarak kaydedilmişse
    model = torch.load(MODEL_PATH, map_location="cpu", weights_only=False)

model.eval()
print("[OK] Model basariyla yuklendi.")

# ──────────────────────────────────────────────
# Sabitler
# ──────────────────────────────────────────────
CLASS_INFO = {
    "A": {"label": "Çok İyi",  "emoji": "🏆", "color": "#00f5a0"},
    "B": {"label": "İyi",      "emoji": "💪", "color": "#00d2ff"},
    "C": {"label": "Orta",     "emoji": "📊", "color": "#f7971e"},
    "D": {"label": "Zayıf",   "emoji": "⚠️",  "color": "#ef4444"},
}
IDX_TO_CLASS = {0: "A", 1: "B", 2: "C", 3: "D"}

# ──────────────────────────────────────────────
# Routes
# ──────────────────────────────────────────────
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json(force=True)

        features = [
            float(data["yas"]),
            float(data["cinsiyet"]),       # 1=Erkek, 0=Kadın
            float(data["boy"]),
            float(data["kilo"]),
            float(data["vucut_yag"]),
            float(data["kucuk_tansiyon"]),
            float(data["buyuk_tansiyon"]),
            float(data["kavrama"]),
            float(data["esneklik"]),
            float(data["mekik"]),
            float(data["atlama"]),
        ]

        x = torch.tensor([features], dtype=torch.float32)

        with torch.inference_mode():
            logits = model(x)
            probs  = torch.softmax(logits, dim=1).squeeze().tolist()

        pred_idx   = int(torch.tensor(probs).argmax())
        pred_class = IDX_TO_CLASS[pred_idx]

        return jsonify({
            "success": True,
            "class":   pred_class,
            "info":    CLASS_INFO[pred_class],
            "probabilities": {
                IDX_TO_CLASS[i]: round(p * 100, 2) for i, p in enumerate(probs)
            }
        })

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


if __name__ == "__main__":
    app.run(debug=True, port=5000)
