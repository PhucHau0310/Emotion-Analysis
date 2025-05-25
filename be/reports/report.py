from graphviz import Digraph
import os

os.environ["PATH"] += os.pathsep + r"D:\Program Files\Graphviz-12.2.1-win64\bin"

# Training Pipeline
train_dot = Digraph(comment='Emotion Analysis Training Pipeline')
train_dot.attr(rankdir='LR')

# Training nodes
train_dot.node('A1', 'Training Data\n(Excel)')
train_dot.node('B1', 'Data\nPreprocessing')
train_dot.node('C1', 'PhoBERT\nTokenizer')
train_dot.node('D1', 'Emotion\nClassifier')
train_dot.node('E1', 'Model\nTraining')
train_dot.node('F1', 'Save Best\nModel')

# Training edges - Fixed to use proper tuple format
train_dot.edge('A1', 'B1')
train_dot.edge('B1', 'C1')
train_dot.edge('C1', 'D1')
train_dot.edge('D1', 'E1')
train_dot.edge('E1', 'F1')

# Render training pipeline
train_dot.render('training_pipeline.gv', view=True, format='png')

# API Pipeline
api_dot = Digraph(comment='Emotion Analysis API Pipeline')
api_dot.attr(rankdir='LR')

# YouTube Analysis nodes
api_dot.node('A2', 'YouTube Link')
api_dot.node('B2', 'Extract\nVideo ID')
api_dot.node('C2', 'Fetch Video\nInfo & Comments')
api_dot.node('D2', 'Load Trained\nModel')
api_dot.node('E2', 'Predict\nEmotions')
api_dot.node('F2', 'JSON\nResponse')

# Text Analysis nodes
api_dot.node('G2', 'Text Input')
api_dot.node('H2', 'Tokenization')
api_dot.node('I2', 'Emotion\nPrediction')
api_dot.node('J2', 'JSON\nResponse')

# YouTube Analysis edges
api_dot.edge('A2', 'B2')
api_dot.edge('B2', 'C2')
api_dot.edge('C2', 'D2')
api_dot.edge('D2', 'E2')
api_dot.edge('E2', 'F2')

# Text Analysis edges
api_dot.edge('G2', 'H2')
api_dot.edge('H2', 'D2')
api_dot.edge('D2', 'I2')
api_dot.edge('I2', 'J2')

# Render API pipeline
api_dot.render('api_pipeline.gv', view=True, format='png')
