# -*- coding: utf-8 -*-
"""
平台配置。通过环境变量或 .env 配置。
"""
import os
from urllib.parse import urlparse, unquote

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

# MySQL
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "mysql+pymysql://root:password@localhost:3306/football_betting"
)

# 占位符检测：若未修改 .env 会提示
_DB_PLACEHOLDERS = ("用户", "密码", "YOUR_MYSQL_USER", "YOUR_MYSQL_PASSWORD")
_parsed = urlparse(DATABASE_URL)
_db_user = unquote(_parsed.username or "")
if _db_user in _DB_PLACEHOLDERS:
    raise ValueError(
        "请在项目根目录的 .env 文件中配置真实的 MySQL 用户名和密码。\n"
        "将 DATABASE_URL 改为例如：mysql+pymysql://root:你的密码@localhost:3306/football_betting\n"
        "（不要使用“用户”“密码”或 YOUR_MYSQL_USER 等占位符）"
    )


def _pymysql_creator():
    """
    PyMySQL 默认用 latin-1 编码密码，中文等非 ASCII 会报错。
    用自定义 creator 把密码按 UTF-8 转成 PyMySQL 能发送的格式。
    """
    import pymysql
    parsed = urlparse(DATABASE_URL)
    password = unquote(parsed.password) if parsed.password else ""
    if password:
        # 使 password.encode('latin1') 等于 UTF-8 字节，这样 PyMySQL 发出去的就是正确密码
        password = password.encode("utf-8").decode("latin-1")
    return pymysql.connect(
        host=parsed.hostname or "localhost",
        port=parsed.port or 3306,
        user=unquote(parsed.username) if parsed.username else None,
        password=password,
        database=(parsed.path or "/").strip("/").split("/")[0] or None,
        charset="utf8mb4",
    )


def get_sqlalchemy_engine_options():
    """若使用 PyMySQL 且密码可能含非 ASCII，用自定义 creator 避免 UnicodeEncodeError。"""
    return {"creator": _pymysql_creator}

# JWT
JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "change-me-in-production")
JWT_ALGORITHM = "HS256"
JWT_EXPIRE_HOURS = 24 * 7  # 7 天

# 短信验证码
SMS_PROVIDER = os.environ.get("SMS_PROVIDER", "mock")
SMS_CODE_EXPIRE = int(os.environ.get("SMS_CODE_EXPIRE", "300"))  # 秒
SMS_CODE_LENGTH = 6
# 同一手机号发送间隔（秒）
SMS_SEND_INTERVAL = 60

# 工作目录：与 pipeline 的 WORK_SPACE 一致，便于统一管理 data/report 等路径
WORK_SPACE = os.environ.get(
    "WORK_SPACE",
    os.path.expanduser("~/Documents/cursor")
).rstrip(os.sep)
# 曲线图目录：与 football-betting-pipeline 的 REPORT_DIR 一致（plot_car.py 生成的 *_曲线.png 在此目录下按 YYYYMMDD 存放）
CURVE_IMAGE_DIR = os.environ.get(
    "CURVE_IMAGE_DIR",
    os.path.join(WORK_SPACE, "football-betting-report")
)
