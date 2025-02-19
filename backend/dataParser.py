import pandas as pd


def dataParser(input_name, output_name):
    """
    This function is meant to take the original csv file that is currently
    formatted as:

    Country,Continent,Capital,Abbreviation,Fact1,Fact1 Source,Fact2,Fact2 Source,
    ...Fact10, Fact10 Source

    and modifies the csv file to be in the form of:
    Fact, Fact Source, Country, Continent, Capital, Abbreviation

    Parameters:
    input_name (str): The relative path to the original CSV file
    output_name (str): The relative path to the outputted CSV file
    """

    df = pd.read_csv(input_name)

    # Prepare an empty list to store the reformatted rows
    new_rows = []

    # Iterate through each row of the original df
    for _, row in df.iterrows():
        country_data = row[:1].tolist()

        # Iterate through facts and their sources
        for i in range(5, len(row), 2):
            fact_source = row.iloc[i]
            fact = row.iloc[i - 1]

            # Only add if fact is not empty
            if pd.notna(fact):
                new_rows.append([fact, fact_source] + country_data)

    # Create new df with new column order
    new_df = pd.DataFrame(
        new_rows,
        columns=[
            "Fact",
            "Fact Source",
            "Country",
            # "Continent",
            # "Capital City",
            # "Abbreviation",
        ],
    )

    new_df.to_csv(output_name, index=False)

    print("CSV has been parsed through path: " + output_name)


dataParser("data/originalFactsList.csv", "data/newFactsList.csv")
