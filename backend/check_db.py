import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv('/Users/peanutgus/Documents/Code/BrandonCollab/skincare_app/backend/.env')
DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_engine(DATABASE_URL)

def check_data():
    try:
        with engine.connect() as conn:
            # Set search path just in case
            conn.execute(text("SET search_path TO ritual, public"))
            
            print("--- Profiles ---")
            profiles = conn.execute(text("SELECT * FROM profile")).fetchall()
            for p in profiles:
                print(p)
                
            print("\n--- Rituals ---")
            rituals = conn.execute(text("SELECT * FROM ritual")).fetchall()
            for r in rituals:
                print(r)
                
            print("\n--- Products ---")
            products = conn.execute(text("SELECT * FROM product")).fetchall()
            for pr in products:
                print(pr)
                
            print("\n--- RitualProducts ---")
            rp = conn.execute(text("SELECT * FROM ritualproduct")).fetchall()
            for r_p in rp:
                print(r_p)
                
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    check_data()
