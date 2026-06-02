import uuid
from fastapi.testclient import TestClient
from app.main import app

# Create a test client that talks directly to our FastAPI app
client = TestClient(app)

def test_inventory_and_order_logic():
    """
    Tests the complete lifecycle:
    1. Creating a product with a unique SKU
    2. Creating a customer with a unique email
    3. Successfully ordering 2 items (verifying price calculation)
    4. Failing to order 5 more items (verifying stock protection)
    """
    
    # Generate a short random string so this test can be run multiple times safely
    unique_suffix = str(uuid.uuid4())[:8]
    test_sku = f"TEST-KB-{unique_suffix}"
    test_email = f"jane-{unique_suffix}@test.com"
    
    # 1. Create a Product
    product_response = client.post(
        "/products",
        json={"name": "Test Keyboard", "sku": test_sku, "price": 100.00, "quantity_in_stock": 5}
    )
    # Safely accept both 200 OK and 201 Created
    assert product_response.status_code in (200, 201)
    product_id = product_response.json()["id"]

    # 2. Create a Customer
    customer_response = client.post(
        "/customers",
        json={"full_name": "Jane Doe", "email": test_email, "phone_number": "555-0199"}
    )
    assert customer_response.status_code in (200, 201)
    customer_id = customer_response.json()["id"]

    # 3. Create a Valid Order (Buying 2 items)
    order_response = client.post(
        "/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 2}]
        }
    )
    assert order_response.status_code in (200, 201)
    
    # Verify the backend correctly calculated the total ($100 x 2)
    assert order_response.json()["total_amount"] == 200.00

    # 4. Attempt an Invalid Order (Trying to buy 5, but only 3 are left)
    invalid_order = client.post(
        "/orders",
        json={
            "customer_id": customer_id,
            "items": [{"product_id": product_id, "quantity": 5}]
        }
    )
    
    # Verify the backend throws a 400 Bad Request
    assert invalid_order.status_code == 400
    # Verify the exact error message is returned
    assert "Insufficient stock" in invalid_order.json()["detail"]