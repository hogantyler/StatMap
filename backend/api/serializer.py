from rest_framework import serializers
from .models import Fact, Country

class FactSerializer(serializers.ModelSerializer):
    """
    JSONify's the facts from StatMap in the format of:
    
    fact_id: integer,
    fact: string,
    source: string,
    country_id: integer,
    country: string,
    continent: string,
    capital: string,
    abbrev: string

    """
    fact_id = serializers.IntegerField(source="id", read_only=True)
    fact = serializers.CharField(read_only=True)
    source = serializers.CharField(read_only=True)
    country_id = serializers.IntegerField(source="country.id", read_only=True)
    country = serializers.CharField(source="country.country", read_only=True)
    continent = serializers.CharField(source="country.continent", read_only=True)
    capital = serializers.CharField(source="country.capital", read_only=True)
    abbrev = serializers.CharField(source="country.abbrev", read_only=True)

    class Meta:
        model = Fact
        fields = [
            "fact_id",
            "fact",
            "source",
            "country_id",
            "country",
            "continent",
            "capital",
            "abbrev",
        ]
