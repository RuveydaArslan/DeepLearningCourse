# S.A.D.S - Şüpheli Aktivite Tespit Sistemi (Suspicious Activity Detection System)

S.A.D.S (Security AI Detector System), gözetim kameraları ve ortam güvenliği için tasarlanmış, yapay zeka destekli web tabanlı bir şüpheli aktivite ve tehdit tespit sistemidir. Sistem, derin öğrenme tabanlı **YOLOv8** modelini kullanarak resim ve videolar üzerinde gerçek zamanlı analiz yapar ve kritik güvenlik ihlallerinde sesli/görsel alarmlar üreterek kullanıcıyı uyarır.

---

## 🚀 Özellikler

- **Gelişmiş Yapay Zeka Analizi:** YOLOv8 tabanlı model ile görsel veri işleme.
- **Çoklu Medya Desteği:** Fotoğraf (JPG, PNG, WEBP) ve Video (MP4, AVI, MOV) dosyaları için analiz desteği.
- **Arka Plan Video İşleme (Background Processing):** Büyük videolar arka planda işlenirken kullanıcı arayüzünü kilitlemez.
- **Gerçek Zamanlı SSE Günlüğü (Server-Sent Events):** Video işleme adımları, ilerleme yüzdesi ve anlık tespit logları anlık olarak kullanıcı paneline aktarılır.
- **Sesli ve Görsel Alarm Sistemi:** Kritik bir tehdit algılandığında dinamik görsel uyarı ekranı ve otomatik üretilen siren sesi (`alert.wav`) tetiklenir.
- **Esnek Arayüz:** Modern, karanlık tema (dark mode) odaklı, duyarlı ve kullanıcı dostu kontrol paneli.

---

## 🧠 Algılanabilir Tehdit Sınıfları

Sistem, özellikle şüpheli veya şiddet içeren aktiviteleri tanımak üzere özelleştirilmiş `Suspicious_Activities_nano.pt` modelini kullanır. Tespit edildiğinde alarm sistemini tetikleyen ana tehdit sınıfları şunlardır:

- 🔫 **Man_With_Gun** (Silahlı Kişi)
- 🔪 **Man_with_Knife** (Bıçaklı Kişi)
- 👊 **Assaulting** (Saldırı / Darp)
- 🤼 **Fighting** (Kavga / Çatışma)
- 👤 **Kidnapping** (Adam Kaçırma)
- 💣 **Terrorist_With_Time_Bomb** (Zaman Ayarlı Bombalı Terörist)
- 💰 **Theaf_Robbery** (Hırsızlık / Soygun)

> [!NOTE]  
> Model, tek başına "silah" nesnesini algılamak yerine, eylemi gerçekleştiren kişiyle silahın oluşturduğu bütünsel kompozisyonu (`Man_With_Gun` / `Man_with_Knife`) algılayacak şekilde eğitilmiştir.

---

## 🛠️ Teknoloji Yığını (Tech Stack)

- **Backend:** Python, Flask, Flask-CORS
- **Computer Vision:** OpenCV, Ultralytics YOLOv8, NumPy
- **Frontend:** HTML5, CSS3 (Cam efekti/Glassmorphism ve modern animasyonlar), Vanilla JavaScript, Lucide Icons

---

## 📋 Kurulum ve Çalıştırma

Sistemi yerel bilgisayarınızda çalıştırmak için aşağıdaki adımları takip edebilirsiniz:

### 1. Gereksinimler
Bilgisayarınızda **Python 3.8+** sürümünün kurulu olduğundan emin olun.

### 2. Projeyi Klonlayın veya İndirin
```bash
git clone <github-depo-linki>
cd security
```

### 3. Sanal Ortam (Virtual Environment) Oluşturun ve Aktifleştirin
Sanal ortam oluşturarak bağımlılıkların çakışmasını önleyin:

**Windows:**
```powershell
python -m venv .venv
.venv\Scripts\activate
```

**macOS / Linux:**
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 4. Gerekli Kütüphaneleri Yükleyin
```bash
pip install -r requirements.txt
```

### 5. Uygulamayı Başlatın
```bash
python app.py
```

Uygulama başarıyla başlatıldığında terminalde şu çıktıyı göreceksiniz:
```text
Preloading model at startup...
Model loaded successfully!
 * Running on http://127.0.0.1:5000
```

### 6. Tarayıcıda Açın
Tarayıcınızı açıp şu adrese gidin:  
👉 **[http://127.0.0.1:5000](http://127.0.0.1:5000)**

---

## 📂 Proje Yapısı

```text
security/
│
├── data/
│   └── Suspicious_Activities_nano.pt  # Eğitilmiş YOLOv8 ağırlık dosyası
│
├── static/
│   ├── audio/
│   │   └── alert.wav                  # Sistem tarafından otomatik üretilen siren sesi
│   ├── css/
│   │   └── style.css                  # Modern dashboard stilleri
│   ├── js/
│   │   └── main.js                    # SSE akışı ve UI yönetimi
│   ├── uploads/                       # Kullanıcı tarafından yüklenen ham medya dosyaları
│   └── results/                       # YOLOv8 tarafından çizilmiş tespit çıktıları
│
├── templates/
│   └── index.html                     # Kullanıcı arayüzü ana sayfası
│
├── app.py                             # Flask API ve arka plan işleme mantığı
├── requirements.txt                   # Python bağımlılıkları listesi
└── README.md                          # Proje dokümantasyonu
```

---

## 🤝 Katkıda Bulunma

1. Bu projeyi fork edin (`https://github.com/kullanici-adi/repo-adi/fork`).
2. Yeni bir özellik dalı (feature branch) oluşturun (`git checkout -b feature/yeniOzellik`).
3. Değişikliklerinizi commitleyin (`git commit -am 'Yeni özellik eklendi'`).
4. Dalı push edin (`git push origin feature/yeniOzellik`).
5. Bir Pull Request oluşturun.

---

## 📄 Lisans
Bu proje MIT Lisansı ile lisanslanmıştır. Detaylar için lisans dosyasına göz atabilirsiniz.
