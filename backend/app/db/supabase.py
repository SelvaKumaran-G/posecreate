from supabase import create_client, Client
from app.core.config import get_settings
from functools import lru_cache
from app.db.mock_supabase import MockSupabaseClient

@lru_cache
def get_supabase_client() -> Client:
    settings = get_settings()
    is_dummy = (
        not settings.SUPABASE_URL 
        or not settings.SUPABASE_SERVICE_ROLE_KEY 
        or "dummy" in settings.SUPABASE_URL
    )
    if is_dummy:
        return MockSupabaseClient()
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

