#!/usr/bin/env python3
"""
Fix db references in Certificate.js and Progress.js models
Adds getDB() method and replaces all direct db references
"""

import re

def fix_model_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if getDB method already exists
    if 'static getDB()' in content:
        print(f"{filepath} already has getDB() method")
        return

    # Add getDB() method after class declaration
    class_pattern = r'(class \w+ \{)'
    replacement = r'\1\n    static getDB() {\n        return getFirestore();\n    }\n'
    content = re.sub(class_pattern, replacement, content, count=1)

    # Find all static async methods and add const db = this.getDB(); at the start
    # Pattern: static async methodName(...) {
    method_pattern = r'(static async \w+\([^)]*\) \{)'

    def add_db_declaration(match):
        method_start = match.group(1)
        # Check if next line already has db declaration
        return method_start + '\n        const db = this.getDB();'

    # First pass: add db declarations
    lines = content.split('\n')
    new_lines = []
    i = 0
    while i < len(lines):
        line = lines[i]
        new_lines.append(line)

        # Check if this is a static async method
        if re.match(r'\s+static async \w+\(', line):
            # Check if next non-empty line already has db declaration
            j = i + 1
            while j < len(lines) and lines[j].strip() == '':
                new_lines.append(lines[j])
                j += 1

            if j < len(lines):
                next_line = lines[j].strip()
                if not next_line.startswith('const db =') and not next_line.startswith('//'):
                    # Add db declaration
                    indent = len(lines[j]) - len(lines[j].lstrip())
                    new_lines.append(' ' * indent + 'const db = this.getDB();')

        i += 1

    content = '\n'.join(new_lines)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"Fixed {filepath}")

if __name__ == '__main__':
    fix_model_file('server/models/Certificate.js')
    fix_model_file('server/models/Progress.js')
    print("Done!")
