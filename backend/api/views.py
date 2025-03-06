from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Fact, Country
from .serializer import FactSerializer, CountrySerializer



class RandomFactView(APIView):
    """
        look into getting less duplicate calls
        would aleviate the frontend from pulling repeated countries
    """
    def get(self, request, format=None):
        random_fact = Fact.objects.select_related('country').order_by('?').first()
        if random_fact:
            serializer = FactSerializer(random_fact)
            return Response(serializer.data)
        return Response({"detail": "No facts available."}, status=404)



class CountryFactsView(APIView):
    """
        API call that would list all of the facts for a specific country
    """
    def get(self, request, format=None):
        countries = Country.objects.prefetch_related('fact_set').all()
        if countries:
            serializer = CountrySerializer(countries, many=True)
            return Response(serializer.data)
        return Response({"detail": "No countries available."}, status=404)