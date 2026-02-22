import docx
import PyPDF2
import io

class DocumentParser:
    @staticmethod
    def parse_docx(file_bytes):
        doc = docx.Document(io.BytesIO(file_bytes))
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                full_text.append(para.text.strip())
        return "\n".join(full_text)

    @staticmethod
    def parse_pdf(file_bytes):
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_bytes))
        full_text = []
        for page in pdf_reader.pages:
            text = page.extract_text()
            if text:
                full_text.append(text.strip())
        return "\n".join(full_text)

    @staticmethod
    def parse(filename, file_bytes):
        if filename.endswith(".docx"):
            return DocumentParser.parse_docx(file_bytes)
        elif filename.endswith(".pdf"):
            return DocumentParser.parse_pdf(file_bytes)
        else:
            raise ValueError("Unsupported file format. Please upload .docx or .pdf")
