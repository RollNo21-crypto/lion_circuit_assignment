from django.shortcuts import render
from django.contrib.auth.models import User
from django.db.models import Count
from django.http import FileResponse
from rest_framework import viewsets, permissions, status, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from .models import UploadedFile, Address, PhoneNumber
from .serializers import UserSerializer, UploadedFileSerializer, AddressSerializer, PhoneNumberSerializer, UserProfileSerializer

# User registration view
class RegisterView(APIView):
    permission_classes = [AllowAny]  # Allow anyone to register
    
    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.create_user(
                username=serializer.validated_data['username'],
                email=serializer.validated_data['email'],
                password=serializer.validated_data['password'],
                first_name=serializer.validated_data.get('first_name', ''),
                last_name=serializer.validated_data.get('last_name', '')
            )
            return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# User profile view
class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserProfileSerializer(request.user, context={'request': request})
        return Response(serializer.data)
    
    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# File upload and management views
class UploadedFileViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = UploadedFileSerializer
    
    def get_queryset(self):
        return UploadedFile.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

# File download view
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_file(request, file_id):
    try:
        file = UploadedFile.objects.get(id=file_id, user=request.user)
        return FileResponse(file.file, as_attachment=True, filename=file.filename)
    except UploadedFile.DoesNotExist:
        return Response({'error': 'File not found'}, status=status.HTTP_404_NOT_FOUND)

# Portal statistics view
class PortalStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Total files uploaded
        total_files = UploadedFile.objects.count()
        
        # Files by type
        files_by_type = UploadedFile.objects.values('file_type').annotate(count=Count('id'))
        
        # Files by user
        files_by_user = UploadedFile.objects.values('user__username').annotate(count=Count('id'))
        
        return Response({
            'total_files': total_files,
            'files_by_type': files_by_type,
            'files_by_user': files_by_user
        })

# Address management views
class AddressViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        return Address.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is set as default, unset any existing default
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user, is_default=True).update(is_default=False)
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # If this is set as default, unset any existing default
        if serializer.validated_data.get('is_default', False):
            Address.objects.filter(user=self.request.user, is_default=True).exclude(id=serializer.instance.id).update(is_default=False)
        serializer.save()

# Phone number management views
class PhoneNumberViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    serializer_class = PhoneNumberSerializer
    
    def get_queryset(self):
        return PhoneNumber.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        # If this is set as primary, unset any existing primary
        if serializer.validated_data.get('is_primary', False):
            PhoneNumber.objects.filter(user=self.request.user, is_primary=True).update(is_primary=False)
        serializer.save(user=self.request.user)
    
    def perform_update(self, serializer):
        # If this is set as primary, unset any existing primary
        if serializer.validated_data.get('is_primary', False):
            PhoneNumber.objects.filter(user=self.request.user, is_primary=True).exclude(id=serializer.instance.id).update(is_primary=False)
        serializer.save()
