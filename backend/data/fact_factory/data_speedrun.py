import openai
import csv
import pandas as pd

client = openai.OpenAI(api_key="INSERT CHATGPT KEY")
country = "Belize"

#chat query
query = (
    "You are an expert on countries. Pull 5 goofy, unique, and mildly obscure facts with their respective Wikipedia sources "
    "from the country" + country + " (don't include the name, the continent, or the capital city of the country in the facts). Return ONLY a valid CSV format with one row, where the columns are: "
    "\"Country, Fact 1, Fact 1 Source, Fact 2, Fact 2 Source, Fact 3, Fact 3 Source, Fact 4, Fact 4 Source, Fact 5, Fact 5 Source"
    "Ensure the response contains NO extra text before or after the CSV data and that the source links are actually accessable."
)

try:
    #makes the api call and stores the output
    print("Making API request...")
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": query}],
        temperature=0,
    )
    print("API request completed.")
    

    csv_text = response.choices[0].message.content.strip()
    csv_lines = csv_text.split("\n")
    csv_reader = csv.reader(csv_lines)

    headers = next(csv_reader, None)
    facts_row = next(csv_reader, None)  #get the actual data

    print(facts_row)
    
    df = pd.read_csv("world_countries.csv")

    country_row = df[df["Country"] == country].index
    if not country_row.empty:
        row_idx = country_row[0]  #find country index

        #update only facts and sources
        fact_columns = [
            "Fact 1", "Fact 1 Source", "Fact 2", "Fact 2 Source",
            "Fact 3", "Fact 3 Source", "Fact 4", "Fact 4 Source",
            "Fact 5", "Fact 5 Source"
        ]

        df.loc[row_idx, fact_columns] = facts_row[1:]  #exclude country for filling in

        #save the df to csv
        df.to_csv("world_countries.csv", index=False)
        print(f"Facts for country updated successfully in world_countries.csv")
    else:
        print("Country not found in the CSV!")

except Exception as e:
    print("Error:", e)