import pandas as pd
import sqlite3

# Load CSV data
df = pd.read_csv("./data/originalFactsList.csv")

# Connect to the db.sqlite3 database
conn = sqlite3.connect("db.sqlite3")
cursor = conn.cursor()

# Clear the table if you want to replace the test data
cursor.execute("DELETE FROM api_country")
conn.commit()

# Insert data from the CSV
for i in range(len(df)):
    country = df["Country"][i]
    continent = df["Continent"][i]
    capital = df["Capital City"][i]
    abbrev = df["Abbreviation"][i]

    sql = "INSERT INTO api_country (country, continent, capital, abbrev) VALUES (?, ?, ?, ?);"
    cursor.execute(sql, (country, continent, capital, abbrev))

conn.commit()
conn.close()