"""
schemas.py

This file defines the SHAPE of our data using Pydantic models.
Pydantic = a library that validates data and converts it to/from JSON automatically.

Why this matters for you: this ComplaintForm class is the SINGLE SOURCE OF TRUTH
for every field in the "Log Customer Complaint" form. Both the AI extraction
prompt and the React frontend will mirror this exact structure.
"""

from pydantic import BaseModel, Field
from typing import Optional, List


class ComplaintForm(BaseModel):
    """
    Every field starts as Optional[str] = None (or "Not Provided").
    None means "AI hasn't filled this in yet" - the frontend shows
    "Awaiting AI extraction..." for these, matching the reference UI.
    """

    # Section 1: Origin & Customer Details
    complaint_source: Optional[str] = None      # e.g. "Pharmacy", "Email", "Phone"
    customer_name: Optional[str] = None

    # Section 2: Product & Batch Identification
    product_name: Optional[str] = None
    product_strength: Optional[str] = None
    batch_lot_number: Optional[str] = None
    affected_quantity: Optional[str] = None
    manufacturing_date: Optional[str] = None
    expiry_date: Optional[str] = None

    # Section 3: Facility & Material Impact
    originating_site_block: Optional[str] = None   # e.g. "Manufacturing", "Packaging"
    impacted_npm: Optional[str] = None              # Non-Product Materials, e.g. "Primary Packaging (Bottle)"

    # Section 4: Defect Analysis
    complaint_category: Optional[str] = None        # e.g. "Product Defect - Discoloration"
    complaint_description: Optional[str] = None      # AI-synthesized formal QMS description

    # AI Copilot Risk Assessment (bonus section shown at bottom of form)
    severity_suggested: Optional[str] = None         # "Critical" / "Major" / "Minor"
    suggested_next_action: Optional[str] = None
    initial_risk_assessment: Optional[str] = None

    # Meta
    complaint_id: Optional[str] = None
    status: str = "Pending Triage"                   # "Pending Triage" -> "Ready to Commit"


class ChatMessage(BaseModel):
    role: str          # "user" or "assistant"
    content: str


class ProcessRequest(BaseModel):
    """What the frontend sends us on every chat turn."""
    message: str                                   # the new user message (pasted text or correction)
    current_state: ComplaintForm = ComplaintForm()  # the form as it currently stands
    chat_history: List[ChatMessage] = []


class ProcessResponse(BaseModel):
    """What we send back to the frontend."""
    updated_state: ComplaintForm
    assistant_message: str
    changed_fields: List[str] = []   # which fields changed this turn -> used for the highlight animation
    missing_required_fields: List[str] = []  # for the "completeness checker" bonus feature
