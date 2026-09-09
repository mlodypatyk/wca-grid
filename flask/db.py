import os
import psycopg2
from dotenv import load_dotenv

load_dotenv()
host = os.getenv('POSTGRES_HOST', 'localhost')
port = int(os.getenv('POSTGRES_PORT', '5432'))
user = os.getenv('POSTGRES_USER', 'user')
password = os.getenv('POSTGRES_PASS', '')
database = os.getenv('POSTGRES_DB', 'db')

mydb = psycopg2.connect(
    host=host,
    user=user,
    password=password,
    database=database,
    port=port
)
