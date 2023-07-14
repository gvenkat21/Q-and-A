from flask import Flask, request, jsonify
import analyze
import pandas as pd
import os 


app = Flask(__name__)
AWS_ACCESS_KEY = ""
AWS_SECRET_ACCESS_KEY = ""
AWS_REGION = os.getenv("awsRegion", "us-west-2")
AWS_S3_BUCKET = "aws-sandbox"
key = "out.csv"

def prepareForRequest():
    df = pd.read_csv(
        f"s3://{AWS_S3_BUCKET}/{key}",
        storage_options={
            "key": AWS_ACCESS_KEY,
            "secret": AWS_SECRET_ACCESS_KEY
        }
    )  
    document_embeddings = analyze.load_embeddings(df)

    return df, document_embeddings

df, document_embeddings = prepareForRequest()

@app.route('/analyzereview', methods=['POST'])
def get_analysis():
    data = request.json
    print(data)
    analyzedData = analyze.main(data['queryString'], df, document_embeddings)
    print(analyzedData)
    return jsonify(analyzedData)