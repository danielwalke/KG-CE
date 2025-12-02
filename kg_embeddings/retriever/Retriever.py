from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
import ollama
import numpy as np
from kg_embeddings.retriever.ExcludedGraphInformation import ExcludedEdgeType, ExcludedNodeType


def cosine_similarity(a, b):
    a = np.array(a, dtype=float)
    b = np.array(b, dtype=float)
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))


def rank_by_similarity(records, prompt_embedding, top_k=None):
    for rec in records:
        rec["similarity"] = cosine_similarity(rec["embedding"], prompt_embedding)

    ranked = sorted(records, key=lambda x: x["similarity"], reverse=True)

    if top_k:
        return ranked[:top_k]
    return ranked

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
    
    def retrieve_similar_nodes(self, query_embedding, top_k=5, excluded_node_types: list[ExcludedNodeType]=[]):
        # Placeholder for retrieval logic
        query = """
        CALL db.index.vector.queryNodes(
            "nameEmbeddingsIdx", 
            $top_k, 
            $query_embedding
        ) 
        YIELD node, score
        WHERE size([l IN labels(node) WHERE l IN $excluded_labels]) = 0
        RETURN reduce(s = "", x IN node.names | s + (CASE WHEN s = "" THEN "" ELSE ", " END) + x) as name, head(labels(node)) as label, elementId(node) as id, score
        """
        parameters = {
            "query_embedding": query_embedding,
            "top_k": top_k,
            "excluded_labels": [ent.node_type for ent in excluded_node_types]
        }
        results = self.neo4j_connector.run_query(query, parameters)
        return results
    
    def retrieve_subgraph(self, node_ids):
        query = """
        MATCH (n)
        WHERE elementId(n) IN $node_ids
        OPTIONAL MATCH (n)-[r]->(m)
        WHERE elementId(m) IN $node_ids
        RETURN n, r, m
        """
        parameters = {
            "node_ids": node_ids
        }
        results = self.neo4j_connector.run_query(query, parameters)
        return results
    
    def retrieve_all_neighboring_nodes(self, node_id, limit=10, skip =0, topic_prompt=None, excluded_edge_types: list[ExcludedEdgeType]=[], excluded_node_types: list[ExcludedNodeType]=[]):
        ## TODO MAYBE it make sense to use shortest path between all existing entities additionally besies cosine sim, TODO SKIP BASED ON NUMBER OF EXISTING FETCHED NEIGHBORS
        print(topic_prompt)
        if topic_prompt:
            prompt_embedding = self.embed_query(topic_prompt)
            node_exclusion_list = [f"'{ent.node_type}' IN labels(m)" for ent in excluded_node_types]
            edge_exclusion_list = [f"(type(r) = '{ent.edge_type}' AND '{ent.source_node_type}' IN labels(n) AND '{ent.target_node_type}' IN labels(m))" for ent in excluded_edge_types]

            node_exclusion_clause = f"AND NOT ({' OR '.join(node_exclusion_list)})" if node_exclusion_list else ""
            edge_exclusion_clause = f"AND NOT ({' OR '.join(edge_exclusion_list)})" if edge_exclusion_list else ""

            query = f"""
                MATCH (n)-[r]->(m)
                WHERE elementId(n) = $node_id 
                AND n.embedding IS NOT NULL
                {node_exclusion_clause} 
                {edge_exclusion_clause}
                RETURN
                    elementId(m) AS id,
                    reduce(s = "", x IN coalesce(m.names, []) | s + (CASE WHEN s = "" THEN "" ELSE ", " END) + x) as name,
                    type(r) AS relationship,
                    head(labels(m)) AS label,
                    m.embedding AS embedding
            """
        else:
            node_exclusion_list = [f"'{ent.node_type}' IN labels(m)" for ent in excluded_node_types]
            edge_exclusion_list = [f"(type(r) = '{ent.edge_type}' AND '{ent.source_node_type}' IN labels(n) AND '{ent.target_node_type}' IN labels(m))" for ent in excluded_edge_types]

            node_exclusion_clause = f"AND NOT ({' OR '.join(node_exclusion_list)})" if node_exclusion_list else ""
            edge_exclusion_clause = f"AND NOT ({' OR '.join(edge_exclusion_list)})" if edge_exclusion_list else ""

            query = f"""
                MATCH (n)-[r]->(m)
                WHERE elementId(n) = $node_id {node_exclusion_clause} {edge_exclusion_clause}
                RETURN 
                    elementId(m) as id,
                    reduce(s = "", x IN coalesce(m.names, []) | s + (CASE WHEN s = "" THEN "" ELSE ", " END) + x) as name,
                    type(r) as relationship, 
                    head(labels(m)) as label
                LIMIT $limit
            """
        parameters = {
            "node_id": node_id,
            "limit": limit
        }
        print(excluded_node_types)
        print(parameters)
        print(query)
        results = self.neo4j_connector.run_query(query, parameters)
        if topic_prompt:
            print("Ranking by similarity to topic prompt embedding")
            print(list(map(lambda x: x['name'], results)))
            results = rank_by_similarity(results, prompt_embedding, top_k=limit)
            print(list(map(lambda x: x['name'], results)))
        
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