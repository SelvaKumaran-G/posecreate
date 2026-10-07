"""
PoseAI MCP Tool Layer

Exposes photography intelligence services as MCP-compatible tools.
The underlying services are the same ones used by FastAPI routes.
This ensures no logic duplication.

To use: configure as an MCP server in your AI assistant.
The web application works independently even if MCP is unavailable.
"""
import asyncio
import json
import sys
from typing import Any, Dict, Optional

# Tool definitions
TOOLS = [
    {
        "name": "analyze_scene",
        "description": "Analyze a photography location image. Returns scene type, composition features, lighting, best spots, and scores.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "location_image_url": {"type": "string", "description": "URL of the location image"},
                "photography_style": {"type": "string", "description": "Photography style: portrait, cinematic, instagram, street, casual, professional, bike"}
            },
            "required": ["location_image_url", "photography_style"]
        }
    },
    {
        "name": "analyze_person",
        "description": "Analyze a person image for photography-relevant features (outfit, style, colors). Never identifies the person.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "person_image_url": {"type": "string", "description": "URL of the person image"}
            },
            "required": ["person_image_url"]
        }
    },
    {
        "name": "analyze_vehicle",
        "description": "Analyze a vehicle/bike image for photography compositions.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "vehicle_image_url": {"type": "string", "description": "URL of the vehicle image"}
            },
            "required": ["vehicle_image_url"]
        }
    },
    {
        "name": "get_phone_capabilities",
        "description": "Get the camera capabilities of a smartphone model.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "phone_model": {"type": "string", "description": "Phone model ID or name"}
            },
            "required": ["phone_model"]
        }
    },
    {
        "name": "generate_pose",
        "description": "Generate a specific photography pose based on scene, person, lighting, and style.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "scene_context": {"type": "object"},
                "lighting_context": {"type": "object"},
                "person_context": {"type": "object"},
                "vehicle_context": {"type": "object"},
                "phone_capabilities": {"type": "object"},
                "photography_style": {"type": "string"},
                "take_my_photo": {"type": "boolean"}
            },
            "required": ["scene_context", "lighting_context", "phone_capabilities", "photography_style"]
        }
    },
    {
        "name": "evaluate_photo",
        "description": "Evaluate a taken photograph against composition, pose, lighting, and background criteria.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "photo_url": {"type": "string", "description": "URL of the taken photo"},
                "session_context": {"type": "object", "description": "Original analysis session context"},
                "original_pose": {"type": "object", "description": "The pose that was recommended"}
            },
            "required": ["photo_url"]
        }
    },
    {
        "name": "generate_shot_plan",
        "description": "Generate a complete mini photoshoot plan with ordered shots.",
        "inputSchema": {
            "type": "object",
            "properties": {
                "session_id": {"type": "string"},
                "photography_style": {"type": "string"},
                "has_vehicle": {"type": "boolean"}
            },
            "required": ["photography_style"]
        }
    }
]

async def handle_tool_call(name: str, args: Dict[str, Any]) -> Any:
    """Route MCP tool calls to the actual service implementations."""
    import os, sys
    sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
    
    if name == "analyze_scene":
        from app.services.scene_analyzer import SceneAnalyzer
        analyzer = SceneAnalyzer()
        return analyzer.analyze(args["location_image_url"], args["photography_style"])
    
    elif name == "analyze_person":
        from app.services.person_analyzer import PersonAnalyzer
        analyzer = PersonAnalyzer()
        return analyzer.analyze(args["person_image_url"])
    
    elif name == "analyze_vehicle":
        from app.services.vehicle_analyzer import VehicleAnalyzer
        analyzer = VehicleAnalyzer()
        return analyzer.analyze(args["vehicle_image_url"])
    
    elif name == "get_phone_capabilities":
        from app.services.phone_capability_service import PhoneCapabilityService
        service = PhoneCapabilityService()
        caps = service.get_capabilities(args["phone_model"])
        return caps.__dict__ if hasattr(caps, '__dict__') else caps
    
    elif name == "generate_pose":
        from app.services.photography_intelligence_engine import PhotographyIntelligenceEngine
        engine = PhotographyIntelligenceEngine()
        return engine.generate_recommendations(
            scene_context=args["scene_context"],
            lighting_context=args["lighting_context"],
            person_context=args.get("person_context"),
            vehicle_context=args.get("vehicle_context"),
            pose_estimation=None,
            phone_capabilities=args["phone_capabilities"],
            photography_style=args["photography_style"],
            take_my_photo=args.get("take_my_photo", False)
        )
    
    elif name == "evaluate_photo":
        from app.services.photo_evaluator import PhotoEvaluator
        evaluator = PhotoEvaluator()
        return evaluator.evaluate(
            evaluated_photo_url=args["photo_url"],
            original_session=args.get("session_context", {}),
            original_pose=args.get("original_pose")
        )
    
    elif name == "generate_shot_plan":
        return {"message": "Use generate_pose with full context for complete shot plans"}
    
    else:
        return {"error": f"Unknown tool: {name}"}


class MCPServer:
    """Simple MCP server implementation."""
    
    async def run_stdio(self):
        """Run as stdio MCP server."""
        import json
        
        # Send initialization
        init_response = {
            "jsonrpc": "2.0",
            "method": "notifications/initialized"
        }
        
        for line in sys.stdin:
            try:
                request = json.loads(line.strip())
                response = await self.handle_request(request)
                if response:
                    print(json.dumps(response))
                    sys.stdout.flush()
            except Exception as e:
                error_response = {
                    "jsonrpc": "2.0",
                    "id": None,
                    "error": {"code": -32603, "message": str(e)}
                }
                print(json.dumps(error_response))
                sys.stdout.flush()
    
    async def handle_request(self, request: Dict) -> Optional[Dict]:
        method = request.get("method", "")
        req_id = request.get("id")
        params = request.get("params", {})
        
        if method == "initialize":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {
                    "protocolVersion": "2024-11-05",
                    "capabilities": {"tools": {}},
                    "serverInfo": {"name": "poseai", "version": "1.0.0"}
                }
            }
        
        elif method == "tools/list":
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "result": {"tools": TOOLS}
            }
        
        elif method == "tools/call":
            tool_name = params.get("name", "")
            tool_args = params.get("arguments", {})
            try:
                result = await handle_tool_call(tool_name, tool_args)
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "result": {
                        "content": [{"type": "text", "text": json.dumps(result, default=str)}]
                    }
                }
            except Exception as e:
                return {
                    "jsonrpc": "2.0",
                    "id": req_id,
                    "error": {"code": -32603, "message": str(e)}
                }
        
        return None


if __name__ == "__main__":
    server = MCPServer()
    asyncio.run(server.run_stdio())
