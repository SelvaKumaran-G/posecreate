from pydantic import BaseModel
from typing import Optional

class PhoneModelResponse(BaseModel):
    id: str
    brand: str
    model: str
    main_camera: str
    ultrawide_camera: Optional[str]
    telephoto_camera: Optional[str]
    portrait_mode: bool
    cinematic_mode: bool
    night_mode: bool
    optical_zoom: Optional[str] = None
    max_supported_zoom: Optional[str] = None
