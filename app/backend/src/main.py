import os
import asyncio
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from routes.dama import router as dama_router
from routes.ml import router as ml_router
from routes.dama import service as dama_service


APP_ENV = os.getenv("APP_ENV", "development")


@asynccontextmanager
async def lifespan(_app):
    async def cleanup_rooms():
        while True:
            await asyncio.sleep(60)
            await dama_service.reap_expired()
    task = asyncio.create_task(cleanup_rooms())
    try:
        yield
    finally:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass


app = FastAPI(title="Equacionei", lifespan=lifespan)
app.include_router(dama_router)
app.include_router(ml_router)

BACKEND_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BACKEND_DIR / "frontend"
if not FRONTEND_DIR.is_dir():
    FRONTEND_DIR = BACKEND_DIR.parent / "frontend"

app.mount("/static", StaticFiles(directory=FRONTEND_DIR), name="static")


@app.get("/")
def read_root() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "index.html")


@app.get("/menu")
def menu() -> FileResponse:
    return FileResponse(FRONTEND_DIR / "pages" / "menu.html")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
