from fastapi import FastAPI
from server.router.HealthRouter import router as HealthRouter
from server.router.WebsocketRouter import router as WebsocketRouter
from server.router.NeighborsRouter import router as NeighborsRouter
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(trailing_slash=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(HealthRouter)
app.include_router(WebsocketRouter)
app.include_router(NeighborsRouter)

    





