from ddgs import DDGS
from bs4 import BeautifulSoup
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
import requests
import time

def get_html_from_url(url):
    
    try:
        response = requests.get(url)
        if response.status_code == 200:
            return response.text
        else:
            return None
    except Exception as e:
        print(f"Error fetching URL {url}: {e}")
        return None
    
def get_body_from_html(html_content):
    soup = BeautifulSoup(html_content, 'html.parser')
    body = soup.body
    if body:
        return body.get_text(separator='\n', strip=True)
    return ""

def return_search_results(query):
    results = []
    for _ in range(3):
        try:
            results = list(DDGS().text(query, max_results=3))
        except Exception as e:
            print(f"Error during search: {e}")
            results = []
        if results:
            break
        time.sleep(3)
    top_html_res_markdown = ""
    for item in results:
        html_content = get_html_from_url(item['href'])
        if html_content:
            body_text = get_body_from_html(html_content)
            top_html_res_markdown += f"## URL: {item['href']}\n\n{body_text}\n\n"

    return top_html_res_markdown

def prompt_gen(in_instruction, graph_markdown):
    llm = ChatOllama(model="qwen3:14b", temperature=0)

    template = """
    You are a search query generator. Formulate a single, concise internet search query based on the following context.

    Knowledge Graph Context:
    <context_data>
        {context_data}
    </context_data>

    <supplementary_info>
        The following is strictly for reference (e.g., resolving pronouns). Do not use this as a primary source of facts.
        <chat_history>
            {previous_context}
        </chat_history>
    </supplementary_info>

    User Input:
    <user_query>
        {user_prompt}
    </user_query>

    Return ONLY the raw search query string. Do not include quotes, explanations, or any other text.
    """

    prompt = PromptTemplate.from_template(template)

    chain = prompt | llm | StrOutputParser()

    response = chain.invoke({
        "context_data": graph_markdown,
        "user_prompt": in_instruction.prompt,
        "previous_context": in_instruction.previous_context
    })
    return response

def search(search_res, user_query):
    prompt = f"""
    Based on the following search results, provide a concise answer to the user's query. Make sure to include the used URL sources for each respective result in your answer.

    Search Results:
    {search_res}

    User Query:
    {user_query}

    Answer:
    """

    llm = ChatOllama(model="qwen3:14b", temperature=0)
    return llm.astream(prompt)