from django.db import models


# Implementing models for Country and Fact within SQLite tables
class Country(models.Model):
    """
    Model for Country, where SQLite table is expected to have property of:
    1) country (max chars = 100)
    2) continent (max chars = 100)
    3) capital (max chars = 100)
    4) abbreviation (max chars = 3)
    """
    country = models.CharField(max_length=100, default = "Unknown")
    continent = models.CharField(max_length=100, default = "Unknown")
    capital = models.CharField(max_length=100, default="Unknown")
    abbrev = models.CharField(max_length=3, default = "Unk")


class Fact(models.Model):
    """
    Model for Fact, where SQLite table is expected to have property of:
    1) fact (max chars = 500)
    2) source (max chars = 300)
    3) country_id (foreign key to find correct Country to reference)
    """
    fact = models.CharField(max_length = 500, default= "Unknown")
    source = models.CharField(max_length=300, default="Unknown")
    country = models.ForeignKey(Country, on_delete=models.CASCADE, default=1)