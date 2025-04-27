# AI Chat Interface & Blog

A responsive AI chat interface built with React, Vite, and Tailwind CSS, featuring a simple blog backed by a Node.js/MySQL server.

## Features

- 💬 Real-time AI responses via configurable API endpoint (**Security Note:** Requires backend proxy for production)
- 🔧 Customizable settings (API Key, Base URL, Model, Temperature, System Prompt)
- 💾 Settings (excluding API Key) and Theme preference saved to Local Storage
- ✨ Basic UI animations
- 💻 Code highlighting in Markdown responses
- 🌓 Dark/Light theme toggle
- 📝 **Blog functionality via Backend:** Add/View Posts stored in a MySQL database.
- 🖼️ **Blog Image Uploads (Backend Implementation Needed)**

## Getting Started

### Prerequisites

- Node.js (LTS version recommended, e.g., 18.x or later)
- npm or yarn
- MySQL Server (for Blog functionality)

### Installation (Frontend)

1.  Clone the repository:
    ```bash
    git clone <your-repo-url> zcanic-chat
    cd zcanic-chat
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
    _(This installs React, Vite, Tailwind, etc. as defined in `package.json`. Note: `mysql2` is NOT a frontend dependency.)_
3.  Start the frontend development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to the URL provided by Vite (usually `http://localhost:3000`).

### Backend Setup (MySQL Required for Blog)

The blog feature **requires** the backend server and a MySQL database.

1.  **Navigate to the Server Directory:**
    ```bash
    cd server
    ```
2.  **Install Backend Dependencies:**
    ```bash
    npm install
    ```
    _(This installs `express`, `cors`, and `mysql2` as defined in `server/package.json`)_
3.  **Configure MySQL Database:**
    - Ensure you have a running MySQL server.
    - Create a database (e.g., `zcanic_blog`).
    - Create a MySQL user with privileges for this database (CONNECT, SELECT, INSERT, DELETE, CREATE TABLE).
    - **Edit `server/server.js`:** Locate the `dbConfig` object and replace placeholder values with your actual MySQL connection details (Host, User, Password, Database Name). **Use `localhost` or `127.0.0.1` for the host if the database is on the same server.**
4.  **Database Schema:** The server (`server.js`) will automatically attempt to create the necessary `blog_posts` table if it doesn't exist upon startup.

## Running the Application Locally (Frontend + Backend)

1.  **Run the Backend Server:**
    - Navigate to the `server` directory: `cd server`
    - Start the server: `node server.js`
    - The server will run on `http://localhost:3001` and connect to MySQL. Check console output.
2.  **Run the Frontend Development Server:**
    - In a **separate terminal**, navigate to the project root directory (`zcanic-chat`).
    - Start Vite: `npm run dev`
    - Open your browser to `http://localhost:3000`. The frontend code currently uses `/api/posts` to fetch data. For local development _without_ a reverse proxy, you'd need to temporarily change `API_URL` in `src/context/AppContext.jsx` to `http://localhost:3001/posts`. **Remember to change it back to `/api/posts` before building for production deployment with a reverse proxy.**

## Configuration (Chat AI)

1.  Open the chat interface.
2.  Click the **Settings** icon (⚙️).
3.  Enter your API Key.
    - **CRITICAL SECURITY WARNING:** The API Key is currently handled **directly in the frontend** (`openai` library is a frontend dependency). This is **EXTREMELY INSECURE** for any public deployment. **You MUST implement a backend proxy** to handle API calls securely for production use. The key is only held in temporary browser state and not saved to localStorage, but it's still exposed during API calls.
4.  Configure other settings (API Base URL, Model, Temperature, etc.). These non-sensitive settings are saved in localStorage.

## Built With

- React, Vite, Tailwind CSS, React Router DOM, React Markdown, Remark GFM, React Syntax Highlighter, Lucide React
- **Frontend:** OpenAI Node.js Library (**Needs replacement with backend proxy calls**)
- **Backend:** Node.js, Express, mysql2

## Key Components & Structure

- **`src/App.jsx`**: Main application, routing, context provider.
- **`src/context/AppContext.jsx`**: Manages global state (theme, settings, messages), **contains API logic for blog posts (fetching from `/api/posts`)**, and loads/saves settings/theme to localStorage.
- **`src/components/ChatInterface.jsx`**: Main chat UI, manages local state for settings including temporary API Key.
- **`src/services/openai.js`**: **Currently makes direct frontend calls to OpenAI API (INSECURE).** Needs modification to call a backend proxy endpoint.
- **`src/pages/Blog.jsx`**: Displays blog posts fetched from the backend via `AppContext`.
- **`src/pages/NewPost.jsx`**: Form for creating new blog posts, calls backend API via `AppContext`. **Image upload UI present but non-functional.**
- **`server/server.js`**: Backend Express server handling `/posts` (GET, POST, DELETE) API requests, interacting with MySQL. **Lacks image upload endpoint.**

