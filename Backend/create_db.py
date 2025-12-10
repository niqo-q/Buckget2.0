"""
Create the database in TiDB.
Run this BEFORE setup_db.py if the database doesn't exist.
"""
import pymysql
import ssl
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def create_database():
    """Create the buckget database if it doesn't exist."""
    
    host = os.getenv("TIDB_HOST", "localhost")
    port = int(os.getenv("TIDB_PORT", "4000"))
    user = os.getenv("TIDB_USER", "root")
    password = os.getenv("TIDB_PASSWORD", "")
    database = os.getenv("TIDB_DATABASE", "buckget")
    ssl_ca = os.getenv("SSL_CA_PATH", "")
    
    print(f"🔗 Connecting to TiDB at {host}:{port}...")
    print(f"   User: {user}")
    print(f"   Database to create: {database}")
    
    # SSL configuration
    ssl_config = None
    if ssl_ca:
        ssl_config = {
            "ca": ssl_ca
        }
        print(f"   SSL CA: {ssl_ca}")
    elif "tidbcloud.com" in host:
        # For TiDB Cloud without specific CA
        ssl_config = {
            "ssl": {}
        }
        print("   SSL: Enabled (TiDB Cloud)")
    
    try:
        # Connect without specifying database
        connection = pymysql.connect(
            host=host,
            port=port,
            user=user,
            password=password,
            ssl=ssl_config
        )
        
        print("✅ Connected to TiDB!")
        
        with connection.cursor() as cursor:
            # Create database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS `{database}`")
            print(f"✅ Database '{database}' created (or already exists)!")
            
            # Show databases
            cursor.execute("SHOW DATABASES")
            databases = cursor.fetchall()
            print("\n📋 Available databases:")
            for db in databases:
                marker = " 👈" if db[0] == database else ""
                print(f"   - {db[0]}{marker}")
        
        connection.close()
        print(f"\n🎉 Database '{database}' is ready!")
        print("   Now run: python setup_db.py")
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        print("\n💡 Troubleshooting:")
        print("   1. Check your .env file has correct TiDB credentials")
        print("   2. Make sure the SSL certificate path is correct")
        print("   3. Verify your TiDB cluster is running")
        return False


if __name__ == "__main__":
    create_database()

