# Quick Start Guide

## 🚀 Fast Setup (5 Minutes)

### Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm or yarn

### Step 1: Clone and Setup Database
```bash
# Create PostgreSQL database
psql -U postgres
CREATE DATABASE product_management;
\q
```

### Step 2: Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your PostgreSQL password
nano .env
# Change: DB_PASSWORD=your_actual_password

# Run migrations (creates tables + admin user)
npm run migrate

# Start backend server
npm run dev
```

Backend will run on: `http://localhost:3000`

### Step 3: Frontend Setup
```bash
# Open new terminal
cd frontend

# Install dependencies
npm install

# Start Angular dev server
npm start
```

Frontend will run on: `http://localhost:4200`

### Step 4: Login
Open browser: `http://localhost:4200`

**Default Credentials:**
- Email: `admin@example.com`
- Password: `admin123`

## 📋 Quick Commands

### Backend
```bash
npm run dev          # Start development server
npm run migrate      # Run database migrations
npm start           # Start production server
```

### Frontend
```bash
npm start           # Start dev server (ng serve)
npm run build       # Build for production
npm test            # Run tests
```

## 🎯 Quick Feature Test

1. **Login** → Use admin credentials
2. **Dashboard** → Click on any card
3. **Categories** → Add a category (e.g., "Electronics")
4. **Products** → Add a product with the category
5. **Bulk Upload** → Use `sample-bulk-upload.csv`
6. **Reports** → Download CSV or XLSX

## 🔧 Common Issues

### "Connection refused" error
- Check if PostgreSQL is running: `sudo service postgresql status`
- Verify database credentials in `.env`

### "Port 3000 already in use"
- Change PORT in backend `.env`
- Update frontend `environment.ts` apiUrl

### "Module not found" errors
- Delete `node_modules/` and run `npm install` again

## 📚 API Testing with Postman

1. Import: `Product-Management-API.postman_collection.json`
2. Run "Login" request first
3. Token will be auto-saved
4. Test other endpoints

## 🎨 UI Features

- **Gradient backgrounds** - Modern purple theme
- **Icon-enhanced navigation** - Easy visual recognition
- **Responsive design** - Works on mobile/tablet/desktop
- **Hover animations** - Interactive feedback
- **Search & filter** - Find products quickly
- **Pagination** - Handle large datasets

## 📦 What's Included

```
Angular Assesment/
├── backend/              # Node.js API
├── frontend/             # Angular app
├── sample-bulk-upload.csv
├── Product-Management-API.postman_collection.json
└── README.md
```

## 🎓 Next Steps

1. Explore the dashboard
2. Create some categories
3. Add products manually
4. Try bulk upload
5. Generate reports
6. Test API with Postman

## 💡 Tips

- Use **Ctrl+C** to stop servers
- Backend must be running for frontend to work
- Check browser console for errors
- Use Chrome DevTools for debugging

## 🆘 Need Help?

Check the main `README.md` for detailed documentation.

---

**Happy Coding! 🚀**
