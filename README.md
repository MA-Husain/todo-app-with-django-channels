# 📝 ToDo App with Django Channels

A full-stack collaborative ToDo application built using modern technologies:

- ⚛️ **React + Vite** frontend with **Redux Toolkit**, styled using **TailwindCSS** and **DaisyUI**
- 🐍 **Django REST Framework** backend with **Django Channels** for real-time WebSocket updates
- 🎯 JWT Authentication (Djoser)
- 👥 Shared ToDo lists with permission-based access
- 💬 Real-time updates via WebSockets

---

## 📁 Tech Stack

### 🔹 Frontend
- React (Vite)
- Redux Toolkit
- React Router
- Axios
- TailwindCSS
- DaisyUI

### 🔹 Backend
- Django & Django REST Framework
- Djoser (JWT Auth)
- Django Channels (WebSockets)
- Redis (for production real-time support) (Optional)

---

## 🚀 Features

- ✅ User authentication (Register, Login, Reset Password)
- 📋 Create, edit, delete todo items
- 📚 Create multiple ToDo lists
- 🔗 Share todo lists with others (view/edit access)
- 🌐 Real-time collaborative updates using WebSockets
- 🧑‍🤝‍🧑 See who lists are shared with and manage permissions
- 🎨 Clean, responsive UI with TailwindCSS and DaisyUI

---

## 🛠️ Setup Instructions

### 🔧 Backend (Django)

1. Clone the repository and navigate to the backend folder:
   ```sh
   git clone <repo-url>
   cd todoapp/backend
   ```

2. Create a virtual environment and install dependencies:
   ```sh
   python -m venv venv
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   pip install -r requirements.txt
   ```

3. Set up your .env file:
   ```sh
   SECRET_KEY=your-secret-key
   DEBUG=True
   ALLOWED_HOSTS=localhost,127.0.0.1
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_HOST_USER=your@gmail.com
   EMAIL_HOST_PASSWORD=your-app-password
   DOMAIN=localhost:5173
   USE_REDIS=false
   CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173,http://localhost:5173
   CSRF_TRUSTED_ORIGINS=http://localhost:5173
   ```

4. Run migrations and start the server:
   ```sh
   python manage.py makemigrations
   python manage.py migrate
   python manage.py runserver
   ```

### 🔧 Frontend (React + Vite)

1. Navigate to the frontend folder:
   ```sh
   cd ../frontend
   ```

2. Install dependencies:
   ```sh
   npm install
   ```

3. Create a .env file:
   ```sh
   VITE_API_BASE_URL=http://127.0.0.1:8000/
   ```

4. Start the frontend:
   ```sh
   npm run dev
   ```

---

## 📦 Deployment

- 🌍 Frontend can be deployed on Vercel
- 🐍 Backend can be deployed on Render
- 💡 Redis is only needed for real-time support in production (you can skip it if showing basic features)

---

## 🙋‍♂️ Author

Made with ❤️ by Md Atif Husain