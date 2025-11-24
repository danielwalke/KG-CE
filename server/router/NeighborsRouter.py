

from kg_embeddings.retriever.Retriever import Retriever
from fastapi import APIRouter
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import NEIGHBORS_EP


router = APIRouter(redirect_slashes=False)
@router.get(SERVER_PREFIX + NEIGHBORS_EP + "/{node_id}/{limit}")
async def get_neighbors(node_id: str, limit: int = 10):
    retriever = Retriever()
    neighbors = retriever.retrieve_all_neighboring_nodes(node_id, limit=limit)
    return {"node_id": node_id, "neighbors": neighbors}