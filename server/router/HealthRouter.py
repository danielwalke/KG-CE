
from fastapi import APIRouter
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import HEALTH_EP

router = APIRouter(redirect_slashes=False)

@router.get(SERVER_PREFIX + HEALTH_EP)
async def health_check():
    return {"status": "ok"}