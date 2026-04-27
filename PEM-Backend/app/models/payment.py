from pydantic import BaseModel
from typing import Optional
from datetime import date

class PaymentCreate(BaseModel):
    amount: float
    date: date
    notes: Optional[str] = ""
