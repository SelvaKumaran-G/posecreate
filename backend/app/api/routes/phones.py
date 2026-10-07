from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional
from app.schemas.phone import PhoneModelResponse
from app.models.phone_database import get_all_phones, get_phone_by_id, search_phones

router = APIRouter(tags=["phones"])

@router.get("", response_model=List[PhoneModelResponse])
async def list_phones(q: Optional[str] = Query(None, description="Search query")):
    """List all supported phone models, optionally filtered by search query."""
    if q:
        phones = search_phones(q)
    else:
        phones = get_all_phones()
    
    return [
        PhoneModelResponse(
            id=p.id,
            brand=p.brand,
            model=p.model,
            main_camera=p.main_camera,
            ultrawide_camera=p.ultrawide_camera,
            telephoto_camera=p.telephoto_camera,
            portrait_mode=p.portrait_mode,
            cinematic_mode=p.cinematic_mode,
            night_mode=p.night_mode,
            optical_zoom=p.optical_zoom,
            max_supported_zoom=p.max_supported_zoom,
        )
        for p in phones
    ]

@router.get("/{phone_id}", response_model=PhoneModelResponse)
async def get_phone(phone_id: str):
    """Get a specific phone model by ID."""
    phone = get_phone_by_id(phone_id)
    if not phone:
        raise HTTPException(status_code=404, detail="Phone model not found. Camera specifications unavailable. Using general smartphone recommendations.")
    
    return PhoneModelResponse(
        id=phone.id,
        brand=phone.brand,
        model=phone.model,
        main_camera=phone.main_camera,
        ultrawide_camera=phone.ultrawide_camera,
        telephoto_camera=phone.telephoto_camera,
        portrait_mode=phone.portrait_mode,
        cinematic_mode=phone.cinematic_mode,
        night_mode=phone.night_mode,
        optical_zoom=phone.optical_zoom,
        max_supported_zoom=phone.max_supported_zoom,
    )
