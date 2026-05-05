import json
import re

# Load the questions file
with open('data_adaptive_learn/questions_indexed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
print(f"Total questions: {len(questions)}")

# Function to fix control characters and LaTeX issues
def fix_control_chars(text):
    if not text or not isinstance(text, str):
        return text
    
    # Fix form feed character (\x0c) before 'rac' -> should be '\frac'
    text = text.replace('\x0crac{', '\\frac{')
    
    # Fix other potential control characters
    text = text.replace('\x0c', '')  # Remove any remaining form feeds
    text = text.replace('\x0b', '')  # Remove vertical tabs
    text = text.replace('\x00', '')  # Remove null bytes
    
    # Make sure we have proper \frac
    # If we have just 'rac{' without backslash, add it
    text = re.sub(r'(?<!\\)rac\{', r'\\frac{', text)
    
    return text

# Process all questions
fixed_count = 0
for q in questions:
    modified = False
    
    # Fix control chars in content
    if 'content' in q:
        original = q['content']
        q['content'] = fix_control_chars(q['content'])
        if original != q['content']:
            modified = True
            print(f"Fixed content in question {q['id']}")
            print(f"  Before: {repr(original[:80])}")
            print(f"  After: {repr(q['content'][:80])}")
    
    # Fix control chars in choices
    if 'choices' in q and isinstance(q['choices'], list):
        for i, choice in enumerate(q['choices']):
            if isinstance(choice, str):
                original = choice
                q['choices'][i] = fix_control_chars(choice)
                if original != q['choices'][i]:
                    modified = True
    
    # Fix control chars in explanation
    if 'explanation' in q and q['explanation']:
        original = q['explanation']
        q['explanation'] = fix_control_chars(q['explanation'])
        if original != q['explanation']:
            modified = True
    
    if modified:
        fixed_count += 1

print(f"\nFixed control characters in {fixed_count} questions")

# Update metadata
data['questions'] = questions
data['metadata']['version'] = '1.4_control_chars_fixed'

# Save the cleaned data
with open('data_adaptive_learn/questions_indexed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nAll control characters fixed and saved!")
print(f"Total: {len(questions)} questions")
