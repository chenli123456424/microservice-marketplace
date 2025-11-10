# Microservices E-Commerce Platform Documentation

## SQL Script Execution Instructions

### Root Cause

The previous issue of garbled Chinese comments was caused by: **Windows PowerShell defaults to GB2312 encoding (Code Page 936)**, not UTF-8.

When executing an SQL file containing Chinese comments via PowerShell:
1. The SQL file itself is encoded in UTF-8 (with correct Chinese characters).
2. PowerShell reads the file using GB2312 encoding.
3. Chinese characters are incorrectly decoded, resulting in garbled text.
4. Even if MySQL is configured with `utf8mb4`, the stored data remains garbled.

### Correct Execution Methods

#### Method 1: Use Get-Content with UTF-8 Encoding (Recommended)

```powershell
# Set PowerShell output encoding to UTF-8
$env:PYTHONIOENCODING="utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Use Get-Content to read the file with UTF-8 encoding
Get-Content sql-file-path -Encoding UTF8 | mysql -h localhost -P 3307 -u root -pPassword DatabaseName --default-character-set=utf8mb4
```

#### Method 2: Use the `source` Command Within MySQL Client

```bash
# First connect to MySQL
mysql -h localhost -P 3307 -u root -p --default-character-set=utf8mb4

# Then execute within the MySQL client
mysql> use ecommerce_user;
mysql> source sql-file-path;
```

#### Method 3: Use a Python Script (Most Reliable)

```python
import pymysql

config = {
    'host': 'localhost',
    'port': 3307,
    'user': 'root',
    'password': '123456',
    'database': 'ecommerce_user',
    'charset': 'utf8mb4'
}

conn = pymysql.connect(**config)
cursor = conn.cursor()

# Read SQL file (UTF-8 encoding)
with open('sql-file-path', 'r', encoding='utf-8') as f:
    sql = f.read()
    
# Execute SQL (split by semicolon to handle multiple statements)
for statement in sql.split(';'):
    if statement.strip():
        cursor.execute(statement)
        conn.commit()

cursor.close()
conn.close()
```

### Preventive Measures

1. **Always save SQL files in UTF-8 encoding.**
2. **Explicitly specify encoding when executing SQL**: Use `Get-Content -Encoding UTF8` or a Python script.
3. **Verify character set settings**: Check MySQL's character set variables before execution.
4. **Test Chinese comments**: After execution, immediately query a comment field to confirm Chinese displays correctly.

### Tables with Fixed Comments

The following tables have had their comments repaired:
- `announcement` - Announcement table
- `appointment` - Appointment table
- `order` - Order table (receive_time field)