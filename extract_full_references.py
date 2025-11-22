"""
Extract full text of the 118 references to keep
"""
import re

# Read the keep list (reference numbers)
with open(r"F:\FINALPROJECT\Codemaster-3\ACCURATE_KEEP_LIST.txt", "r", encoding="utf-8") as f:
    keep_text = f.read()

# Extract reference numbers to keep
keep_numbers = []
for line in keep_text.split('\n'):
    match = re.match(r'^(\d+)\.', line.strip())
    if match:
        keep_numbers.append(int(match.group(1)))

print(f"References to keep: {len(keep_numbers)}")
print(f"Numbers: {keep_numbers[:10]}...")  # Show first 10

# Read REFERENCES section from original file
with open(r"F:\FINALPROJECT\Codemaster-3\TEMP_REFS_SECTION.txt", "r", encoding="utf-8") as f:
    refs_text = f.read()

# Split into individual references
# Each reference starts with "number." and continues until the next "number." or end
ref_pattern = r'^(\d+)\.\s+(.+?)(?=\n\d+\.\s+|\Z)'
all_refs = re.findall(ref_pattern, refs_text, re.MULTILINE | re.DOTALL)

print(f"Total references found in section: {len(all_refs)}")

# Filter to keep only the cited ones
kept_refs = []
for num_str, ref_text in all_refs:
    num = int(num_str)
    if num in keep_numbers:
        # Clean up the reference text
        ref_clean = ref_text.replace('\n', ' ').replace('  ', ' ').strip()
        ref_clean = ref_clean.replace('\\*', '*')  # Fix escaped asterisks
        kept_refs.append((num, ref_clean))

print(f"References extracted: {len(kept_refs)}")

# Write to markdown file
with open(r"F:\FINALPROJECT\Codemaster-3\FINAL_118_REFERENCES_KEEP.md", "w", encoding="utf-8") as f:
    f.write("# FINAL 118 REFERENCES TO KEEP\n\n")
    f.write(f"**Total References: {len(kept_refs)}**\n\n")
    f.write("---\n\n")
    f.write("## Copy the text below to replace your REFERENCES section\n\n")
    f.write("# REFERENCES\n\n")

    for i, (orig_num, ref_text) in enumerate(kept_refs, 1):
        # Renumber sequentially starting from 1
        f.write(f"{i}. {ref_text}  \n")

print(f"\n[OK] Created: FINAL_118_REFERENCES_KEEP.md")
print(f"References will be renumbered 1-{len(kept_refs)}")
