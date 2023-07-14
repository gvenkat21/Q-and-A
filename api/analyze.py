import os
import openai
import pandas as pd
import tiktoken
import numpy as np

openai.api_key = "<API_KEY>"
openai.organization = "<ORGANIZATION>"

COMPLETIONS_MODEL = "text-davinci-003"
EMBEDDING_MODEL = "text-embedding-ada-002"
embedding_encoding = "cl100k_base"  # this the encoding for text-embedding-ada-002
max_tokens = 8000  # the maximum for text-embedding-ada-002 is 8191

AWS_ACCESS_KEY = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION = os.getenv("awsRegion", "us-west-2")
AWS_S3_BUCKET = "aws-sandbox"
key = "data_cleaned_with_embeddings.csv"

MAX_SECTION_LEN = 3000
SEPARATOR = "\n* "
ENCODING = "gpt2"  # encoding for text-davinci-003

encoding = tiktoken.get_encoding(ENCODING)
separator_len = len(encoding.encode(SEPARATOR))

######Functions##################################
def get_embedding(text: str, model: str=EMBEDDING_MODEL) -> list[float]:
    result = openai.Embedding.create(
      model=model,
      input=text
    )
    return result["data"][0]["embedding"]

def load_embeddings(df):
    """
    Read the document embeddings and their keys from a CSV.
    """
    return {r[0]:eval(r[1]['embedding']) for r in df.iterrows()}


def vector_similarity(x: list[float], y: list[float]) -> float:
    """
    Returns the similarity between two vectors.
    
    Because OpenAI Embeddings are normalized to length 1, the cosine similarity is the same as the dot product.
    """
    return np.dot(np.array(x), np.array(y))


def order_document_sections_by_query_similarity(query: str, contexts: dict[(str, str), np.array]) -> list[(float, (str, str))]:
    """
    Find the query embedding for the supplied query, and compare it against all of the pre-calculated document embeddings
    to find the most relevant sections. 
    
    Return the list of document sections, sorted by relevance in descending order.
    """
    query_embedding = get_embedding(query)
    
    document_similarities = sorted([
        (vector_similarity(query_embedding, doc_embedding), doc_index) for doc_index, doc_embedding in contexts.items()
    ], reverse=True)
    
    return document_similarities

def construct_prompt(question: str, context_embeddings: dict, df: pd.DataFrame) -> str:
    """
    Fetch relevant 
    """
    most_relevant_document_sections = order_document_sections_by_query_similarity(question, context_embeddings)
    
    chosen_sections = []
    chosen_sections_len = 0
    chosen_sections_indexes = []
     
    for _, section_index in most_relevant_document_sections:
        # Add contexts until we run out of space.        
        document_section = df.loc[section_index]
        
        chosen_sections_len += document_section.tokens + separator_len
        if int(chosen_sections_len) > MAX_SECTION_LEN:
            break
            
        chosen_sections.append(SEPARATOR + document_section.content.replace("\n", " "))
        chosen_sections_indexes.append(str(section_index))
            
    # Useful diagnostic information
    print(f"Selected {len(chosen_sections)} document sections:")
#     print("\n".join(chosen_sections_indexes))
    
    header = """Answer the question as truthfully as possible using the provided context, and if the answer is not contained within the text below, say "I don't know". Write the answer in a prosaic manner. If answer is a list, use bullet points."\n\nContext:\n"""
    final_prompt = header + "".join(chosen_sections) + "\n\n Q: " + question + "\n A:"
    indexes = [x[1] for x in most_relevant_document_sections[:len(chosen_sections)]]
    return indexes, final_prompt


def answer_query_with_context(
    query: str,
    df: pd.DataFrame,
    document_embeddings: dict[(str, str), np.array],
    COMPLETIONS_API_PARAMS, 
    show_prompt: bool = False
) -> str:
    indexes, prompt = construct_prompt(
        query,
        document_embeddings,
        df
    )
    
    if show_prompt:
        print(prompt)

    response = openai.Completion.create(
                prompt=prompt,
                **COMPLETIONS_API_PARAMS
            )
    return response["choices"][0]["text"], indexes


def main(query, df, document_embeddings):

    COMPLETIONS_API_PARAMS = {
        # We use temperature of 0.0 because it gives the most predictable, factual answer.
        "temperature": 0.7,
        "max_tokens": 512,
        "frequency_penalty": 0.8,
        "model": COMPLETIONS_MODEL,
    }
    responseData = {}
    responseData['payload'] = answer_query_with_context(query, df, document_embeddings, COMPLETIONS_API_PARAMS, show_prompt = False)[0]
    responseData['arrayIndices'] = answer_query_with_context(query, df, document_embeddings, COMPLETIONS_API_PARAMS, show_prompt = False)[1]
    
    return(responseData)

if __name__ == '__main__':
    main(query, df, document_embeddings)