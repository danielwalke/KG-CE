from typing import Optional
from kg_embeddings.retriever.ExcludedGraphInformation import ExcludedNodeType, ExcludedEdgeType
from pydantic import BaseModel, ConfigDict


class InTopic(BaseModel):
    prompt: str
    session_id: Optional[str] = None 
    kg_context: Optional[str] = None
    previous_context: Optional[str] = None
    excluded_node_types: list[ExcludedNodeType] = []
    excluded_edge_types: list[ExcludedEdgeType] = []

    model_config = ConfigDict(
        arbitrary_types_allowed=True
    )