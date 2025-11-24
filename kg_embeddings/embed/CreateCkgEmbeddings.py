from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
import tqdm
import ollama

class CreateEmbeddings:
    def __init__(self):
        self.neo4j_connector = Neo4jConnector(uri = "bolt://localhost:7689", user="neo4j", password="password")

    def embed_node_name(self):
        # Placeholder for embedding logic
        nodes = self.neo4j_connector.run_query("MATCH (n:NamedEntity) WHERE n.embedding IS NULL RETURN id(n) as id, n.name")
        for node in tqdm.tqdm(nodes, desc="Embedding node names"):
            joined_name = node['n.name'] if node['n.name'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE id(n) = $id SET n.embedding = $embedding",
                parameters={"id": node['id'], "embedding": embedding}
            )
        self.neo4j_connector.run_query("""
                                        CREATE VECTOR INDEX node_name_embedding_index IF NOT EXISTS
                                        FOR (n:NamedEntity)               // Replace 'YourLabel' with your actual label (e.g., :Document)
                                        ON (n.embedding)
                                        OPTIONS {indexConfig: {
                                        `vector.dimensions`: 1024,    // Replace with your embedding dimension (e.g., OpenAI is 1536)
                                        `vector.similarity_function`: 'cosine'
                                        }}
                                       """)

    def embed_node_synonyms(self):
        # Placeholder for embedding logic
        nodes = self.neo4j_connector.run_query("MATCH (n:SynonymEntity) RETURN id(n) as id, n.synonyms")
        for node in tqdm.tqdm(nodes, desc="Embedding node synonyms"):
            joined_name = node['n.synonyms'] if node['n.synonyms'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE id(n) = $id SET n.synonym_embedding = $embedding",
                parameters={"id": node['id'], "embedding": embedding}
            )
        self.neo4j_connector.run_query("""
                                        CREATE VECTOR INDEX node_synonym_embedding_index IF NOT EXISTS
                                        FOR (n:SynonymEntity)               // Replace 'YourLabel' with your actual label (e.g., :Document)
                                        ON (n.synonym_embedding)
                                        OPTIONS {indexConfig: {
                                        `vector.dimensions`: 1024,    // Replace with your embedding dimension (e.g., OpenAI is 1536)
                                        `vector.similarity_function`: 'cosine'
                                        }}
                                       """)
    
    def embed_node_descriptions(self):
        # Placeholder for embedding logic
        nodes = self.neo4j_connector.run_query("MATCH (n:DescriptiveEntity) RETURN id(n) as id, n.description")
        for node in tqdm.tqdm(nodes, desc="Embedding node descriptions"):
            joined_name = node['n.description'] if node['n.description'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE id(n) = $id SET n.description_embedding = $embedding",
                parameters={"id": node['id'], "embedding": embedding}
            )
        self.neo4j_connector.run_query("""
                                        CREATE VECTOR INDEX node_description_embedding_index IF NOT EXISTS
                                        FOR (n:DescriptiveEntity)               // Replace 'YourLabel' with your actual label (e.g., :Document)
                                        ON (n.description_embedding)
                                        OPTIONS {indexConfig: {
                                        `vector.dimensions`: 1024,    // Replace with your embedding dimension (e.g., OpenAI is 1536)
                                        `vector.similarity_function`: 'cosine'
                                        }}
                                       """)
        
        

if __name__ == "__main__":
    embedder = CreateEmbeddings()
    embedder.embed_node_name()
    embedder.embed_node_synonyms()
    embedder.embed_node_descriptions()
        