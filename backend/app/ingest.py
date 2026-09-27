import os
import pdfplumber
from typing import List, Dict, Any

# Try importing pytesseract / PIL for OCR fallback on scanned PDFs & images
try:
    import pytesseract
    from PIL import Image
    HAS_OCR = True
except Exception:
    HAS_OCR = False

def run_ocr_on_file(file_path: str) -> str:
    """Performs OCR text extraction on image files or scanned documents if Tesseract OCR is available."""
    if not HAS_OCR:
        return ""
    try:
        img = Image.open(file_path)
        text = pytesseract.image_to_string(img)
        return text or ""
    except Exception as e:
        print(f"OCR processing note for {file_path}: {e}")
        return ""

def read_document_pages(file_path: str) -> List[Dict[str, Any]]:
    """
    Reads a document file (.pdf, .eml, .txt, .json, .csv, .md, .png, .jpg)
    and extracts text along with page references for LLM fact extraction & Knowledge Graph indexing.
    """
    file_name = os.path.basename(file_path)
    pages_data = []
    ext = os.path.splitext(file_name)[1].lower()

    if ext == ".pdf":
        try:
            with pdfplumber.open(file_path) as pdf:
                for idx, page in enumerate(pdf.pages, start=1):
                    extracted = page.extract_text() or ""
                    # Fallback to OCR if page text is empty (scanned image PDF)
                    if not extracted.strip() and HAS_OCR:
                        try:
                            pil_image = page.to_image().original
                            extracted = pytesseract.image_to_string(pil_image) or ""
                        except Exception as ocr_err:
                            print(f"Scanned PDF page {idx} OCR note: {ocr_err}")
                    
                    pages_data.append({
                        "file_path": file_path,
                        "file_name": file_name,
                        "page": idx,
                        "text": extracted
                    })
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")

    elif ext in [".png", ".jpg", ".jpeg", ".tiff", ".bmp"]:
        ocr_text = run_ocr_on_file(file_path)
        pages_data.append({
            "file_path": file_path,
            "file_name": file_name,
            "page": 1,
            "text": ocr_text or f"Scanned Document Image: {file_name}"
        })

    else:
        # EML, TXT, JSON, CSV, MD plain text files
        try:
            with open(file_path, "r", encoding="utf-8", errors="replace") as f:
                content = f.read()
            pages_data.append({
                "file_path": file_path,
                "file_name": file_name,
                "page": 1,
                "text": content
            })
        except Exception as e:
            print(f"Error reading text document {file_path}: {e}")

    return pages_data


def ingest_data_dir(data_dir: str) -> List[Dict[str, Any]]:
    """
    Ingests all supported document formats from data_dir.
    """
    all_pages = []
    if not os.path.exists(data_dir):
        return all_pages

    supported_exts = [".pdf", ".eml", ".txt", ".json", ".csv", ".md", ".png", ".jpg", ".jpeg", ".doc", ".docx"]
    for root, _, files in os.walk(data_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in supported_exts:
                full_path = os.path.join(root, file)
                pages = read_document_pages(full_path)
                all_pages.extend(pages)
    return all_pages
