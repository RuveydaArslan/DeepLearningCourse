\## ⚠️ Karşılaşılan Sorunlar



\### ⛔ Kernel Restarting



<details>

<summary>Çözümü Gör</summary>



\*\*Belirti\*\*



```text

Kernel Restarting

The kernel appears to have died.

```



\*\*Kontrol Edilecekler\*\*



\- \[ ] Doğru conda ortamı aktif mi?



```bash

conda activate deeplearning

```



\- \[ ] Jupyter doğru kernel ile mi açıldı?



```

Python (DeepLearning)

```



\- \[ ] PyTorch doğru ortamda kurulu mu?



```bash

python -c "import torch; print(torch.\_\_version\_\_)"

```



</details>



\---



\### ⛔ ModuleNotFoundError: No module named 'torch'



<details>

<summary>Çözümü Gör</summary>



\*\*Kontrol Edilecekler\*\*



\- \[ ] Doğru conda ortamı aktif mi?



```bash

conda activate deeplearning

```



\- \[ ] PyTorch kurulu mu?



```bash

pip install torch torchvision

```



\- \[ ] Jupyter doğru kernel'i kullanıyor mu?



</details>



\---



\### ⛔ torch.cuda.is\_available() → False



<details>

<summary>Çözümü Gör</summary>



\*\*Olası Nedenler\*\*



\- \[ ] CPU sürümü (`+cpu`) kurulu olabilir.

\- \[ ] NVIDIA ekran kartı olmayabilir.

\- \[ ] NVIDIA sürücüsü kurulu olmayabilir.

\- \[ ] CUDA destekli PyTorch kurulu olmayabilir.



\*\*Kontrol\*\*



```bash

nvidia-smi

```



```python

import torch



print(torch.\_\_version\_\_)

print(torch.version.cuda)

print(torch.cuda.is\_available())

```



GPU destekli sürümü yüklemek için:



```bash

pip uninstall torch torchvision

```



```bash

pip install torch torchvision --index-url https://download.pytorch.org/whl/cu128

```



</details>



\---



\### ⛔ OMP: Error #15



<details>

<summary>Çözümü Gör</summary>



\*\*Belirti\*\*



```text

OMP: Error #15: Initializing libiomp5md.dll...

```



\*\*Kontrol Edilecekler\*\*



\- \[ ] Aynı ortamda birden fazla OpenMP kütüphanesi bulunuyor olabilir.

\- \[ ] PyTorch'un doğru ortamda kurulu olduğundan emin ol.

\- \[ ] Gerekirse PyTorch'u kaldırıp yeniden kur.



Geçici çözüm (önerilmez):



```python

import os



os.environ\["KMP\_DUPLICATE\_LIB\_OK"] = "TRUE"

```



Bu yöntem yalnızca sorunun kaynağını tespit etmek için kullanılmalıdır.



</details>



\---



\### ⛔ NVIDIA GPU Algılanmıyor



<details>

<summary>Çözümü Gör</summary>



Kontrol:



```bash

nvidia-smi

```



Eğer komut çalışmıyorsa:



\- \[ ] NVIDIA sürücüsü kurulu mu?

\- \[ ] Bilgisayarda NVIDIA ekran kartı var mı?

\- \[ ] Sürücü güncel mi?



</details>



\---



\### ⛔ Python Ortamı Karışıklığı



<details>

<summary>Çözümü Gör</summary>



Aktif Python yorumlayıcısını kontrol et:



```python

import sys



print(sys.executable)

```



Beklenen örnek çıktı:



```text

C:\\Users\\...\\anaconda3\\envs\\deeplearning\\python.exe

```



Conda ortamlarını listelemek için:



```bash

conda env list

```



</details>



\---



\### ⛔ Jupyter Kernel Görünmüyor



<details>

<summary>Çözümü Gör</summary>



`ipykernel` kur:



```bash

pip install ipykernel

```



Kernel oluştur:



```bash

python -m ipykernel install --user --name deeplearning --display-name "Python (DeepLearning)"

```



Kontrol:



```bash

jupyter kernelspec list

```



</details>

