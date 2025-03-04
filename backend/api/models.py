from django.db import models


# Implementing models for Country and Fact within SQLite tables
class Country(models.Model):
    """
    Model for Country, where SQLite table is expected to have property of:
    1) country_id (primary key to be called by Fact, which has foreign keys)
    2) country (max chars = 100)
    3) continent (max chars = 100)
    4) abbreviation (max chars = 3)
    """

    country_id = models.IntegerField(primary_key=True)
    country = models.CharField(max_length=100)
    continent = models.CharField(max_length=100)
    abbrev = models.CharField(max_length=3)


# class Fact(models.Model):
#     """
#     Model for Fact, where SQLite table is expected to have property of:
#     1) fact_id (primary key)
#     2) fact (max chars = 500)
#     3) source (max chars = 300)
#     4) country (foreign key to find correct Country to reference)
#     """

#     fact_id = models.IntegerField(primary_key=True)
#     fact = models.CharField(max_length=500)
#     source = models.CharField(max_length=300)
#     country = models.ForeignKey(Country, on_delete=models.CASCADE, related_name="facts")

class Fact(models.Model):
    text = models.TextField()

    def __str__(self):
        return self.text