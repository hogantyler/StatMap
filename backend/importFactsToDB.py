import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()


def importFactsToDb():
    """
    Clears the existing Facts table and uploads new facts from the CSV file.
    It dynamically maps countries to Country_IDs using the Countries table in Supabase.
    """
    df = pd.read_csv("./world_facts_v2.csv")

    SUPABASE_URL = "https://ewqbknnhmhepuqjbkgmm.supabase.co"
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Clear the Facts table
    supabase.table("Facts").delete().neq("Fact_ID", 0).execute()

    # Fetch all countries from Supabase to build country_name -> Country_ID map
    response = supabase.table("Countries").select("Country_ID", "Country").execute()

    country_map = {}
    if response.data:
        for country in response.data:
            name = country["Country"]
            country_id = country["Country_ID"]
            country_map[name] = country_id

    # Loop through each country row
    for _, row in df.iterrows():
        country = row["Country"]
        country_id = country_map.get(country)

        if not country_id:
            print(f"Skipping country not found in DB: {country}")
            continue

        # Loop through Fact 1 to Fact 50
        for i in range(1, 51):
            fact_col = f"Fact {i}"
            source_col = f"Fact {i} Source"

            fact = row.get(fact_col, "")
            source = row.get(source_col, "")

            if pd.notnull(fact) and str(fact).strip():
                supabase.table("Facts").insert(
                    {
                        "Fact": str(fact).strip(),
                        "Source": str(source).strip() if pd.notnull(source) else "",
                        "Country_ID": country_id,
                    }
                ).execute()


importFactsToDb()
