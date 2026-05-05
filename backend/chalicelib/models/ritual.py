from chalicelib.db import Base
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

class Ritual(Base):
    __tablename__ = 'ritual'

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey('profile.id'), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)
    result = Column(JSON, nullable=False)

    profile = relationship('Profile', back_populates='rituals')
    ritual_products = relationship('RitualProduct', back_populates='ritual', cascade='all, delete-orphan')
