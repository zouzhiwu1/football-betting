# -*- coding: utf-8 -*-
"""
曲线图查询：按日期和球队名搜索并展示 pipeline 生成的曲线图。
数据来源：CURVE_IMAGE_DIR 下各日期目录中的 {主队}_VS_{客队}_曲线.png
"""
import os
import re
from urllib.parse import unquote

from flask import Blueprint, send_from_directory, jsonify, request

curves_bp = Blueprint("curves", __name__)

CURVE_SUFFIX = "_曲线.png"
VS_SEP = "_VS_"


def _get_curve_dir():
    from config import CURVE_IMAGE_DIR
    return CURVE_IMAGE_DIR


def _parse_curve_filename(basename: str):
    """从文件名解析出 (主队, 客队)，若不是曲线图返回 None。"""
    if not basename.endswith(CURVE_SUFFIX):
        return None
    name = basename[: -len(CURVE_SUFFIX)]
    if VS_SEP not in name:
        return None
    parts = name.split(VS_SEP, 1)
    return (parts[0].strip(), parts[1].strip()) if len(parts) == 2 else None


def _match_team(keyword: str, home: str, away: str) -> bool:
    if not keyword or not keyword.strip():
        return True
    k = keyword.strip()
    return k in home or k in away


@curves_bp.route("/dates")
def api_dates():
    """列出曲线图目录下所有日期目录（YYYYMMDD）。"""
    base = _get_curve_dir()
    if not os.path.isdir(base):
        return jsonify({"dates": []})
    dirs = []
    for name in os.listdir(base):
        path = os.path.join(base, name)
        if os.path.isdir(path) and re.match(r"^\d{8}$", name):
            dirs.append(name)
    dirs.sort(reverse=True)
    return jsonify({"dates": dirs})


@curves_bp.route("/search")
def api_search():
    """按日期和球队名搜索曲线图。参数: date=YYYYMMDD, team=可选关键词。"""
    date = (request.args.get("date") or "").strip()
    team = (request.args.get("team") or "").strip()
    if not date or not re.match(r"^\d{8}$", date):
        return jsonify({"error": "请提供有效日期 YYYYMMDD", "items": []})
    base = _get_curve_dir()
    dir_path = os.path.join(base, date)
    if not os.path.isdir(dir_path):
        return jsonify({"date": date, "items": []})
    items = []
    for fn in os.listdir(dir_path):
        if not fn.endswith(CURVE_SUFFIX):
            continue
        parsed = _parse_curve_filename(fn)
        if not parsed:
            continue
        home, away = parsed
        if not _match_team(team, home, away):
            continue
        items.append({
            "date": date,
            "home": home,
            "away": away,
            "filename": fn,
        })
    items.sort(key=lambda x: (x["home"], x["away"]))
    return jsonify({"date": date, "items": items})


@curves_bp.route("/img/<date>/<path:filename>")
def serve_image(date, filename):
    """按日期和文件名提供曲线图图片。"""
    if not re.match(r"^\d{8}$", date):
        return "", 404
    base = _get_curve_dir()
    dir_path = os.path.join(base, date)
    filename = unquote(filename)
    if ".." in filename or not filename.endswith(CURVE_SUFFIX):
        return "", 404
    path = os.path.join(dir_path, filename)
    if not os.path.isfile(path):
        return "", 404
    return send_from_directory(dir_path, filename, mimetype="image/png")
