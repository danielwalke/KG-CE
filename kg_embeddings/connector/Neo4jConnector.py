from neo4j import GraphDatabase
class Neo4jConnector:
    def __init__(self, uri = "bolt://localhost:8083", user="", password=""):
        
        self.driver = GraphDatabase.driver(uri, auth=(user, password))

    def close(self):
        self.driver.close()

    def run_query(self, query, parameters=None):
        with self.driver.session() as session:
            result = session.run(query, parameters)
            return result.data()