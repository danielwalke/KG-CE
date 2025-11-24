from typing import Optional
from pydantic import BaseModel

class InTopic(BaseModel):
    prompt: str
    session_id: Optional[str] = None 
    kg_context: Optional[str] = None
    previous_context: Optional[str] = None