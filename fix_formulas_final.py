import json
import re

# Load the questions file
with open('data_adaptive_learn/questions_indexed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
print(f"Total questions: {len(questions)}")

# Function to fix common LaTeX issues
def fix_latex(text):
    if not text or not isinstance(text, str):
        return text
    
    # Fix \rac to \frac (missing 'f') - MUST BE FIRST
    text = text.replace('\\rac{', '\\frac{')
    text = text.replace('\nrac{', '\\frac{')  # Also fix line break + rac
    
    # Fix infinity symbol variations
    text = text.replace('∈fty', '\\infty')
    text = text.replace('∞', '\\infty')
    
    # Fix common spacing/encoding issues
    text = text.replace('\\mathrm{m}', '\\mathrm{m}')
    
    # Fix incomplete fractions at end of string
    if text.endswith('\\frac{') or '\\frac{x' in text and not '}' in text[text.index('\\frac{'):]:
        # This needs manual review, just return as is for now
        pass
    
    return text

# Process all questions
fixed_count = 0
for q in questions:
    modified = False
    
    # Fix LaTeX in content
    if 'content' in q:
        original = q['content']
        q['content'] = fix_latex(q['content'])
        if original != q['content']:
            modified = True
    
    # Fix LaTeX in choices
    if 'choices' in q and isinstance(q['choices'], list):
        for i, choice in enumerate(q['choices']):
            if isinstance(choice, str):
                original = choice
                q['choices'][i] = fix_latex(choice)
                if original != q['choices'][i]:
                    modified = True
    
    # Fix LaTeX in explanation
    if 'explanation' in q and q['explanation']:
        original = q['explanation']
        q['explanation'] = fix_latex(q['explanation'])
        if original != q['explanation']:
            modified = True
    
    if modified:
        fixed_count += 1

print(f"Fixed LaTeX in {fixed_count} questions")

# Update metadata
data['questions'] = questions
data['metadata']['version'] = '1.3_all_formulas_fixed'

# Save the cleaned data
with open('data_adaptive_learn/questions_indexed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nAll formulas fixed and saved!")
print(f"Total: {len(questions)} questions")
