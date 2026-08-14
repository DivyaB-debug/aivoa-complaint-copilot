"""
file_parser.py

Handles turning an uploaded file (PDF, TXT, EML) into plain text
so it can be fed to the same extraction prompt as pasted text.

The assignment explicitly says "Production-grade OCR is not required" -
so we just extract whatever text layer exists. If someone uploads a
scanned image-only PDF, we return an empty string and the agent will
ask the user to paste the text instead.
"""

import pdfplumber
import io
import email
from email import policy


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_chunks = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_chunks.append(page_text)
    return "\n".join(text_chunks)


def extract_text_from_eml(file_bytes: bytes) -> str:
    msg = email.message_from_bytes(file_bytes, policy=policy.default)
    body = msg.get_body(preferencelist=("plain",))
    return body.get_content() if body else ""


def extract_text_from_upload(filename: str, file_bytes: bytes) -> str:
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    elif lower.endswith(".eml"):
        return extract_text_from_eml(file_bytes)
    elif lower.endswith(".txt") or lower.endswith(".docx") is False:
        # plain text fallback
        try:
            return file_bytes.decode("utf-8", errors="ignore")
        except Exception:
            return ""
    return ""
