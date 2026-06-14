from pydantic import BaseModel
from typing import Optional
from datetime import date

class EntryCreate(BaseModel):
    type: str
    amount: float
    description: str
    category: Optional[str] = "General"
    date: date
    notes: Optional[str] = ""

class EntryUpdate(BaseModel):
    amount: float
    description: str
    category: Optional[str] = "General"
    date: date
    notes: Optional[str] = ""

