from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
import tqdm
import ollama

class CreateEmbeddings:
    def __init__(self):
        self.neo4j_connector = Neo4jConnector()

    def embed_nodes(self):
        nodes = self.neo4j_connector.run_query("MATCH (n:BioConcept) RETURN elementId(n) as id, n.names")
        for node in tqdm.tqdm(nodes, desc="Embedding nodes"):
            joined_name = ", ".join(node['n.names']) if node['n.names'] else "Unknown"
            response = ollama.embed(model="mxbai-embed-large:latest", input=[joined_name])
            embedding = response['embeddings'][0]
            self.neo4j_connector.run_query(
                "MATCH (n) WHERE elementId(n) = $id SET n.embedding = $embedding",
                parameters={"id": node['id'], "embedding": embedding}
            )

    def embed_nodes_fast(self, batch_size=64):
        print("Embedding nodes in batches...")
        nodes = self.neo4j_connector.run_query("MATCH (n:BioConcept) WHERE n.names IS NOT NULL RETURN elementId(n) as id, n.names")
        
        current_batch = []
        
        for node in tqdm.tqdm(nodes, desc="Embedding nodes (Batch)"):
            joined_name = ", ".join(node['n.names']) if node['n.names'] else "Unknown"
            current_batch.append({
                "id": node['id'],
                "text": joined_name
            })
            
            if len(current_batch) >= batch_size:
                self._process_batch(current_batch)
                current_batch = []
        
        if current_batch:
            self._process_batch(current_batch)

    def _process_batch(self, batch_data):
        
        texts = [item["text"] for item in batch_data]
        
        response = ollama.embed(model="mxbai-embed-large:latest", input=texts)
        embeddings = response['embeddings']
        
        update_params = []
        for i, item in enumerate(batch_data):
            update_params.append({
                "id": item["id"], 
                "embedding": embeddings[i]
            })

        query = """
        UNWIND $batch as row
        MATCH (n) WHERE elementId(n) = row.id
        SET n.embedding = row.embedding
        """
        
        self.neo4j_connector.run_query(query, parameters={"batch": update_params})
        
    def cleanup_unmapped_nodes(self):
        cleanup_query = """
        MATCH (sAgg)<-[m1:MAPPED_TO]-(s)-[r]-(t)-[m2:MAPPED_TO]->(tAgg)
        WHERE id(sAgg) <> id(tAgg) AND id(s) <> id(sAgg) AND id(t) <> id(tAgg)
        CALL {
            WITH s, t
            DETACH DELETE s, t
        } IN TRANSACTIONS OF 2000 ROWS
        """
        self.neo4j_connector.run_query(cleanup_query)
        
    def addBioConceptLabelToAllNodes(self):
        print("Adding BioConcept label to all nodes with names...")
        query = """
        MATCH (n)
        WHERE n.names IS NOT NULL AND NOT n:BioConcept
        SET n:BioConcept
        """
        self.neo4j_connector.run_query(query)
        
    def createVectorIndex(self):
        print("Creating vector index on BioConcept nodes...")
        index_query = """
        CREATE VECTOR INDEX nameEmbeddingsIdx IF NOT EXISTS FOR (n:BioConcept) ON (n.embedding) OPTIONS { indexConfig: {
        `vector.dimensions`: 1024,
        `vector.similarity_function`: 'cosine'
        }}
        """
        self.neo4j_connector.run_query(index_query)

if __name__ == "__main__":
    embedder = CreateEmbeddings()
    # embedder.cleanup_unmapped_nodes()
    #embedder.addBioConceptLabelToAllNodes()
    embedder.embed_nodes_fast()
    embedder.createVectorIndex()
    