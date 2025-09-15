from django.db import models

# Create your models here.
class LawInfo(models.Model):
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=100)
    section_code = models.CharField(max_length=50, blank=True)
    short_description = models.TextField()
    detailed_description = models.TextField()
    source_url = models.URLField(blank=True)

    def __str__(self):
        return self.title

class Client(models.Model):
    cname = models.CharField(max_length=150)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    dob = models.DateField(blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return super().cname
    
class Lawyer(models.Model):
    lname = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, unique=True)
    specialization = models.CharField(max_length=100)
    experience_years = models.PositiveIntegerField()
    location = models.CharField(max_length=100)
    charge = models.DecimalField(max_digits=10, decimal_places=2)
    username = models.CharField(max_length=100, unique=True)
    password = models.CharField(max_length=128)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.full_name} ({self.specialization})"
