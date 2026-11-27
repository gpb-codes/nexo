-- Tareas: detalles de productividad (categoría y fecha límite).
ALTER TABLE tasks ADD COLUMN due_date TEXT;
ALTER TABLE tasks ADD COLUMN category TEXT DEFAULT '';
