from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class ApiError(Exception):
    def __init__(self, status_code: int, message: str, details: object | None = None):
        self.status_code = status_code
        self.message = message
        self.details = details


async def api_error_handler(_: Request, exc: ApiError) -> JSONResponse:
    payload: dict[str, object] = {"message": exc.message}
    if exc.details is not None:
        payload["details"] = exc.details
    return JSONResponse(status_code=exc.status_code, content=payload)


async def validation_exception_handler(
    _: Request,
    exc: RequestValidationError,
) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={
            "message": "Validation failed",
            "details": exc.errors(),
        },
    )

