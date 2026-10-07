from dataclasses import dataclass

@dataclass
class PhoneSpec:
    id: str
    brand: str
    model: str
    main_camera: str
    ultrawide_camera: str | None
    telephoto_camera: str | None
    portrait_mode: bool
    cinematic_mode: bool
    night_mode: bool
    optical_zoom: str | None
    max_supported_zoom: str | None

PHONES = [
    PhoneSpec("iphone_16_pro_max", "Apple", "iPhone 16 Pro Max", "48MP", "48MP", "12MP 5x", True, True, True, "5x", "25x"),
    PhoneSpec("iphone_16_pro", "Apple", "iPhone 16 Pro", "48MP", "48MP", "12MP 5x", True, True, True, "5x", "25x"),
    PhoneSpec("iphone_16", "Apple", "iPhone 16", "48MP", "12MP", None, True, True, True, "2x", "10x"),
    PhoneSpec("iphone_15_pro_max", "Apple", "iPhone 15 Pro Max", "48MP", "12MP", "12MP 5x", True, True, True, "5x", "25x"),
    PhoneSpec("iphone_15_pro", "Apple", "iPhone 15 Pro", "48MP", "12MP", "12MP 3x", True, True, True, "3x", "15x"),
    PhoneSpec("iphone_15", "Apple", "iPhone 15", "48MP", "12MP", None, True, False, True, "2x", "10x"),
    PhoneSpec("iphone_14_pro", "Apple", "iPhone 14 Pro", "48MP", "12MP", "12MP 3x", True, True, True, "3x", "15x"),
    PhoneSpec("samsung_s25_ultra", "Samsung", "Galaxy S25 Ultra", "200MP", "12MP", "50MP 5x + 10MP 3x", True, True, True, "5x", "100x"),
    PhoneSpec("samsung_s25_plus", "Samsung", "Galaxy S25+", "50MP", "12MP", "10MP 3x", True, True, True, "3x", "30x"),
    PhoneSpec("samsung_s25", "Samsung", "Galaxy S25", "50MP", "12MP", None, True, True, True, "2x", "20x"),
    PhoneSpec("samsung_s24_ultra", "Samsung", "Galaxy S24 Ultra", "200MP", "12MP", "50MP 5x + 10MP 3x", True, True, True, "5x", "100x"),
    PhoneSpec("pixel_9_pro", "Google", "Pixel 9 Pro", "50MP", "48MP", "48MP 5x", True, True, True, "5x", "30x"),
    PhoneSpec("pixel_9", "Google", "Pixel 9", "50MP", "48MP", None, True, False, True, "2x", "8x"),
    PhoneSpec("pixel_8_pro", "Google", "Pixel 8 Pro", "50MP", "48MP", "48MP 5x", True, True, True, "5x", "30x"),
    PhoneSpec("pixel_8", "Google", "Pixel 8", "50MP", "12MP", None, True, False, True, "2x", "8x"),
    PhoneSpec("oneplus_13", "OnePlus", "OnePlus 13", "50MP", "50MP", "50MP 3x", True, False, True, "3x", "20x"),
    PhoneSpec("oneplus_12", "OnePlus", "OnePlus 12", "50MP", "48MP", "64MP 3x", True, False, True, "3x", "20x")
]

def get_all_phones() -> list[PhoneSpec]:
    return PHONES

def get_phone_by_id(phone_id: str) -> PhoneSpec | None:
    for phone in PHONES:
        if phone.id == phone_id:
            return phone
    return None

def search_phones(query: str) -> list[PhoneSpec]:
    query = query.lower()
    return [p for p in PHONES if query in p.brand.lower() or query in p.model.lower()]
