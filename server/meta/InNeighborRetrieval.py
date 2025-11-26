from kg_embeddings.retriever.ExcludedGraphInformation import ExcludedEdgeType, ExcludedNodeType
from pydantic import BaseModel, ConfigDict

class InNeighborRetrieval(BaseModel):
    node_id: str
    max_neighbors: int = 10
    skip: int = 0
    topic_prompt: str = ""
    excluded_node_types: list[ExcludedNodeType]=[]
    excluded_edge_types: list[ExcludedEdgeType]=[]

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )