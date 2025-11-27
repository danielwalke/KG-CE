from fastapi import FastAPI
from server.router.HealthRouter import router as HealthRouter
from server.router.WebsocketRouter import router as WebsocketRouter
from server.router.NeighborsRouter import router as NeighborsRouter
from server.router.TopicRouter import router as TopicRouter
from server.router.GraphSchemaRouter import router as GraphSchemaRouter
from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
from fastapi.middleware.cors import CORSMiddleware
app = FastAPI(trailing_slash=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this to your frontend's origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    print("Starting up the server...")
    neo4j_connector = Neo4jConnector()
    neo4j_schema_query = """
    MATCH (a)-[r]->(b)
    RETURN DISTINCT 
    head(labels(a)) AS StartNodeType, 
    type(r) AS EdgeType, 
    head(labels(b)) AS TargetNodeType
    ORDER BY StartNodeType, EdgeType
    """
    results = neo4j_connector.run_query(neo4j_schema_query)
    edge_types = []
    node_types_set = set()
    for record in results:
        start_node_type = record["StartNodeType"]
        edge_type = record["EdgeType"]
        target_node_type = record["TargetNodeType"]
        edge_types.append({
            "start_node_type": start_node_type,
            "edge_type": edge_type,
            "target_node_type": target_node_type
        })
        node_types_set.add(start_node_type)
        node_types_set.add(target_node_type)
    node_types = list(node_types_set)
    app.state.graph_schema = {"node_types": node_types, "edge_types": edge_types}

app.include_router(HealthRouter)
app.include_router(WebsocketRouter)
app.include_router(NeighborsRouter)
app.include_router(TopicRouter)
app.include_router(GraphSchemaRouter)
    





