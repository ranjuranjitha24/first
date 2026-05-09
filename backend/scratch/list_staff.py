from config.db import employees_col, users_col
print("--- EMPLOYEES ---")
for e in employees_col.find():
    print(f"- {e.get('name')} ({e.get('role')})")

print("\n--- USERS ---")
for u in users_col.find():
    print(f"- {u.get('username')} ({u.get('role')})")
