import json

# Load the questions file
with open('data_adaptive_learn/questions_indexed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
print(f"Total questions: {len(questions)}")

# Function to fix double backslash issues
def cleanup_latex(text):
    if not text or not isinstance(text, str):
        return text
    
    # Fix \\f\\frac -> \\frac
    text = text.replace('\\f\\frac', '\\frac')
    
    # Fix any remaining standalone \f before rac
    text = text.replace('\\frac', '\\frac')  # This is already correct
    
    return text

# Process all questions
fixed_count = 0
for q in questions:
    modified = False
    
    # Fix content
    if 'content' in q:
        original = q['content']
        q['content'] = cleanup_latex(q['content'])
        if original != q['content']:
            modified = True
    
    # Fix choices
    if 'choices' in q and isinstance(q['choices'], list):
        for i, choice in enumerate(q['choices']):
            if isinstance(choice, str):
                original = choice
                q['choices'][i] = cleanup_latex(choice)
                if original != q['choices'][i]:
                    modified = True
    
    # Fix explanation
    if 'explanation' in q and q['explanation']:
        original = q['explanation']
        q['explanation'] = cleanup_latex(q['explanation'])
        if original != q['explanation']:
            modified = True
    
    if modified:
        fixed_count += 1

print(f"Cleaned up {fixed_count} questions")

# Update metadata
data['questions'] = questions
data['metadata']['version'] = '1.5_cleaned'

# Save the cleaned data
with open('data_adaptive_learn/questions_indexed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nAll LaTeX cleaned and saved!")
