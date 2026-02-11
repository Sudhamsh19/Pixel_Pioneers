import sqlite3

DB_NAME = "incidents.db"

def execute_query(sql, params=()):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(sql, params)
    result = cursor.fetchall()
    conn.commit()
    conn.close()
    return result
