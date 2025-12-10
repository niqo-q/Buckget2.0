"""
AI Agent API routes - powered by Google Gemini.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
import json

from ..database import get_db
from ..models import User, Bucket, AIConversation
from ..schemas import AIQueryRequest, AIQueryResponse
from ..auth import get_current_active_user
from ..config import settings

router = APIRouter(prefix="/api/ai-agent", tags=["AI Agent"])

# Gemini client
gemini_model = None

def get_gemini_model():
    """Get Gemini model if API key is configured."""
    global gemini_model
    if settings.gemini_api_key and gemini_model is None:
        try:
            import google.generativeai as genai
            genai.configure(api_key=settings.gemini_api_key)
            gemini_model = genai.GenerativeModel('gemini-1.5-flash')
        except Exception as e:
            print(f"Failed to initialize Gemini: {e}")
            return None
    return gemini_model


def get_user_context(user: User, db: Session) -> str:
    """Build context string about the user's financial state."""
    buckets = db.query(Bucket).filter(Bucket.user_id == user.id).all()
    
    context = f"""
User Financial Context:
- Name: {user.full_name}
- Available Wages: ${user.current_available:.2f}
- Total Saved: ${user.total_saved:.2f}
- Hourly Rate: ${user.hourly_rate:.2f}

Savings Goals (Buckets):
"""
    
    for bucket in buckets:
        progress = (bucket.current / bucket.target * 100) if bucket.target > 0 else 0
        context += f"- {bucket.name}: ${bucket.current:.2f} / ${bucket.target:.2f} ({progress:.1f}%)\n"
    
    if not buckets:
        context += "- No savings goals set up yet\n"
    
    return context


def get_fallback_response(user_message: str, user: User, buckets) -> dict:
    """
    Generate a fallback response when Gemini is not available.
    This mirrors the existing frontend AI logic.
    """
    message_lower = user_message.lower()
    
    if "split" in message_lower or "suggest" in message_lower:
        emergency_bucket = next((b for b in buckets if "emergency" in b.name.lower()), None)
        if emergency_bucket:
            need_amount = emergency_bucket.target - emergency_bucket.current
            suggested_save = min(need_amount, user.current_available * 0.3)
        else:
            suggested_save = user.current_available * 0.3
        
        suggested_get = user.current_available - suggested_save
        
        return {
            "reply": f"Based on your goals, I recommend:\n\n💰 Get: ${suggested_get:.2f}\n🐷 Save: ${suggested_save:.2f}\n\nThis will help you reach your savings goals faster!",
            "action": {
                "type": "split",
                "get": round(suggested_get, 2),
                "save": round(suggested_save, 2)
            }
        }
    
    if "bucket" in message_lower or "goal" in message_lower:
        if buckets:
            top_bucket = buckets[0]
            return {
                "reply": f"Your top priority is \"{top_bucket.name}\" 🎯\n\nYou've saved ${top_bucket.current:.2f} out of ${top_bucket.target:.2f}. Keep it up!",
                "action": None
            }
        else:
            return {
                "reply": "You don't have any savings goals set up yet! Would you like me to help you create one?",
                "action": None
            }
    
    if "spend" in message_lower or "budget" in message_lower:
        return {
            "reply": "Here's a smart budgeting tip: Follow the 50/30/20 rule!\n\n• 50% for needs\n• 30% for wants\n• 20% for savings\n\nYou're doing great! 🎯",
            "action": None
        }
    
    if "hello" in message_lower or "hi" in message_lower:
        return {
            "reply": f"Hi {user.full_name}! 👋 I'm Botl, your AI financial advisor.\n\nYou have ${user.current_available:.2f} available. How can I help you today?",
            "action": None
        }
    
    return {
        "reply": f"I can help you with:\n\n✨ Optimal wage splits\n💰 Savings strategies\n📊 Budget planning\n🎯 Goal tracking\n\nYou currently have ${user.current_available:.2f} available. What would you like to know?",
        "action": None
    }


@router.post("/query", response_model=AIQueryResponse)
async def query_ai_agent(
    request: AIQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Send a message to the AI agent and get a response.
    Uses Google Gemini if configured, otherwise falls back to rule-based responses.
    """
    # Get user's buckets for context
    buckets = db.query(Bucket).filter(Bucket.user_id == current_user.id).all()
    
    # Try Gemini first
    model = get_gemini_model()
    
    if model:
        try:
            user_context = get_user_context(current_user, db)
            
            system_prompt = f"""You are Botl, a friendly AI financial advisor for the BuckGet app. 
You help users manage their wages and savings goals.

{user_context}

Guidelines:
1. Be concise and friendly (max 3-4 sentences)
2. Use emojis sparingly to add personality
3. Give specific, actionable advice based on the user's financial context
4. When suggesting splits, consider their savings goals
5. Always be encouraging and positive about their financial journey
6. If they ask to split funds, provide specific dollar amounts

If suggesting a split, include this JSON at the END of your response on its own line:
ACTION: {{"type": "split", "get": <amount>, "save": <amount>}}

User message: {request.message}
"""
            
            response = model.generate_content(system_prompt)
            reply = response.text
            
            # Parse action if present
            action = None
            if "ACTION:" in reply:
                try:
                    action_str = reply.split("ACTION:")[1].strip()
                    action_json = action_str.split("\n")[0].strip()
                    action = json.loads(action_json)
                    reply = reply.split("ACTION:")[0].strip()
                except:
                    pass
            
            # Save conversation
            conversation = AIConversation(
                user_id=current_user.id,
                message=request.message,
                response=reply
            )
            db.add(conversation)
            db.commit()
            
            return AIQueryResponse(reply=reply, action=action)
            
        except Exception as e:
            # Fall back to rule-based if Gemini fails
            print(f"Gemini error: {e}")
            pass
    
    # Fallback to rule-based responses
    result = get_fallback_response(request.message, current_user, buckets)
    
    # Save conversation
    conversation = AIConversation(
        user_id=current_user.id,
        message=request.message,
        response=result["reply"]
    )
    db.add(conversation)
    db.commit()
    
    return AIQueryResponse(reply=result["reply"], action=result["action"])


@router.get("/history")
async def get_ai_history(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get recent AI conversation history.
    """
    conversations = db.query(AIConversation).filter(
        AIConversation.user_id == current_user.id
    ).order_by(AIConversation.created_at.desc()).limit(limit).all()
    
    return [
        {
            "id": c.id,
            "message": c.message,
            "response": c.response,
            "created_at": c.created_at
        }
        for c in conversations
    ]
