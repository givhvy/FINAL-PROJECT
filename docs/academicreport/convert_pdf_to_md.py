import PyPDF2
import sys
import os

def convert_pdf_to_md(pdf_path, md_path):
    """Convert PDF to Markdown format"""
    
    try:
        # Open PDF file
        with open(pdf_path, 'rb') as pdf_file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            # Get number of pages
            num_pages = len(pdf_reader.pages)
            print(f"📄 Processing PDF: {os.path.basename(pdf_path)}")
            print(f"📊 Total pages: {num_pages}")
            
            # Extract text from all pages
            md_content = f"# {os.path.basename(pdf_path).replace('.pdf', '')}\n\n"
            md_content += f"**Extracted from PDF:** {os.path.basename(pdf_path)}  \n"
            md_content += f"**Total Pages:** {num_pages}  \n"
            md_content += f"**Conversion Date:** November 8, 2025\n\n"
            md_content += "---\n\n"
            
            for page_num in range(num_pages):
                page = pdf_reader.pages[page_num]
                text = page.extract_text()
                
                # Clean up text
                text = text.strip()
                
                if text:
                    md_content += f"## Page {page_num + 1}\n\n"
                    md_content += text + "\n\n"
                    md_content += "---\n\n"
                
                print(f"✓ Processed page {page_num + 1}/{num_pages}")
            
            # Write to markdown file
            with open(md_path, 'w', encoding='utf-8') as md_file:
                md_file.write(md_content)
            
            print(f"✅ Successfully converted to: {md_path}")
            print(f"📝 Output size: {len(md_content)} characters")
            
    except Exception as e:
        print(f"❌ Error converting PDF: {e}")
        sys.exit(1)

if __name__ == '__main__':
    # Convert both PDF templates
    pdf_files = [
        'GDM Final Report Template_2022-2023 (2).pdf',
        'Undergraduate Project Report Structure Guide (2).pdf'
    ]
    
    for pdf_file in pdf_files:
        if os.path.exists(pdf_file):
            md_file = pdf_file.replace('.pdf', '.md')
            convert_pdf_to_md(pdf_file, md_file)
            print()
        else:
            print(f"⚠️  File not found: {pdf_file}")
