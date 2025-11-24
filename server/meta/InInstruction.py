from pydantic import BaseModel

class InInstruction(BaseModel):
    prompt: str