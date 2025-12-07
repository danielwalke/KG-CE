docker run --rm -p 8000:8000 `
  -e NEO4J_URI="bolt://host.docker.internal:8083" `
  -e NEO4J_USERNAME="neo4j" `
  -e NEO4J_PASSWORD="password" `
  -e NEO4J_DATABASE="neo4j" `
  -e NEO4J_TRANSPORT="http" `
  -e NEO4J_MCP_SERVER_HOST="0.0.0.0" `
  -e NEO4J_MCP_SERVER_PORT="8000" `
  -e NEO4J_MCP_SERVER_PATH="/mcp/" `
  -e NEO4J_SCHEMA_SAMPLE_SIZE=1000 `
  -e NEO4J_READ_TIMEOUT=60 `
  mcp/neo4j-cypher:latest