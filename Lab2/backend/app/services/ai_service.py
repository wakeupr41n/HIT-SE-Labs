"""
AI Service: Handles communication with LLM API (OpenAI-compatible).
Builds health-aware prompts from user profile + recent records.
Falls back to a rule-based response if API is unavailable.
"""

import os
from typing import List, Optional

# Try to import openai; if not installed, use fallback
try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False


SYSTEM_PROMPT = """你是一个专业的办公室健康管理助手。你的职责是：
1. 根据用户的健康数据（心率、血压、体重、睡眠、饮水、运动步数），给出个性化的健康建议。
2. 关注办公室常见健康问题：久坐、眼疲劳、颈椎问题、压力管理等。
3. 回答用户关于健康的问题，语气亲切专业。
4. 如果发现异常数据（如心率过高、血压异常），主动提醒用户注意。
5. 回复使用中文，简洁明了，每次回复控制在200字以内。"""


def _build_health_context(user, records) -> str:
    """Build health data context string for the LLM."""
    ctx = f"用户信息：{user.name}，{user.age}岁，{user.gender}，身高{user.height}cm，体重{user.weight}kg，职业：{user.occupation}\n"

    if records:
        ctx += "\n最近的健康记录：\n"
        for r in records[:5]:
            ctx += (
                f"- {r.record_date.strftime('%m/%d')}：心率{r.heart_rate}bpm，"
                f"血压{r.systolic_bp}/{r.diastolic_bp}，"
                f"睡眠{r.sleep_hours}h，饮水{r.water_intake}ml，步数{r.steps}\n"
            )
    else:
        ctx += "\n暂无健康记录数据。\n"

    return ctx


def _build_messages(user, records, history, user_message: str) -> list:
    """Build the message list for the LLM API call."""
    health_context = _build_health_context(user, records)
    messages = [{"role": "system", "content": SYSTEM_PROMPT + "\n\n" + health_context}]

    for msg in history[-8:]:  # Last 8 messages for context window
        messages.append({"role": msg.role, "content": msg.content})

    messages.append({"role": "user", "content": user_message})
    return messages


def _fallback_response(user, records, user_message: str) -> str:
    """Rule-based fallback when LLM API is not available."""
    msg = user_message.lower()
    
    if "你好" in msg or "hi" in msg or "hello" in msg:
        return f"您好，{user.name}！我是 Aura Intelligence。目前系统运行在离线健康分析系模式。有什么我可以帮您的？"
        
    if "心率" in msg or "心脏" in msg:
        if records:
            return f"关于您的心脏健康：您最近的静息心率记录为 {records[0].heart_rate} bpm。保持规律作息和适度有氧运动可以强化您的心肺功能。"
        return "您还没有录入心率数据，请先前往数据中心记录。"
        
    if "血压" in msg:
        if records:
            return f"您最近的血压为 {records[0].systolic_bp}/{records[0].diastolic_bp} mmHg。建议采取低盐饮食，并在情绪激动时做深呼吸放松。"
        return "还没有发现关于您血压的记录，记得每天按时测量哦。"
        
    if "睡眠" in msg or "熬夜" in msg or "困" in msg:
        if records:
            if records[0].sleep_hours < 7:
                return f"我注意到您最近只睡了 {records[0].sleep_hours} 小时。长期睡眠不足会影响代谢和情绪，今晚试着提前半小时放下手机入睡吧。"
            return f"您的睡眠时间 ({records[0].sleep_hours}小时) 很充足！继续保持这个优秀的睡眠习惯。"
        return "优质睡眠是高能状态的基础。您可以开始记录睡眠，让我为您分析。"
        
    if "运动" in msg or "步数" in msg or "锻炼" in msg or "减肥" in msg:
        if records:
             return f"您最近的活动量为 {records[0].steps} 步。在办公室久坐时，别忘了每 45 分钟站起来伸展一下身体。"
        return "不管多忙，也要记得让身体动一动。您可以在页面左侧记录每日步数。"

    # Default fallback summarizing current status
    response = "【离线健康状态播报】\n"
    if records:
        latest = records[0]
        if latest.heart_rate > 100:
             response += f"⚠️ 心率偏高 ({latest.heart_rate}bpm)，请深呼吸放松。\n"
        if latest.systolic_bp > 140 or latest.diastolic_bp > 90:
             response += f"⚠️ 血压偏高 ({latest.systolic_bp}/{latest.diastolic_bp})，请注意清淡饮食。\n"
        if latest.sleep_hours < 6:
             response += f"🛌 睡眠严重不足 ({latest.sleep_hours}h)，请务必尽早休息。\n"
        response += "\n📌 提示：目前后端未配置真实的 LLM API Key (如 OpenAI 或 Gemini)，因此我只能根据关键词和规则与您对话。如果要让我变得像真正的 AI 一样全能，请在后端 `.env` 中配置 `OPENAI_API_KEY`。"
        return response
    
    return "💡 提示：我是您的本地规则引擎助手。目前后端暂未配置真实的大模型 API 密钥（如 OpenAI / Gemini），因此我只能做固定逻辑回复。要唤醒真正的 AI，请协助开发者配置 API Key。"



import urllib.request
import urllib.error
import json

def get_ai_response(user, records, history, user_message: str) -> str:
    """
    Get AI response using standard native Python HTTP requests to avoid proxy hangs.
    """
    api_key = os.getenv("OPENAI_API_KEY")

    if api_key and api_key != "":
        try:
            base_url = os.getenv("OPENAI_BASE_URL", "https://api.openai.com/v1").rstrip("/")
            model = os.getenv("OPENAI_MODEL", "gpt-3.5-turbo")
            messages = _build_messages(user, records, history, user_message)

            req_data = json.dumps({
                "model": model,
                "messages": messages,
                "max_tokens": 500,
                "temperature": 0.7
            }).encode("utf-8")

            # Native urllib request with a strict 15-second timeout
            req = urllib.request.Request(
                f"{base_url}/chat/completions",
                data=req_data,
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}"
                },
                method="POST"
            )

            # Creating a custom opener that bypasses local python proxy settings if they cause hangs
            proxy_handler = urllib.request.ProxyHandler({}) # empty forces direct connection
            opener = urllib.request.build_opener(proxy_handler)

            with opener.open(req, timeout=15.0) as resp:
                result = json.loads(resp.read().decode("utf-8"))
                return result["choices"][0]["message"]["content"].strip()

        except urllib.error.URLError as e:
            return f"⚠️ 远端大模型网络故障或响应超时（{str(e)}）。\n\n已切回本地引擎：\n{_fallback_response(user, records, user_message)}"
        except Exception as e:
            return f"⚠️ 系统内部处理异常（{str(e)}）。\n\n已切回本地引擎：\n{_fallback_response(user, records, user_message)}"

    return _fallback_response(user, records, user_message)
