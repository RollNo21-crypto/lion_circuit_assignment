<<<<<<< HEAD
# Lion Circuit File Portal

A comprehensive file management portal built with Django REST Framework backend and React frontend. This application allows users to register, upload and manage files, maintain profile information including addresses and phone numbers, and view portal statistics.

## Features

- **User Authentication**: Register, login, and JWT token-based authentication
- **File Management**: Upload, download, and manage files with type categorization
- **Profile Management**: Update user profile information
- **Address Management**: Add, update, and manage multiple addresses with default address support
- **Phone Number Management**: Add, update, and manage multiple phone numbers with primary number support
- **Portal Statistics**: View statistics about uploaded files, file types, and user activity

## Technology Stack

### Backend
- Django 5.1.7
- Django REST Framework
- Simple JWT for authentication
- SQLite database (default)

### Frontend
- React 19.0.0
- React Router 7.3.0
- Material UI 6.4.7
- Axios for API requests
- Vite as build tool

## Setup Instructions

### Backend Setup

1. Clone the repository
   ```
   git clone <repository-url>
   cd lion_circuit_assignment
   ```

2. Create and activate a virtual environment
   ```
   python -m venv venv
   # On Windows
   venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```

3. Install dependencies
   ```
   pip install -r requirements.txt
   ```

4. Run migrations
   ```
   python manage.py migrate
   ```

5. Create a superuser (admin)
   ```
   python manage.py createsuperuser
   ```

6. Start the development server
   ```
   python manage.py runserver
   ```
   The backend will be available at http://localhost:8000/

### Frontend Setup

1. Navigate to the frontend directory
   ```
   cd frontend
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Start the development server
   ```
   npm run dev
   ```
   The frontend will be available at http://localhost:5173/

## API Endpoints

### Authentication
- `POST /api/register/` - Register a new user
- `POST /api/token/` - Obtain JWT token pair
- `POST /api/token/refresh/` - Refresh JWT token
- `POST /api/login/` - Login with username and password (token authentication)

### User Profile
- `GET /api/profile/` - Get user profile information
- `PATCH /api/profile/` - Update user profile information

### File Management
- `GET /api/files/` - List all files uploaded by the user
- `POST /api/files/` - Upload a new file
- `GET /api/files/{id}/` - Get file details
- `PUT /api/files/{id}/` - Update file information
- `DELETE /api/files/{id}/` - Delete a file
- `GET /api/download/{file_id}/` - Download a file

### Address Management
- `GET /api/addresses/` - List all addresses for the user
- `POST /api/addresses/` - Add a new address
- `GET /api/addresses/{id}/` - Get address details
- `PUT /api/addresses/{id}/` - Update an address
- `DELETE /api/addresses/{id}/` - Delete an address

### Phone Number Management
- `GET /api/phone-numbers/` - List all phone numbers for the user
- `POST /api/phone-numbers/` - Add a new phone number
- `GET /api/phone-numbers/{id}/` - Get phone number details
- `PUT /api/phone-numbers/{id}/` - Update a phone number
- `DELETE /api/phone-numbers/{id}/` - Delete a phone number

### Portal Statistics
- `GET /api/stats/` - Get portal statistics

## Admin Access

Access the Django admin interface at http://localhost:8000/admin/ using the superuser credentials created during setup.

## File Types Supported

The portal supports various file types including:
- PDF documents
- Excel spreadsheets
- Word documents
- Text files
- Other file types

## Security Features

- JWT token-based authentication
- Password validation
- User-specific file access
- Protected API endpoints

## License

This project is licensed under the MIT License - see the LICENSE file for details.
