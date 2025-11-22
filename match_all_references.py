"""
Match all 190 references with actual citations in text
"""
import re

# Read the document body (before REFERENCES)
with open(r"F:\FINALPROJECT\Codemaster-3\TEMP_BODY_ONLY.txt", "r", encoding="utf-8") as f:
    body_text = f.read()

# Read all references
with open(r"F:\FINALPROJECT\Codemaster-3\TEMP_REFS_SECTION.txt", "r", encoding="utf-8") as f:
    refs_text = f.read()

# Extract all numbered references
ref_lines = re.findall(r'^\d+\.\s+(.+?)(?=\n\d+\.|\Z)', refs_text, re.MULTILINE | re.DOTALL)

print(f"Total references found: {len(ref_lines)}\n")

# Check each reference
cited_refs = []
uncited_refs = []

for i, ref_line in enumerate(ref_lines, 1):
    # Clean up the reference line
    ref_clean = ref_line.replace('\n', ' ').replace('\\*', '').strip()

    # Extract author and year
    # Patterns to match:
    # 1. "Author (2020)"
    # 2. "Author, A. (2020)"
    # 3. "Author et al. (2020)"
    # 4. "Organization (2020)"

    # Try to extract year
    year_match = re.search(r'\((\d{4})\)', ref_clean)
    if not year_match:
        print(f"⚠️  #{i}: No year found in: {ref_clean[:100]}")
        continue

    year = year_match.group(1)

    # Extract author/org name (before the year)
    author_part = ref_clean[:year_match.start()].strip()

    # Get first author's last name or organization name
    # Handle patterns like:
    # "Aas, J., Barnes, R..." -> Aas
    # "ACM" -> ACM
    # "Google Cloud" -> Google Cloud
    # "O'Neil, C." -> O'Neil

    if ',' in author_part:
        first_author = author_part.split(',')[0].strip()
    else:
        first_author = author_part.strip()

    # Search patterns in body text
    search_patterns = [
        f"({first_author} et al., {year})",
        f"({first_author}, {year})",
        f"({first_author} & ",  # For "Author & Author"
        f"({first_author} and ",  # For "Author and Author"
        f"({first_author}, ",  # For multiple authors listed
    ]

    # Also check for organizational authors
    if not any(c in first_author for c in [',']):  # If it's likely an org name
        # Handle special cases
        if "Google Cloud" in ref_clean:
            search_patterns.insert(0, "(Google Cloud, 2023)")
        elif "Node.js" in ref_clean:
            search_patterns.insert(0, "(Node.js Foundation, 2023)")
        elif "Baymard" in ref_clean:
            search_patterns.insert(0, "(Baymard Institute, 2022)")
        elif "Material Design" in ref_clean:
            search_patterns.insert(0, "(Google Material Design, 2021)")
        elif "Apple" in ref_clean and "2020" in year:
            search_patterns.insert(0, "(Apple HIG, 2020)")
        elif "HTTP Archive" in ref_clean:
            search_patterns.insert(0, "(HTTP Archive, 2022)")
        elif "Pew Research" in ref_clean:
            search_patterns.insert(0, "(Pew Research, 2021)")
        elif "State of California" in ref_clean:
            search_patterns.insert(0, "(State of California, 2018)")
        elif "Copyright Act" in ref_clean:
            search_patterns.insert(0, "(Copyright Act, 1976)")

    # Check if any pattern found in body
    found = False
    for pattern in search_patterns:
        if pattern in body_text:
            found = True
            break

    if found:
        cited_refs.append((i, first_author, year, ref_clean[:80]))
    else:
        uncited_refs.append((i, first_author, year, ref_clean[:80]))

print(f"\n{'='*80}")
print(f"[CITED] REFERENCES: {len(cited_refs)}")
print(f"[NOT CITED]: {len(uncited_refs)}")
print(f"{'='*80}\n")

print("\n[NOT CITED] REFERENCES (SAFE TO DELETE):\n")
for num, author, year, text in uncited_refs:
    print(f"{num}. {author} ({year}) - {text}...")

print(f"\n\n[CITED] REFERENCES (KEEP THESE):\n")
for num, author, year, text in cited_refs:
    print(f"{num}. {author} ({year}) - {text}...")

# Save to file
with open(r"F:\FINALPROJECT\Codemaster-3\ACCURATE_DELETE_LIST.txt", "w", encoding="utf-8") as f:
    f.write(f"REFERENCES TO DELETE: {len(uncited_refs)}\n\n")
    for num, author, year, text in uncited_refs:
        f.write(f"{num}. {author} ({year})\n")

with open(r"F:\FINALPROJECT\Codemaster-3\ACCURATE_KEEP_LIST.txt", "w", encoding="utf-8") as f:
    f.write(f"REFERENCES TO KEEP: {len(cited_refs)}\n\n")
    for num, author, year, text in cited_refs:
        f.write(f"{num}. {author} ({year})\n")

print(f"\n\n[OK] Files created:")
print(f"  - ACCURATE_DELETE_LIST.txt ({len(uncited_refs)} references)")
print(f"  - ACCURATE_KEEP_LIST.txt ({len(cited_refs)} references)")
