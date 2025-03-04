from rest_framework.decorators import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Fact, Country
from .serializer import FactSerializer



class RandomFactView(APIView):
    """
    
    """
    def get(self, request, format=None):
        random_fact = Fact.objects.select_related('country').order_by('?').first()
        if random_fact:
            serializer = FactSerializer(random_fact)
            return Response(serializer.data)
        return Response({"detail": "No facts available."}, status=404)