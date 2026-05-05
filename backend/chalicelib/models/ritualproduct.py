from chalicelib.db import Base
from sqlalchemy import Column, String, Integer, ForeignKey
from sqlalchemy.orm import relationship

class RitualProduct(Base):
    __tablename__ = 'ritualproduct'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ritual_id = Column(String, ForeignKey('ritual.id'), nullable=False)
    product_id = Column(Integer, ForeignKey('product.id'), nullable=False)

    ritual = relationship('Ritual', back_populates='ritual_products')
    product = relationship('Product')
