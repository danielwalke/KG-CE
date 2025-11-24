import re
from kg_embeddings.Llm import Llm
from kg_embeddings.constants.Prompts import BIOMEDICAL_KEYWORD_EXTRACTION_PROMPT
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import CommaSeparatedListOutputParser
from langchain_core.runnables import RunnableLambda

class KeywordExtraction:
    def __init__(self, llm: Llm):
        self.llm = llm.get_llm()

    def _clean_thinking_content(self, output):
        text = output.content if hasattr(output, "content") else str(output)
        cleaned_text = re.sub(r'<think>.*?</think>', '', text, flags=re.DOTALL)
        return cleaned_text.strip()

    def extract_keyword(self, text: str):
        output_parser = CommaSeparatedListOutputParser()
        template = BIOMEDICAL_KEYWORD_EXTRACTION_PROMPT + """
        {format_instructions}

        Text: {text}
        """

        prompt = ChatPromptTemplate.from_template(
            template,
            partial_variables={"format_instructions": output_parser.get_format_instructions()}
        )

        chain = (
            prompt 
            | self.llm 
            | RunnableLambda(self._clean_thinking_content) 
            | output_parser
        )

        result = chain.invoke({"text": text})
        return [item.strip() for item in result]

if __name__ == "__main__":
    llm = Llm()
    keyword_extractor = KeywordExtraction(llm)
    sample_text = "Sepsis is a life-threatening condition caused by the body's response to an infection. Common pathogens include Staphylococcus aureus and Escherichia coli."
    keywords = keyword_extractor.extract_keyword(sample_text)
    print("Extracted Keywords:", keywords)