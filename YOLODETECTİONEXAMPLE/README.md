# YOLO ile Gerçek Zamanlı Nesne Algılama

Bu proje, **Ultralytics YOLO** ve **OpenCV** kütüphanelerini kullanarak bilgisayarınızın web kamerasından (webcam) gerçek zamanlı nesne algılama yapmanızı sağlar. Algılanan nesneleri hem görsel pencere üzerinde kutucuklarla (bounding box) gösterir hem de terminal/konsol ekranında anlık olarak listeler.

---

## 🚀 Özellikler

* **Gerçek Zamanlı Algılama:** Kamera akışındaki nesneleri anlık olarak yüksek FPS ile tespit eder.
* **YOLO26 Nano Modeli:** Hafif (`yolo26n.pt` - yaklaşık 5.5 MB) ve hızlı bir model kullanır. Düşük sistem kaynaklarıyla bile akıcı çalışır.
* **Akıllı Konsol Çıktısı:** Sadece yeni bir nesne algılandığında veya algılanan nesneler değiştiğinde terminale çıktı yazarak ekran kirliliğini önler.
* **Kolay Kontrol:** Görsel arayüz açıkken klavyeden `q` tuşuna basarak uygulamayı güvenli bir şekilde kapatabilirsiniz.

---

## 🛠️ Gereksinimler

Projenin çalışması için bilgisayarınızda **Python 3.8+** sürümünün yüklü olması önerilir. Gerekli kütüphaneler:

* `ultralytics` (YOLO modelinin çalıştırılması için)
* `opencv-python` (Kamera erişimi ve görüntü işleme için)

---

## 📦 Kurulum ve Kurulum Adımları

Projenin bağımlılıklarını izole bir ortamda çalıştırmak için aşağıdaki adımları sırasıyla uygulayabilirsiniz:

### 1. Depoyu/Klasörü Açın
Proje klasörünün içine terminal veya PowerShell ile giriş yapın:
```bash
cd YOLODETECTİONEXAMPLE
```

### 2. Sanal Ortam (Virtual Environment) Oluşturun
Python projelerinde kütüphane çakışmalarını önlemek için sanal ortam kullanılması önerilir:
```bash
# Sanal ortam oluşturma
python -m venv .venv

# Sanal ortamı aktifleştirme (Windows için)
.venv\Scripts\activate

# Sanal ortamı aktifleştirme (macOS/Linux için)
source .venv/bin/activate
```

### 3. Bağımlılıkları Yükleyin
`requirements.txt` dosyasındaki kütüphaneleri yükleyin:
```bash
pip install -r requirements.txt
```

---

## 🖥️ Çalıştırma

Kurulum adımlarını tamamladıktan sonra projeyi başlatmak için şu komutu çalıştırın:

```bash
python main.py
```

### Kullanım İpuçları:
* Kamera açıldığında gerçek zamanlı nesne algılama penceresi ekrana gelecektir.
* Kamerayı kapatmak ve programdan çıkmak için nesne tespiti yapılan pencere seçiliyken klavyenizden **`q`** tuşuna basmanız yeterlidir.

---

## 📁 Proje Yapısı

```text
YOLODETECTİONEXAMPLE/
│
├── .venv/               # Python sanal ortam klasörü (oluşturulduysa)
├── main.py              # Uygulamanın ana kaynak kodu (kamera okuma, algılama ve görselleştirme)
├── requirements.txt     # Gerekli Python kütüphaneleri listesi
├── yolo26n.pt           # YOLO nano ağırlık/model dosyası
└── README.md            # Proje açıklama dokümanı (bu dosya)
```

---

## 📝 Kod Açıklaması

[main.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/YOLODETECT%C4%B0ONEXAMPLE/main.py) dosyası şu adımları gerçekleştirir:
1. `model = YOLO("yolo26n.pt")` ifadesiyle nesne tespiti modelini belleğe yükler.
2. `cv2.VideoCapture(0)` ile varsayılan kameradan görüntü akışı başlatır.
3. Her kare (`frame`) YOLO modelinden geçirilerek nesneler tespit edilir.
4. Tespit edilen nesnelerin isimleri benzersiz bir kümede (`set`) tutulur ve sadece değişiklik olduğunda konsola yazdırılır.
5. Görsel çıktı `cv2.imshow` ile ekrana yansıtılır.
