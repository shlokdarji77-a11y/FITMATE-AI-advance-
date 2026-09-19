with open('js/ai-ecosystem.js', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if line.startswith('const ') or line.startswith('function ') or line.startswith('let ') or 'window.' in line:
            print(f"{i+1}: {line.strip()[:80]}")
