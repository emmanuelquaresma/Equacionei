"""API do laboratório: corpo limitado, mensagens legíveis e CPU fora do event loop."""
import logging
from dataclasses import asdict
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from pydantic import ValidationError
from starlette.concurrency import run_in_threadpool
from config.ml import LIMITS
from schemas.ml import TrainRequest, PredictRequest, ReleaseRequest
from services.ml.datasets import DEMOS
from services.ml.errors import LabError
from services.ml.service import LabService

logger = logging.getLogger(__name__)
service = LabService()


def no_cache(response: Response):
    response.headers['Cache-Control'] = 'no-store'


router = APIRouter(prefix='/api/ml', tags=['Laboratório ML'], dependencies=[Depends(no_cache)])


async def bounded_body(request, maximum):
    chunks = bytearray()
    async for chunk in request.stream():
        if len(chunks) + len(chunk) > maximum:
            raise HTTPException(413, 'O conteúdo enviado excede o limite permitido pelo laboratório.')
        chunks.extend(chunk)
    return bytes(chunks)


async def payload(request, schema):
    raw = await bounded_body(request, LIMITS.max_json_bytes)
    try:
        return schema.model_validate_json(raw)
    except ValidationError as exc:
        fields = ', '.join('.'.join(map(str, item['loc'])) for item in exc.errors(include_input=False))
        logger.info('Configuração ML inválida: %s', fields)
        raise HTTPException(422, 'Confira os campos e limites da configuração: ' + (fields or 'JSON inválido')) from exc


async def call(operation, *args, **kwargs):
    try:
        return await run_in_threadpool(operation, *args, **kwargs)
    except LabError as exc:
        logger.info('Validação do laboratório: %s', exc.detail)
        raise HTTPException(exc.status, exc.detail) from exc
    except Exception as exc:
        logger.exception('Falha no laboratório ML em %s', operation.__name__)
        raise HTTPException(500, 'Não foi possível concluir esta operação. Confira os dados ou tente novamente.') from exc


@router.get('/datasets')
def datasets():
    return {'demos': [{'id': key, 'name': title, 'model_type': task} for key,(title,_,task) in DEMOS.items()],
            'limits': asdict(LIMITS)}


@router.post('/datasets/demo/{name}')
async def demo(name: str):
    return await call(service.dataset, demo=name)


@router.post('/datasets/upload')
async def upload(request: Request, filename: str = ''):
    if len(filename) > 255 or not filename.lower().endswith('.csv'):
        raise HTTPException(422, 'Selecione um arquivo com extensão .csv.')
    raw = await bounded_body(request, LIMITS.max_upload_mb * 1024 * 1024)
    return await call(service.dataset, raw=raw, filename=filename)


@router.post('/xgboost/train')
async def train(request: Request):
    return await call(service.train, await payload(request, TrainRequest))


@router.post('/xgboost/predict')
async def predict(request: Request):
    return await call(service.predict, await payload(request, PredictRequest))


@router.post('/release')
async def release(request: Request):
    data = await payload(request, ReleaseRequest)
    if data.dataset_id:
        service.datasets.delete(data.dataset_id)
    if data.model_id:
        service.models.delete(data.model_id)
    return {'released': True}
