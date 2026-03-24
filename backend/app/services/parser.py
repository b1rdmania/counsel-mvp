"""PDF and DOCX text extraction with OCR fallback for scanned documents."""

from io import BytesIO
from pathlib import Path

import fitz  # PyMuPDF
from docx import Document as DocxDocument

# OCR imports — optional but available
try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except ImportError:
    HAS_OCR = False


def extract_text(file_path: Path) -> str:
    suffix = file_path.suffix.lower()
    if suffix == ".pdf":
        return _extract_pdf(file_path)
    elif suffix in (".docx", ".doc"):
        return _extract_docx(file_path)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")


def _extract_pdf(file_path: Path) -> str:
    doc = fitz.open(str(file_path))
    pages: list[str] = []
    ocr_pages: list[int] = []

    # First pass: try native text extraction
    for page_num, page in enumerate(doc, 1):
        text = page.get_text("text")
        if text.strip() and len(text.strip()) > 20:
            pages.append(f"--- Page {page_num} ---\n{text}")
        else:
            ocr_pages.append(page_num - 1)  # 0-indexed for fitz

    # Second pass: OCR any pages that had no/minimal text
    if ocr_pages and HAS_OCR:
        for page_idx in ocr_pages:
            page = doc[page_idx]
            # Render page to image at 300 DPI
            mat = fitz.Matrix(300 / 72, 300 / 72)
            pix = page.get_pixmap(matrix=mat)
            img = Image.open(BytesIO(pix.tobytes("png")))
            text = pytesseract.image_to_string(img)
            if text.strip():
                pages.append(f"--- Page {page_idx + 1} (OCR) ---\n{text}")

    doc.close()
    return "\n\n".join(pages)


def _extract_docx(file_path: Path) -> str:
    doc = DocxDocument(str(file_path))
    paragraphs: list[str] = []
    for para in doc.paragraphs:
        if para.text.strip():
            prefix = ""
            if para.style and para.style.name:
                style = para.style.name.lower()
                if "heading" in style:
                    prefix = f"[{para.style.name}] "
            paragraphs.append(f"{prefix}{para.text}")
    return "\n\n".join(paragraphs)
