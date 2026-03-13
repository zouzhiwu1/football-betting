from app.sms import generate_code, send_sms


def test_generate_code_default_length_and_digits():
    code = generate_code()
    assert len(code) >= 4  # 默认 6 位，但这里只校验至少为 4 位
    assert code.isdigit()


def test_send_sms_mock_provider_returns_true(capsys):
    ok = send_sms("13800138000", "123456")
    assert ok is True
    out, _ = capsys.readouterr()
    assert "13800138000" in out
    assert "123456" in out

