"""
YOLO26 ile webcam uzerinden gercek zamanli nesne algilama.
Cikmak icin 'q' tusuna basin.
"""

from ultralytics import YOLO
import cv2


def main():
    # YOLO26 nano modeli (hafif ve hizli). Ilk calistirmada otomatik indirilir.
    model = YOLO("yolo26n.pt")

    # 0 = varsayilan webcam
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Webcam acilamadi. Kameranin bagli oldugundan emin olun.")
        return

    print("Webcam acildi. Cikmak icin 'q' tusuna basin.\n")

    last_printed = set()

    while True:
        ok, frame = cap.read()
        if not ok:
            print("Kare okunamadi.")
            break

        results = model(frame, verbose=False)
        result = results[0]

        names = result.names
        detected = set()

        if result.boxes is not None and len(result.boxes):
            for cls_id in result.boxes.cls.tolist():
                detected.add(names[int(cls_id)])

        # Yeni veya degisen nesneleri terminale yazdir
        if detected != last_printed:
            if detected:
                print("Algilanan:", ", ".join(sorted(detected)))
            else:
                print("Algilanan: (nesne yok)")
            last_printed = detected

        annotated = result.plot()
        cv2.imshow("YOLO26 Detection", annotated)

        if cv2.waitKey(1) & 0xFF == ord("q"):
            break

    cap.release()
    cv2.destroyAllWindows()
    print("Program kapandi.")


if __name__ == "__main__":
    main()
