from chalicelib.db import Base
from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship

class Product(Base):
    __tablename__ = 'product'

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    product_type = Column(String, nullable=False)
