from collections import defaultdict

def describe_graph(graph, n=5):
    nodes_by_type = defaultdict(list)
    for node in graph.nodes:
        print(node)
        node.type = ", ".join(node.labels)
        nodes_by_type[node.type].append(node)

    edges_by_type = defaultdict(list)
    for edge in graph.relationships:
        edges_by_type[edge.type].append(edge)

    lines = []
    lines.append(f"Graph Document | Total Nodes: {len(graph.nodes)} | Total Edges: {len(graph.relationships)}")
    lines.append("=" * 60)

    for node_type, nodes in nodes_by_type.items():
        sample = nodes[:n] if n is not None else nodes
        lines.append(f"Nodes ({node_type}) - Showing {len(sample)} of {len(nodes)}:")
        
        for i, node in enumerate(sample):
            props = dict(node._properties)
            if "embedding" in props:
                del props["embedding"]
            lines.append(f"  {i+1}. {props}")
        lines.append("") 

    lines.append("-" * 60)

    for edge_type, edges in edges_by_type.items():
        sample = edges[:n] if n is not None else edges
        lines.append(f"Relationships ({edge_type}) - Showing {len(sample)} of {len(edges)}:")
        
        for i, edge in enumerate(sample):
            start_name = edge.start_node._properties.get("name", "Unknown")
            end_name = edge.end_node._properties.get("name", "Unknown")
            
            props = dict(edge._properties)
            if "embedding" in props:
                del props["embedding"]
            if "elementId" in props:
                del props["elementId"]
                
            props_str = f" | Properties: {props}" if props else ""
            lines.append(f"  {i+1}. ({start_name}) -[{edge.type}]-> ({end_name}){props_str}")
        lines.append("")

    return "\n".join(lines)