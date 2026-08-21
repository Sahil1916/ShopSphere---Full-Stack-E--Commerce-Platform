# Shop With Sahil — Interview Demo

Full-stack e-commerce demo built with **React + Vite**, **Spring Boot + JPA**, and **MySQL**.

## Deployment target

- Frontend: **Netlify**
- Backend: **Render**
- Database: **Aiven MySQL**

This repository is prepared for an **interview/portfolio demo deployment**, not a high-traffic production store.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Spring Boot 3.2, Spring Data JPA, Spring Security |
| Language | Java 17+ |
| Database | MySQL 8 / Aiven MySQL |
| Authentication | HttpSession |
| Email | Spring Mail / Gmail SMTP (optional) |

## Local setup

### 1. Database

For local MySQL:

```sql
CREATE DATABASE ONLINE_SHOPPING_CART_SPRING;
```

Then import:

```text
Shop-With-sahil.sql
```

If your SQL client reports that the database already exists, that is fine.

### 2. Backend

Set local environment variables (or use your IDE's Run Configuration):

```text
DB_HOST=localhost
DB_PORT=3306
DB_NAME=ONLINE_SHOPPING_CART_SPRING
DB_USERNAME=root
DB_PASSWORD=YOUR_LOCAL_MYSQL_PASSWORD
DB_SSL_MODE=DISABLED
JPA_DDL_AUTO=update
FRONTEND_URLS=http://localhost:5173
SESSION_COOKIE_SECURE=false
SESSION_COOKIE_SAME_SITE=Lax
APP_URL=http://localhost:5173
```

Run:

```bash
cd backend
mvn spring-boot:run
```

Backend:

```text
http://localhost:8080
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Demo accounts

The SQL seed contains demo accounts:

| Role | Email | Password |
|---|---|---|
| Admin | admin@shopverse.com | admin123 |
| Customer | sahil@example.com | customer123 |

Change these if the demo is made public for a longer period.

## Netlify + Render + Aiven deployment

### A. Aiven

1. Create an Aiven MySQL service.
2. Create/select a database.
3. Copy the Aiven connection host, port, database, username and password.
4. Keep SSL enabled (`DB_SSL_MODE=REQUIRED`).

### B. Render

Create a Web Service from this repository.

Render configuration:

```text
Root Directory: backend
Build Command: mvn clean package -DskipTests
Start Command: java -jar target/online-shopping-cart-1.0.0.jar
```

Set these environment variables:

```text
DB_HOST=<Aiven host>
DB_PORT=<Aiven port>
DB_NAME=<Aiven database>
DB_USERNAME=<Aiven username>
DB_PASSWORD=<Aiven password>
DB_SSL_MODE=REQUIRED
JPA_DDL_AUTO=update
FRONTEND_URLS=https://YOUR-SITE.netlify.app
SESSION_COOKIE_SECURE=true
SESSION_COOKIE_SAME_SITE=None
APP_URL=https://YOUR-SITE.netlify.app
```

Email variables are optional:

```text
MAIL_USERNAME=<Gmail address>
MAIL_PASSWORD=<Gmail App Password>
MAIL_FROM=<same sender address>
MAIL_SUPPORT=support@shopverse.com
```

**Never commit these values to GitHub.**

### C. Netlify

Create a Netlify site from the same repository.

The included `netlify.toml` already sets:

```text
Base directory: frontend
Build command: npm run build
Publish directory: dist
```

After Render gives you a URL, open `netlify.toml` and replace:

```text
https://YOUR-RENDER-SERVICE.onrender.com
```

with your real Render hostname.

The `/api/*` Netlify proxy is intentional: it keeps API requests same-origin from the browser, which makes the session cookie flow more reliable than calling the Render domain directly from React.

Then redeploy Netlify.

## Important deployment checks

Before putting the URL on your resume, verify:

- Register
- Login/logout
- Products
- Product details
- Add/update/remove cart items
- Checkout/order placement
- Order history
- Admin login
- Admin product create/update/delete
- Admin order management
- Normal customer cannot modify products
- Aiven database receives users/products/orders
- Refreshing React routes does not return Netlify 404
- No localhost API URL is used in the deployed frontend
- No database/email password is committed to GitHub

## API endpoints

| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/users/register` | Public |
| POST | `/api/users/login` | Public |
| POST | `/api/users/logout` | Logged in |
| GET | `/api/users/me` | Logged in |
| GET | `/api/products` | Public |
| GET | `/api/products/{id}` | Public |
| POST | `/api/products` | Admin |
| PUT | `/api/products/{id}` | Admin |
| DELETE | `/api/products/{id}` | Admin |
| GET | `/api/cart` | Logged in |
| POST | `/api/cart` | Logged in |
| PUT | `/api/cart/{id}` | Logged in |
| DELETE | `/api/cart/{id}` | Logged in |
| POST | `/api/orders` | Logged in |
| GET | `/api/orders` | Logged in |
| GET | `/api/orders/{id}` | Logged in |
| GET | `/api/admin/users` | Admin |
| PATCH | `/api/admin/users/{id}/status` | Admin |
| GET | `/api/admin/orders` | Admin |
| PATCH | `/api/admin/orders/{id}/status` | Admin |

## Security note

The original uploaded project contained a Gmail App Password. It has been removed from this deployment package.

**Revoke that old App Password in Google before using the repository or deploying it.**

This demo uses session authentication and keeps product write operations restricted to the ADMIN role. It is intended for portfolio/interview demonstration rather than a real payment/commerce production environment.
