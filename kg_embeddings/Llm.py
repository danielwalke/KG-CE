from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.output_parsers import StrOutputParser
from kg_embeddings.constants.Prompts import SYSTEM_PROMPT
import uuid

class Llm:
    def __init__(self):
        self.llm = ChatOllama(model="qwen3:14b")

    def get_llm(self):
        return self.llm

class LLmHistory:
    def __init__(self, llm: Llm):
        self.llm = llm.get_llm()
        self.conversation_chain = None

    
    def initialize_conversation(self):
        prompt = ChatPromptTemplate.from_messages([
            ("system", SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            ("human", "{input}"),
        ])

        chain = prompt | self.llm | StrOutputParser()

        store = {}

        def get_session_history(session_id: str):
            if session_id not in store:
                store[session_id] = ChatMessageHistory()
            return store[session_id]

        self.conversation_chain = RunnableWithMessageHistory(
            chain,
            get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
        )
        ## generate a unique session id
        session_id = str(uuid.uuid4())
        return session_id

    def run_query(self, input_text: str, session_id: str):
        config = {"configurable": {"session_id": session_id}}
        return self.conversation_chain.astream(
            {"input": input_text},
            config=config
        )


if __name__ == "__main__":
    llm = Llm()
    llm_instance = LLmHistory(llm)
    session_id = llm_instance.initialize_conversation()
    resp1 = llm_instance.run_query("Hi! My name is Dave.", session_id)
    resp2 = llm_instance.run_query("Do you remember my name?", session_id)
    print(resp1)
    print(resp2)