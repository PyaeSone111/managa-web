# Manga Web Application

A full-stack web application for reading manga, manhwa, and manhua, built with Laravel (backend API) and React (frontend) using Vite.

## 📋 Project Structure

```
.
├── laravel/                 # Laravel backend API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── Admin/    # Admin controllers
│   │   │   │   │   └── ...       # Public API controllers
│   │   │   └── Middleware/
│   │   │       └── AdminMiddleware.php
│   │   └── Models/
│   ├── database/
│   │   └── migrations/
│   └── routes/
│       └── api.php
├── frontend/                # React frontend (public site)
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── utils/
│   ├── package.json
│   └── vite.config.js
├── admin-dashboard/         # React admin dashboard
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── services/
│   ├── package.json
│   └── vite.config.js
├── PROJECT_SPECIFICATION.md  # Detailed project specification
├── API_CONTRACTS.md         # API request/response documentation
├── SETUP_GUIDE.md           # Setup instructions
├── SETUP_COMPLETE.md        # Post-setup checklist
└── README.md                # This file
```

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL/PostgreSQL
- Laravel 9.x (or compatible)

### ✅ Dependencies Installed

All dependencies have been installed:
- ✅ Laravel backend dependencies (composer install)
- ✅ Frontend dependencies (npm install)
- ✅ Admin dashboard dependencies (npm install)

### Backend Setup (Laravel)

1. Navigate to Laravel directory:
```bash
cd laravel
```

2. Copy environment file (if not exists):
```bash
cp .env.example .env
```

3. Generate application key:
```bash
php artisan key:generate
```

4. Configure database in `.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=manga_web
DB_USERNAME=root
DB_PASSWORD=your_password
```

5. Run migrations:
```bash
php artisan migrate
```

6. Install Laravel Sanctum (for authentication):
```bash
php artisan vendor:publish --provider="Laravel\Sanctum\SanctumServiceProvider"
php artisan migrate
```

7. Create storage link:
```bash
php artisan storage:link
```

8. (Optional) Install Intervention Image for image processing:
```bash
composer require intervention/image
```

9. Start the server:
```bash
php artisan serve
```

The API will be available at `http://localhost:8000`

### Frontend Setup (React)

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. Start development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Admin Dashboard Setup (React)

1. Navigate to admin dashboard directory:
```bash
cd admin-dashboard
```

2. Create `.env` file:
```env
VITE_API_BASE_URL=http://localhost:8000/api/v1
```

3. Start development server:
```bash
npm run dev
```

The admin dashboard will be available at `http://localhost:3001`

## 📚 Documentation

- **PROJECT_SPECIFICATION.md**: Complete project architecture and specifications
- **API_CONTRACTS.md**: Detailed API endpoint documentation with request/response examples
- **frontend/REACT_COMPONENT_SPECS.md**: React component specifications and structure
- **SETUP_GUIDE.md**: Detailed setup instructions
- **SETUP_COMPLETE.md**: Post-setup checklist and next steps

## 🗄️ Database Schema

The application uses the following main tables:

- `users` - User accounts (optional)
- `series` - Manga/manhwa/manhua series
- `chapters` - Individual chapters
- `chapter_pages` - Chapter page images
- `categories` - Series categories/genres
- `tags` - Series tags
- `series_category` - Series-category pivot table
- `series_tag` - Series-tag pivot table
- `user_bookmarks` - User bookmarks (optional)
- `user_reading_progress` - Reading progress tracking (optional)

See migration files in `laravel/database/migrations/` for complete schema.

## 🔑 Key Features

### Backend (Laravel)
- RESTful API architecture
- Optional authentication with Laravel Sanctum
- Full-text search
- Pagination and filtering
- Admin panel routes
- CDN integration for images
- Caching support

### Frontend (React)
- Modern React with hooks
- React Router for navigation
- React Query for data fetching
- Dark/light theme toggle
- Responsive design
- SEO support with React Helmet
- Image lazy loading
- Infinite scroll support

## 🛠️ Development

### Running Tests

**Laravel:**
```bash
cd laravel
php artisan test
```

**React:**
```bash
cd frontend
npm test
```

### Building for Production

**Frontend:**
```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`

## 📝 API Endpoints

### Public Endpoints

- `GET /api/v1/series` - List series
- `GET /api/v1/series/{id}` - Get series details
- `GET /api/v1/series/{id}/chapters` - Get series chapters
- `GET /api/v1/chapters/{id}` - Get chapter details
- `GET /api/v1/categories` - List categories
- `GET /api/v1/tags` - List tags
- `GET /api/v1/search` - Search series
- `GET /api/v1/latest` - Latest updates
- `GET /api/v1/popular` - Popular series
- `GET /api/v1/trending` - Trending series

### Authentication Endpoints

- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/logout` - Logout user (requires auth)
- `GET /api/v1/auth/me` - Get authenticated user (requires auth)

### Admin Endpoints (Authentication Required)

- `POST /api/v1/admin/series` - Create series
- `PUT /api/v1/admin/series/{id}` - Update series
- `DELETE /api/v1/admin/series/{id}` - Delete series
- `POST /api/v1/admin/chapters` - Create chapter
- `PUT /api/v1/admin/chapters/{id}` - Update chapter
- `DELETE /api/v1/admin/chapters/{id}` - Delete chapter
- `POST /api/v1/admin/categories` - Create category
- `PUT /api/v1/admin/categories/{id}` - Update category
- `DELETE /api/v1/admin/categories/{id}` - Delete category
- `POST /api/v1/admin/tags` - Create tag
- `PUT /api/v1/admin/tags/{id}` - Update tag
- `DELETE /api/v1/admin/tags/{id}` - Delete tag
- `POST /api/v1/admin/upload` - Upload single image
- `POST /api/v1/admin/upload/bulk` - Upload multiple images

See `API_CONTRACTS.md` for detailed request/response formats.

## 🎨 Styling

The frontend uses Tailwind CSS for styling. Configuration is in `frontend/tailwind.config.js`.

## 🔒 Security

- CORS configuration
- XSS protection
- CSRF tokens for admin endpoints
- Input validation and sanitization
- SQL injection prevention (Laravel Eloquent)
- Rate limiting on API endpoints

## 📦 Deployment

### Backend Deployment

1. Set up production environment variables
2. Run migrations: `php artisan migrate --force`
3. Optimize: `php artisan config:cache` and `php artisan route:cache`
4. Set up web server (Nginx/Apache) or use Laravel Forge/Vapor

### Frontend Deployment

1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, Netlify, etc.)
3. Configure environment variables
4. Set up CDN for images

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🆘 Support

For issues and questions, please open an issue on the repository.

