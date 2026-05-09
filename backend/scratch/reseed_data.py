from config.db import candidates_col, jobs_col
from controllers.auth_controller import seed_admin

print("Clearing old data...")
candidates_col.delete_many({})
jobs_col.delete_many({})

print("Re-seeding...")
seed_admin()
print("Done!")
