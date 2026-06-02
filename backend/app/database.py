import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

if not DATABASE_URL:
    raise ValueError("DATABASE_URL missing")

engine = create_engine(DATABASE_URL)

# Safety Guard: Throw a clear error if the environment variable is missing completely
if not DATABASE_URL:
    raise ValueError(
        "CRITICAL: DATABASE_URL environment variable is missing or not set!"
    )

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a customized Session class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create a Base class
Base = declarative_base()


# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
