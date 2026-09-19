for fname in ['index.html', 'app/index.html']:
    print(f"=== {fname} ===")
    with open(fname, 'r', encoding='utf-8') as f:
        for i, line in enumerate(f):
            if 'id="view-' in line or 'id="trainer' in line or 'canvas' in line:
                print(f"  {i+1}: {line.strip()[:90]}")

