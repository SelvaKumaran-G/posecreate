from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
import uuid
from app.api.dependencies import get_current_user, get_supabase_client
from supabase import Client

router = APIRouter(tags=["upload"])

ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
MAX_FILE_SIZE = 10 * 1024 * 1024 # 10MB

@router.post("")
async def upload_image(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    # Check file size
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Check file type
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type. Only JPG, PNG and WEBP allowed")

    file_content = await file.read()
    
    # Generate unique filename
    ext = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    filename = f"{user_id}/{uuid.uuid4()}.{ext}"
    
    try:
        # Upload to Supabase storage
        res = supabase.storage.from_("uploads").upload(
            path=filename,
            file=file_content,
            file_options={"content-type": file.content_type}
        )
        
        # Get public URL
        public_url = supabase.storage.from_("uploads").get_public_url(filename)
        
        return {
            "url": public_url,
            "path": filename,
            "bucket": "uploads"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
