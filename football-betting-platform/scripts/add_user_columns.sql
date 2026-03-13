-- 为 users 表添加 用户名、性别、邮箱 列（若表是旧版创建的）
-- 在 DBeaver 中选中 football_betting 库，逐条执行下面每条 ALTER。
-- 若某条报 "Duplicate column name" 或 "Duplicate key"，说明该列/索引已存在，可跳过。

USE football_betting;

-- 以下三条每条单独执行；缺哪列就执行哪条（已存在的列会报错，忽略即可）
ALTER TABLE users ADD COLUMN username VARCHAR(64) NULL;
ALTER TABLE users ADD COLUMN gender VARCHAR(10) NULL;
ALTER TABLE users ADD COLUMN email VARCHAR(128) NULL;

-- 最后为 username 建唯一索引（若已存在会报错，可忽略）
ALTER TABLE users ADD UNIQUE KEY uk_username (username);
