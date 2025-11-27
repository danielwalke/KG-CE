from fastapi import APIRouter
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import GRAPH_SCHEMA_EP
from fastapi import Request

router = APIRouter(redirect_slashes=False)

@router.get(SERVER_PREFIX + GRAPH_SCHEMA_EP)
async def get_graph_schema(request: Request):
    print(request.app.state)
    print(request.app.state.graph_schema)  
    return request.app.state.graph_schema    