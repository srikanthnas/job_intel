from PyPDF2 import PdfReader
from docx import Document


def extract_text_from_pdf(file):
    """
    Extract text from a PDF file.
    """
    reader = PdfReader(file)
    text = ""

    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text += page_text + "\n"

    return text.strip()


def extract_text_from_docx(file):
    """
    Extract text from a DOCX file.
    """
    doc = Document(file)

    text = []

    for para in doc.paragraphs:
        if para.text.strip():
            text.append(para.text)

    return "\n".join(text)


def extract_resume_text(file):
    """
    Automatically detect file type and extract text.
    """
    filename = file.filename.lower()

    if filename.endswith(".pdf"):
        return extract_text_from_pdf(file)

    elif filename.endswith(".docx"):
        return extract_text_from_docx(file)

    else:
        raise ValueError("Unsupported file type. Upload PDF or DOCX.")