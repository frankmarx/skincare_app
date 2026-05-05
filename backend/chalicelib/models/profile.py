from chalicelib.db import Base
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime

class Profile(Base):
    __tablename__ = 'profile'

    id = Column(String, primary_key=True)
    user_id = Column(String, nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    rituals = relationship('Ritual', back_populates='profile', cascade='all, delete-orphan')
