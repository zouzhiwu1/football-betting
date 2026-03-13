# -*- coding: utf-8 -*-
from datetime import datetime
from app import db


class User(db.Model):
    """用户表：用户名、性别、手机号、邮箱、密码。"""
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    username = db.Column(db.String(64), unique=True, nullable=True, index=True)  # 兼容旧数据
    gender = db.Column(db.String(10), nullable=True)  # 男 / 女 / 其他
    phone = db.Column(db.String(20), unique=True, nullable=False, index=True)
    email = db.Column(db.String(128), nullable=True, index=True)
    password_hash = db.Column(db.String(255), nullable=True)  # 新注册必填，兼容旧数据
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "gender": self.gender,
            "phone": self.phone,
            "email": self.email,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class VerificationCode(db.Model):
    """短信验证码记录：用于注册/找回等场景。"""
    __tablename__ = "verification_codes"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    phone = db.Column(db.String(20), nullable=False, index=True)
    code = db.Column(db.String(10), nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
