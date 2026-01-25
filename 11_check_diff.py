import json

def check_diff():
    with open('data/products_ready.json', 'r', encoding='utf-8') as f:
        current = {p['id']: p for p in json.load(f)}
    
    with open('products_merged.json', 'r', encoding='utf-8') as f:
        backup = {p['id']: p for p in json.load(f)}
    
    diff_count = 0
    gallery_diff_count = 0
    
    fields_to_ignore = ['gallery']
    
    example_diffs = []

    for pid, p_curr in current.items():
        if pid not in backup:
            continue
            
        p_back = backup[pid]
        
        if p_curr.get('gallery') != p_back.get('gallery'):
            gallery_diff_count += 1
            
        has_other_diff = False
        for k, v in p_curr.items():
            if k in fields_to_ignore: continue
            if p_back.get(k) != v:
                has_other_diff = True
                if len(example_diffs) < 3:
                    example_diffs.append(f"Prod {pid} key {k}: '{v}' vs '{p_back.get(k)}'")
                break
        
        if has_other_diff:
            diff_count += 1

    print(f"Products with gallery differences: {gallery_diff_count}")
    print(f"Products with OTHER differences: {diff_count}")
    print("Example differences:")
    for d in example_diffs:
        print(d)

if __name__ == "__main__":
    check_diff()
