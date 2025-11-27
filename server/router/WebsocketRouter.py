from kg_embeddings.retriever.Retriever import Retriever
from kg_embeddings.Llm import Llm, LLmHistory
from kg_embeddings.KeywordExtraction import KeywordExtraction
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import WEBSOCKET_EP
from server.meta.InInstruction import InInstruction
import asyncio
from server.utils.SubgraphToMarkdown import format_graph_for_llm
from textwrap import dedent
router = APIRouter(redirect_slashes=False)

@router.websocket(SERVER_PREFIX + WEBSOCKET_EP)
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    llm = Llm()
    llm_instance = LLmHistory(llm)
    session_id = llm_instance.initialize_conversation()
    try:
        while True:
            user_input = await websocket.receive_json()
            in_instruction = InInstruction(**user_input)
            
            ## Send session id back to client
            await websocket.send_text(f"[START]")

            print("Received instruction:", in_instruction.prompt)
            print("Retrieving subgraph for node IDs:", in_instruction.node_ids)

            retriever = Retriever()
            subgraph = retriever.retrieve_subgraph(in_instruction.node_ids)
            graph_markdown = format_graph_for_llm(subgraph)

            print("Graph markdown prepared, constructing prompt.")
            print(graph_markdown)

            prompt_template = dedent("""
                <system_instructions>
                You are a Knowledge Graph Assistant.
                1. **Primary Source:** Answer strictly based on the <context_data> below.
                2. **Refusal:** If the answer is not in the context, say "I don't know."
                3. **Tone:** Professional and concise.
                </system_instructions>

                <context_data>
                {context_data}
                </context_data>

                <supplementary_info>
                The following is strictly for reference (e.g., resolving pronouns). Do not use this as a primary source of facts.
                <chat_history>
                {previous_context}
                </chat_history>
                </supplementary_info>

                <user_query>
                {user_prompt}
                </user_query>

                Response:
            """)

            formatted_prompt = prompt_template.format(
                context_data=graph_markdown,
                user_prompt=in_instruction.prompt,
                previous_context=in_instruction.previous_context
            )

            stream_generator = llm_instance.run_query(formatted_prompt, session_id)
            
            full_response = ""
            
            async for chunk in stream_generator:
                if chunk:
                    full_response += chunk
                    await websocket.send_text(chunk)
    except WebSocketDisconnect:
        print("Client disconnected")