## Blog Image Upload Backend Requirement (Needs Implementation)

The frontend (`src/pages/NewPost.jsx`) includes UI elements for uploading an image, but the corresponding backend functionality is **MISSING**.

To enable image uploads, you need to:

1.  **Choose an Upload Strategy:** Decide where to store uploaded images (e.g., a specific directory on the server like `server/public/uploads/`).
2.  **Implement Backend Endpoint:**
    - Add a new route in `server/server.js`, for example, `POST /api/upload`.
    - Use a library like `multer` to handle `multipart/form-data` requests.
    - Configure `multer` to save the uploaded file (with proper validation for file type and size) to your chosen directory.
    - Ensure the upload directory has write permissions for the Node.js process user (e.g., `www`).
    - The endpoint **must** respond with JSON:
      - Success: `{ "success": true, "imageUrl": "/uploads/your-image.jpg" }` (Use a web-accessible relative path).
      - Failure: `{ "success": false, "error": "Error description" }`.
3.  **Update Frontend:** Modify `src/pages/NewPost.jsx` to:
    - Re-enable the image input and preview logic.
    - Send the image file via `FormData` to the `/api/upload` endpoint.
    - Handle the JSON response, storing the returned `imageUrl` when adding the blog post via the `/api/posts` endpoint.

## Deployment (Example: Baota Panel with Node.js Backend & Reverse Proxy)

**This setup requires Nginx (or Apache with similar config) acting as a reverse proxy.**

1.  **Configure Backend:**
    - Ensure `server/server.js` has the **correct production database credentials**.
    - Upload the entire `server` directory (excluding `node_modules`) to your server (e.g., `/www/wwwroot/yourdomain.com/server`).
    - SSH into your server, navigate to the `server` directory, and run `npm install` to install backend dependencies.
2.  **Build Frontend:**
    - **Verify `API_URL`:** Double-check that `API_URL` in `src/context/AppContext.jsx` is set to the **relative path** `/api/posts`.
    - Run the build command in your local project root:
      ```bash
      npm run build
      ```
    - This creates the `dist` directory.
3.  **Deploy Frontend Files:**
    - In Baota Panel, go to the "Files" section for your website.
    - Upload the **contents** of your local `dist` directory to the website's root directory on the server (e.g., `/www/wwwroot/yourdomain.com`). Overwrite existing files if necessary.
4.  **Configure Node Project in Baota:**
    - Go to "Website" -> "Node project" (or PM2 Manager).
    - Add a new project:
      - **Project directory:** Set to your backend code directory (e.g., `/www/wwwroot/yourdomain.com/server`).
      - **Startup file:** `server.js`.
      - **Port:** `3001` (or whatever port `server.js` listens on).
      - **Run user:** `www`.
      - Select the appropriate Node.js version.
    - Start the project. Use Baota's interface or `pm2 list`, `pm2 logs <name>` to check status.
5.  **Configure Nginx Reverse Proxy (CRUCIAL):**
    - Go to "Website" -> Your Site -> "Reverse Proxy".
    - Add a reverse proxy rule:
      - **Proxy Name:** `backend_api` (or anything descriptive).
      - **URL:** `/api` (The path prefix you want to forward).
      - **Target URL:** `http://127.0.0.1:3001` (Points to your running Node.js backend).
      - Enable the proxy.
    - This rule tells Nginx: "Any request coming to `yourdomain.com/api/...` should be forwarded to the backend server running on port 3001, stripping the `/api` prefix before forwarding (usually default behavior, check advanced settings if needed, goal is `/api/posts` -> `http://127.0.0.1:3001/posts`)".
6.  **Configure URL Rewrite (伪静态):**
    - Go to "Website" -> Your Site -> "URL Rewrite" (伪静态).
    - Select the "react" or a similar SPA (Single Page Application) preset. This ensures that direct navigation to routes like `/blog` works correctly by serving `index.html`. Example Nginx rule:
      ```nginx
      location / {
        try_files $uri $uri/ /index.html;
      }
      ```
7.  **Security Hardening (Post-Setup):**
    - **Implement Backend Proxy for AI Chat:** Modify the frontend and backend to securely handle OpenAI API calls via the backend.
    - **Configure CORS:** In `server/server.js`, configure the `cors` middleware more strictly for production, allowing only your domain(s).
    - **Firewall:** Ensure only necessary ports (like 80, 443) are open to the public. Port 3001 should only need to be accessible from `localhost`/`127.0.0.1` by Nginx.

## Contributing & License

Contributions are welcome! Please feel free to submit a Pull Request.

This project is licensed under the MIT License.
