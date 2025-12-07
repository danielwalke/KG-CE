import os
from colorama import Fore, Style
import pandas as pd
from neo4j import GraphDatabase
from kg_embeddings.connector.Neo4jConnector import Neo4jConnector
from pathlib import Path
import numpy as np
from pathlib import Path
import shutil

data_type_function_dict = {
	"bool": "toBoolean",
	"float": "toFloat",
	"int": "toInteger",
	"str": "toString"
}

def get_data_type_function(conversion_type):
	data_type_function = None
	if "float" in conversion_type:
		data_type_function = data_type_function_dict["float"]
	if "int" in conversion_type:
		data_type_function = data_type_function_dict["int"]
	if "str" in conversion_type:
		data_type_function = data_type_function_dict["str"]
	if "bool" in conversion_type:
		data_type_function = data_type_function_dict["bool"]
	if data_type_function is None:
		raise Exception("Data type could not be parsed from node schema")
	return data_type_function


def upload_nodes(session):
	nodes_path = os.path.join(IMPORT_PATH, "nodes")	
	for node_file in os.listdir(nodes_path):
		file_path = os.path.join("nodes", node_file).replace("\\", "/") #f"nodes/{node_file}" #
		print(file_path)
		#file_path = Path(file_path).as_uri()
		node_label = node_file.split(".")[0]
  
		print(f"""
		CALL apoc.periodic.iterate(
		  "CALL apoc.load.csv('file:///{file_path}') YIELD map",
		  "CREATE (n:Detected_{node_label}) SET n = map",
		  {{batchSize: 1000, parallel: false}}
		)
		""")
		session.run(f"""
		CALL apoc.periodic.iterate(
		  "CALL apoc.load.csv('file:///{file_path}') YIELD map",
		  "CREATE (n:Detected_{node_label}) SET n = map",
		  {{batchSize: 1000, parallel: false}}
		)
		""")
		
		session.run(f"CREATE INDEX IF NOT EXISTS FOR (n:{node_label}) ON (n.id)")

def upload_edges(session):
	edges_path = os.path.join(IMPORT_PATH, "edges")	
	for edge_file in os.listdir(edges_path):
		# if edge_file == "Metaprotein__ASSOCIATED_WITH__Peptide.csv": continue
		file_path = os.path.join("edges", edge_file).replace("\\", "/") #f"edges/{edge_file}" #
		# file_path = Path(file_path).as_uri()
		edge_label = edge_file.split(".")[0]
		source_label, edge_label, target_label = edge_label.split("__")
		session.run(f"""
			CALL apoc.load.csv('file:///{file_path}') YIELD map
			WITH apoc.map.removeKeys(map, ['Source', 'Target']) AS filteredMap, map
			MATCH (a:Detected_{source_label} {{id: map.Source}})
			MATCH (b:Detected_{target_label} {{id: map.Target}})
			CREATE (a)-[r:{edge_label}]->(b)
			SET r = filteredMap
		""")

def convert_node_props(session):
	node_schema_path = os.path.join(IMPORT_PATH, "nodes_schema")
	for node_schema_file in os.listdir(node_schema_path):
		file_path = os.path.join("nodes_schema", node_schema_file)
		node_label = node_schema_file.split(".")[0]
		node_schema = pd.read_csv(file_path)
		query = f"MATCH (n:Detected_{node_label})"
		for column in node_schema.columns:
			conversion_type = node_schema[column].iloc[0].lower()
			dt_function = get_data_type_function(conversion_type)
			if "list" in conversion_type:
				query += f"""
				WITH n, n.`{column}` as list_val
				UNWIND split(list_val, ';') AS splitted_val
				WITH n, COLLECT({dt_function}(splitted_val)) AS collected_val
				SET n.`{column}` = collected_val
				"""
			else:
				query += f"""
					SET n.`{column}` = {dt_function}(n.`{column}`)
				"""
		session.run(query)

