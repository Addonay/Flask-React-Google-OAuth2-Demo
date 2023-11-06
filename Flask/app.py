import os

import requests
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from dotenv import load_dotenv
from flask_jwt_extended import create_access_token, JWTManager, jwt_required, get_jwt_identity, create_refresh_token
from flask_cors import CORS
from uuid import uuid4

app = Flask(__name__)
CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///db.sqlite'
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'default-secret-key') 
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)
load_dotenv()  

GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_SECRET_KEY = os.getenv('GOOGLE_SECRET_KEY')

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid4()))
    name = db.Column(db.String(100))
    email = db.Column(db.String(100), unique=True)
    profile = db.Column(db.String(200))


@app.route('/', methods=['GET'])
def hello_world():
    return "hello world"


@app.route('/google_login', methods=['POST'])
def login():
    auth_code = request.get_json()['code']

    data = {
        'code': auth_code,
        'client_id': GOOGLE_CLIENT_ID, 
        'client_secret': GOOGLE_SECRET_KEY, 
        'redirect_uri': 'postmessage',
        'grant_type': 'authorization_code'
    }

    response = requests.post('https://oauth2.googleapis.com/token', data=data).json()
    headers = {
        'Authorization': f'Bearer {response["access_token"]}'
    }
    user_info = requests.get('https://www.googleapis.com/oauth2/v3/userinfo', headers=headers).json()

    # Check if the user exists in the database
    existing_user = User.query.filter_by(email=user_info['email']).first()

    if not existing_user:
        # If the user doesn't exist, create a new User record
        new_user = User(
            name=user_info['name'],
            email=user_info['email'],
            profile=user_info['picture']
        )
        db.session.add(new_user)
        db.session.commit()

    access_token = create_access_token(identity=user_info['email'])
    refresh_token = create_refresh_token(identity=user_info['email'])

    response = jsonify(user=user_info)
    response.set_cookie('access_token_cookie', value=access_token, secure=False, httponly=False)
    response.set_cookie('refresh_token_cookie', value=refresh_token, secure=False, httponly=True)

    return response, 200

# Route to refresh the access token using a refresh token
@app.route('/refresh_token', methods=['POST'])
@jwt_required(refresh=True)
def refresh_token():
    current_user = get_jwt_identity()
    access_token = create_access_token(identity=current_user)
    response = jsonify(access_token=access_token)
    return response, 200

@app.route('/logout', methods=['POST'])
@jwt_required()  
def logout():
    response = jsonify(message='Logged out successfully')
    response.set_cookie('access_token_cookie', value='', expires=0)
    response.set_cookie('refresh_token_cookie', value='', expires=0)

    return response, 200


@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user_email = get_jwt_identity()
    user = User.query.filter_by(email=current_user_email).first()

    if not user:
        return jsonify(message="User not found"), 404

    user_info = {
        "id":user.id,
        "name": user.name,
        "email": user.email,
        "profile": user.profile
    }

    return jsonify(logged_in_as=user_info), 200


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
