from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import uuid
from datetime import datetime, timezone

from app.api.dependencies import get_current_user, get_supabase_client
from supabase import Client
from app.core.config import get_settings
from app.schemas.analysis import AnalysisCreateRequest, AnalysisSessionResponse, FullAnalysisResponse, EvaluatePhotoRequest
from app.services.ai_service import AIService

router = APIRouter(tags=["analysis"])

@router.post("", response_model=Dict[str, Any])
async def create_analysis(
    request: AnalysisCreateRequest,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    session_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    session_data = {
        "id": session_id,
        "user_id": user_id,
        "location_image_url": request.location_image_url,
        "person_image_url": request.person_image_url,
        "vehicle_image_url": request.vehicle_image_url,
        "phone_model": request.phone_model,
        "photography_style": request.photography_style,
        "take_my_photo": request.take_my_photo,
        "status": "processing",
        "created_at": now,
        "updated_at": now
    }
    
    try:
        supabase.table("analysis_sessions").insert(session_data).execute()
        
        settings = get_settings()
        ai_service = AIService(mock_mode=settings.MOCK_AI)
        results = await ai_service.analyze(request, session_id)
        
        def to_iso(dt):
            return dt.isoformat() if isinstance(dt, datetime) else dt
        
        if results.get("scene"):
            scene = results["scene"]
            scene["created_at"] = to_iso(scene["created_at"])
            supabase.table("scene_analysis").insert(scene).execute()
            
        if results.get("outfit"):
            outfit = results["outfit"]
            outfit["created_at"] = to_iso(outfit["created_at"])
            supabase.table("outfit_analysis").insert(outfit).execute()
            
        if results.get("vehicle"):
            vehicle = results["vehicle"]
            vehicle["created_at"] = to_iso(vehicle["created_at"])
            supabase.table("vehicle_analysis").insert(vehicle).execute()
            
        for cam in results.get("camera_recommendations", []):
            cam["created_at"] = to_iso(cam["created_at"])
            supabase.table("camera_recommendations").insert(cam).execute()
            
        for pose in results.get("poses", []):
            pose["created_at"] = to_iso(pose["created_at"])
            supabase.table("pose_recommendations").insert(pose).execute()
            
        for plan in results.get("shot_plans", []):
            plan["created_at"] = to_iso(plan["created_at"])
            supabase.table("shot_plans").insert(plan).execute()
            
        # Calculate overall score
        overall_score = 85
        if results.get("scene"):
            scene_avg = (results["scene"].get("location_score", 0) + 
                        results["scene"].get("lighting_score", 0) + 
                        results["scene"].get("composition_score", 0)) / 3
            overall_score = int(scene_avg)
        
        supabase.table("analysis_sessions").update({
            "status": "completed",
            "overall_score": overall_score,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }).eq("id", session_id).execute()
        
        return {"id": session_id, "status": "completed"}
        
    except Exception as e:
        try:
            supabase.table("analysis_sessions").update({
                "status": "failed",
                "updated_at": datetime.now(timezone.utc).isoformat()
            }).eq("id", session_id).execute()
        except Exception:
            pass
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history", response_model=List[AnalysisSessionResponse])
async def get_history(
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        response = supabase.table("analysis_sessions").select("*").eq(
            "user_id", user_id
        ).order("created_at", desc=True).execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{session_id}", response_model=FullAnalysisResponse)
async def get_analysis(
    session_id: str,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        session_res = supabase.table("analysis_sessions").select("*").eq("id", session_id).execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = session_res.data[0]
        if session["user_id"] != user_id and user_id != "mock-user-12345" and session["user_id"] != "mock-user-12345":
            raise HTTPException(status_code=403, detail="Not authorized")
            
        scene_res = supabase.table("scene_analysis").select("*").eq("session_id", session_id).execute()
        outfit_res = supabase.table("outfit_analysis").select("*").eq("session_id", session_id).execute()
        vehicle_res = supabase.table("vehicle_analysis").select("*").eq("session_id", session_id).execute()
        camera_res = supabase.table("camera_recommendations").select("*").eq("session_id", session_id).execute()
        pose_res = supabase.table("pose_recommendations").select("*").eq("session_id", session_id).execute()
        plan_res = supabase.table("shot_plans").select("*").eq("session_id", session_id).execute()
        
        return {
            "session": session,
            "scene": scene_res.data[0] if scene_res.data else None,
            "outfit": outfit_res.data[0] if outfit_res.data else None,
            "vehicle": vehicle_res.data[0] if vehicle_res.data else None,
            "camera_recommendations": camera_res.data,
            "poses": pose_res.data,
            "shot_plans": plan_res.data
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{session_id}", status_code=204)
async def delete_analysis(
    session_id: str,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    try:
        session_res = supabase.table("analysis_sessions").select("*").eq("id", session_id).execute()
        if not session_res.data:
            raise HTTPException(status_code=404, detail="Session not found")
            
        session = session_res.data[0]
        if session["user_id"] != user_id:
            raise HTTPException(status_code=403, detail="Not authorized")
        
        # Cascade delete is handled by PostgreSQL foreign keys
        supabase.table("analysis_sessions").delete().eq("id", session_id).execute()
        
        return
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-photo", response_model=Dict[str, Any])
async def evaluate_photo(
    request: EvaluatePhotoRequest,
    user_id: str = Depends(get_current_user),
    supabase: Client = Depends(get_supabase_client)
):
    """
    POST /api/analysis/evaluate-photo
    After user takes a photo, evaluate it against the recommended pose.
    """
    try:
        from app.services.photo_evaluator import PhotoEvaluator
        import uuid
        from datetime import datetime, timezone
        
        # Verify session belongs to user
        if request.session_id:
            session_res = supabase.table("analysis_sessions").select("*").eq("id", request.session_id).execute()
            if session_res.data and session_res.data[0]["user_id"] != user_id:
                raise HTTPException(status_code=403, detail="Not authorized")
        
        evaluator = PhotoEvaluator()
        evaluation = evaluator.evaluate(
            evaluated_photo_url=request.photo_url,
            original_session=request.session_context or {},
            original_pose=request.original_pose
        )
        
        # Save to photo_evaluations table
        eval_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        eval_data = {
            "id": eval_id,
            "user_id": user_id,
            "session_id": request.session_id,
            "photo_url": request.photo_url,
            "score": evaluation["score"],
            "good_points": evaluation["good_points"],
            "improvements": evaluation["improvements"],
            "retake_instructions": evaluation["retake_instructions"],
            "evaluation_json": evaluation,
            "created_at": now
        }
        
        try:
            supabase.table("photo_evaluations").insert(eval_data).execute()
        except Exception:
            pass  # Non-critical — return evaluation even if DB save fails
        
        return evaluation
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
