CREATE TABLE IF NOT EXISTS campanhas_disparadas (
  id BIGSERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  instancia TEXT NOT NULL,
  data_envio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  quantidade_numeros INTEGER NOT NULL
);
