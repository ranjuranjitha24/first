import os
import certifi
from pymongo import MongoClient
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME   = os.getenv("DB_NAME", "hr_recruiter")

client = MongoClient(MONGO_URI)
db     = client[DB_NAME]

employees_col  = db["employees"]
interviews_col = db["interviews"]
jobs_col       = db["jobs"]
candidates_col = db["candidates"]
leaves_col     = db["leaves"]
reviews_col    = db["reviews"]
users_col      = db["users"]
activity_col   = db["activity"]
