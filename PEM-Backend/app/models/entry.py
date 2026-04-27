from pydantic import BaseModel
from typing import Optional
from datetime import date

class EntryCreate(BaseModel):
    type: str           # 'expense' | 'income'
    amount: float
    description: str
    category: Optional[str] = "General"
    date: date
    notes: Optional[str] = ""

class EntryUpdate(BaseModel):
    amount: Optional[float] = None
    description: Optional[str] = None
    category: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
