"""
main.py

This is the FastAPI server - the "backend" that your React app talks to.
It exposes 2 endpoints:

  POST /api/complaint/process        -> handles pasted-text chat messages
  POST /api/complaint/process-file   -> handles PDF/EML file uploads

Run it with:  uvicorn main:app --reload --port 8000
Then visit http://localhost:8000/docs to test it interactively (FastAPI
auto-generates a Swagger UI - very useful while you're new to this).
"""

from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import json

from schemas import ProcessRequest, ProcessResponse, ComplaintForm
from agent import complaint_agent
from file_parser import extract_text_from_upload

load_dotenv(override=True)  # reads GROQ_API_KEY from your .env file

app = FastAPI(title="AIVOA Complaint Copilot API")

# CORS lets your React app (running on a different port, e.g. localhost:5173)
# call this API without the browser blocking it. For the demo, "*" is fine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def run_agent(message: str, current_state: dict, chat_history: list) -> dict:
    """Shared helper: invokes the LangGraph agent and returns its final state."""
    result = complaint_agent.invoke({
        "message": message,
        "current_state": current_state,
        "chat_history": chat_history,
        "extracted": {},
        "changed_fields": [],
        "missing_required_fields": [],
        "assistant_message": "",
    })
    return result


@app.post("/api/complaint/process", response_model=ProcessResponse)
def process_message(req: ProcessRequest):
    """Handles a pasted-text complaint or a correction message."""
    result = run_agent(
        message=req.message,
        current_state=req.current_state.model_dump(),
        chat_history=[m.model_dump() for m in req.chat_history],
    )

    return ProcessResponse(
        updated_state=ComplaintForm(**result["current_state"]),
        assistant_message=result["assistant_message"],
        changed_fields=result.get("changed_fields", []),
        missing_required_fields=result.get("missing_required_fields", []),
    )


@app.post("/api/complaint/process-file", response_model=ProcessResponse)
async def process_file(
    file: UploadFile = File(...),
    current_state: str = Form("{}"),   # frontend sends the current form state as a JSON string
):
    """Handles a dropped PDF/EML complaint document."""
    file_bytes = await file.read()
    extracted_text = extract_text_from_upload(file.filename, file_bytes)

    if not extracted_text.strip():
        return ProcessResponse(
            updated_state=ComplaintForm(**json.loads(current_state)),
            assistant_message=f"I couldn't extract readable text from {file.filename}. "
                               f"Could you paste the complaint text directly instead?",
            changed_fields=[],
            missing_required_fields=[],
        )

    result = run_agent(
        message=f"[Uploaded document: {file.filename}]\n{extracted_text}",
        current_state=json.loads(current_state),
        chat_history=[],
    )

    return ProcessResponse(
        updated_state=ComplaintForm(**result["current_state"]),
        assistant_message=result["assistant_message"],
        changed_fields=result.get("changed_fields", []),
        missing_required_fields=result.get("missing_required_fields", []),
    )


@app.get("/")
def health_check():
    return {"status": "AIVOA Complaint Copilot API is running"}
