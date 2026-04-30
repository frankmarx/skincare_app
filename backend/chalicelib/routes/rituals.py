import uuid
from chalice import Blueprint, UnauthorizedError
from chalicelib.claude import suggest_products, analyze_routine
from chalicelib.db import get_db
from chalicelib.models import Ritual, Profile, Product
from datetime import datetime

rituals = Blueprint(__name__)

def require_auth():
    from chalicelib.auth import get_user_id_from_token
    token = rituals.current_request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        raise UnauthorizedError('Missing authorization token')
    return get_user_id_from_token(token)

@rituals.route('/rituals/suggest', methods=['POST'])
def get_product_suggestions():
    try:
        body = rituals.current_request.json_body
        query = body.get('query', '')
        
        if not query:
            return {'suggestions': []}
        
        suggestions = suggest_products(query)
        return {'suggestions': suggestions}
    except Exception as e:
        return {'error': str(e)}, 500

@rituals.route('/rituals/analyze', methods=['POST'])
def analyze():
    try:
        body = rituals.current_request.json_body
        products = body.get('products', [])
        
        if not products:
            return {'error': 'No products provided'}, 400
        
        result = analyze_routine(products)
        return {'result': result}
    except Exception as e:
        return {'error': str(e)}, 500

@rituals.route('/rituals', methods=['GET'])
def list_rituals():
    try:
        user_id = require_auth()
        profile_filter = rituals.current_request.query_params.get('profileId')
        
        with get_db() as db:
            # Find all profiles for this user
            user_profiles = db.query(Profile).filter_by(user_id=user_id).all()
            profile_ids = [p.id for p in user_profiles]
            
            # Find rituals belonging to these profiles
            query = db.query(Ritual).filter(Ritual.profile_id.in_(profile_ids))
            
            if profile_filter:
                query = query.filter(Ritual.profile_id == profile_filter)
            
            rituals_list = query.order_by(Ritual.saved_at.desc()).all()
            
            results = []
            for r in rituals_list:
                # Get profile for the avatar/name
                profile = db.query(Profile).filter_by(id=r.profile_id).first()
                # Get products for this ritual
                products = db.query(Product).filter_by(ritual_id=r.id).all()
                
                results.append({
                    'id': r.id,
                    'profile': {
                        'id': profile.id if profile else None,
                        'name': profile.name if profile else 'Unknown',
                    },
                    'savedAt': r.saved_at.isoformat(),
                    'result': r.result,
                    'products': [{'name': p.name, 'type': p.product_type} for p in products],
                })
            
            return {'rituals': results}
    except Exception as e:
        return {'error': str(e)}, 500

@rituals.route('/rituals/{profile_id}', methods=['GET'])
def get_ritual(profile_id):
    try:
        user_id = require_auth()
        
        with get_db() as db:
            profile = db.query(Profile).filter_by(id=profile_id, user_id=user_id).first()
            
            if not profile:
                return {'error': 'Profile not found'}, 404
            
            ritual = db.query(Ritual).filter_by(profile_id=profile_id).order_by(Ritual.saved_at.desc()).first()
            
            if not ritual:
                return {'ritual': None}
            
            products = db.query(Product).filter_by(ritual_id=ritual.id).all()
            
            return {
                'ritual': {
                    'id': ritual.id,
                    'savedAt': ritual.saved_at.isoformat(),
                    'result': ritual.result,
                    'products': [{'name': p.name, 'type': p.product_type} for p in products],
                }
            }
    except Exception as e:
        return {'error': str(e)}, 500

@rituals.route('/rituals', methods=['POST'])
def save_ritual():
    try:
        user_id = require_auth()
        body = rituals.current_request.json_body
        
        profile_id = body.get('profileId')
        products = body.get('products', [])
        result = body.get('result', {})
        
        if not profile_id:
            return {'error': 'Profile ID required'}, 400
        
        with get_db() as db:
            profile = db.query(Profile).filter_by(id=profile_id, user_id=user_id).first()
            
            if not profile:
                return {'error': 'Profile not found'}, 404
            
            ritual_id = f'ritual-{uuid.uuid4().hex[:12]}'
            ritual = Ritual(
                id=ritual_id,
                profile_id=profile_id,
                saved_at=datetime.utcnow(),
                result=result,
            )
            db.add(ritual)
            
            for p in products:
                product = Product(
                    ritual_id=ritual_id,
                    name=p.get('name', ''),
                    product_type=p.get('type', 'Other'),
                )
                db.add(product)
            
            db.commit()
            
            profile.updated_at = datetime.utcnow()
            db.commit()
            
            return {
                'id': ritual_id,
                'savedAt': ritual.saved_at.isoformat(),
            }, 201
    except Exception as e:
        return {'error': str(e)}, 500
