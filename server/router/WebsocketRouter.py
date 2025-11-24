from kg_embeddings.retriever.Retriever import Retriever
from kg_embeddings.Llm import Llm, LLmHistory
from kg_embeddings.KeywordExtraction import KeywordExtraction
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import WEBSOCKET_EP
import asyncio

router = APIRouter(redirect_slashes=False)

@router.websocket(SERVER_PREFIX + WEBSOCKET_EP)
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    llm = Llm()
    llm_instance = LLmHistory(llm)
    session_id = llm_instance.initialize_conversation()
    try:
        while True:
            user_input = await websocket.receive_text()
            
            ## Send session id back to client
            await websocket.send_text(f"[SESSION_ID]{session_id}")

            keyword_extractor = KeywordExtraction(llm)
            keywords = keyword_extractor.extract_keyword(user_input)
            print("Extracted Keywords:", keywords)

            retriever = Retriever()
            embeddings = retriever.embed_queries(keywords)
            keyword_results = dict()
            for embedding, keyword in zip(embeddings, keywords):
                print(f"Keyword: {keyword}")
                results = retriever.retrieve_similar_nodes(embedding, top_k=3)
                keyword_results[keyword] = results
                print("Top similar nodes:")
                for result in results:
                    print(result)                               
                    result = str(result).replace("'", '"')  # Ensure JSON compatibility
                    await websocket.send_text(f"[KG_RESULT]{result}")
                print("-----")

            
            # stream_generator = llm_instance.run_query(f"{user_input}. \n\n Here might be some relevant information from the knowledge graph: {keyword_results}", session_id)
            
            # full_response = ""
            
            # async for chunk in stream_generator:
            #     if chunk:
            #         full_response += chunk
            #         # Send just this chunk to the frontend
            #         await websocket.send_text(chunk)
            # await websocket.send_text("[DONE]")

    except WebSocketDisconnect:
        print("Client disconnected")