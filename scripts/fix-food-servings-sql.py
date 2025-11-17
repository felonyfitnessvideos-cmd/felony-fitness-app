"""
Fix batch-insert-common-foods.sql to use correct schema
Converts serving_size + serving_unit into serving_description string
"""

import re

def fix_values_line(line):
    """Convert a VALUES line from old format to new format"""
    if not line.strip().startswith("('"):
        return line
    
    # Match pattern: ('food', 'brand', size, 'unit', cal, p, c, f, fi, s, 'cat', 'source', 'status')
    pattern = r"\('([^']+)',\s*'([^']*)',\s*(\d+(?:\.\d+)?),\s*'([^']+)',\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*(\d+(?:\.\d+)?),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)'\)"
    
    match = re.search(pattern, line)
    if not match:
        return line
    
    food_name = match.group(1)
    brand = match.group(2)
    serving_size = match.group(3)
    serving_unit = match.group(4)
    calories = match.group(5)
    protein = match.group(6)
    carbs = match.group(7)
    fat = match.group(8)
    fiber = match.group(9)
    sugar = match.group(10)
    category = match.group(11)
    source = match.group(12)
    status = match.group(13)
    
    # Combine serving_size and serving_unit into serving_description
    serving_desc = f"{serving_size}{serving_unit}" if serving_unit != 'g' else f"{serving_size}g"
    
    # Handle special cases
    if serving_unit == 'g' and int(float(serving_size)) > 1:
        serving_desc = f"{int(float(serving_size))}g"
    
    # Build new line
    new_line = f"  ('{food_name}', '{brand}', '{serving_desc}', {calories}, {protein}, {carbs}, {fat}, {fiber}, {sugar}, '{category}', '{source}', '{status}')"
    
    # Preserve comma or semicolon at end
    if line.rstrip().endswith(','):
        new_line += ','
    elif line.rstrip().endswith(';'):
        new_line += ';'
    
    return new_line + '\n'

def main():
    input_file = 'batch-insert-common-foods.sql'
    output_file = 'batch-insert-common-foods-fixed.sql'
    
    with open(input_file, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    fixed_lines = []
    for line in lines:
        fixed_lines.append(fix_values_line(line))
    
    with open(output_file, 'w', encoding='utf-8') as f:
        f.writelines(fixed_lines)
    
    print(f"✅ Fixed SQL written to {output_file}")
    print(f"   Processed {len(lines)} lines")

if __name__ == '__main__':
    main()
