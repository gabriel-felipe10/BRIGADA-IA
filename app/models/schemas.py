"""
BRIGADA-IA — Schemas de validação de entrada (Pydantic).
"""

from pydantic import BaseModel, Field
from typing import Any, Optional, Literal


class ValidationRequest(BaseModel):
    """Schema para requisições de validação."""
    type: Literal["csv", "json", "business_rule"] = Field(
        ...,
        description="Tipo de validação: 'csv', 'json' ou 'business_rule'"
    )
    data: Any = Field(
        ...,
        description="Dados a serem validados"
    )


class ValidationResponse(BaseModel):
    """Schema para respostas de validação."""
    request_id: str
    status: Literal["success", "error"]
    details: list[str] = []
    input: dict[str, Any] = {}
    timestamp: str = ""
    duration_ms: float = 0.0


class LogsQueryParams(BaseModel):
    """Schema para parâmetros de consulta de logs."""
    page: int = Field(default=1, ge=1)
    per_page: int = Field(default=20, ge=1, le=100)
    status: Optional[str] = None
    type: Optional[str] = None
