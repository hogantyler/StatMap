import pandas as pd
from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()


def importCountriesToDB():
    """
    This function is made to upload countries into the Supabase DB, in the format
    of:

    """
    # Load CSV data
    df = pd.read_csv("./data/originalFactsList.csv")

    # Supabase credentials
    SUPABASE_URL = "https://ewqbknnhmhepuqjbkgmm.supabase.co"
    SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

    # Connect to Supabase
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

    country_data = []
    for _, row in df.iterrows():
        country = row["Country"]
        continent = row["Continent"]
        capital = row["Capital City"]
        abbrev = row["Abbreviation"]

        country_data.append(
            {
                "Country": country,
                "Continent": continent,
                "Capital": capital,
                "Abbreviation": abbrev,
            }
        )

    supabase.table("api_country").insert(country_data).execute()


importCountriesToDB()
