# SQL 脚本执行说明

## 问题原因

之前注释乱码的原因是：**Windows PowerShell 默认使用 GB2312 编码（代码页 936）**，而不是 UTF-8。

当通过 PowerShell 执行包含中文注释的 SQL 文件时：
1. SQL 文件本身是 UTF-8 编码（包含正确的中文）
2. PowerShell 用 GB2312 编码读取文件
3. 中文字符被错误解码，变成乱码
4. 即使 MySQL 设置了 `utf8mb4`，存储的仍然是乱码数据

## 正确的执行方式

### 方式1：使用 Get-Content 指定 UTF-8 编码（推荐）

```powershell
# 设置 PowerShell 输出编码为 UTF-8
$env:PYTHONIOENCODING="utf-8"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# 使用 Get-Content 读取文件并指定 UTF-8 编码
Get-Content sql文件路径 -Encoding UTF8 | mysql -h localhost -P 3307 -u root -p密码 数据库名 --default-character-set=utf8mb4
```

### 方式2：在 MySQL 客户端内使用 source 命令

```bash
# 先连接到 MySQL
mysql -h localhost -P 3307 -u root -p --default-character-set=utf8mb4

# 在 MySQL 客户端内执行
mysql> use ecommerce_user;
mysql> source sql文件路径;
```

### 方式3：使用 Python 脚本执行（最可靠）

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

# 读取 SQL 文件（UTF-8 编码）
with open('sql文件路径', 'r', encoding='utf-8') as f:
    sql = f.read()
    
# 执行 SQL（可以按分号分割执行多条语句）
for statement in sql.split(';'):
    if statement.strip():
        cursor.execute(statement)
        conn.commit()

cursor.close()
conn.close()
```

## 预防措施

1. **始终使用 UTF-8 编码保存 SQL 文件**
2. **执行 SQL 时明确指定编码**：使用 `Get-Content -Encoding UTF8` 或 Python 脚本
3. **验证字符集设置**：执行前检查 MySQL 的字符集变量
4. **测试中文注释**：执行后立即查询一个字段的注释，确认中文显示正常

## 已修复的表

以下表的注释已修复：
- `announcement` - 公告表
- `appointment` - 预约表  
- `order` - 订单表（receive_time 字段）

