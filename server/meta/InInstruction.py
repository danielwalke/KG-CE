from pydantic import BaseModel

class InInstruction(BaseModel):
    prompt: str
    node_ids: list[str]
    previous_context: str = ""  # Optional field for previous context