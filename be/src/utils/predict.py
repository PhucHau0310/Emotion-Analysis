import torch
from transformers import AutoTokenizer
from src.models.emotion_classifier import EmotionClassifier
from src.config.config import Config

class EmotionPredictor:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained(Config.MODEL_NAME)
        self.model = EmotionClassifier(Config.MODEL_NAME, Config.NUM_CLASSES)
        self.model.load_state_dict(torch.load('src/models/best_model.pth'))
        self.model = self.model.to(self.device)
        self.model.eval()
        self.label_names = ['Anger', 'Disgust', 'Enjoyment', 'Fear', 'Sadness', 'Surprise', 'Other']

    def predict(self, text):
        # Tokenize
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=Config.MAX_LENGTH,
            padding='max_length',
            truncation=True,
            return_attention_mask=True,
            return_tensors='pt'
        )

        # Move to device
        input_ids = encoding['input_ids'].to(self.device)
        attention_mask = encoding['attention_mask'].to(self.device)

        # Get prediction
        with torch.no_grad():
            outputs = self.model(input_ids, attention_mask)
            _, preds = torch.max(outputs, dim=1)
            probabilities = torch.softmax(outputs, dim=1)

        # Get predicted emotion and probability
        predicted_emotion = self.label_names[preds.item()]
        confidence = probabilities[0][preds.item()].item()

        return {
            'emotion': predicted_emotion,
            'confidence': f'{confidence:.2%}',
            'probabilities': {
                emotion: f'{prob:.2%}'
                for emotion, prob in zip(self.label_names, probabilities[0].tolist())
            }
        }