import os
import pdfplumber
from typing import List, Dict, Any

def read_document_pages(file_path: str) -> List[Dict[str, Any]]:
    """
    Reads a document file (.pdf, .eml, .txt) and extracts text along with page references.
    Returns a list of dicts: [{"file_path": str, "file_name": str, "page": int, "text": str}]
    """
    file_name = os.path.basename(file_path)
    pages_data = []

    if file_path.lower().endswith(".pdf"):
        try:
            with pdfplumber.open(file_path) as pdf:
                for idx, page in enumerate(pdf.pages, start=1):
                    extracted = page.extract_text() or ""
                    pages_data.append({
                        "file_path": file_path,
                        "file_name": file_name,
                        "page": idx,
                        "text": extracted
                    })
        except Exception as e:
            print(f"Error reading PDF {file_path}: {e}")
    else:
        # EML or TXT plain text
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
            print(f"Error reading plain text file {file_path}: {e}")

    return pages_data


def ingest_data_dir(data_dir: str) -> List[Dict[str, Any]]:
    """
    Ingests all supported documents from data_dir.
    """
    all_pages = []
    if not os.path.exists(data_dir):
        return all_pages

    for root, _, files in os.walk(data_dir):
        for file in files:
            ext = os.path.splitext(file)[1].lower()
            if ext in [".pdf", ".eml", ".txt"]:
                full_path = os.path.join(root, file)
                pages = read_document_pages(full_path)
                all_pages.extend(pages)
    return all_pages
