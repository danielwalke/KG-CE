from pydantic import BaseModel

class InInstruction(BaseModel):
    prompt: str
    node_ids: list[str]