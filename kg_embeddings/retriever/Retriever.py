from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
import ollama
class Retriever:
    def __init__(self):
        self.neo4j_connector = Neo4jConnector()

    def embed_query(self, query_text):
        # Placeholder for embedding logic
        ollama_response = ollama.embed(model="mxbai-embed-large:latest", input=[query_text])
        embedding = ollama_response['embeddings'][0]
        return embedding
    
    def embed_queries(self, query_texts):
        ollama_response = ollama.embed(model="mxbai-embed-large:latest", input=query_texts)
        embeddings = ollama_response['embeddings']
        return embeddings
    
    def retrieve_similar_nodes(self, query_embedding, top_k=5):
        # Placeholder for retrieval logic
        query = """
        CALL db.index.vector.queryNodes(
            "embedding_index", 
            $top_k, 
            $query_embedding
        ) 
        YIELD node, score 
        RETURN node.names as names, head(labels(node)) as label, elementId(node) as id, score
        """
        parameters = {
            "query_embedding": query_embedding,
            "top_k": top_k
        }
        results = self.neo4j_connector.run_query(query, parameters)
        return results
    
    def retrieve_all_neighboring_nodes(self, node_id, limit=10):
        ## TODO SORT BY RELEVANCE BASED ON EMBEDDING SIMILARITY TO USER QUERY, TODO SKIP BASED ON NUMBER OF EXISTING FETCHED NEIGHBORS
        query = """
        MATCH (n)-[r]->(m)
        WHERE elementId(n) = $node_id
        RETURN elementId(m) as id, m.names as names, type(r) as relationship, head(labels(m)) as label
        LIMIT $limit
        """
        parameters = {
            "node_id": node_id,
            "limit": limit
        }
        results = self.neo4j_connector.run_query(query, parameters)
        return results
    
if __name__ == "__main__":
    retriever = Retriever()
    sample_query = "sepsis"
    embedding = retriever.embed_query(sample_query)
    results = retriever.retrieve_similar_nodes(embedding, top_k=3)
    
    print("Top similar nodes:")
    for result in results:
        print(result)
        neighbors = retriever.retrieve_all_neighboring_nodes(result['id'], limit=50)
        # print("Neighboring nodes:")
        # for neighbor in neighbors:
        #     print(neighbor)