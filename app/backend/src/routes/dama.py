"""HTTP: Authorization: Bearer <session_token>.

WebSocket: primeira mensagem {"type":"authenticate","session_token":"..."}.
Não enviar token em URL. Após autenticação, mensagens room_state/player_* contêm
snapshot completo e revision. Move é validado pelo motor de regras no backend.
"""
import asyncio
import os

from fastapi import APIRouter, Depends, HTTPException, Request, Response, WebSocket, WebSocketDisconnect
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from pydantic import ValidationError

from schemas.dama import RoomView, SessionView, MoveRequest
from services.dama_game import InvalidMove
from services.dama import RoomError, RoomService
from services.rate_limit import limiter

router = APIRouter()
service = RoomService()
bearer = HTTPBearer(auto_error=False)
ALLOWED_ORIGINS = {item.strip().rstrip("/") for item in os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:8000,http://127.0.0.1:8000,https://equacionei.com.br,https://www.equacionei.com.br"
).split(",") if item.strip()}


async def session_token(credentials: HTTPAuthorizationCredentials | None = Depends(bearer)):
    if credentials is None:
        raise HTTPException(401, "Token de sessão obrigatório")
    return credentials.credentials


def call(operation, *args):
    try:
        return operation(*args)
    except RoomError as error:
        raise HTTPException(error.status_code, error.detail) from error


def no_cache(response: Response):
    response.headers["Cache-Control"] = "no-store"


@router.post("/api/dama/rooms", response_model=SessionView, status_code=201)
async def create_room(request: Request, response: Response):
    no_cache(response)
    limited(request, 10, 60, "dama:create")
    return call(service.create)


def limited(request: Request, maximum: int, window: int, namespace: str):
    ip = request.client.host if request.client else "unknown"
    retry = limiter.check(f"{namespace}:{ip}", maximum, window)
    if retry is not None:
        raise HTTPException(429, "Muitas solicitações. Aguarde e tente novamente.", headers={"Retry-After": str(retry)})


@router.post("/api/dama/rooms/{room_id}/join", response_model=SessionView, status_code=201)
async def join_room(room_id: str, response: Response):
    no_cache(response)
    session = call(service.join, room_id)
    await service.broadcast(room_id, "player_joined")
    return session


@router.get("/api/dama/rooms/{room_id}", response_model=RoomView)
async def get_room(room_id: str, response: Response, token: str = Depends(session_token)):
    no_cache(response)
    call(service.authenticate, room_id, token)
    return service.snapshot(room_id)


@router.post("/api/dama/rooms/{room_id}/leave", response_model=RoomView)
async def leave_room(room_id: str, response: Response, token: str = Depends(session_token)):
    no_cache(response)
    call(service.authenticate, room_id, token)
    return await service.leave(room_id, token)


@router.post("/api/dama/rooms/{room_id}/swap-colors", response_model=RoomView)
async def swap_colors(room_id: str, response: Response, token: str = Depends(session_token)):
    no_cache(response)
    room = call(service.swap_colors, room_id, token)
    await service.broadcast(room_id)
    return room


@router.post("/api/dama/rooms/{room_id}/start", response_model=RoomView)
async def start_room(room_id: str, response: Response, token: str = Depends(session_token)):
    no_cache(response)
    room = call(service.start, room_id, token)
    await service.broadcast(room_id)
    return room


@router.websocket("/ws/dama/{room_id}")
async def room_socket(websocket: WebSocket, room_id: str):
    origin = websocket.headers.get("origin", "").rstrip("/")
    if not origin or origin not in ALLOWED_ORIGINS:
        await websocket.close(code=1008)
        return
    await websocket.accept()
    player = None
    try:
        auth = await asyncio.wait_for(websocket.receive_json(), timeout=10)
        if not isinstance(auth, dict) or auth.get("type") != "authenticate":
            await websocket.close(code=1008)
            return
        player = service.connect(room_id, auth.get("session_token"), websocket)
        await service.broadcast(room_id, "player_connected")
        while True:
            try:
                message = await websocket.receive_json()
            except (ValueError, KeyError):
                await websocket.send_json({"type": "error", "detail": "Envie uma mensagem JSON válida."})
                continue
            # Leave desconecta todas as abas; não aceitar uma conexão já retirada.
            if websocket not in service.connections[room_id].get(player.player_id, set()):
                return
            if isinstance(message, dict) and message.get("type") == "ping":
                await service.broadcast(room_id)
            elif isinstance(message, dict) and message.get("type") == "move":
                try:
                    move = MoveRequest.model_validate(message)
                    service.move(room_id, auth.get("session_token"), websocket, move)
                except (ValidationError, InvalidMove, RoomError) as error:
                    detail = "Formato de jogada inválido: informe origem e destino entre 0 e 7." if isinstance(error, ValidationError) else str(error)
                    await websocket.send_json({"type": "move_rejected", "detail": detail,
                                               "room": service.snapshot(room_id).model_dump(mode="json", by_alias=True)})
                else:
                    await service.broadcast(room_id, "state")
            else:
                await websocket.send_json({"type": "error", "detail": "Mensagem não suportada nesta fase"})
    except (RoomError, ValueError, asyncio.TimeoutError):
        await websocket.close(code=1008)
    except WebSocketDisconnect:
        pass
    finally:
        if player is not None:
            service.disconnect(room_id, player.player_id, websocket)
            await service.broadcast(room_id, "player_disconnected")
