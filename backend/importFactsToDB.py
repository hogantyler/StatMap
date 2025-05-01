import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()


def importFactsToDb():
    """
    This function is made to upload facts into the Supabase DB, in the format
    of:

    Fact_ID, Fact, Source, Country_ID

    The Country_ID will be a foreign key to the Country table.
    To get this running, a .env file with the SUPABASE_SERVICE_KEY is required.
    EX:
    SUPABASE_SERVICE_KEY="asasdfasdfasdf"
    """
    df = pd.read_csv("./data/newFactsList.csv")

    # Supabase credentials
    SUPABASE_URL = "https://ewqbknnhmhepuqjbkgmm.supabase.co"
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

    # Connect to supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Iterate over each fact in the CSV file
    fact_data = []
    for _, row in df.iterrows():
        fact = row["Fact"]
        source = row["Fact Source"] if pd.notnull(row["Fact Source"]) else ""
        country = row["Country"]
        country_id = country_map.get(country, None)

        fact_data.append({"Fact": fact, "Source": source, "Country_ID": country_id})

    supabase.table("api_fact").insert(fact_data).execute()


importFactsToDb()
