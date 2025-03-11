from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
import os

# Function to determine the upload path for files
def user_directory_path(instance, filename):
    # Files will be uploaded to MEDIA_ROOT/user_<id>/<filename>
    return f'user_{instance.user.id}/{filename}'

# Model for uploaded files
class UploadedFile(models.Model):
    FILE_TYPES = (
        ('pdf', 'PDF'),
        ('excel', 'Excel'),
        ('word', 'Word'),
        ('txt', 'Text'),
        ('other', 'Other'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    file = models.FileField(upload_to=user_directory_path)
    filename = models.CharField(max_length=255)
    file_type = models.CharField(max_length=10, choices=FILE_TYPES)
    upload_date = models.DateTimeField(default=timezone.now)
    
    def save(self, *args, **kwargs):
        # Set filename and determine file type based on extension
        if not self.filename and self.file:
            self.filename = os.path.basename(self.file.name)
        
        # Determine file type based on extension
        if not self.file_type and self.file:
            ext = os.path.splitext(self.file.name)[1].lower()
            if ext == '.pdf':
                self.file_type = 'pdf'
            elif ext in ['.xls', '.xlsx']:
                self.file_type = 'excel'
            elif ext in ['.doc', '.docx']:
                self.file_type = 'word'
            elif ext == '.txt':
                self.file_type = 'txt'
            else:
                self.file_type = 'other'
        
        super().save(*args, **kwargs)
    
    def __str__(self):
        return self.filename

# Model for user addresses
class Address(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    street = models.CharField(max_length=255)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100)
    is_default = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.street}, {self.city}, {self.state}, {self.country}"

# Model for user phone numbers
class PhoneNumber(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='phone_numbers')
    number = models.CharField(max_length=20)
    is_primary = models.BooleanField(default=False)
    
    def __str__(self):
        return self.number
