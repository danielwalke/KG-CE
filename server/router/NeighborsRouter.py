

from kg_embeddings.retriever.Retriever import Retriever
from fastapi import APIRouter
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import NEIGHBORS_EP
from server.meta.InNeighborRetrieval import InNeighborRetrieval

router = APIRouter(redirect_slashes=False)
@router.post(SERVER_PREFIX + NEIGHBORS_EP)
async def get_neighbors(in_neighbor_retrieval: InNeighborRetrieval):
    retriever = Retriever()
    neighbors = retriever.retrieve_all_neighboring_nodes(in_neighbor_retrieval.node_id, limit=in_neighbor_retrieval.max_neighbors)
    return {"node_id": in_neighbor_retrieval.node_id, "neighbors": neighbors}