from django.core.management.base import BaseCommand
from django.db import connection
from django.conf import settings

class Command(BaseCommand):
    help = "Verifies the database connection, queries the PostgreSQL version, and prints details."

    def handle(self, *args, **options):
        self.stdout.write("Testing database connection...")
        
        default_db = settings.DATABASES.get('default', {})
        engine = default_db.get('ENGINE', '')
        host = default_db.get('HOST', 'localhost') or 'localhost'
        
        self.stdout.write(f"Configured Engine: {engine}")
        self.stdout.write(f"Configured Host: {host}")

        try:
            # Force connection establishment
            connection.ensure_connection()
            
            # Execute query to fetch PostgreSQL version
            with connection.cursor() as cursor:
                cursor.execute("SELECT version();")
                version = cursor.fetchone()
            
            self.stdout.write(self.style.SUCCESS("SUCCESS: Connected to the database!"))
            if version:
                self.stdout.write(f"Version Info: {version[0]}")
            else:
                self.stdout.write("Version Info: None returned")
                
        except Exception as e:
            self.stderr.write(self.style.ERROR("ERROR: Database connection failed!"))
            # Make sure to redact or mask any password if it leaks in exception
            err_msg = str(e)
            if "Ih9oUeap5FVMT8RM" in err_msg:
                err_msg = err_msg.replace("Ih9oUeap5FVMT8RM", "********")
            
            self.stderr.write(self.style.ERROR(f"Exception details: {err_msg}"))
            raise e
