from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
import tqdm
import ollama

class CreateEmbeddings:
    def __init__(self):
        self.neo4j_connector = Neo4jConnector(uri = "bolt://localhost:7687", user="neo4j", password="password")

    def embed_node_name(self):
        # Placeholder for embedding logic
        nodes = self.neo4j_connector.run_query("MATCH (n:NamedEntity) WHERE n.embedding IS NULL RETURN elementId(n) as id, n.name")
        for node in tqdm.tqdm(nodes, desc="Embedding node names"):
            joined_name = node['n.name'] if node['n.name'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE elementId(n) = $id SET n.embedding = $embedding",
                parameters={"id": node['id'], "embedding": embedding}
            )
        self.neo4j_connector.run_query("""
                                        CREATE VECTOR INDEX node_name_embedding_index IF NOT EXISTS
                                        FOR (n:NamedEntity) 
                                        ON (n.embedding)
                                        OPTIONS {indexConfig: {
                                        `vector.dimensions`: 1024,    
                                        `vector.similarity_function`: 'cosine'
                                        }}
                                       """)

    def embed_node_synonyms(self):
        # Placeholder for embedding logic
        nodes = self.neo4j_connector.run_query("MATCH (n:SynonymEntity) WHERE n.synonym_embedding IS NULL RETURN elementId(n) as id, n.synonyms")
        for node in tqdm.tqdm(nodes, desc="Embedding node synonyms"):
            joined_name = ", ".join(node['n.synonyms']) if node['n.synonyms'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE elementId(n) = $id SET n.synonym_embedding = $embedding",
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
        nodes = self.neo4j_connector.run_query("MATCH (n:DescriptiveEntity) WHERE n.description_embedding IS NULL RETURN elementId(n) as id, n.description")
        for node in tqdm.tqdm(nodes, desc="Embedding node descriptions"):
            joined_name = node['n.description'] if node['n.description'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE elementId(n) = $id SET n.description_embedding = $embedding",
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
        
    def set_node_labels(self):
        print("Setting node labels based on types...")
        named_entity_query = """
        MATCH (n)
        WHERE n.name IS NOT NULL AND NOT n:NamedEntity
        SET n:NamedEntity
        """
        self.neo4j_connector.run_query(named_entity_query)
        synonym_entity_query = """
        MATCH (n)
        WHERE n.synonyms IS NOT NULL AND NOT n:SynonymEntity
        SET n:SynonymEntity
        """
        self.neo4j_connector.run_query(synonym_entity_query)
        descriptive_entity_query = """
        MATCH (n)
        WHERE n.description IS NOT NULL AND NOT n:DescriptiveEntity
        SET n:DescriptiveEntity
        """
        self.neo4j_connector.run_query(descriptive_entity_query)
        
        

if __name__ == "__main__":
    embedder = CreateEmbeddings()
    #embedder.set_node_labels()
    embedder.embed_node_name()
    embedder.embed_node_synonyms()
    embedder.embed_node_descriptions()
        