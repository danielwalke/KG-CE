import traceback
from typing import Any, Dict, Optional
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
from server.utils.SampledSubgraphDocu import describe_graph

# --- CONSTANTS & CONFIGURATION ---

# The specific schema documentation you provided
SCHEMA_DOCS = """
# Neo4j Graph Object Documentation
The `Graph` object serves as a container for graph data.

## Nested Objects
### 1. `Node`
Accessed via iteration over `graph.nodes`.
- `_properties` (Dict[str, Any]): Data stored on the node (e.g., name, id).
- `elementId` (str): Unique identifier.

### 2. `Relationship`
Accessed via iteration over `graph.relationships`.
- `start_node` (Node): Origin node.
- `end_node` (Node): Target node.
- `type` (str): Label (e.g., "KNOWS").
- `_properties` (Dict[str, Any]): Metadata specific to the edge.
"""

# Prompt to generate the initial code
GEN_PROMPT_TEMPLATE = """
You are a Python Expert.
Your task is to write a Python function named `analyze_graph_data(graph)` that answers a user query.

**Input:**
- `graph`: A Python object containing `nodes` and `relationships`.
- User Query: "{user_query}"
- Samples subgraph with 5 nodes and 5 relationships: "{subgraph_sample}"

**Your Goal:**
1. Iterate over `graph.nodes` and `graph.relationships` to find data relevant to the query.
2. Use `node._properties.get('key')` or `relationship._properties.get('key')` to access data safely or relationship.type to access the relationship type, relationship.start_node and relationship.end_node to access connected nodes. 
3. Construct a string summary of the found data.
4. Initialize `llm = ChatOllama(model="qwen3:14b")`.
5. Create a prompt for the LLM containing the User Query and your Data Summary.
6. Return the string response from the LLM.

**Schema Definition:**
{schema_docs}

**Constraints:**
- The function MUST be named `analyze_graph_data`.
- DO NOT use Cypher queries (e.g. `graph.query`). Use Python iteration only.
- Import `ChatOllama` inside the code or assume it is available.
- Return ONLY the final string answer.
"""

# Prompt to fix the code if it errors
FIX_PROMPT_TEMPLATE = """
The Python code you generated previously failed to execute.

**User Query:** {user_query}

**The Broken Code:**
```python
{broken_code}
The Error Traceback:
{error_message}

Task:
Rewrite the analyze_graph_data function to fix the error.
Ensure you handle potential KeyError or AttributeError by using .get() for properties.
"""

class GraphAnalysisAgent:
    def __init__(self):
        # The "Meta-Programmer" LLM
        self.coder_llm = ChatOllama(model="minimax-m2.1:cloud", temperature=0.1)
        self.max_retries = 3
        
    def _clean_code(self, code_str: str) -> str:
        """Removes Markdown backticks if present."""
        if "```python" in code_str:
            code_str = code_str.split("```python")[1].split("```")[0]
        elif "```" in code_str:
            code_str = code_str.split("```")[1].split("```")[0]
        return code_str.strip()

    def _generate_initial_code(self, user_query: str, graph_object) -> str:
        prompt = ChatPromptTemplate.from_template(GEN_PROMPT_TEMPLATE)
        chain = prompt | self.coder_llm
        
        graph_description = describe_graph(graph_object, n=10)
        print(graph_description)
        response = chain.invoke({"user_query": user_query, "schema_docs": SCHEMA_DOCS, "subgraph_sample": graph_description})
        return self._clean_code(response.content)

    def _fix_code(self, broken_code: str, error_msg: str, user_query: str) -> str:
        prompt = ChatPromptTemplate.from_template(FIX_PROMPT_TEMPLATE)
        chain = prompt | self.coder_llm
        print(f"   >> Triggering Self-Healing for error: {error_msg.splitlines()[-1]}")
        response = chain.invoke({
            "broken_code": broken_code,
            "error_message": error_msg,
            "user_query": user_query
        })
        return self._clean_code(response.content)

    def execute(self, graph_object: Any, user_query: str) -> str:
        """
        Main entry point. Generates code, executes it, and handles retries.
        """
        print(f"[*] Analyzing query: '{user_query}'")
        
        # 1. Generate Initial Code
        current_code = self._generate_initial_code(user_query, graph_object)
        
        # 2. Execution Loop with Retries
        for attempt in range(self.max_retries):
            try:
                print(f"   >> Execution Attempt {attempt + 1}/{self.max_retries}")
                
                # Setup execution environment
                local_scope = {
                    "graph": graph_object,
                    "ChatOllama": ChatOllama,
                    "List": list,
                    "Dict": dict
                }
                print(current_code)
                exec(current_code, globals(), local_scope)
                
                if "analyze_graph_data" not in local_scope:
                    raise ValueError("Function 'analyze_graph_data' was not defined in generated code.")
                
                final_result = local_scope["analyze_graph_data"](graph_object)
                print(final_result)
                return final_result

            except Exception:
                error_trace = traceback.format_exc()
                if attempt == self.max_retries - 1:
                    return f"Failed to analyze graph after {self.max_retries} attempts. Last error: {error_trace}"
                current_code = self._fix_code(current_code, error_trace, user_query)

        return "Unknown error occurred."

class MockNode: 
    def __init__(self, props): 
        self._properties = props

class MockRel: 
    def __init__(self, start, end, rtype): 
        self.start_node = start 
        self.end_node = end 
        self.type = rtype 
        self._properties = {}

class MockGraph: 
    def __init__(self): 
        # Create a tiny mock graph: Alice --(WROTE)--> "Neo4j for Dummies" 
        alice = MockNode({"name": "Alice", "type": "Person", "age": 30}) 
        book = MockNode({"title": "Neo4j for Dummies", "type": "Book", "year": 2024}) 
        rel = MockRel(alice, book, "WROTE")
        self.nodes = [alice, book]
        self.relationships = [rel]
        
if __name__ == "__main__": # 1. Setup the dummy graph (In your app, this is your real neo4j object) 
    my_graph = MockGraph()
    agent = GraphAnalysisAgent()

    query = "What did Alice write and when?"

    result = agent.execute(my_graph, query)

    print("\n--- FINAL ANSWER FROM QWEN ---")
    print(result)
    