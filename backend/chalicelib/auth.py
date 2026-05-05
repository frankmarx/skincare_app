import os
import boto3
from jose import jwt, JWTError
from chalice import UnauthorizedError

COGNITO_USER_POOL_ID = os.environ.get('COGNITO_USER_POOL_ID')
COGNITO_CLIENT_ID = os.environ.get('COGNITO_CLIENT_ID')

cognito_client = boto3.client('cognito-idp')

def get_user_id_from_token(token):
    try:
        payload = jwt.get_unverified_claims(token)
        user_id = payload.get('sub')
        if not user_id:
            raise UnauthorizedError('Invalid token: missing sub claim')
        return user_id
    except JWTError:
        raise UnauthorizedError('Invalid token')

def require_auth(request):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    if not token:
        raise UnauthorizedError('Missing authorization token')
    return get_user_id_from_token(token)

def get_user_info(token):
    try:
        return jwt.get_unverified_claims(token)
    except JWTError:
        raise UnauthorizedError('Invalid token')

def sign_up(email, password):
    print(f"DEBUG: Attempting sign_up for {email} with ClientId={COGNITO_CLIENT_ID}")
    try:
        response = cognito_client.sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            Password=password,
        )
        print(f"DEBUG: sign_up response: {response}")
        return response
    except Exception as e:
        print(f"DEBUG: sign_up failed: {str(e)}")
        raise e

def confirm_sign_up(email, code):
    print(f"DEBUG: Attempting confirm_sign_up for {email} with code {code}")
    try:
        response = cognito_client.confirm_sign_up(
            ClientId=COGNITO_CLIENT_ID,
            Username=email,
            ConfirmationCode=code,
        )
        print(f"DEBUG: confirm_sign_up response: {response}")
        return response
    except Exception as e:
        print(f"DEBUG: confirm_sign_up failed: {str(e)}")
        raise e

def sign_in(email, password):
    print(f"DEBUG: Attempting sign_in for {email}")
    try:
        response = cognito_client.initiate_auth(
            ClientId=COGNITO_CLIENT_ID,
            AuthFlow='USER_PASSWORD_AUTH',
            AuthParameters={
                'USERNAME': email,
                'PASSWORD': password,
            },
        )
        print(f"DEBUG: sign_in response: {response}")
        return response
    except Exception as e:
        print(f"DEBUG: sign_in failed: {str(e)}")
        raise e
