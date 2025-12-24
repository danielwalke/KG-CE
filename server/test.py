import neo4j
from neo4j.graph import Node, Relationship, Graph
from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
neo4j_connector = Neo4jConnector(uri = "bolt://localhost:7687", user="neo4j", password="password")
node_ids = ['e4bd8ee9-78d3-46c8-bc45-df6fcafe49ef', '4:33efcca6-b242-47c6-b6d5-43811954fdc0:317866', '4:33efcca6-b242-47c6-b6d5-43811954fdc0:317678', '4:33efcca6-b242-47c6-b6d5-43811954fdc0:62335']
graph = neo4j_connector.driver.execute_query("""MATCH (n)
        WHERE elementId(n) IN $node_ids
        OPTIONAL MATCH (n)-[r]->(m)
        WHERE elementId(m) IN $node_ids
        RETURN n, r as edge, m, head(labels(n)) AS n_label, head(labels(m)) AS m_label""", {"node_ids": node_ids}, result_transformer_=neo4j.Result.graph)
def graph_to_markdown(graph):
    mermaid_lines = ["```mermaid", "graph TD"]
    added_names = set()

    for node in graph.nodes:
        props = dict(node._properties)
        if "embedding" in props:
            del props["embedding"]
        if "synonym_embedding" in props:
            del props["synonym_embedding"]
        if "description_embedding" in props:
            del props["description_embedding"]
        if "elementId" in props:
            del props["elementId"]

        name = props.get("name", "Unknown")

        if name not in added_names:
            prop_strings = [f"**{name}**"]
            for key, value in props.items():
                if key != "name":
                    prop_strings.append(f"{key}: {value}")
            
            label_content = "<br/>".join(prop_strings)
            safe_name = str(name).replace('"', "'")
            safe_label = label_content.replace('"', "'")
            
            mermaid_lines.append(f'    "{safe_name}"["{safe_label}"]')
            added_names.add(name)

    for edge in graph.relationships:
        start_name = edge.start_node._properties.get("name", "Unknown")
        end_name = edge.end_node._properties.get("name", "Unknown")
        
        safe_start = str(start_name).replace('"', "'")
        safe_end = str(end_name).replace('"', "'")

        edge_props = dict(edge._properties)
        if "embedding" in edge_props:
            del edge_props["embedding"]
        if "elementId" in edge_props:
            del edge_props["elementId"]

        edge_label_parts = [edge.type]
        for k, v in edge_props.items():
            edge_label_parts.append(f"{k}: {v}")
        
        edge_label = "<br/>".join(edge_label_parts)
        safe_edge_label = edge_label.replace('"', "'")
        
        mermaid_lines.append(f'    "{safe_start}" -- "{safe_edge_label}" --> "{safe_end}"')

    mermaid_lines.append("```")
    return "\n".join(mermaid_lines)

for record in graph.nodes:
    del record._properties["embedding"]
    print(record._properties)
    

for edge in graph.relationships:
    nodes = edge._start_node, edge._end_node
    for node in nodes:
        print(node._properties["name"])
    print(edge.type)
    print(edge._properties)
    
markdown_output = graph_to_markdown(graph)
print(markdown_output)
