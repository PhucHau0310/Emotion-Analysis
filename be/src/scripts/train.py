import torch
import torch.nn as nn
from torch.utils.data import DataLoader
from torch.optim import AdamW
from transformers import get_linear_schedule_with_warmup
from tqdm import tqdm
import numpy as np
from config.config import Config
from utils.dataset import EmotionDataset
from models.emotion_classifier import EmotionClassifier

def train_model():
    # Set device
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"Using device: {device}")
    
    # Create datasets
    train_dataset = EmotionDataset(
        Config.TRAIN_PATH, 
        Config.MODEL_NAME,
        Config.MAX_LENGTH
    )
    valid_dataset = EmotionDataset(
        Config.VALID_PATH,
        Config.MODEL_NAME,
        Config.MAX_LENGTH
    )

    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=Config.TRAIN_BATCH_SIZE,
        shuffle=True
    )
    valid_loader = DataLoader(
        valid_dataset,
        batch_size=Config.VALID_BATCH_SIZE,
        shuffle=False
    )

    # Initialize model
    model = EmotionClassifier(Config.MODEL_NAME, Config.NUM_CLASSES)
    model = model.to(device)

    # Initialize optimizer and scheduler
    optimizer = AdamW(model.parameters(), lr=Config.LEARNING_RATE)
    total_steps = len(train_loader) * Config.EPOCHS
    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=0,
        num_training_steps=total_steps
    )

    # Training loop
    best_valid_loss = float('inf')
    for epoch in range(Config.EPOCHS):
        print(f'Epoch {epoch + 1}/{Config.EPOCHS}')
        
        # Training phase
        model.train()
        train_losses = []
        for batch in tqdm(train_loader, desc="Training"):
            optimizer.zero_grad()
            
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)

            outputs = model(input_ids, attention_mask)
            loss = nn.CrossEntropyLoss()(outputs, labels)
            
            loss.backward()
            optimizer.step()
            scheduler.step()
            
            train_losses.append(loss.item())

        # Validation phase
        model.eval()
        valid_losses = []
        predictions = []
        true_labels = []
        
        with torch.no_grad():
            for batch in tqdm(valid_loader, desc="Validation"):
                input_ids = batch['input_ids'].to(device)
                attention_mask = batch['attention_mask'].to(device)
                labels = batch['labels'].to(device)

                outputs = model(input_ids, attention_mask)
                loss = nn.CrossEntropyLoss()(outputs, labels)
                
                valid_losses.append(loss.item())
                
                _, preds = torch.max(outputs, dim=1)
                predictions.extend(preds.cpu().tolist())
                true_labels.extend(labels.cpu().tolist())

        # Calculate average losses and accuracy
        train_loss = np.mean(train_losses)
        valid_loss = np.mean(valid_losses)
        accuracy = sum(1 for x, y in zip(predictions, true_labels) if x == y) / len(predictions)

        print(f'Train Loss: {train_loss:.4f}')
        print(f'Valid Loss: {valid_loss:.4f}')
        print(f'Accuracy: {accuracy:.4f}')

        # Save best model
        if valid_loss < best_valid_loss:
            best_valid_loss = valid_loss
            torch.save(model.state_dict(), 'src/models/best_model.pth')
            print(f"Saved best model")
