

from kg_embeddings.retriever.Retriever import Retriever
# from kg_embeddings.retriever.CkgRetriever import Retriever
from fastapi import APIRouter, Request
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import NEIGHBORS_EP
from server.meta.InNeighborRetrieval import InNeighborRetrieval

router = APIRouter(redirect_slashes=False)
@router.post(SERVER_PREFIX + NEIGHBORS_EP)
async def get_neighbors(request: Request, in_neighbor_retrieval: InNeighborRetrieval):
    retriever = request.app.state.retriever
    neighbors = retriever.retrieve_all_neighboring_nodes(in_neighbor_retrieval.node_id, limit=in_neighbor_retrieval.max_neighbors, skip=in_neighbor_retrieval.skip, topic_prompt=in_neighbor_retrieval.topic_prompt, excluded_edge_types=in_neighbor_retrieval.excluded_edge_types, excluded_node_types=in_neighbor_retrieval.excluded_node_types)
    return {"node_id": in_neighbor_retrieval.node_id, "neighbors": neighbors}