import json
import os
import uuid
import datetime
import logging

logger = logging.getLogger("uvicorn")

class MockTable:
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self.filters = []
        self.order_by = None
        self.order_desc = False

    def insert(self, data):
        # Handle list of dicts or single dict
        if isinstance(data, list):
            for item in data:
                self._insert_item(item)
        else:
            self._insert_item(data)
        return self

    def _insert_item(self, item):
        # Ensure item has a unique ID if it doesn't already
        if "id" not in item:
            item["id"] = str(uuid.uuid4())
        self.client.db[self.table_name].append(item)

    def update(self, data):
        records = self.client.db[self.table_name]
        for record in records:
            if self._matches(record):
                record.update(data)
        return self

    def delete(self):
        records = self.client.db[self.table_name]
        self.client.db[self.table_name] = [r for r in records if not self._matches(r)]
        return self

    def select(self, columns="*"):
        return self

    def eq(self, column, value):
        self.filters.append((column, value))
        return self

    def order(self, column, desc=False):
        self.order_by = column
        self.order_desc = desc
        return self

    def _matches(self, record):
        for col, val in self.filters:
            if record.get(col) != val:
                return False
        return True

    def execute(self):
        records = self.client.db[self.table_name]
        filtered = [dict(r) for r in records if self._matches(r)]
        
        if self.order_by:
            filtered.sort(
                key=lambda x: str(x.get(self.order_by) or ""),
                reverse=self.order_desc
            )
        
        self.client.save_db()
        
        class ExecuteResult:
            def __init__(self, data):
                self.data = data
        return ExecuteResult(filtered)


class MockAuthUser:
    def __init__(self, id, email="mock@example.com", display_name="Mock User"):
        self.id = id
        self.email = email
        self.user_metadata = {"display_name": display_name}


class MockAuthUserResponse:
    def __init__(self, user):
        self.user = user


class MockAuth:
    def get_user(self, token):
        # Default mock user ID. If the token is formatted, extract user ID.
        user_id = "mock-user-12345"
        if token:
            if token.startswith("mock-token-"):
                user_id = token.replace("mock-token-", "")
            elif len(token) > 10:
                user_id = token
        return MockAuthUserResponse(MockAuthUser(id=user_id))


class MockBucket:
    def __init__(self, bucket_name):
        self.bucket_name = bucket_name

    def upload(self, path, file, file_options=None):
        # File is bytes or file-like object
        # Save to static/uploads/{path} or static/{bucket_name}/{path}
        # In upload.py, path is user_id/uuid.ext and bucket is uploads
        import os
        # We target the static/ folder inside app
        app_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        static_uploads_dir = os.path.join(app_dir, "static", self.bucket_name)
        dest_path = os.path.join(static_uploads_dir, path)
        
        os.makedirs(os.path.dirname(dest_path), exist_ok=True)
        
        with open(dest_path, "wb") as f:
            if isinstance(file, bytes):
                f.write(file)
            else:
                f.write(file.read())
                
        logger.info(f"Mock Storage uploaded file saved to: {dest_path}")
        return {"path": path}

    def get_public_url(self, path):
        # Generates a URL pointing to our local FastAPI static files directory
        return f"http://localhost:8000/static/{self.bucket_name}/{path}"


class MockStorage:
    def from_(self, bucket_name):
        return MockBucket(bucket_name)


class MockSupabaseClient:
    db_file = "mock_supabase_db.json"

    def __init__(self):
        self.db = {
            "analysis_sessions": [],
            "scene_analysis": [],
            "outfit_analysis": [],
            "vehicle_analysis": [],
            "camera_recommendations": [],
            "pose_recommendations": [],
            "shot_plans": [],
            "photo_evaluations": []
        }
        self.load_db()
        self.auth = MockAuth()
        self.storage = MockStorage()

    def load_db(self):
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, "r") as f:
                    loaded = json.load(f)
                    for k, v in loaded.items():
                        if k in self.db:
                            self.db[k] = v
                logger.info(f"Loaded mock database from {self.db_file}")
            except Exception as e:
                logger.error(f"Error loading mock DB: {e}")

    def save_db(self):
        try:
            with open(self.db_file, "w") as f:
                json.dump(self.db, f, indent=2)
        except Exception as e:
            logger.error(f"Error saving mock DB: {e}")

    def table(self, table_name):
        if table_name not in self.db:
            self.db[table_name] = []
        return MockTable(self, table_name)
