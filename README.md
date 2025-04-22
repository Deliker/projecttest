# examproject

## TaskMaster - Complete Setup Guide

This guide will walk you through setting up and running the complete TaskMaster application, including both the Spring Boot backend and Vue.js frontend.

## Prerequisites

- JDK 17+ installed
- XAMPP installed (for MySQL database)
- Node.js v14+ installed
- npm v6+ installed
- Git (optional)

## Project Structure

```
taskmaster/
├── backend/         # Spring Boot backend
├── frontend/        # Vue.js frontend
```

## Step 1: Set up and Run the Backend

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Build the project:
   ```bash
   ./mvnw clean install
   ```
   or if you're using Windows:
   ```bash
   mvnw.cmd clean install
   ```

3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   or if you're using Windows:
   ```bash
   mvnw.cmd spring-boot:run
   ```

## Step 2: Set up and Run the Frontend

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create the API and Auth service files:
   
   Create a new directory `src/services` if it doesn't exist:
   ```bash
   mkdir -p src/services
   ```
   
   Copy the `ApiService.js` and `AuthService.js` files into the `src/services` directory.

4. Start the development server:
   ```bash
   npm run serve
   ```

5. The Vue.js frontend should now be running on http://localhost:8080

## Step 3: Using the Application

1. Open your browser and go to http://localhost:8080

2. You can register a new account.

3. Once logged in, you can:
   - Create, edit, and delete tasks
   - Mark tasks as completed
   - View and track your achievements
   - Change application settings
   
### Frontend Deployment

For production deployment:
1. Build a production version:
   ```bash
   npm run build
   ```
2. The built files will be in the `dist/` directory
3. Serve these files using a web server like Nginx or Apache
