from fastapi import FastAPI
from pydantic import BaseModel
from src.utils.predict import EmotionPredictor
from src.utils.youtube_data import YouTubeAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

# Initialize predictor
predictor = EmotionPredictor()

# Define the input model for the API
class LinkInput(BaseModel):
    link: str

@app.post("/analyze")
async def analyze_comments_youtube(input_data: LinkInput):
    video_id = input_data.link.split("?v=")[-1]
    if not video_id:
        raise HTTPException(status_code=400, detail="Invalid YouTube link provided")
    
    ytb_api_key = os.getenv('YOUTUBE_API_KEY')
    if not ytb_api_key:
        raise HTTPException(status_code=500, detail="YouTube API key is not set")

    youtube = YouTubeAPI(ytb_api_key)
    
    try:
        # Get video info and comments
        video_info = youtube.get_video_info(video_id)
        comments = youtube.get_video_comments(video_id)
        
        # Add predictions to comments
        for comment in comments:
            comment.prediction = predictor.predict(comment.comment)
        
        return {
            "video_info": video_info,
            "comments": comments
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "Emotion Analysis API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
