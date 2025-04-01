from django.core.cache import cache
from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Fact, Country
from .serializer import FactSerializer, CountrySerializer



class RandomFactView(APIView):
    """
    Ensures less duplicate country calls
    Prevents a country from appearing twice in the last 5 selections
    """

    def get(self, request, format=None):
        recent_countries_key = "recent_countries"
        recent_countries = cache.get(recent_countries_key, [])  # Get last 5 countries from cache

        # Exclude recent countries
        random_fact = Fact.objects.select_related('country') \
            .exclude(country__id__in=recent_countries) \
            .order_by('?') \
            .first()

        if random_fact:
            serializer = FactSerializer(random_fact)
            
            # Update recent countries list
            recent_countries.append(random_fact.country.id)
            if len(recent_countries) > 10:  # Keep only the last 5
                recent_countries.pop(0)

            cache.set(recent_countries_key, recent_countries, timeout=3600)  # Store for 1 hour

            return Response(serializer.data)

        return Response({"detail": "No facts available."}, status=404)



class CountryFactsView(APIView):
    """
        API call that would list all of the facts for a specific country
    """
    def get(self, request, country_name, format=None):
        try:
            country = Country.objects.prefetch_related('fact_set').get(country=country_name)
            facts = country.fact_set.all()
            serializer = FactSerializer(facts, many=True)
            return Response(serializer.data)
        except Country.DoesNotExist:
            return Response({"detail": "Country not found."}, status=404)
        
        
    
