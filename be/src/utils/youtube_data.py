from pydantic import BaseModel
from typing import List, Dict, Any
import requests

class VideoInfo(BaseModel):
    title: str
    channelTitle: str
    thumbnailUrl: str
    channelId: str

class Comment(BaseModel):
    name: str
    imgUrl: str
    comment: str
    likeCount: int
    replyCount: int
    prediction: Dict[str, Any] = None

class YouTubeAPI:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://youtube.googleapis.com/youtube/v3"

    def get_video_info(self, video_id: str) -> VideoInfo:
        video_api_url = f"{self.base_url}/videos"
        params = {
            "part": "snippet",
            "id": video_id,
            "key": self.api_key
        }
        
        response = requests.get(video_api_url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch video details")
            
        video_data = response.json()
        if not video_data.get('items'):
            raise HTTPException(status_code=404, detail="Video not found")
            
        snippet = video_data['items'][0]['snippet']
        return VideoInfo(
            title=snippet['title'],
            channelTitle=snippet['channelTitle'],
            thumbnailUrl=snippet['thumbnails']['high']['url'],
            channelId=snippet['channelId']
        )

    def get_video_comments(self, video_id: str) -> List[Comment]:
        api_url = f"{self.base_url}/commentThreads"
        params = {
            "part": "snippet",
            "order": "relevance",
            "videoId": video_id,
            "key": self.api_key
        }
        
        response = requests.get(api_url, params=params)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch YouTube comments")
            
        comments = []
        for item in response.json().get('items', []):
            snippet = item['snippet']['topLevelComment']['snippet']
            comments.append(
                Comment(
                    name=snippet['authorDisplayName'],
                    imgUrl=snippet['authorProfileImageUrl'],
                    comment=snippet['textDisplay'],
                    likeCount=snippet['likeCount'],
                    replyCount=item['snippet']['totalReplyCount']
                )
            )
        return comments
