# Product Management System

A full-stack web application built with Angular, Node.js, Express, and PostgreSQL for managing users, categories, and products with advanced features like bulk upload and report generation.

## Features

### Backend (Node.js + Express + PostgreSQL)
- **User Management**: CRUD operations with encrypted passwords (bcrypt)
- **Category Management**: Create, read, update, and delete categories
- **Product Management**: Full CRUD with image upload support
- **Authentication**: JWT-based authentication system
- **Bulk Upload**: Handle large CSV/XLSX files without timeout errors using streaming
- **Report Generation**: Download product reports in CSV/XLSX format with streaming
- **Advanced Product API**:
  - Server-side pagination
  - Sorting by price (ascending/descending)
  - Search by product name
  - Filter by category name and ID

### Frontend (Angular)
- **Modern UI**: Clean and responsive design
- **Authentication**: Login and registration with form validation
- **User Management**: View and manage users
- **Category Management**: CRUD operations with modal dialogs
- **Product Management**:
  - Create/Edit products with image upload
  - Paginated product list
  - Search and filter functionality
  - Sort by price
  - Bulk upload via CSV/XLSX
  - Download reports (CSV/XLSX)

## Technology Stack

### Backend
- Node.js
- Express.js
- PostgreSQL
- Sequelize ORM
- JWT for authentication
- Bcrypt for password encryption
- Multer for file uploads
- CSV-Parser & XLSX for file processing

### Frontend
- Angular 17
- RxJS
- Reactive Forms
- HttpClient
- Router

## Project Structure

```
Angular Assesment/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   └── productController.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── upload.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Category.js
│   │   ├── Product.js
│   │   └── index.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── categories.js
│   │   └── products.js
│   ├── migrations/
│   │   └── run-migrations.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── services/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   └── ...
│   │   ├── environments/
│   │   └── ...
│   └── package.json
└── Product-Management-API.postman_collection.json
```

## Database Schema

### User Table
- `id`: Primary Key (Auto-increment)
- `email`: String (Unique, Email validation)
- `password`: String (Encrypted with bcrypt)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Category Table
- `id`: Primary Key (Auto-increment)
- `uniqueId`: String (Auto-generated UUID)
- `name`: String (Required)
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

### Product Table
- `id`: Primary Key (Auto-increment)
- `uniqueId`: String (Auto-generated UUID)
- `name`: String (Required)
- `image`: String (Optional)
- `price`: Decimal(10,2) (Required, Min: 0)
- `categoryId`: Foreign Key → Category.id
- `createdAt`: Timestamp
- `updatedAt`: Timestamp

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Angular CLI (`npm install -g @angular/cli`)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a PostgreSQL database:
```sql
CREATE DATABASE product_management;
```

4. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your database credentials:
```
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=product_management
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key_change_this_in_production
JWT_EXPIRES_IN=24h

MAX_FILE_SIZE=52428800
UPLOAD_DIR=uploads
```

5. Run database migrations:
```bash
npm run migrate
```

This will create all tables and a default admin user:
- Email: `admin@example.com`
- Password: `admin123`

6. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:4200`

## API Documentation

### Authentication Endpoints

#### Register
```
POST /api/auth/register
Body: { "email": "user@example.com", "password": "password123" }
```

#### Login
```
POST /api/auth/login
Body: { "email": "user@example.com", "password": "password123" }
Response: { "token": "jwt_token", "user": {...} }
```

#### Get Profile
```
GET /api/auth/profile
Headers: { "Authorization": "Bearer <token>" }
```

### User Endpoints (Requires Authentication)

```
GET    /api/users          - Get all users
GET    /api/users/:id      - Get user by ID
PUT    /api/users/:id      - Update user
DELETE /api/users/:id      - Delete user
```

### Category Endpoints (Requires Authentication)

```
POST   /api/categories     - Create category
GET    /api/categories     - Get all categories
GET    /api/categories/:id - Get category by ID
PUT    /api/categories/:id - Update category
DELETE /api/categories/:id - Delete category
```

### Product Endpoints (Requires Authentication)

```
POST   /api/products                    - Create product (multipart/form-data)
GET    /api/products                    - Get all products (with pagination, search, filter)
GET    /api/products/:id                - Get product by ID
PUT    /api/products/:id                - Update product (multipart/form-data)
DELETE /api/products/:id                - Delete product
POST   /api/products/bulk-upload        - Bulk upload products (CSV/XLSX)
GET    /api/products/report?format=csv  - Generate CSV report
GET    /api/products/report?format=xlsx - Generate XLSX report
```

### Product List Query Parameters

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search by product name
- `categoryId`: Filter by category ID
- `categoryName`: Filter by category name
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

Example:
```
GET /api/products?page=1&limit=10&sortBy=price&sortOrder=asc&search=laptop
```

## Bulk Upload Format

### CSV Format
```csv
name,price,categoryId,image
Laptop,999.99,1,laptop.jpg
Mouse,29.99,1,
Keyboard,79.99,1,keyboard.jpg
```

### XLSX Format
Same structure as CSV with columns: name, price, categoryId, image

## Testing with Postman

1. Import the Postman collection:
   - Open Postman
   - Click Import
   - Select `Product-Management-API.postman_collection.json`

2. Set up environment variables:
   - `baseUrl`: `http://localhost:3000/api`
   - `token`: (will be auto-set after login)

3. Test the API:
   - First, run the "Login" request to get a token
   - The token will be automatically saved
   - All other requests will use this token for authentication

## Features Highlights

### 1. Bulk Upload (No Timeout)
- Uses streaming to process large files
- Batch processing (100 records at a time)
- Validates category existence
- Returns detailed success/failure summary

### 2. Report Generation (No Timeout)
- Streaming response for large datasets
- Supports CSV and XLSX formats
- Includes all product and category information

### 3. Server-Side Pagination
- Efficient database queries
- Configurable page size
- Total count and page information

### 4. Advanced Search & Filter
- Search by product name (case-insensitive)
- Filter by category ID or name
- Sort by any field (especially price)
- Combined filters support

### 5. Security
- JWT-based authentication
- Password encryption with bcrypt
- Protected routes with middleware
- Input validation

## Default Credentials

After running migrations, use these credentials to login:
- **Email**: admin@example.com
- **Password**: admin123

## Troubleshooting

### Database Connection Error
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists

### Port Already in Use
- Change PORT in backend `.env` file
- Update `apiUrl` in frontend `environment.ts`

### File Upload Issues
- Check `UPLOAD_DIR` exists
- Verify file size limits in `.env`
- Ensure proper file permissions

## License

MIT

## Author

Product Management System - Angular Assessment
