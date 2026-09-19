with open('app/app.js', 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if 'users' in line.lower() and ('const' in line or 'let' in line or 'usr_' in line or 'email' in line):
            print(f"{i+1}: {line.strip()[:90]}")
