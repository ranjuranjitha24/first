from fastapi import APIRouter, File, UploadFile, Depends
from dependencies import get_current_user_required
import controllers.ai_controller as ctrl

router = APIRouter()

@router.post("/analyze")
async def analyze_resume_endpoint(
    file: UploadFile = File(...), 
    user: dict = Depends(get_current_user_required)
):
    # In a real app, we'd save the file and pass its path or content
    content = await file.read()
    results = ctrl.analyze_resume(filename=file.filename)
    return {"success": True, "data": results}
