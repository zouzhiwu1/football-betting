# -*- coding: utf-8 -*-
from flask import Flask, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

from config import DATABASE_URL, JWT_SECRET_KEY, get_sqlalchemy_engine_options

db = SQLAlchemy()


def create_app():
    app = Flask(__name__, template_folder="templates")
    app.config["SQLALCHEMY_DATABASE_URI"] = DATABASE_URL
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = get_sqlalchemy_engine_options()
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SECRET_KEY"] = JWT_SECRET_KEY
    CORS(app)

    db.init_app(app)

    from app.auth import auth_bp
    from app.curves import curves_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(curves_bp, url_prefix="/api/curves")

    @app.route("/")
    def index():
        return redirect(url_for("login_page"))

    @app.route("/login")
    def login_page():
        return render_template("login.html")

    @app.route("/register")
    def register_page():
        return render_template("register.html")

    @app.route("/home")
    def home_page():
        return render_template("home.html")

    @app.route("/curves")
    def curves_page():
        return render_template("curves.html")

    with app.app_context():
        db.create_all()

    return app
