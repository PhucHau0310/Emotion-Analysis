from dataclasses import dataclass

@dataclass
class Config:
    MODEL_NAME = "vinai/phobert-base"
    MAX_LENGTH = 256
    TRAIN_BATCH_SIZE = 16
    VALID_BATCH_SIZE = 16
    EPOCHS = 5
    LEARNING_RATE = 2e-5
    NUM_CLASSES = 7
    TRAIN_PATH = "src/data/train_data.xlsx"
    VALID_PATH = "src/data/valid_data.xlsx"
    TEST_PATH = "src/data/test_data.xlsx"