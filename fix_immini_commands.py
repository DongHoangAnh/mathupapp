import json
import re

# Load the questions file
with open('data_adaptive_learn/questions_indexed.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

questions = data['questions']
print(f"Total questions: {len(questions)}")

# Function to clean immini commands
def clean_immini(text):
    if not text or not isinstance(text, str):
        return text
    
    # Remove \immini[thm] and \immini commands but keep the content
    # Pattern: \immini[thm]{content} or \immini[thm] {content} or just \immini{content}
    text = re.sub(r'\\immini\[thm\]\s*\{\s*', '', text)
    text = re.sub(r'\\immini\s*\{\s*', '', text)
    
    # Also handle cases where the closing brace might be missing or the command is standalone
    text = re.sub(r'\\immini\[thm\]\s*', '', text)
    text = re.sub(r'\\immini\s*', '', text)
    
    return text

# Process all questions
removed_count = 0
questions_with_immini = []

for q in questions:
    had_immini = False
    
    # Check and clean content
    if 'content' in q:
        if '\\immini' in q['content']:
            had_immini = True
            questions_with_immini.append(q['id'])
            original = q['content']
            q['content'] = clean_immini(q['content'])
            print(f"\nQuestion {q['id']}:")
            print(f"  Before: {original[:80]}...")
            print(f"  After: {q['content'][:80]}...")
    
    # Check and clean choices
    if 'choices' in q and isinstance(q['choices'], list):
        for i, choice in enumerate(q['choices']):
            if isinstance(choice, str) and '\\immini' in choice:
                had_immini = True
                q['choices'][i] = clean_immini(choice)
    
    # Check and clean explanation
    if 'explanation' in q and q['explanation'] and '\\immini' in q['explanation']:
        had_immini = True
        q['explanation'] = clean_immini(q['explanation'])
    
    if had_immini:
        removed_count += 1

print(f"\n\nCleaned \\immini from {removed_count} questions")
print(f"Questions affected: {questions_with_immini}")

# Since these questions reference images/figures that we don't have,
# let's mark them or remove them
print("\n\nThese questions reference figures/images. Should we remove them?")
print("For now, keeping them but the content might be incomplete without the images.")

# Update metadata
data['questions'] = questions
data['metadata']['version'] = '1.6_immini_cleaned'

# Save the cleaned data
with open('data_adaptive_learn/questions_indexed.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("\nAll \\immini commands cleaned and saved!")
print(f"Total: {len(questions)} questions")
