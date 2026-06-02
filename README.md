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
│   └── .env               # Backend environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI elements (Layout, Sidebar)
│   │   ├── pages/         # Dashboard, Products, Customers, Orders
│   │   ├── services/      # Native fetch API connection layer
│   │   └── types/         # TypeScript interfaces
│   ├── vite.config.ts     # Vite & Tailwind v4 configuration
│   └── package.json       # Node dependencies
└── docker-compose.yml     # PostgreSQL database orchestration
```

## 🚦 Getting Started

Follow these steps to run the application locally on your machine.

### Prerequisites

- **Docker Desktop** installed and running.
- **Python 3.12+** installed.
- **Node.js** installed.

### 1. Configure Environment and Start Database

The application relies on a PostgreSQL database hosted via Docker. First, set up your environment variables:

```bash
# In the root directory (inventory_system/)
# Copy the example environment file
cp .env.example .env

# Start the database and services
docker compose up -d
```

### 2. Run the Backend Server

Open a new terminal to install the Python dependencies and start the FastAPI server.

```bash
cd backend

# Create and activate a virtual environment
python -m venv .venv
# On Windows: .venv\Scripts\activate
# On Mac/Linux: source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload

```

> The backend API and interactive Swagger documentation will be available at http://127.0.0.1:8000/docs.

### 3. Run the Frontend Client

Open a third terminal to install the Node packages and start the React application.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

> The Vite server will provide a local URL (typically http://localhost:5173) where you can view the application.

## 🌐 API Endpoints Overview

| Method | Endpoint     | Description                                                   |
| :----- | :----------- | :------------------------------------------------------------ |
| `GET`  | `/products`  | Retrieve all products                                         |
| `POST` | `/products`  | Create a new product (Requires unique SKU)                    |
| `GET`  | `/customers` | Retrieve all customers                                        |
| `POST` | `/customers` | Create a new customer (Requires unique email)                 |
| `GET`  | `/orders`    | Retrieve all orders                                           |
| `POST` | `/orders`    | Create an order (Calculates total, validates & deducts stock) |
