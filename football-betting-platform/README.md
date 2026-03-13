# football-betting-platform

用户管理后端（注册、登录），使用 MySQL，注册时通过手机号 + 短信验证码校验。

## 技术栈

- Python 3.10+
- Flask + Flask-SQLAlchemy + PyMySQL
- JWT 登录态
- 短信验证码：默认 mock（控制台打印），可接阿里云/腾讯云等

## 本地运行

### 1. 创建 MySQL 数据库

```sql
CREATE DATABASE football_betting CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2. 环境变量

复制 `.env.example` 为 `.env`，填写：

- `DATABASE_URL`：MySQL 连接串，例如  
  `mysql+pymysql://YOUR_MYSQL_USER:YOUR_MYSQL_PASSWORD@localhost:3306/football_betting`
- `JWT_SECRET_KEY`：任意随机长字符串，用于签发登录 token

不填短信相关则使用 mock，验证码会在控制台打印。

### 3. 安装依赖并启动

```bash
cd football-betting-platform
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

服务默认在 `http://127.0.0.1:5001`（端口可在 `.env` 中设置 `PORT`）。

### 4. 网页

- **登录**：http://127.0.0.1:5001/login  
- **注册**：http://127.0.0.1:5001/register（新用户可点「去注册」进入）  
- **首页**：登录成功后跳转 http://127.0.0.1:5001/home  
- **曲线图查询**：http://127.0.0.1:5001/curves（按日期、球队名搜索并展示 football-betting-pipeline 生成的曲线图；需在 `.env` 中配置 `CURVE_IMAGE_DIR` 与 pipeline 的输出目录一致）

注册需填写：用户名、性别、密码、手机号、邮箱；手机号需先「获取验证码」（验证码会打印在运行 `python run.py` 的终端里）。

若之前已创建过 `users` 表且没有 `username`/`gender`/`email` 列，请在 MySQL 中执行：

```sql
ALTER TABLE users ADD COLUMN username VARCHAR(64) NULL, ADD COLUMN gender VARCHAR(10) NULL, ADD COLUMN email VARCHAR(128) NULL;
ALTER TABLE users ADD UNIQUE KEY username (username);
```

## API 说明

### 发送验证码

- **POST** `/api/auth/send-code`
- Body: `{ "phone": "13800138000" }`
- 成功: `{ "ok": true, "message": "验证码已发送" }`
- 频率限制：同一手机 60 秒内只能发一次

### 注册（手机号 + 验证码）

- **POST** `/api/auth/register`
- Body: `{ "phone": "13800138000", "code": "123456", "password": "可选" }`
- 成功: `{ "ok": true, "user": {...}, "token": "jwt..." }`

### 登录

- **POST** `/api/auth/login`
- 方式一（验证码）：`{ "phone": "13800138000", "code": "123456" }`
- 方式二（密码）：`{ "phone": "13800138000", "password": "xxx" }`
- 成功: `{ "ok": true, "user": {...}, "token": "jwt..." }`

后续请求在 Header 中携带：`Authorization: Bearer <token>` 即可（后续支付、查询等接口会用到）。

## 短信接入（生产环境）

当前默认 `SMS_PROVIDER=mock`，验证码只在控制台输出。生产可：

1. 在 `.env` 中设置 `SMS_PROVIDER=aliyun`（或你实现的厂商名）。
2. 在 `app/sms.py` 的 `send_verification_code` 中根据 `SMS_PROVIDER` 调用对应厂商 API（阿里云、腾讯云等），并配置 `SMS_ACCESS_KEY_ID`、`SMS_ACCESS_KEY_SECRET`、签名、模板等（变量名见 `.env.example`）。

## 数据库表

- `users`：用户（id, phone, password_hash, created_at, updated_at）
- `verification_codes`：验证码记录（phone, code, expires_at, used_at），用于防重放与过期校验

表在首次启动时通过 `db.create_all()` 自动创建。
