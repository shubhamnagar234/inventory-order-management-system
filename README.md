# Inventory & Order Management System

A full-stack, containerized web application designed to manage products, customers, and orders. This system features real-time stock validation, automated inventory deduction, and a comprehensive dashboard for business insights.

**Author:** Shubham Nagar

---

## 🚀 Features

- **Command Center Dashboard:** High-level overview of total revenue, recent orders, and automated low-stock alerts.
- **Product Management:** Full CRUD operations for inventory with strict unique SKU validation.
- **Customer Management:** Track customer profiles and contact information.
- **Dynamic Order Processing:** \* Multi-item order creation.
  - **Automated Validation:** Prevents order creation if requested quantity exceeds available stock.
  - **Automated Deduction:** Instantly updates product stock upon successful order placement.
  - **Secure Calculations:** Total order amounts are calculated securely on the backend.

---

## 🛠️ Tech Stack

### Backend

- **Framework:** FastAPI (Python 3.12)
- **ORM:** SQLAlchemy 2.0
- **Data Validation:** Pydantic
- **Database:** PostgreSQL (Containerized)
- **Server:** Uvicorn

### Frontend

- **Framework:** React 18 (Vite)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Routing:** React Router DOM
- **Icons:** Lucide React
- **API Client:** Native `fetch` API wrapper

---

## 📁 Project Structure

```text
inventory_system/
├── backend/
│   ├── app/
│   │   ├── main.py        # FastAPI application & core routes
│   │   ├── models.py      # SQLAlchemy database models
│   │   ├── schemas.py     # Pydantic validation schemas
│   │   └── database.py    # Database connection & session management
│   ├── requirements.txt   # Python dependencies
│   ├── Dockerfile         # Production Dockerfile
│   └── .env.example       # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements
│   │   ├── pages/         # Dashboard, Products, Customers, Orders
│   │   └── services/      # Native fetch API connection layer
│   ├── Dockerfile         # Multi-stage Nginx Dockerfile
│   └── .env.example       # Frontend environment variables
├── docker-compose.yml     # Full-stack orchestration (DB, API, Client)
└── .env.example           # Root variables for Docker Compose
```

## 🌍 Live Demo & Deployments

- **Frontend (Vercel):** [https://inventory-order-management-system-sn.vercel.app](https://inventory-order-management-system-sn.vercel.app)
- **Backend API (Railway):** [https://inventory-order-management-system-sn.up.railway.app](https://inventory-order-management-system-sn.up.railway.app)
- **Docker Hub Image:** [https://hub.docker.com/r/shubhamnagar234/inventory-backend](https://hub.docker.com/r/shubhamnagar234/inventory-backend)

## 🚦 Quick Start (Docker)

The absolute fastest way to run the entire application (Database, Backend, and Frontend) locally is using Docker.

### Prerequisites

- **Docker Desktop** installed and running.

```bash
# 1. Copy the example environment file
cp .env.example .env

# 2. Build and start the entire stack
docker-compose up -d
```

Once running:

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Backend API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 💻 Manual Local Development (Without Docker)

If you wish to run the services individually for active development:

### 1. Start Database

Make sure you have `.env` configured, then run:

```bash
docker-compose up -d db
```

### 2. Run the Backend Server

```bash
cd backend
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Run the Frontend Client

```bash
cd frontend
npm install
npm run dev
```

## 🌐 API Endpoints Overview

| Method | Endpoint     | Description                                                   |
| :----- | :----------- | :------------------------------------------------------------ |
| `GET`  | `/products`  | Retrieve all products                                         |
| `POST` | `/products`  | Create a new product (Requires unique SKU)                    |
| `GET`  | `/customers` | Retrieve all customers                                        |
| `POST` | `/customers` | Create a new customer (Requires unique email)                 |
| `GET`  | `/orders`    | Retrieve all orders                                           |
| `POST` | `/orders`    | Create an order (Calculates total, validates & deducts stock) |
