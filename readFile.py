import pandas as pd
import numpy as np
import os

# Load the CSV file
df = pd.read_csv('factsList.csv')

# Drop rows where all fact columns are NaN
fact_columns = [f'Fact {i}' for i in range(1, 11)]
df = df.dropna(subset=fact_columns, how='all')  #ChatGPT helped with this, basicly drops all null values in CSV

# Select a random country
random_row = df.sample(n=1).iloc[0]  # Select one random row and convert to Series

# Extract non-NaN facts and their sources
facts = random_row[fact_columns].dropna()
sources = random_row[[f'Fact {i} Source' for i in range(1, 11)]].dropna()  # Get non-NaN sources

# Randomly select one fact and its source
random_index = np.random.choice(facts.index)
fact = facts[random_index]
source_column = random_index + ' Source'  # Correctly format the source column name
source = sources[source_column]  # Get corresponding source

# Extract hints
continent = random_row['Continent']
capital_city = random_row['Capital City']
abbreviation = random_row['Abreviation']

# Correct country name
country_name = random_row['Country']

# Print the result
print(f"Fact: {fact}")
print(f"Source: {source}")
print("\nHints:")
print(f"1. Continent: {continent}")
print(f"2. Capital City: {capital_city}")
print(f"3. Abbreviation: {abbreviation}")
print("\nGuess the country!\n")
print(f"Correct answer is {country_name}\n") 