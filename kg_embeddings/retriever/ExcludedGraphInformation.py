from pydantic import BaseModel
class ExcludedEdgeType(BaseModel):
    source_node_type: str
    target_node_type: str
    edge_type: str

class ExcludedNodeType(BaseModel):
    node_type: str