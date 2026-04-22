"""PDF health report generation service using reportlab."""
import io
from datetime import datetime
from typing import List
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.enums import TA_CENTER, TA_LEFT
import os

from .. import models

# Try to register Chinese font, fall back to default if not available
_FONT_REGISTERED = False
_font_paths = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Light.ttc",
    "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
    "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
]

for _fp in _font_paths:
    if os.path.exists(_fp):
        try:
            pdfmetrics.registerFont(TTFont('Chinese', _fp, subfontIndex=0))
            _FONT_REGISTERED = True
            break
        except Exception:
            pass

# Colors
AURA_BLUE = HexColor("#007aff")
AURA_DARK = HexColor("#1c1c1e")
AURA_TEXT = HexColor("#333333")
AURA_LIGHT = HexColor("#f5f5f7")
AURA_BORDER = HexColor("#e5e5ea")


def _get_styles() -> dict:
    """Create paragraph styles for the PDF."""
    font_name = 'Chinese' if _FONT_REGISTERED else 'Helvetica'

    styles = {
        'title': ParagraphStyle(
            'Title',
            fontName=font_name,
            fontSize=24,
            leading=30,
            alignment=TA_CENTER,
            textColor=AURA_DARK,
            spaceAfter=6,
        ),
        'subtitle': ParagraphStyle(
            'Subtitle',
            fontName=font_name,
            fontSize=12,
            leading=16,
            alignment=TA_CENTER,
            textColor=HexColor("#86868b"),
            spaceAfter=20,
        ),
        'heading': ParagraphStyle(
            'Heading',
            fontName=font_name,
            fontSize=14,
            leading=20,
            textColor=AURA_BLUE,
            spaceBefore=16,
            spaceAfter=8,
        ),
        'body': ParagraphStyle(
            'Body',
            fontName=font_name,
            fontSize=10,
            leading=16,
            textColor=AURA_TEXT,
            spaceAfter=4,
        ),
        'small': ParagraphStyle(
            'Small',
            fontName=font_name,
            fontSize=8,
            leading=12,
            textColor=HexColor("#86868b"),
        ),
    }
    return styles


def generate_report_pdf(
    report: models.HealthReport,
    user: models.User,
    records: List[models.HealthRecord],
) -> bytes:
    """Generate a PDF health report and return the raw bytes."""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        topMargin=20 * mm,
        bottomMargin=20 * mm,
        leftMargin=25 * mm,
        rightMargin=25 * mm,
    )

    styles = _get_styles()
    elements = []

    # Title Section
    type_label = "周报" if report.report_type == "weekly" else "月报"
    elements.append(Paragraph("Aura 健康报告", styles['title']))
    elements.append(Spacer(1, 4))
    elements.append(Paragraph(
        f"{user.name or user.username} · {type_label} · "
        f"{report.start_date.strftime('%Y/%m/%d')} - {report.end_date.strftime('%Y/%m/%d')}",
        styles['subtitle']
    ))
    elements.append(HRFlowable(width="100%", thickness=1, color=AURA_BORDER, spaceAfter=12))

    # User Info
    elements.append(Paragraph("基本信息", styles['heading']))
    info_data = [
        ["姓名", user.name or user.username],
        ["年龄", f"{user.age}岁"],
        ["性别", user.gender or "未填写"],
        ["身高", f"{user.height}cm"],
        ["体重", f"{user.weight}kg"],
        ["职业", user.occupation or "未填写"],
    ]
    info_table = Table(info_data, colWidths=[80, 200])
    info_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (-1, -1), 'Chinese' if _FONT_REGISTERED else 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('TEXTCOLOR', (0, 0), (0, -1), HexColor("#86868b")),
        ('TEXTCOLOR', (1, 0), (1, -1), AURA_TEXT),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 2),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    elements.append(info_table)
    elements.append(Spacer(1, 10))

    # AI Analysis Content
    elements.append(Paragraph("AI 健康分析", styles['heading']))
    # Parse markdown-ish content into paragraphs
    content_lines = report.content.split('\n')
    for line in content_lines:
        line = line.strip()
        if not line:
            continue
        # Handle markdown headings
        if line.startswith('## '):
            heading_text = line[3:].strip()
            elements.append(Paragraph(heading_text, styles['heading']))
        elif line.startswith('### '):
            subheading_text = line[4:].strip()
            elements.append(Paragraph(subheading_text, ParagraphStyle(
                'SubHeading',
                parent=styles['body'],
                fontSize=11,
                textColor=AURA_DARK,
                spaceBefore=8,
            )))
        else:
            # Clean up markdown bold markers
            clean = line.replace('**', '').replace('*', '')
            elements.append(Paragraph(clean, styles['body']))

    elements.append(Spacer(1, 10))

    # Data Summary Table
    if records:
        elements.append(Paragraph("数据汇总", styles['heading']))
        table_data = [["日期", "心率", "收缩压", "舒张压", "睡眠", "饮水", "步数"]]
        for r in records[:14]:  # Limit to 14 rows for readability
            table_data.append([
                r.record_date.strftime('%m/%d'),
                f"{r.heart_rate}",
                f"{r.systolic_bp}",
                f"{r.diastolic_bp}",
                f"{r.sleep_hours}h",
                f"{r.water_intake}ml",
                f"{r.steps}",
            ])

        col_widths = [45, 50, 50, 50, 50, 55, 55]
        data_table = Table(table_data, colWidths=col_widths)
        data_table.setStyle(TableStyle([
            ('FONTNAME', (0, 0), (-1, -1), 'Chinese' if _FONT_REGISTERED else 'Helvetica'),
            ('FONTSIZE', (0, 0), (-1, -1), 8),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('BACKGROUND', (0, 0), (-1, 0), AURA_BLUE),
            ('TEXTCOLOR', (0, 0), (-1, 0), HexColor("#ffffff")),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('GRID', (0, 0), (-1, -1), 0.5, AURA_BORDER),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [HexColor("#ffffff"), AURA_LIGHT]),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
            ('TOPPADDING', (0, 0), (-1, -1), 4),
        ]))
        elements.append(data_table)

    # Footer
    elements.append(Spacer(1, 20))
    elements.append(HRFlowable(width="100%", thickness=0.5, color=AURA_BORDER, spaceAfter=6))
    elements.append(Paragraph(
        f"由 Aura Health 生成 · {datetime.utcnow().strftime('%Y年%m月%d日')}",
        styles['small']
    ))

    doc.build(elements)
    return buffer.getvalue()
