from pydantic import BaseModel, ConfigDict, EmailStr, Field
from typing import List, Optional
from datetime import datetime


# Product Schemas
class ProductBase(BaseModel):
    name: str
    sku: str
    price: float = Field(..., gt=0, description="Price must be greater than zero")
    quantity_in_stock: int = Field(
        default=0, ge=0, description="Quantity cannot be negative"
    )


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    price: Optional[float] = Field(None, gt=0)
    quantity_in_stock: Optional[int] = Field(None, ge=0)


class ProductResponse(ProductBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Customer Schemas
class CustomerBase(BaseModel):
    full_name: str
    email: EmailStr
    phone_number: str


class CustomerCreate(CustomerBase):
    pass


class CustomerResponse(CustomerBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0, description="Must order at least 1 item")


class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate]


class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    items: List[OrderItemResponse]
    model_config = ConfigDict(from_attributes=True)
