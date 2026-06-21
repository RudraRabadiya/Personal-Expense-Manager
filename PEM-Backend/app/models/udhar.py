from pydantic import BaseModel
from typing import Optional
from datetime import date

class UdharCreate(BaseModel):
    type: str
    person_name: str
    amount: float
    description: Optional[str] = ""
    date: date
    due_date: Optional[date] = ""
    notes: Optional[str] = ""

class UdharUpdate(BaseModel):
        person_name: str
        amount: float
        description: Optional[str] = ""
        date: date
        due_date: Optional[date] = ""
        notes: Optional[str] = ""
