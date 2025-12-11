
from kg_embeddings.connector.Neo4jConnector import Neo4jConnector


class Neo4jConnectorRouter:
    def __init__(self):
        pass
    
    def get_metaprot_connector(self):
        return Neo4jConnector(uri="bolt://localhost:8083", user="", password="")
    
    def get_ckg_connector(self):
        return Neo4jConnector(uri="bolt://localhost:7687", user="neo4j", password="password")
    
    