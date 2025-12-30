
from neo4j.graph import Graph

def graph_to_markdown(graph) -> str:
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