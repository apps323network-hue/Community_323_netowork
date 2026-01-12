#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script para gerar PDF dos Termos de Serviço da 323 Networking
"""

try:
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.colors import HexColor, black
except ImportError:
    print("Instalando reportlab...")
    import subprocess
    subprocess.check_call(["pip", "install", "reportlab"])
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
    from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.lib.colors import HexColor, black

import re

def read_terms_file(filepath):
    """Lê o arquivo de termos"""
    with open(filepath, 'r', encoding='utf-8') as f:
        return f.read()

def parse_content(text):
    """Parseia o conteúdo mantendo toda a estrutura"""
    lines = text.split('\n')
    content = []
    
    for line in lines:
        line = line.rstrip()
        if not line:
            content.append(('spacer', None))
        elif line.startswith('# '):
            # Título principal
            content.append(('title', line[2:].strip()))
        elif line.startswith('## '):
            # Seção principal
            content.append(('section', line[3:].strip()))
        elif line.startswith('### '):
            # Subseção
            content.append(('subsection', line[4:].strip()))
        elif line.startswith('---'):
            # Separador
            content.append(('separator', None))
        elif line.startswith('- '):
            # Item de lista
            content.append(('list_item', line[2:].strip()))
        elif line.strip().startswith('**') and '**' in line:
            # Linha que começa com negrito (pode ter mais texto depois)
            content.append(('normal', line))
        else:
            # Texto normal
            content.append(('normal', line))
    
    return content

def format_text_for_pdf(text):
    """Formata texto para PDF, convertendo markdown básico"""
    # Escapa caracteres especiais do HTML
    text = text.replace('&', '&amp;')
    text = text.replace('<', '&lt;')
    text = text.replace('>', '&gt;')
    
    # Converte markdown de negrito para HTML
    # Processa todos os pares de **
    while '**' in text:
        text = text.replace('**', '<b>', 1)
        text = text.replace('**', '</b>', 1)
    
    # Converte múltiplos espaços em um único espaço (mas preserva quebras de linha)
    text = re.sub(r' +', ' ', text)
    
    return text

def create_pdf(content_items, output_path):
    """Cria o PDF com formatação profissional"""
    doc = SimpleDocTemplate(
        output_path,
        pagesize=letter,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Estilos
    styles = getSampleStyleSheet()
    
    # Estilo para título principal
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=black,
        spaceAfter=30,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para seções
    section_style = ParagraphStyle(
        'CustomSection',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=black,
        spaceBefore=20,
        spaceAfter=12,
        fontName='Helvetica-Bold',
        leftIndent=0
    )
    
    # Estilo para subseções
    subsection_style = ParagraphStyle(
        'CustomSubsection',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=black,
        spaceBefore=12,
        spaceAfter=8,
        fontName='Helvetica-Bold',
        leftIndent=0
    )
    
    # Estilo para texto normal
    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        textColor=black,
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14,
        fontName='Helvetica'
    )
    
    # Estilo para texto em negrito
    bold_style = ParagraphStyle(
        'CustomBold',
        parent=styles['Normal'],
        fontSize=10,
        textColor=black,
        spaceAfter=8,
        alignment=TA_LEFT,
        leading=14,
        fontName='Helvetica-Bold'
    )
    
    # Estilo para itens de lista
    list_style = ParagraphStyle(
        'CustomList',
        parent=styles['Normal'],
        fontSize=10,
        textColor=black,
        spaceAfter=6,
        leftIndent=20,
        bulletIndent=10,
        alignment=TA_LEFT,
        leading=14,
        fontName='Helvetica'
    )
    
    # Estilo para aviso importante
    notice_style = ParagraphStyle(
        'CustomNotice',
        parent=styles['Normal'],
        fontSize=11,
        textColor=black,
        spaceBefore=15,
        spaceAfter=15,
        alignment=TA_LEFT,
        leading=16,
        fontName='Helvetica-Bold',
        backColor=HexColor('#F5F5F5'),
        borderPadding=10
    )
    
    story = []
    first_title = True
    
    for item_type, content in content_items:
        if item_type == 'spacer':
            story.append(Spacer(1, 6))
        elif item_type == 'title':
            if first_title:
                story.append(Paragraph(format_text_for_pdf(content), title_style))
                story.append(Spacer(1, 20))
                first_title = False
            else:
                story.append(Paragraph(format_text_for_pdf(content), title_style))
        elif item_type == 'section':
            story.append(Spacer(1, 12))
            story.append(Paragraph(format_text_for_pdf(content), section_style))
        elif item_type == 'subsection':
            story.append(Spacer(1, 8))
            story.append(Paragraph(format_text_for_pdf(content), subsection_style))
        elif item_type == 'bold':
            # Remove os ** do início e fim
            clean_content = content.replace('**', '')
            story.append(Paragraph(format_text_for_pdf(clean_content), bold_style))
        elif item_type == 'separator':
            story.append(Spacer(1, 15))
            story.append(Paragraph("_" * 80, normal_style))
            story.append(Spacer(1, 15))
        elif item_type == 'list_item':
            # Formata como item de lista com bullet
            formatted = format_text_for_pdf(content)
            story.append(Paragraph(f"• {formatted}", list_style))
        elif item_type == 'normal':
            if content.strip():
                # Verifica se é o aviso importante (Section 15)
                if 'NOTICE: BY CLICKING' in content or 'CONSPICUOUS NOTICE' in content.upper():
                    story.append(Paragraph(format_text_for_pdf(content), notice_style))
                else:
                    story.append(Paragraph(format_text_for_pdf(content), normal_style))
    
    doc.build(story)
    print(f"PDF criado com sucesso: {output_path}")

def main():
    input_file = r"c:\Users\Henrique-PC\Downloads\Terms 323network.txt"
    output_file = r"c:\Users\Henrique-PC\Downloads\323 networking\Community_323_network\Terms_323_Network.pdf"
    
    print("Lendo arquivo de termos...")
    text = read_terms_file(input_file)
    
    print("Processando conteúdo...")
    content_items = parse_content(text)
    
    print("Gerando PDF...")
    create_pdf(content_items, output_file)
    
    print("Concluído!")

if __name__ == "__main__":
    main()
