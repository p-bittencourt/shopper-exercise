# Shopper API

Esta é uma API desenvolvida como parte do desafio para a vaga na Shopper. Foi construída utilizando TypeScript, Express e Gemini API.

## Autor

Pedro Bittencourt

## Funcionalidades

A API possui as seguintes funcionalidades:

- Realização de leitura de hidrômetro via Gemini
- Validação de dados enviados via request
- Testes com array de clientes
- Utilização de payloads.json para testes

## Testando a API

Foi criado um array com alguns clientes para testes.
Para testar a API, podem ser utilize os seguintes códigos de clientes:

- "CUST001"
- "CUST002"
- "CUST003"

Também algumas uuids das medições cadastradas no array podem ser utilizadas:

- "1a2b3c4d-1234-5678-9101-abcdef123456"
- "3c4d5e6f-3456-7890-1121-cdef34567890"

Além disso, estão disponibilizados alguns arquivos payloads.json na raiz do projeto para efetuar testes.

## Utilizando em um container

Para utilizar o projeto em um container, execute o seguinte comando:

```
docker-compose up --build
```

Isso irá gerar o container com todas as dependências necessárias.
