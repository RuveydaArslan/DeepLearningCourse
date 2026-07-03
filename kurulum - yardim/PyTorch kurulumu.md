Bu dokümanda Anaconda ortamı oluşturma, PyTorch kurulumu adımları bulunmaktadır.

---

# 1. Anaconda Ortamı Oluşturma

Yeni bir ortam oluştur:

```bash
conda create -n deeplearning python=3.11
```
Ortamı aktif et:

```bash
conda activate deeplearning
```

# 2. Jupyter Notebook Kurulumu

```bash
pip install notebook
```

Notebook'u başlat:

```bash
jupyter notebook
```

---

# 3. PyTorch Kurulumu

CPU sürümünü kurmak için:

```bash
pip install torch torchvision
```

Kurulumun başarılı olduğunu kontrol et:

```python
import torch

print(torch.__version__)
```

---


# 4. Kernel Oluşturma

Jupyter'ın oluşturulan ortamı görebilmesi için:

```bash
pip install ipykernel
```

Ardından:

```bash
python -m ipykernel install --user --name deeplearning --display-name "Python (DeepLearning)"
```

Jupyter yeniden açıldığında:

```
Kernel
↓
Change Kernel
↓
Python (DeepLearning)
```


seçilmelidir.

---


# 5. Kernel Çökmesi Problemi

Eğer

```
Kernel Restarting
The kernel appears to have died.
```

hatası alınıyorsa aşağıdakileri kontrol edin.

### Python sürümü

```bash
python --version
```

### PyTorch sürümü

```bash
python -c "import torch; print(torch.__version__)"
```

### Ortam

```bash
conda env list
```

### Kullanılan Python

```python
import sys

print(sys.executable)
```