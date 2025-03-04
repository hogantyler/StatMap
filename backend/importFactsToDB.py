import pandas as pd
import sqlite3

# Load CSV data containing facts
df = pd.read_csv("./data/newFactsList.csv")

# Connect to the db.sqlite3 database
conn = sqlite3.connect("db.sqlite3")
cursor = conn.cursor()

# Clear the api_fact table
cursor.execute("DELETE FROM api_fact")

# Iterate over each fact in the CSV file
for i in range(len(df)):
    fact = df["Fact"][i]
    source = df["Fact Source"][i]
    
    if pd.isnull(source):
        source = ""
    country = df["Country"][i]
    
    country = df["Country"][i]

    # Get the corresponding country ID from the api_country table
    sql = "SELECT id FROM api_country WHERE country = ?;"
    data = cursor.execute(sql, (country,))
    
    country_id = None
    for row in data:
        country_id = row[0]

    # Insert the fact into the api_fact table
    sql = "INSERT INTO api_fact (fact, source, country_id) VALUES (?, ?, ?);"
    cursor.execute(sql, (fact, source, country_id))

conn.commit()
conn.close()