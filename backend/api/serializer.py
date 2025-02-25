from rest_framework import serializers
from .models import Fact, Country


# Serializer used to JSONify Facts for StatMap
class FactSerializer(serializers.ModelSerializer):
    """
    JSONify's the facts from StatMap in the format of:

    Fact_ID: integer,
    Fact: string,
    Source: string,
    CC_ID: integer,
    Correct_Country: string,
    CC_Continent: string,
    CC_Capital: string,
    CC_Abbrev: string

    where CC stands for "Correct Country"
    """

    Fact_ID = serializers.IntegerField(source="fact_id")
    Fact = serializers.CharField(source="fact")
    Source = serializers.CharField(source="source")
    CC_ID = serializers.IntegerField(source="country_id")
    Correct_Country = serializers.CharField(source="country.country")
    CC_Continent = serializers.CharField(source="country.continent")
    CC_Capital = serializers.CharField(source="country.capital")
    CC_Abbrev = serializers.CharField(source="country.abbrev")

    class Meta:
        model = Fact
        fields = [
            "Fact_ID",
            "Fact",
            "Source",
            "CC_ID",
            "Correct_Country",
            "CC_Continent",
            "CC_Capital",
            "CC_Abbrev",
        ]
