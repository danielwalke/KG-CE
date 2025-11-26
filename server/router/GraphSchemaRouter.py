from fastapi import APIRouter
from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import GRAPH_SCHEMA_EP

router = APIRouter(redirect_slashes=False)

@router.get(SERVER_PREFIX + GRAPH_SCHEMA_EP)
async def get_graph_schema():
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
    return {"node_types": node_types, "edge_types": edge_types}