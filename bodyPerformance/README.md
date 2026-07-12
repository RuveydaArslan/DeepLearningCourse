# 🏋️ Body Performance AI

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)
![PyTorch](https://img.shields.io/badge/PyTorch-2.0%2B-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-3.0%2B-000000?style=for-the-badge&logo=flask&logoColor=white)

**Yapay zeka destekli fiziksel uygunluk sınıflandırma web uygulaması.**  
11 vücut ölçümü girerek derin öğrenme modelinin fiziksel uygunluk sınıfınızı tahmin etmesini sağlayın.

</div>

---

## 📌 Proje Hakkında

Bu proje, **13.393 kişilik** gerçek beden performans verisi üzerinde eğitilmiş bir **PyTorch sinir ağı** modeli kullanarak bireylerin fiziksel uygunluk düzeyini 4 kategoride sınıflandırır:

| Sınıf | Seviye | Açıklama |
|-------|--------|----------|
| 🏆 **A** | Çok İyi | Üst dilim fiziksel performans |
| 💪 **B** | İyi | Ortalamanın üzerinde performans |
| 📊 **C** | Orta | Ortalama fiziksel uygunluk |
| ⚠️ **D** | Zayıf | Gelişim gerektiren seviye |

---

## 🧠 Model Mimarisi

```
Giriş (11 özellik)
     │
     ▼
Linear(11 → 128) → BatchNorm1d → ReLU → Dropout(0.2)
     │
     ▼
Linear(128 → 256) → BatchNorm1d → ReLU → Dropout(0.3)
     │
     ▼
Linear(256 → 128) → BatchNorm1d → ReLU → Dropout(0.2)
     │
     ▼
Linear(128 → 4)
     │
     ▼
Softmax → Tahmin (A / B / C / D)
```

**Eğitim:** 300 epoch · CrossEntropyLoss · Adam optimizer  
**Veri:** 13.393 örnek

### Giriş Özellikleri

| # | Özellik | Birim |
|---|---------|-------|
| 1 | Yaş | yıl |
| 2 | Cinsiyet | 1=Erkek, 0=Kadın |
| 3 | Boy | cm |
| 4 | Kilo | kg |
| 5 | Vücut Yağ Oranı | % |
| 6 | Küçük Tansiyon (Diyastolik) | mmHg |
| 7 | Büyük Tansiyon (Sistolik) | mmHg |
| 8 | Kavrama Kuvveti | kg |
| 9 | Otur-Uzan Esneklik | cm |
| 10 | Mekik Sayısı | adet |
| 11 | Uzun Atlama | cm |

---

## 🚀 Kurulum ve Çalıştırma

### 1. Depoyu klonlayın

```bash
git clone https://github.com/RuveydaArslan/bodyPerformance.git
cd bodyPerformance
```

### 2. Sanal ortam oluşturun

```bash
# Windows
python -m venv .venv
.venv\Scripts\activate

# macOS / Linux
python3 -m venv .venv
source .venv/bin/activate
```

### 3. Bağımlılıkları yükleyin

```bash
pip install -r requirements.txt
```

> **Not:** PyTorch CPU sürümünü yüklemek için (daha küçük dosya boyutu):
> ```bash
> pip install torch --index-url https://download.pytorch.org/whl/cpu
> pip install flask
> ```

### 4. Uygulamayı başlatın

```bash
python app.py
```

### 5. Tarayıcıda açın

```
http://127.0.0.1:5000
```

---

## 📁 Proje Yapısı

```
bodyPerformance/
│
├── app.py                                     # Flask backend & model yükleme
├── requirements.txt                           # Python bağımlılıkları
├── bodyPerformance_classification_model.pth   # Eğitilmiş PyTorch modeli
│
├── templates/
│   └── index.html                             # Ana web sayfası
│
└── static/
    ├── style.css                              # Dark glassmorphism UI stilleri
    └── script.js                             # Frontend animasyonları & API
```

---

## 🌐 API Kullanımı

`POST /predict` endpoint'ine JSON gövdesiyle istek gönderin:

```bash
curl -X POST http://127.0.0.1:5000/predict \
  -H "Content-Type: application/json" \
  -d '{
    "yas": 25,
    "cinsiyet": 1,
    "boy": 175,
    "kilo": 70,
    "vucut_yag": 18,
    "kucuk_tansiyon": 80,
    "buyuk_tansiyon": 120,
    "kavrama": 40,
    "esneklik": 16,
    "mekik": 30,
    "atlama": 180
  }'
```

**Örnek Yanıt:**

```json
{
  "success": true,
  "class": "B",
  "info": {
    "label": "İyi",
    "emoji": "💪",
    "color": "#00d2ff"
  },
  "probabilities": {
    "A": 12.35,
    "B": 67.82,
    "C": 18.41,
    "D": 1.42
  }
}
```

---

## 🎨 Arayüz Özellikleri

- **Dark Glassmorphism** tasarım — yüzen ışık topları ve canvas partiküller
- **Animasyonlu olasılık çubukları** — 4 sınıfın güven skorları
- **Cinsiyet toggle** — stil butonlarla seçim
- **Sayaç animasyonu** — tahmin değerleri akıcı şekilde artar
- **Mobil uyumlu** — responsive grid layout

---

## 🛠️ Teknolojiler

- **Backend:** Python, Flask
- **Model:** PyTorch (MultiClass Neural Network)
- **Frontend:** Vanilla HTML, CSS, JavaScript
- **Font:** Inter + Space Grotesk (Google Fonts)

---

## 📄 Lisans

MIT License — dilediğiniz gibi kullanabilirsiniz.
