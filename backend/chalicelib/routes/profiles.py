import uuid
from datetime import datetime
from chalice import Blueprint, UnauthorizedError
from chalicelib.db import get_db
from chalicelib.models import Profile, Ritual, Product

profiles = Blueprint(__name__)

def require_auth(request):
    from chalicelib.auth import get_user_id_from_token
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    return get_user_id_from_token(token)

@profiles.route('/profiles', methods=['GET'])
def list_profiles():
    try:
        request = profiles.current_request
        user_id = require_auth(request)
        
        with get_db() as db:
            profiles_list = db.query(Profile).filter_by(user_id=user_id).all()
            
            results = []
            for p in profiles_list:
                try:
                    ritual_count = db.query(Ritual).filter_by(profile_id=p.id).count()
                    product_count = db.query(Product).join(Ritual).filter(Ritual.profile_id == p.id).count()
                except Exception as e:
                    print(f"Error counting for profile {p.id}: {e}")
                    ritual_count = 0
                    product_count = 0
                
                results.append({
                    'id': p.id,
                    'name': p.name,
                    'createdAt': p.created_at.isoformat(),
                    'updatedAt': p.updated_at.isoformat() if p.updated_at else None,
                    'ritualsCount': ritual_count,
                    'productsCount': product_count,
                })
            
            return {
                'profiles': results
            }
    except UnauthorizedError as e:
        return {'error': str(e)}, 401
    except Exception as e:
        return {'error': str(e)}, 500

@profiles.route('/profiles', methods=['POST'])
def create_profile():
    try:
        request = profiles.current_request
        user_id = require_auth(request)
        body = request.json_body
        
        with get_db() as db:
            profile = Profile(
                id=f'profile-{uuid.uuid4().hex[:12]}',
                user_id=user_id,
                name=body.get('name'),
            )
            db.add(profile)
            db.commit()
            
            return {
                'id': profile.id,
                'name': profile.name,
                'createdAt': profile.created_at.isoformat(),
            }, 201
    except UnauthorizedError as e:
        return {'error': str(e)}, 401
    except Exception as e:
        return {'error': str(e)}, 500

@profiles.route('/profiles/{profile_id}', methods=['DELETE'])
def delete_profile(profile_id):
    try:
        request = profiles.current_request
        user_id = require_auth(request)
        
        with get_db() as db:
            profile = db.query(Profile).filter_by(id=profile_id, user_id=user_id).first()
            
            if not profile:
                return {'error': 'Profile not found'}, 404
            
            db.delete(profile)
            db.commit()
            
            return {'message': 'Profile deleted'}, 200
    except UnauthorizedError as e:
        return {'error': str(e)}, 401
    except Exception as e:
        return {'error': str(e)}, 500