from pydantic import BaseModel

class InNeighborRetrieval(BaseModel):
    node_id: str
    max_neighbors: int = 10
    skip: int = 0
    topic_prompt: str = ""