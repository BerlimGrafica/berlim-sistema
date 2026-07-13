import urllib.request
import urllib.parse
import json

url = "https://xbanoipgoleuahwbqksy.supabase.co/rest/v1/pedidos?responsavel=ilike.*Giovana*&select=id,responsavel"
headers = {
    "apikey": "sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh",
    "Authorization": "Bearer sb_publishable_RSQ4odG0wxy8ZucJHu_WvQ_0JfM8jbh",
    "Content-Type": "application/json",
    "Prefer": "return=representation"
}

req = urllib.request.Request(url, headers=headers)
try:
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read().decode())
except Exception as e:
    print("Error fetching data:", e)
    exit(1)

to_update = []
for d in data:
    resp = d.get('responsavel', '')
    if not resp: continue
    
    parts = [s.strip() for s in resp.split(',')]
    new_parts = []
    has_duplicates = False
    
    for p in parts:
        if p not in new_parts:
            new_parts.append(p)
        else:
            has_duplicates = True
            
    if has_duplicates:
        to_update.append({
            'id': d['id'],
            'old': resp,
            'new': ', '.join(new_parts)
        })

print(f"Found {len(to_update)} rows to update.")

for u in to_update:
    patch_url = f"https://xbanoipgoleuahwbqksy.supabase.co/rest/v1/pedidos?id=eq.{u['id']}"
    payload = json.dumps({"responsavel": u['new']}).encode('utf-8')
    patch_req = urllib.request.Request(patch_url, data=payload, headers=headers, method='PATCH')
    try:
        with urllib.request.urlopen(patch_req) as response:
            print(f"- OS #{u['id']}: {u['old']} -> {u['new']}")
    except Exception as e:
        print(f"Error updating OS #{u['id']}:", e)

print("Finished updates.")
