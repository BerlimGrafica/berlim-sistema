import fitz
import glob
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

pdf_files = glob.glob(os.path.join(os.path.dirname(os.path.abspath(__file__)), "TEXTOS*2026*.pdf"))
if not pdf_files:
    print("PDF not found!")
    exit(1)

pdf_path = pdf_files[0]
output_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "pdf_extracted.txt")

doc = fitz.open(pdf_path)
page_count = doc.page_count
with open(output_path, 'w', encoding='utf-8') as f:
    for i, page in enumerate(doc):
        text = page.get_text()
        f.write(f"=== PAGE {i+1} ===\n")
        f.write(text)
        f.write("\n\n")
doc.close()

print(f"Done! Extracted {page_count} pages to {output_path}")
