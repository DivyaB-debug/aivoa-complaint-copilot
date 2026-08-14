# AIVOA Complaint Copilot - Setup Guide

This is a starter build for the AIVOA AI Product Engineer assignment.
It's functional but you WILL want to test it, tweak prompts, and add your
own sample data before recording your demo video.

## Prerequisites (install once)
- Python 3.10+ (`python3 --version` to check)
- Node.js 18+ (`node --version` to check)
- A free Groq API key: https://console.groq.com/keys

---

## PART 1: Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate          # on Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Now set up your API key:
```bash
cp .env.example .env
```
Open `.env` in a text editor and paste your real Groq key in place of `your_groq_api_key_here`.

Run the server:
```bash
uvicorn main:app --reload --port 8000
```

Visit **http://localhost:8000/docs** in your browser — this is FastAPI's
auto-generated test UI. You can try the `/api/complaint/process` endpoint
right there before touching the frontend, by clicking "Try it out" and
pasting sample JSON like:
```json
{
  "message": "Apollo Pharmacy reported discolored capsules in Amoxicillin Capsules 500mg, batch AMX240602",
  "current_state": {},
  "chat_history": []
}
```
If you get a JSON response back with fields filled in, your backend + Groq + LangGraph pipeline is working.

---

## PART 2: Frontend Setup

Open a NEW terminal tab (keep the backend running in the first one):
```bash
cd frontend
npm install
npm run dev
```

Visit **http://localhost:5173** — you should see the two-panel UI.

Try:
1. Paste a complaint sentence in the chat box, hit Send
2. Watch the form fields populate with a blue highlight
3. Send a correction like "actually the batch number is XYZ123"
4. Upload the sample PDF from `sample_complaints/sample_complaint_1.pdf`

---

## PART 3: What to Customize Before Submitting

1. **Test extraction quality** — paste 5-10 different complaint messages,
   check if fields extract correctly. Tweak the prompt in `agent.py` inside
   `extract_fields()` if results are off.
2. **Generate more sample PDFs** — create 2-3 more realistic pharma complaint
   documents (different products, defect types) for your demo video.
3. **Add the second bonus feature if you have time** — Duplicate Complaint
   Detection is the next-easiest. You'd add a new LangGraph node that embeds
   the complaint description and compares it against past ones (can even
   just do a simple keyword/fuzzy-match for the demo instead of real embeddings).
4. **Database** — this starter keeps state in the browser (Redux) and doesn't
   persist to Postgres/MySQL yet. If you have time, add a `save_complaint()`
   function in `main.py` using `psycopg2` (Postgres) or `SQLAlchemy`. If you're
   short on time, it's fine to mention in your video that persistence is
   the next step, and show the schema you'd use (see `schemas.py` — it maps
   directly to a table).

---

## PART 4: Deploy (Free Tiers)

- **Backend** → https://render.com — New Web Service, connect your GitHub
  repo, set root directory to `backend/`, start command:
  `uvicorn main:app --host 0.0.0.0 --port $PORT`. Add `GROQ_API_KEY` as an
  environment variable in Render's dashboard (don't commit your .env file).
- **Frontend** → https://vercel.com — import repo, set root directory to
  `frontend/`, add environment variable `VITE_API_BASE` = your Render backend URL.

---

## PART 5: Before You Record Your Demo Videos

**Video 1 (live demo, 5-10 min):**
1. Paste a complaint → show extraction
2. Send a correction → show the field updating in place
3. Upload the sample PDF → show extraction + risk assessment card appearing
4. Point out the completeness checker flagging any missing fields

**Video 2 (code walkthrough):**
1. Start at `CopilotChat.jsx` — show the `handleSend` function
2. Jump to `main.py` — show the `/api/complaint/process` endpoint
3. Walk through `agent.py`'s 5 LangGraph nodes in order — this is the part
   they most want to see explained, since it's the "AI Agent Framework" requirement
4. Show `merge_with_state()` specifically — explain why it patches instead
   of overwrites (this is what makes corrections work)
5. End back at the frontend showing the form update

---

## Project Structure
```
backend/
  main.py          <- FastAPI routes
  agent.py          <- LangGraph agent (5 nodes)
  schemas.py         <- Pydantic models (the form's field definitions)
  file_parser.py       <- PDF/EML text extraction
frontend/
  src/
    store.js         <- Redux store
    api.js            <- calls to backend
    App.jsx
    components/
      ComplaintForm.jsx  <- left panel
      CopilotChat.jsx    <- right panel
sample_complaints/
  sample_complaint_1.pdf <- test file for uploads
```
