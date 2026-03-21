-- 会员购买订单（支付宝 out_trade_no 对账）
CREATE TABLE IF NOT EXISTS payment_orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    out_trade_no VARCHAR(64) NOT NULL COMMENT '商户订单号',
    user_id INT NOT NULL,
    membership_type VARCHAR(20) NOT NULL,
    total_amount VARCHAR(16) NOT NULL COMMENT '与支付宝 total_amount 一致',
    subject VARCHAR(256) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT 'pending/paid/closed',
    trade_no VARCHAR(64) NULL COMMENT '支付宝交易号',
    created_at DATETIME NULL,
    paid_at DATETIME NULL,
    UNIQUE KEY uk_out_trade_no (out_trade_no),
    KEY idx_user_id (user_id),
    CONSTRAINT fk_payment_orders_user FOREIGN KEY (user_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
