import asyncio
import uuid
from fastapi import FastAPI, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict

app = FastAPI(title="Social Media Downloader API")

# Allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all for Vercel Serverless
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

tasks: Dict[str, dict] = {}

class ProcessRequest(BaseModel):
    url: str
    upscale: str = "1x"

async def process_media_pipeline(task_id: str, request: ProcessRequest):
    try:
        tasks[task_id] = {"status": "Starting pipeline...", "progress": 5, "result_url": None, "original_url": None}
        await asyncio.sleep(1)

        tasks[task_id] = {"status": "Downloading media from source...", "progress": 20, "result_url": None, "original_url": None}
        await asyncio.sleep(2) 
        
        tasks[task_id] = {"status": "Removing watermark with AI...", "progress": 50, "result_url": None, "original_url": None}
        await asyncio.sleep(2) 

        if request.upscale != "1x":
            tasks[task_id] = {"status": f"Upscaling media to {request.upscale}...", "progress": 75, "result_url": None, "original_url": None}
            upscale_time = 3 if request.upscale == "2x" else 5
            await asyncio.sleep(upscale_time)

        tasks[task_id] = {"status": "Finalizing and uploading result...", "progress": 95, "result_url": None, "original_url": None}
        await asyncio.sleep(1)

        tasks[task_id] = {
            "status": "Completed", 
            "progress": 100, 
            "result_url": "https://images.unsplash.com/photo-1682687982501-1e5898cb4734?auto=format&fit=crop&q=100&w=1080", 
            "original_url": "https://images.unsplash.com/photo-1682687982501-1e5898cb4734?auto=format&fit=crop&q=40&w=400&blur=10", 
        }

    except Exception as e:
        tasks[task_id] = {"status": f"Error: {str(e)}", "progress": 0, "result_url": None, "original_url": None}


@app.post("/api/process")
async def start_processing(request: ProcessRequest, background_tasks: BackgroundTasks):
    if not request.url.startswith("http"):
        raise HTTPException(status_code=400, detail="Invalid URL format provided.")

    task_id = str(uuid.uuid4())
    tasks[task_id] = {"status": "Queued", "progress": 0, "result_url": None, "original_url": None}
    
    background_tasks.add_task(process_media_pipeline, task_id, request)
    
    return {"task_id": task_id, "message": "Task received and queued."}


@app.get("/api/status/{task_id}")
async def get_task_status(task_id: str):
    if task_id not in tasks:
        raise HTTPException(status_code=404, detail="Task ID not found.")
    return tasks[task_id]
