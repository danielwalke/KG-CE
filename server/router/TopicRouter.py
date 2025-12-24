from kg_embeddings.retriever.Retriever import Retriever
# from kg_embeddings.retriever.CkgRetriever import Retriever
from kg_embeddings.Llm import Llm, LLmHistory
from kg_embeddings.KeywordExtraction import KeywordExtraction
from fastapi import APIRouter, Request, WebSocket, WebSocketDisconnect
from server.constants.ServerConfig import SERVER_PREFIX
from server.constants.Endpoints import TOPIC_EP
from server.meta.InTopic import InTopic

router = APIRouter(redirect_slashes=False)

@router.post(SERVER_PREFIX + TOPIC_EP)
async def get_topic_nodes(request: Request, in_topic: InTopic):
    llm = Llm()
    llm_instance = LLmHistory(llm)
    session_id = llm_instance.initialize_conversation()
    user_input = in_topic.prompt
    

    # keyword_extractor = KeywordExtraction(llm)
    # keywords = keyword_extractor.extract_keyword(user_input)
    # keywords.insert(0, user_input)  # Add the full prompt as the first "keyword"
    keywords = [user_input]
    print("Extracted Keywords:", keywords)

    retriever = request.app.state.retriever
    embeddings = retriever.embed_queries(keywords)
    keyword_results = dict()
    for embedding, keyword in zip(embeddings, keywords):
        print(f"Keyword: {keyword}")
        results = retriever.retrieve_similar_nodes(embedding, top_k=3, excluded_node_types=in_topic.excluded_node_types)
        keyword_results[keyword] = results
        print("Top similar nodes:")
        for result in results:
            print(result)                               
            result = str(result).replace("'", '"')  # Ensure JSON compatibility
    return {
        "session_id": session_id,
        "keyword_results": keyword_results,
        "prompt": user_input
    }