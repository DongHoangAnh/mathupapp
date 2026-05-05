import json
import re

# Load the questions file
with open('data_adaptive_learn/questions_indexed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
print(f"Total questions before: {len(questions)}")

# Function to fix common LaTeX issues
def fix_latex(text):
    if not text:
        return text
    
    # Fix infinity symbol
    text = text.replace('∈fty', '\\infty')
    text = text.replace('∞', '\\infty')
    
    # Fix incomplete fractions - common pattern: \frac{x-2 without closing
    # Find \frac{...} patterns and ensure they're closed properly
    text = re.sub(r'\\frac\{([^}]+)$', r'\\frac{\1}{}', text)
    
    # Fix \rac to \frac (missing 'f')
    text = text.replace('\\rac{', '\\frac{')
    
    # Ensure all LaTeX expressions are wrapped in $ $
    # Check if text has LaTeX commands but no $ delimiters
    if '\\' in text and not '$' in text:
        # Wrap the whole text if it contains LaTeX
        if re.search(r'\\[a-zA-Z]+', text):
            text = f'${text}$'
    
    return text

# Function to check if question is about variation table
def is_variation_table_question(question):
    content = question.get('content', '')
    content_lower = content.lower()
    
    # Check if content mentions "bảng biến thiên"
    if 'bảng biến thiên' in content_lower:
        return True
    
    # Check if content has tikzpicture (table diagrams)
    if '\\begin{tikzpicture}' in content:
        return True
    
    # Check if content has tikzTabInit (another table command)
    if 'tkzTabInit' in content:
        return True
    
    # Check if content mentions variation table diagram
    if 'như hình vẽ' in content_lower or 'như sau' in content_lower:
        if 'tikz' in content.lower() or '\\begin{center}' in content:
            return True
    
    return False

# Clean questions
cleaned_questions = []
removed_count = 0

for q in questions:
    # Skip variation table questions
    if is_variation_table_question(q):
        removed_count += 1
        continue
    
    # Fix LaTeX in content
    if 'content' in q:
        q['content'] = fix_latex(q['content'])
    
    # Fix LaTeX in choices
    if 'choices' in q and isinstance(q['choices'], list):
        q['choices'] = [fix_latex(choice) if isinstance(choice, str) else choice for choice in q['choices']]
    
    # Simplify explanation - remove tikzpicture and keep only text
    if 'explanation' in q:
        explanation = q['explanation']
        
        # Remove tikzpicture blocks
        explanation = re.sub(r'\\begin\{center\}.*?\\end\{center\}', '', explanation, flags=re.DOTALL)
        explanation = re.sub(r'\\begin\{tikzpicture\}.*?\\end\{tikzpicture\}', '', explanation, flags=re.DOTALL)
        
        # Remove references to "bảng biến thiên" sentences
        explanation = re.sub(r'[^.]*bảng biến thiên[^.]*\.', '', explanation, flags=re.IGNORECASE)
        explanation = re.sub(r'[^.]*Bảng xét dấu[^.]*\.', '', explanation, flags=re.IGNORECASE)
        
        # Clean up extra whitespace
        explanation = re.sub(r'\s+', ' ', explanation).strip()
        explanation = re.sub(r'\\\\\s*', ' ', explanation)
        
        # Fix LaTeX in explanation
        explanation = fix_latex(explanation)
        
        q['explanation'] = explanation
    
    cleaned_questions.append(q)

print(f"Questions removed (variation tables): {removed_count}")
print(f"Total questions after: {len(cleaned_questions)}")

# Update metadata
data['questions'] = cleaned_questions
data['metadata']['total_questions'] = len(cleaned_questions)
data['metadata']['removed_variation_tables'] = removed_count
data['metadata']['version'] = '1.2_fixed_formulas'

# Save the cleaned data
with open('data_adaptive_learn/questions_indexed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nFixed questions file saved!")
print(f"New total: {len(cleaned_questions)} questions")
