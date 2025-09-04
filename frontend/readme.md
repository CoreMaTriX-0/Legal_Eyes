# Legal Eyes Frontend

A React-based frontend application for the Legal Eyes legal document management platform, featuring GitHub-inspired authentication pages.

## Features

- **Authentication System**: Login and registration pages with GitHub-style design
- **Form Validation**: Real-time validation for all form fields
- **Responsive Design**: Mobile-friendly interface
- **Protected Routes**: Route protection based on authentication status
- **API Integration**: RESTful API communication with the backend

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── Auth/
│   │       ├── AuthLayout.jsx      # Layout wrapper for auth pages
│   │       ├── LoginForm.jsx       # Login form component
│   │       ├── RegisterForm.jsx    # Registration form component
│   │       ├── Auth.css           # GitHub-inspired styles
│   │       └── index.js           # Component exports
│   ├── pages/
│   │   ├── LoginPage.jsx          # Login page
│   │   └── RegisterPage.jsx       # Registration page
│   ├── utils/
│   │   ├── authApi.js            # Authentication API calls
│   │   └── validators.js         # Form validation utilities
│   ├── App.jsx                   # Main app component with routing
│   └── index.js                  # App entry point
├── public/
│   └── index.html               # HTML template
└── package.json                 # Dependencies and scripts
```

## Dependencies

### Core Dependencies
- **react**: ^18.2.0 - Core React library
- **react-dom**: ^18.2.0 - React DOM rendering
- **react-router-dom**: ^6.3.0 - Client-side routing
- **react-scripts**: 5.0.1 - Build tools and scripts

### Development Dependencies
- **@testing-library/jest-dom**: ^5.16.4 - Testing utilities
- **@testing-library/react**: ^13.3.0 - React testing utilities
- **@testing-library/user-event**: ^13.5.0 - User interaction testing
- **@types/react**: ^18.0.15 - TypeScript definitions for React
- **@types/react-dom**: ^18.0.6 - TypeScript definitions for React DOM
- **web-vitals**: ^2.1.4 - Performance monitoring

## Installation and Setup

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

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm run eject` - Ejects from Create React App (one-way operation)

## Authentication Flow

1. **Public Routes**: `/login` and `/register` - accessible when not authenticated
2. **Protected Routes**: `/dashboard` - requires authentication
3. **Auto-redirect**: Authenticated users are redirected to dashboard, unauthenticated to login

## API Configuration

The app expects a backend API running on `http://localhost:5000` by default. This can be configured by:

1. Setting the `REACT_APP_API_URL` environment variable
2. Using the proxy configuration in `package.json`

## Styling

The authentication pages use GitHub-inspired styling with:
- Clean, modern design
- Responsive layout
- Accessible form elements
- Consistent color scheme and typography
- Error states and loading indicators

## Form Validation

- **Email**: Format validation
- **Password**: Minimum 8 characters with complexity requirements
- **Username**: 3-20 characters, alphanumeric with underscores/hyphens
- **Real-time validation**: Immediate feedback on form fields
- **Password confirmation**: Ensures passwords match during registration

## Security Features

- JWT token storage in localStorage
- Token expiration validation
- Protected route guards
- Automatic logout on token expiry
- CSRF protection through API design

## Browser Support

Supports all modern browsers including:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

When making changes:
1. Follow the existing code style and structure
2. Add any new dependencies to `package.json`
3. Update this README if adding new features
4. Test authentication flows thoroughly
5. Ensure responsive design works on all screen sizes

frontend commits should contain all the needed summary for the changes, if used any new model, libarary, imports, add them to requirements file in frontend folder only or init a node_models
