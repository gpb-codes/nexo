export class DomainError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = "DomainError";
    this.status = status;
  }
}

export class ValidationError extends DomainError {
  constructor(message) { super(message, 400); this.name = "ValidationError"; }
}
export class UnauthorizedError extends DomainError {
  constructor(message = "No autenticado.") { super(message, 401); this.name = "UnauthorizedError"; }
}
export class NotFoundError extends DomainError {
  constructor(message = "No encontrado.") { super(message, 404); this.name = "NotFoundError"; }
}
export class ConflictError extends DomainError {
  constructor(message = "Conflicto.") { super(message, 409); this.name = "ConflictError"; }
}
export class ForbiddenError extends DomainError {
  constructor(message = "No tienes permiso para esta acción.") { super(message, 403); this.name = "ForbiddenError"; }
}
