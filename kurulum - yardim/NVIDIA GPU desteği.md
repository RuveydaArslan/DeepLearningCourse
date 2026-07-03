Bu dokümanda NVIDIA GPU desteğini etkinleştirme adımları bulunmaktadır.





\# 1. NVIDIA GPU Kontrolü



Bilgisayarda NVIDIA ekran kartı olup olmadığını kontrol etmek için:



```bash

nvidia-smi

```



Örnek çıktı:



```

NVIDIA GeForce RTX 4060 Laptop GPU

CUDA Version: 13.1

```



\---



\# 2. GPU Destekli PyTorch Kurulumu



Önce CPU sürümünü kaldır:



```bash

pip uninstall torch torchvision

```



Ardından GPU destekli sürümü yükle:



```bash

pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128

```



\---



\# 3. GPU'nun Çalıştığını Kontrol Etme



```python

import torch



print(torch.\_\_version\_\_)

print(torch.version.cuda)

print(torch.cuda.is\_available())

print(torch.cuda.get\_device\_name(0))

```



Beklenen çıktı:



```

2.11.0+cu128

12.8

True

NVIDIA GeForce RTX 4060 Laptop GPU

```



\---





\# 4. Jupyter Notebook'u Doğru Şekilde Açma



Her çalışmada:



```bash

conda activate deeplearning

```



daha sonra



```bash

jupyter notebook

```



Notebook açıldıktan sonra kernel olarak:



```

Python (DeepLearning)

```



seçilmelidir.



\---



\# 5. GPU Kullanımı



GPU'nun kullanılabilir olup olmadığını kontrol et:



```python

device = "cuda" if torch.cuda.is\_available() else "cpu"



print(device)

```



Modeli GPU'ya taşı:



```python

model = model.to(device)

```



Veriyi GPU'ya taşı:



```python

x = x.to(device)

```





