from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import Fact, Country
from .serializer import FactSerializer


@api_view(["GET"])
def get_fact(request):
    serializer
    return Response()
