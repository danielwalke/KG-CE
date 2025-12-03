def format_graph_for_llm(data):
    """
    Takes the list of dictionaries from neo4j_driver.session.run(query).data()
    and returns a structured Markdown string optimized for LLM comprehension.
    """
    if not data:
        return "No graph data found."

    # dictionaries to deduplicate nodes and store edges
    nodes = {}
    relationships = []

    for record in data:
        # 1. Process Source Node (n)
        n = record.get('n')
        n_label = record.get('n_label')
        print(n_label)
        if n:
            # Use element_id as unique key
            n_id = " ".join(n["ids"]) 
            n_props = dict(n)
            n_props["label"] = n_label if n_label else "Unknown"
            del n_props["ids"]  # Remove internal ids from properties
            del n_props["embedding"]  # Remove embedding from properties if exists
            print(n_props)
            if n_id not in nodes:
                nodes[n_id] = {
                    # "labels": list(n["labels"]),
                    "properties": n_props
                }

        # 2. Process Target Node (m) - might be None due to OPTIONAL MATCH
        m = record.get('m')
        m_label = record.get('m_label')
        if m:
            m_id = " ".join(m["ids"]) 
            m_props = dict(m)
            m_props["label"] = m_label if m_label else "Unknown"
            del m_props["ids"]  # Remove internal ids from properties
            del m_props["embedding"]  # Remove embedding from properties if exists

            if m_id not in nodes:
                nodes[m_id] = {
                    # "labels": list(m["labels"]),
                    "properties": m_props
                }

        # 3. Process Relationship (r)
        r = record.get('r')
        if r and n and m:
            relationships.append({
                "source": " ".join(n["ids"]),
                "target": " ".join(m["ids"]),
                "type": r[1]
            })

    # --- Construct the Markdown String ---
    output_lines = []

    # Section 1: Entities (Nodes)
    output_lines.append("## Graph Entities")
    for node_id, details in nodes.items():
        # Format: - ID: {JSON props}
        # labels = ":".join(details['labels'])
        props = details['properties']
        # We map the internal ID to the properties so the LLM can link them to edges
        output_lines.append(f"- ID: `{node_id}`: {props}")

    # Section 2: Connections (Edges)
    output_lines.append("\n## Relationships")
    if not relationships:
        output_lines.append("No relationships found between these nodes.")
    else:
        for rel in relationships:
            # Format: (ID) --[TYPE]--> (ID)
            line = (f"- `{rel['source']}` --[{rel['type']}]--> `{rel['target']}`")
            output_lines.append(line)

    return "\n".join(output_lines)