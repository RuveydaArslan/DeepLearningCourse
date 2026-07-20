# Tatlı Sınıflandırma (Dessert Classifier) Projesi

Bu proje, PyTorch kullanarak çeşitli tatlı türlerini (baklava, cannoli, cupcake, donut) sınıflandırmak için tasarlanmış bir evrişimli sinir ağı (CNN) modelidir. Proje dosyaları modüler bir yapıda düzenlenmiştir ve veri yükleme, model oluşturma, eğitim/test işlemleri ile model kaydetme/yükleme adımlarını içerir.

## Proje Yapısı

Proje aşağıdaki dosyalardan oluşmaktadır:

*   **[setup_data.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/setup_data.py):** Eğitim ve test veri kümeleri için PyTorch `DataLoader` nesnelerini hazırlar ve sınıf isimlerini (`class_names`) döndürür.
*   **[model_creation.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/model_creation.py):** Model mimarisini tanımlar. `DesertClassifier` adında bir `nn.Module` alt sınıfı içerir. Bu model 2 adet evrişimsel blok (Conv2d, ReLU, MaxPool2d) ve bir sınıflandırıcı (Linear) katmanından oluşur.
*   **[training_testing_engine.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/training_testing_engine.py):** Modelin eğitim (`train_step`), test (`test_step`) ve genel eğitim döngüsü (`train`) işlemlerini gerçekleştiren fonksiyonları barındırır.
*   **[utils.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/utils.py):** Eğitilen modelin ağırlıklarını kaydetmek için (`save_model`) yardımcı fonksiyonlar içerir.
*   **[main.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/main.py):** Projenin ana giriş noktasıdır. Veriyi yükler, modeli oluşturur, eğitir ve eğitilen modeli `models/` klasörüne kaydeder.
*   **[load_model_make_prediction.py](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/load_model_make_prediction.py):** Kaydedilmiş modeli diskten yükler ve yeni bir görsel (`data/baklava-online.jpg`) üzerinde tahmin yürütür.
*   **[requirements.txt](file:///c:/Users/rarsl/OneDrive/Desktop/derinOgrenme/PythonComputerVisionSetup/requirements.txt):** Projenin çalışması için gerekli kütüphaneleri (PyTorch ve Torchvision) listeler.

---

## Gereksinimler ve Kurulum

Projeyi çalıştırmak için sisteminizde Python yüklü olmalıdır.

1.  **Sanal Ortam Oluşturma (İsteğe Bağlı):**
    ```bash
    python -m venv .venv
    # Windows için aktif etme:
    .venv\Scripts\activate
    # macOS/Linux için aktif etme:
    source .venv/bin/activate
    ```

2.  **Bağımlılıkların Yüklenmesi:**
    ```bash
    pip install -r requirements.txt
    ```

---

## Veri Kümesi Yapısı

Modelin eğitilebilmesi için veri kümesinin aşağıdaki dizin yapısına sahip olması gerekir:

```text
data/
└── desert101/
    ├── train/
    │   ├── baklava/
    │   ├── cannoli/
    │   ├── cup_cakes/
    │   └── donuts/
    └── test/
        ├── baklava/
        ├── cannoli/
        ├── cup_cakes/
        └── donuts/
```

---

## Kullanım Kılavuzu

### 1. Modeli Eğitme ve Kaydetme

Modeli eğitmek için `main.py` dosyasını çalıştırın. Bu dosya veri yükleyicilerini hazırlayacak, modeli tanımlayacak, 10 epoch boyunca eğitecek ve ardından eğitilen model ağırlıklarını `models/DesertClassifier.pth` dosyasına kaydedecektir.

```bash
python main.py
```

### 2. Model Yükleme ve Tahmin Etme

Eğitilmiş modeli yükleyip tek bir görsel üzerinde sınıflandırma tahmini yapmak için `load_model_make_prediction.py` dosyasını çalıştırabilirsiniz. Bu dosya varsayılan olarak `data/baklava-online.jpg` görselini okur ve modelin bu görsel için tahmin ettiği sınıfı ekrana yazdırır.

```bash
python load_model_make_prediction.py
```

---

## Model Mimarisi (`DesertClassifier`)

Model, 3 kanallı (RGB) ve 64x64 boyutundaki görselleri işlemek üzere optimize edilmiştir:

*   **Evrişimsel Blok 1 (Conv Block 1):**
    *   Conv2d (Giriş: 3 kanal, Çıkış: 32 filtre, Kernel: 3x3, Padding: 1)
    *   ReLU
    *   Conv2d (Giriş: 32, Çıkış: 32 filtre, Kernel: 3x3, Padding: 1)
    *   ReLU
    *   MaxPool2d (Kernel: 2x2, Stride: 2) -> Görsel boyutu 32x32'ye düşer.

*   **Evrişimsel Blok 2 (Conv Block 2):**
    *   Conv2d (Giriş: 32, Çıkış: 32 filtre, Kernel: 3x3, Padding: 1)
    *   ReLU
    *   Conv2d (Giriş: 32, Çıkış: 32 filtre, Kernel: 3x3, Padding: 1)
    *   ReLU
    *   MaxPool2d (Kernel: 2x2, Stride: 2) -> Görsel boyutu 16x16'ya düşer.

*   **Sınıflandırıcı Katman (Classifier Head):**
    *   Flatten
    *   Linear (Giriş: 32 * 16 * 16, Çıkış: Sınıf Sayısı)

---

## Notlar ve İpuçları
*   **Desert/Dessert İsimlendirmesi:** Projedeki klasör (`desert101`) ve sınıf isimleri (`DesertClassifier`), tatlı anlamına gelen "dessert" kelimesinin tek "s" ile (çöl anlamına gelen "desert" gibi) yazılmasıyla oluşturulmuştur. Kodların sorunsuz çalışması için dizin yollarının ve sınıf isimlerinin bu şekilde bırakılması gerekir.
*   **Veri Normalizasyonu:** Eğitim esnasında görseller `mean=[0.5483, 0.4638, 0.3865]` ve `std=[0.2173, 0.2279, 0.2263]` değerleri kullanılarak normalize edilir. Tahmin yaparken de aynı normalizasyon değerlerinin uygulanması model başarısı için önemlidir.
