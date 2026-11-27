-- Asistente de IA: datos del proveedor.
ALTER TABLE users ADD COLUMN ai_api_key TEXT;
ALTER TABLE users ADD COLUMN ai_model TEXT;
ALTER TABLE users ADD COLUMN ai_base_url TEXT;
