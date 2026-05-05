import os
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, declarative_base
from contextlib import contextmanager

DATABASE_URL = os.environ.get('DATABASE_URL')

engine = create_engine(DATABASE_URL)

@event.listens_for(engine, "connect")
def set_search_path(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("SET search_path TO ritual, public")
    cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

@contextmanager
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    from chalicelib.models import Profile, Ritual, Product, RitualProduct
    Base.metadata.create_all(bind=engine)
