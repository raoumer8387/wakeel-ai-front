import os
import sys
import tempfile

# Force import from local inner whisper package
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "whisper"))

import whisper
import static_ffmpeg
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

# Add static ffmpeg paths before everything else
print("Setting up FFmpeg path using static-ffmpeg...")
try:
    static_ffmpeg.add_paths()
    print("FFmpeg paths configured successfully!")
except Exception as e:
    print(f"Warning setting up static-ffmpeg paths: {e}")

app = FastAPI(title="Whisper Voice Chat API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Whisper model once at startup to keep requests fast
# Using "tiny" (39M parameters) for CPU speed and low resource usage
MODEL_NAME = "tiny"
print(f"Loading Whisper model '{MODEL_NAME}'... (this might take a few moments on startup)")
try:
    model = whisper.load_model(MODEL_NAME, device="cpu")
    print(f"Whisper model '{MODEL_NAME}' loaded successfully!")
except Exception as e:
    print(f"Error loading model '{MODEL_NAME}': {e}")
    raise e

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "running", "model": MODEL_NAME}

@app.post("/transcribe")
async def transcribe_audio(file: UploadFile = File(...)):
    print(f"Received audio transcription request: {file.filename}")
    temp_file_path = None
    try:
        # Create a temporary file to save the uploaded audio
        suffix = os.path.splitext(file.filename)[1] or ".m4a"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name

        print(f"Saved temporary audio file to {temp_file_path}")

        # Transcribe audio using the loaded whisper model
        # We specify fp16=False to run on CPU without warnings
        print("Transcribing audio using Whisper...")
        result = model.transcribe(temp_file_path, fp16=False)
        transcription_text = result.get("text", "").strip()

        # Encode to UTF-8 to avoid UnicodeEncodeError in Windows console
        print(f"Transcription result: {transcription_text.encode('utf-8')}")

        # Delete the temporary file
        try:
            os.remove(temp_file_path)
            print("Temporary file cleaned up.")
        except Exception as err:
            print(f"Failed to delete temp file: {err}")

        return {"text": transcription_text}

    except Exception as e:
        print(f"Error during transcription: {e}")
        # Make sure we clean up the file if it exists and wasn't deleted
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.remove(temp_file_path)
            except Exception:
                pass
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat_response(request: ChatRequest):
    user_message = request.message
    # Encode to UTF-8 to avoid UnicodeEncodeError
    print(f"Generating agent response for: {user_message.encode('utf-8')}")
    response = generate_agent_response(user_message)
    return {"response": response}

def generate_agent_response(message: str) -> str:
    msg = message.lower()
    
    # Check for basic greetings
    if any(greet in msg for greet in ["hello", "hi", "hey", "greetings"]):
        return "Hello there! I'm your voice-enabled AI assistant. I can hear your voice and talk back to you! How can I help you today?"
        
    # Check for name/identity
    if "who are you" in msg or "your name" in msg:
        return "I am Antigravity AI, a smart assistant built using React Native, Expo, and a local OpenAI Whisper model. I can listen to your speech and help you with anything!"
        
    # Check for tech stack
    if "how do you work" in msg or "tech stack" in msg or "whisper" in msg:
        return "I record your voice using Expo AV in the mobile app, send the audio to a FastAPI backend server, transcribe it using the local OpenAI Whisper library running on your computer, and reply with custom AI logic. It's completely local and highly responsive!"
        
    # Helpful custom prompts
    if "help" in msg:
        return "I'm happy to help! You can speak into the microphone by holding the mic button. I will transcribe your voice into text and we can chat. Ask me anything about programming, science, or general questions!"

    if "weather" in msg:
        return "I don't have real-time internet access to check local weather, but it's always a beautiful, sunny day in the cloud! ☀️"

    # Default clever responses
    responses = [
        f"That's a fascinating question! Since you asked: '{message}', I think it shows how natural voice interactions can be. How else can I assist you with this?",
        f"I hear you loud and clear! You said: '{message}'. As your AI agent, I'm fully synchronized and ready to help. What would you like to explore next?",
        f"Fascinating! I've processed your voice input: '{message}'. Let's dive deeper into this topic. What specific questions do you have?",
        f"Thank you for sharing that! Your voice came through beautifully. Is there anything else you'd like me to solve or explain for you?"
    ]
    
    # Return a deterministic selection or simple cycle
    import random
    return random.choice(responses)

if __name__ == "__main__":
    import uvicorn
    print("Starting FastAPI server...")
    uvicorn.run(app, host="0.0.0.0", port=8000)
