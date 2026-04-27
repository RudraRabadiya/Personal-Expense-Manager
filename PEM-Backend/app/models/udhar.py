from pydantic import BaseModel
from typing import Optional
from datetime import date

class UdharCreate(BaseModel):
    type: str           # 'gave' | 'got'
    person_name: str
    amount: float
    description: Optional[str] = ""
    date: date
    notes: Optional[str] = ""

class UdharUpdate(BaseModel):
    person_name: Optional[str] = None
    amount: Optional[float] = None
    description: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
