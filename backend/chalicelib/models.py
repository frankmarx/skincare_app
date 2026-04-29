from sqlalchemy import Column, String, Integer, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from chalicelib.db import Base

class Profile(Base):
    __tablename__ = 'profiles'

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rituals = relationship('Ritual', back_populates='profile', cascade='all, delete-orphan')

class Ritual(Base):
    __tablename__ = 'rituals'

    id = Column(String, primary_key=True)
    profile_id = Column(String, ForeignKey('profiles.id'), nullable=False)
    saved_at = Column(DateTime, default=datetime.utcnow)
    result = Column(JSON, nullable=False)

    profile = relationship('Profile', back_populates='rituals')

class Product(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, autoincrement=True)
    ritual_id = Column(String, ForeignKey('rituals.id'), nullable=False)
    name = Column(String, nullable=False)
    product_type = Column(String, nullable=False)
