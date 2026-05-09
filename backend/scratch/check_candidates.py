from config.db import candidates_col
candidates = list(candidates_col.find({}, {"name": 1}))
print(f"Total candidates: {len(candidates)}")
for c in candidates:
    print(f"- {c.get('name')}")
