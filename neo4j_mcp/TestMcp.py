import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_ollama import ChatOllama
from langchain.agents import create_agent
from langchain.messages import SystemMessage, HumanMessage

async def main():
    client = MultiServerMCPClient({
        "neo4j": {
            "url": "http://localhost:8000/mcp",
            "transport": "streamable_http"
        }
    })

    try:
        tools = await client.get_tools()
        
        schema_tool_name = next(t.name for t in tools if "schema" in t.name)
        
        async with client.session("neo4j") as session:
            schema_result = await session.call_tool(schema_tool_name)
            
        schema_text = schema_result.content[0].text
        print("Graph Schema:")
        print(schema_text)
    except Exception as e:
        print(f"Error: {e}")
        return

    llm = ChatOllama(model="qwen3:14b", temperature=0)

    system_message = f"""You are a read-only Neo4j assistant. 
    
    Here is the exact Graph Schema:
    {schema_text}
    
    ONLY use the node labels and relationship types defined above.
    """

    agent = create_agent(
        model=llm, 
        tools=tools, 
        system_prompt=SystemMessage(
        content=[
            {
                "type": "text",
                "text": system_message,
            }
        ]
    )
    )
    result = await agent.ainvoke(
        {"messages": [HumanMessage("""\n
                                   Find 5 proteins related to bacterial sepsis.
                                   """)]}
    )
    
    print(result["messages"][-1].content)

if __name__ == "__main__":
    asyncio.run(main())