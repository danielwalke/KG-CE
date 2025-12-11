
from kg_embeddings.connector.Neo4jConnectorRouter import Neo4jConnectorRouter
from kg_embeddings.retriever.CkgRetriever import Retriever as CkgRetriever
from kg_embeddings.retriever.Retriever import Retriever as MetaprotRetriever

AVAILABLE_KGS = ['ckg', "metaprot"]

class Neo4Router:
    def __init__(self, kg_name):        
        self.kg_name = kg_name
        
    def get_neo4j_connector(self):
        connector_router = Neo4jConnectorRouter()
        if self.kg_name == 'ckg':
            neo4j_connector = connector_router.get_ckg_connector()
        elif self.kg_name == 'metaprot':
            neo4j_connector = connector_router.get_metaprot_connector()
        else:
            raise ValueError(f"Unknown KG name: {self.kg_name}")
        return neo4j_connector
    
    def get_retriever(self):        
        if self.kg_name == 'ckg':
            return CkgRetriever()
        elif self.kg_name == 'metaprot':
            return MetaprotRetriever()
        else:
            raise ValueError(f"Unknown KG name: {self.kg_name}")