def convert_edge_props(session):
	edge_schema_path = os.path.join(IMPORT_PATH, "edge_schema")
	for edge_schema_file in os.listdir(edge_schema_path):
		abs_path = os.path.join("edge_schema", edge_schema_file)
		src_label, edge_label, trt_label = edge_schema_file.split(".")[0].split("__")
		edge_schema = pd.read_csv(abs_path)
		query = f"MATCH (a:Detected_{src_label})-[r:{edge_label}]->(b:Detected_{trt_label})"
		for column in edge_schema.columns:
			conversion_type = edge_schema[column].iloc[0].lower()
			dt_function = get_data_type_function(conversion_type)
			if "list" in conversion_type:
				query += f"""
				WITH r, r.{column} as list_val
				UNWIND split(list_val, ';') AS splitted_val
				WITH r, COLLECT({dt_function}(splitted_val)) AS collected_val
				SET r.`{column}` = collected_val
				"""
			else:
				query += f"""
					SET r.`{column}` = {dt_function}(r.{column})
				"""
		session.run(query)


def test(session):
	data = pd.read_csv("data/AbundanceProteinsGroups.csv", sep = ";")
	data = data.sort_values(by = "Metaprotein Number")
	for col in data.columns[17:]:
		neo_res = session.run(f"""
		MATCH (n:Detected_Sample {{id:"{col}"}})-[r:MEASURES]-(m:Detected_Metaprotein)
		RETURN m.id as `Metaprotein Number`, r.Weight as `{col}`
		""").to_df()
		neo_res_sorted = neo_res.sort_values(by = 'Metaprotein Number')
		non_zero_mask = data[col] != 0.0
		metaproteins_matches = neo_res_sorted["Metaprotein Number"].values == data[non_zero_mask]["Metaprotein Number"].values
		values_matches = neo_res_sorted[col].values.astype(np.float32) == data[non_zero_mask][col].values.astype(np.float32)
		assert metaproteins_matches.all(), "Metaproteins does not match"
		print(f"{Fore.GREEN}✓ Metaprotein validation successful!{Style.RESET_ALL}")

		assert values_matches.all(), "Values does not match"
		print(f"{Fore.GREEN}✓ Values validation successful!{Style.RESET_ALL}")

		print(f"{Fore.GREEN}========== Sample {col} passed all tests! =========={Style.RESET_ALL}")

	print(f"\n{Fore.GREEN}✓✓✓ ALL SAMPLES VALIDATED SUCCESSFULLY ✓✓✓{Style.RESET_ALL}")
 
def copy_all_neo4j_folders_in_import_dir(import_dir):
    edge_schema_dir_abs_path = os.path.abspath(f"edge_schema")
    node_schema_dir_abs_path = os.path.abspath(f"nodes_schema")
    node_abs_path = os.path.abspath("nodes")
    edges_abs_path = os.path.abspath("edges")
    shutil.copytree(Path(edge_schema_dir_abs_path), Path(import_dir, "edge_schema"), dirs_exist_ok=True) 
    shutil.copytree(Path(node_schema_dir_abs_path), Path(import_dir, "nodes_schema"), dirs_exist_ok=True) 
    shutil.copytree(Path(node_abs_path), Path(import_dir, "nodes"), dirs_exist_ok=True) 
    shutil.copytree(Path(edges_abs_path), Path(import_dir, "edges"), dirs_exist_ok=True) 
    
    
    
     

driver = Neo4jConnector().driver
os.chdir("sepsis")
IMPORT_PATH = r"C:\Users\danie\git\pKGML\pKGML\neo4j\neo4j.db"
copy_all_neo4j_folders_in_import_dir(IMPORT_PATH)
with driver.session() as session:
	upload_nodes(session)
	upload_edges(session)
	convert_node_props(session)
	convert_edge_props(session)
	##Test only validates Sample -> Metaprotein for now but this is the main focus for me
	test(session)





