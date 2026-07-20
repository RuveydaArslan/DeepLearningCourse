from model_creation import DesertClassifier
import torch
from torchvision import transforms
import torchvision
import setup_data

MODEL_SAVE_PATH = "models/DesertClassifier.pth"

NUM_EPOCHS = 10
BATCH_SIZE = 32
HIDDEN_SIZE = 32
LEARNING_RATE = 0.001

train_dir = "data/desert101/train"
test_dir = "data/desert101/test"

data_transform = transforms.Compose(
    [
        transforms.Resize((64, 64)),
        transforms.RandomHorizontalFlip(p=0.4),
        transforms.TrivialAugmentWide(),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5483, 0.4638, 0.3865],
                             std=[0.2173, 0.2279, 0.2263])

    ]
)

train_dataloader, test_dataloader, class_names = setup_data.create_dataloaders(
    train_dir=train_dir,
    test_dir=test_dir,
    transform=data_transform,
    batch_size=BATCH_SIZE
)
loaded_model = DesertClassifier(
    input_shape=3,
    hidden_units=32,
    output_shape=len(class_names)
)

loaded_model.load_state_dict(torch.load(MODEL_SAVE_PATH))

from pathlib import Path

data_path = Path("data/")
online_image_path = data_path / "baklava-online.jpg"
single_image = torchvision.io.read_image(str(online_image_path)).type(torch.float32)
single_image = single_image / 255
single_image_transform = transforms.Compose(
    [
        transforms.Resize(size=(64,64))
    ]
)

single_image = single_image_transform(single_image)

single_image = single_image.unsqueeze(dim=0)

loaded_model.eval()
with torch.inference_mode():
    logits = loaded_model(single_image)
    probs = torch.softmax(logits,dim=1)
    pred_idx = probs.argmax(dim=1).item()

print("Predicted class: ", class_names[pred_idx])