import io

import pdfplumber


def extract_text(file_bytes: bytes) -> str:
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        pages_text: list[str] = []
        for page in pdf.pages:
            page_text = page.extract_text() or ""
            pages_text.append(page_text)

    full_text = "\n".join(pages_text).strip()
    if not full_text:
        raise ValueError("No extractable text found in PDF.")

    return full_text
