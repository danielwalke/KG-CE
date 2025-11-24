from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
import tqdm
import ollama

class CreateEmbeddings:
    def __init__(self):
        self.neo4j_connector = Neo4jConnector()

    def embed_nodes(self):
        # Placeholder for embedding logic
        nodes = self.neo4j_connector.run_query("MATCH (n) RETURN elementId(n) as id, n.names")
        for node in tqdm.tqdm(nodes, desc="Embedding nodes"):
            joined_name = ", ".join(node['n.names']) if node['n.names'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE elementId(n) = $id SET n.embedding = $embedding",
                parameters={"id": node['id'], "embedding": embedding}
            )
        
        

if __name__ == "__main__":
    embedder = CreateEmbeddings()
    embedder.embed_nodes()
        