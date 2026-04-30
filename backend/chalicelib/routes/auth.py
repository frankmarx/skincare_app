from chalice import Blueprint, Response
from chalicelib.auth import sign_up, confirm_sign_up, sign_in, get_user_info
from chalice import UnauthorizedError

auth = Blueprint(__name__)

@auth.route('/auth/me', methods=['GET'])
def me():
    try:
        # The ID token is usually passed as the Bearer token for user info
        token = auth.current_request.headers.get('Authorization', '').replace('Bearer ', '')
        if not token:
            return Response(body={'error': 'Missing token'}, status_code=401)
        
        user_info = get_user_info(token)
        return Response(body={
            'email': user_info.get('email'),
            'sub': user_info.get('sub'),
            'name': user_info.get('name')
        }, status_code=200)
    except Exception as e:
        return Response(body={'error': str(e)}, status_code=401)

@auth.route('/auth/signup', methods=['POST'])
def signup():
    try:
        body = auth.current_request.json_body
        email = body.get('email')
        password = body.get('password')
        
        if not email or not password:
            return Response(body={'error': 'Email and password required'}, status_code=400)
        
        result = sign_up(email, password)
        return Response(body={'message': 'Signup successful', 'userSub': result['UserSub']}, status_code=200)
    except Exception as e:
        error_msg = str(e)
        # Cognito throws InvalidPasswordException for any password policy violation
        if 'InvalidPasswordException' in error_msg:
            return Response(
                body={
                    'error': 'password_policy_error', 
                    'message': 'Password does not match requirements',
                    'specific_error': error_msg.split(':')[-1].strip() if ':' in error_msg else 'Password too weak',
                    'requirements': [
                        'At least 8 characters',
                        'At least one number',
                        'At least one special character',
                        'At least one uppercase and one lowercase letter'
                    ]
                }, 
                status_code=400
            )
        return Response(body={'error': error_msg}, status_code=400)

@auth.route('/auth/confirm', methods=['POST'])
def confirm():
    try:
        body = auth.current_request.json_body
        email = body.get('email')
        code = body.get('code')
        
        confirm_sign_up(email, code)
        return Response(body={'message': 'Email confirmed'}, status_code=200)
    except Exception as e:
        error_msg = str(e)
        if 'UserAlreadyConfirmedException' in error_msg or 'already confirmed' in error_msg.lower():
            return Response(body={'message': 'Email already confirmed'}, status_code=200)
        return Response(body={'error': error_msg}, status_code=400)

@auth.route('/auth/login', methods=['POST'])
def login():
    body = auth.current_request.json_body
    email = body.get('email')
    password = body.get('password')
    
    if not email or not password:
        return Response(body={'error': 'Email and password required'}, status_code=400)
    
    try:
        result = sign_in(email, password)
        return Response(
            body={
                'accessToken': result['AuthenticationResult']['AccessToken'],
                'idToken': result['AuthenticationResult']['IdToken'],
            }, 
            status_code=200
        )
    except Exception as e:
        error_msg = str(e)
        if 'User does not exist' in error_msg or 'UserNotFoundException' in error_msg:
            return Response(body={'error': 'no_account', 'message': 'No account associated with this email. Create one?', 'email': email}, status_code=401)
        elif 'Incorrect username or password' in error_msg or 'NotAuthorizedException' in error_msg:
            return Response(body={'error': 'Incorrect password'}, status_code=401)
        else:
            return Response(body={'error': error_msg}, status_code=401)
