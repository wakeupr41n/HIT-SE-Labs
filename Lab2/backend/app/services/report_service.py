"""AI-powered health report generation service."""
import os
import json
import urllib.request
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
from .. import models

REPORT_SYSTEM_PROMPT = """你是一个专业的健康报告分析师。请根据用户的健康数据生成一份结构化的中文健康{report_type}报告。

报告必须包含以下章节，使用 Markdown 格式：

## 综合评估
对用户整体健康状况的总体评价（1-2段）

## 各项指标分析
逐项分析以下指标的趋势和异常：
- 心率：正常范围 60-100 bpm
- 血压：正常收缩压 < 140 mmHg，舒张压 < 90 mmHg
- 体重：结合BMI分析
- 睡眠：推荐 7-9 小时
- 饮水：推荐每日 1500-2000 ml
- 步数：推荐每日 8000-10000 步

## 改善建议
针对发现的问题给出3-5条具体的改善建议

回复使用中文，专业但亲切，总字数控制在500-800字。"""


def _build_report_context(user: models.User, records: List[models.HealthRecord], stats: dict) -> str:
    """Build health data context for report generation."""
    ctx = f"用户信息：{user.name}，{user.age}岁，{user.gender}，身高{user.height}cm，体重{user.weight}kg，职业：{user.occupation}\n\n"

    ctx += "【统计摘要】\n"
    for metric, values in stats.items():
        ctx += f"- {metric}：平均 {values['avg']:.1f}，最低 {values['min']:.1f}，最高 {values['max']:.1f}\n"

    ctx += "\n【每日明细】\n"
    for r in records:
        ctx += (
            f"- {r.record_date.strftime('%m/%d')}：心率{r.heart_rate}bpm，"
            f"血压{r.systolic_bp}/{r.diastolic_bp}，"
            f"睡眠{r.sleep_hours}h，饮水{r.water_intake}ml，步数{r.steps}\n"
        )

    return ctx


def _compute_stats(records: List[models.HealthRecord]) -> dict:
    """Compute aggregate statistics from health records."""
    if not records:
        return {}

    stats = {}
    metrics = {
        "心率": [r.heart_rate for r in records if r.heart_rate > 0],
        "收缩压": [r.systolic_bp for r in records if r.systolic_bp > 0],
        "舒张压": [r.diastolic_bp for r in records if r.diastolic_bp > 0],
        "体重": [r.weight for r in records if r.weight > 0],
        "睡眠时长": [r.sleep_hours for r in records if r.sleep_hours > 0],
        "饮水量": [float(r.water_intake) for r in records if r.water_intake > 0],
        "步数": [float(r.steps) for r in records if r.steps > 0],
    }

    for name, values in metrics.items():
        if values:
            stats[name] = {
                "avg": sum(values) / len(values),
                "min": min(values),
                "max": max(values),
            }

    return stats


def _call_llm_api(system_prompt: str, user_prompt: str) -> Optional[str]:
    """Call the LLM API to generate report content."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return None

    try:
        base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
        model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ]

        req_data = json.dumps({
            "model": model,
            "messages": messages,
            "max_tokens": 1500,
            "temperature": 0.6,
        }).encode("utf-8")

        req = urllib.request.Request(
            f"{base_url}/chat/completions",
            data=req_data,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )

        proxy_handler = urllib.request.ProxyHandler({})
        opener = urllib.request.build_opener(proxy_handler)

        with opener.open(req, timeout=30.0) as resp:
            result = json.loads(resp.read().decode("utf-8"))
            return result["choices"][0]["message"]["content"].strip()

    except Exception:
        return None


def _fallback_report(user: models.User, stats: dict, report_type: str) -> str:
    """Generate a rule-based fallback report when AI is unavailable."""
    type_label = "周" if report_type == "weekly" else "月"
    lines = [f"## {type_label}度综合评估\n"]

    overall_status = "良好"
    warnings = []

    if "心率" in stats:
        hr = stats["心率"]["avg"]
        if hr > 100:
            warnings.append(f"平均心率偏高 ({hr:.0f}bpm)")
            overall_status = "需关注"
        elif hr < 60:
            warnings.append(f"平均心率偏低 ({hr:.0f}bpm)")

    if "收缩压" in stats:
        sbp = stats["收缩压"]["avg"]
        if sbp >= 140:
            warnings.append(f"平均收缩压偏高 ({sbp:.0f}mmHg)")
            overall_status = "需关注"

    if warnings:
        lines.append(f"您的整体健康状况**{overall_status}**，以下指标需要特别注意：\n")
        for w in warnings:
            lines.append(f"- {w}")
    else:
        lines.append("您的整体健康状况**良好**，各项指标基本在正常范围内。\n")

    lines.append(f"\n## 各项指标分析\n")
    for name, values in stats.items():
        lines.append(f"**{name}**：平均 {values['avg']:.1f}，范围 {values['min']:.1f} - {values['max']:.1f}\n")

    lines.append(f"\n## 改善建议\n")
    suggestions = [
        "保持规律作息，确保每日7-8小时睡眠",
        "每日饮水不少于1500ml，分多次少量饮用",
        "工作期间每隔1小时起身活动5-10分钟",
        "坚持每日步行8000步以上，增强心肺功能",
        "定期监测血压和心率，如有持续异常请及时就医",
    ]
    for i, s in enumerate(suggestions, 1):
        lines.append(f"{i}. {s}\n")

    return "\n".join(lines)


def generate_report(db: Session, user: models.User, report_type: str) -> models.HealthReport:
    """Generate an AI health report for the user."""
    # Determine date range
    days = 7 if report_type == "weekly" else 30
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Query records in date range
    records = (
        db.query(models.HealthRecord)
        .filter(
            models.HealthRecord.user_id == user.id,
            models.HealthRecord.record_date >= start_date,
            models.HealthRecord.record_date <= end_date,
        )
        .order_by(models.HealthRecord.record_date.asc())
        .all()
    )

    if not records:
        raise ValueError("该时段内无健康数据，请先录入健康记录")

    # Compute statistics
    stats = _compute_stats(records)

    # Build context and call AI
    type_label = "周报" if report_type == "weekly" else "月报"
    system_prompt = REPORT_SYSTEM_PROMPT.format(report_type=type_label)
    context = _build_report_context(user, records, stats)

    ai_content = _call_llm_api(system_prompt, context)

    if not ai_content:
        ai_content = _fallback_report(user, stats, report_type)

    # Create report title
    title = f"{user.name or user.username}的健康{type_label} - {start_date.strftime('%m/%d')}-{end_date.strftime('%m/%d')}"

    # Persist report
    report = models.HealthReport(
        user_id=user.id,
        report_type=report_type,
        title=title,
        content=ai_content,
        start_date=start_date,
        end_date=end_date,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    return report
