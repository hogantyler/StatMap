import pandas as pd
import sqlite3

df = pd.read_csv("./data/newFactsList.csv")

conn = sqlite3.connect("StatMap.db")
cursor = conn.cursor()

cursor.execute("DELETE FROM Facts")

for i in range(0, len(df["Fact"])):
    fact = df["Fact"][i]
    source = df["Fact Source"][i]
    country = df["Country"][i]

    # Gets Country ID from DB
    sql = "SELECT Country_ID FROM Countries WHERE Country = ?;"
    data = cursor.execute(sql, (country,))

    country_id = None
    for row in data:
        country_id = row[0]

    sql = "INSERT INTO Facts(Fact, Source, Country_ID) Values(?, ?, ?)"
    cursor.execute(sql, (fact, source, country_id))

conn.commit()
conn.close()
