import pandas as pd
import sqlite3

df = pd.read_csv("./data/originalFactsList.csv")

conn = sqlite3.connect("StatMap.db")
cursor = conn.cursor()

data = cursor.execute("SELECT count(*) FROM Countries")

num_countries = 0
for row in data:
    num_countries = row[0]

if num_countries == 0:
    for i in range(0, len(df["Country"])):
        country = df["Country"][i]
        continent = df["Continent"][i]
        capital = df["Capital City"][i]
        abbrev = df["Abbreviation"][i]

        sql = "INSERT INTO Countries (Country, Continent, Capital, Abbrev) VALUES (?, ?, ?, ?);"
        cursor.execute(sql, (country, continent, capital, abbrev))

conn.commit()
conn.close()
