import numpy as np
import pandas as pd
import os
import torch


def create_nodes_csv(node_type, df):
	os.makedirs("nodes", exist_ok=True)
	df.to_csv(f"nodes/{node_type}.csv", index=False)


def create_sample_nodes_csv(data):
	samples = data.columns[17:]
	samples_df = pd.DataFrame()
	samples_df["id"] = samples
	samples_df["label"] = [int("sepsis" in sample.lower()) for sample in samples.values.tolist()]
	samples_df["sample_id"] = [sample.split(".")[-1] for sample in samples.values.tolist()]
	abundance_sample_translation_dict = dict(zip(samples_df["sample_id"], samples_df["id"]))
	create_nodes_csv("Sample", samples_df)
	return  abundance_sample_translation_dict


def create_metaproteins_csv(data):
	metaproteins_df = pd.DataFrame()
	metaproteins_df["id"] = data["Metaprotein Number"]
	metaproteins_df["Protein_Accessions"] = data["Protein Accessions"]
	metaproteins_df["superkingdom"] = data["task_1::Taxonomic_Annotation_Task_1::superkingdom"]
	metaproteins_df["phylum"] = data["task_1::Taxonomic_Annotation_Task_1::phylum"]
	metaproteins_df["class"] = data["task_1::Taxonomic_Annotation_Task_1::class"]
	metaproteins_df["order"] = data["task_1::Taxonomic_Annotation_Task_1::order"]
	metaproteins_df["family"] = data["task_1::Taxonomic_Annotation_Task_1::family"]
	metaproteins_df["genus"] = data["task_1::Taxonomic_Annotation_Task_1::genus"]
	metaproteins_df["species"] = data["task_1::Taxonomic_Annotation_Task_1::species"]
	metaproteins_df["main_role"] = data["task_0::Functional_Annotation_Task_1::main role"]
	metaproteins_df["subrole"] = data["task_0::Functional_Annotation_Task_1::subrole"]
	metaproteins_df["og"] = data["task_0::Functional_Annotation_Task_1::og"]
	metaproteins_df["seed_ortholog"] = data["task_0::Functional_Annotation_Task_1::seed ortholog"]
	metaproteins_df["Biological_Process"] = data["Biological Process"]
	metaproteins_df["Cellular_Component"] = data["Cellular Component"]
	metaproteins_df["Molecular_Function"] = data["Molecular Function"]

	for col in ["Protein_Accessions", "Biological_Process", "Cellular_Component", "Molecular_Function"]:
		origin_col = col.replace("_", " ")
		metaproteins_df[col] = data[origin_col].str.replace("\"", "").str.replace("'", "").str.replace("[",
																									   "").str.replace(
			"]", "").str.replace(", ", ";").str.replace(",", ";")
	create_nodes_csv("Metaprotein", metaproteins_df)


def create_node_schema(node_type, df):
	"""
	Each and every node is first created with all columns as strings props. This schema can modify props
	List separators must always be ';'
	:return:
	"""
	os.makedirs("nodes_schema", exist_ok=True)
	df.to_csv(f"nodes_schema/{node_type}.csv", index=False)


def create_metaprotein_schema_csv():
	metaprotein_schema_df = pd.DataFrame()
	for col in ["Protein_Accessions", "Biological_Process", "Cellular_Component", "Molecular_Function"]:
		metaprotein_schema_df[col] = ["list<String>"]
	create_node_schema("Metaprotein", metaprotein_schema_df)


def create_edges_csv(edge_type, df):
	os.makedirs("edges", exist_ok=True)
	df.to_csv(f"edges/{edge_type}.csv", index=False)


def create_measurement_edges_csv(data):
	adj = torch.from_numpy(data.iloc[:, 17:].values).type(torch.FloatTensor)
	edge_index = adj.nonzero(as_tuple=False).t()
	edge_weight = adj[edge_index[0], edge_index[1]]

	samples = pd.Series(data.columns[17:])
	metaproteins = pd.Series(data["Metaprotein Number"])
	df = pd.DataFrame()
	df["Source"] = samples.iloc[edge_index[1, :].tolist()].values
	df["Target"] = metaproteins.iloc[edge_index[0, :].tolist()].values
	df["Weight"] = edge_weight
	create_edges_csv("Sample__MEASURES__Metaprotein", df)


def create_edge_schema_csv(edge_type, df):
	"""
	Each and every edge is first created with all columns as strings props. This schema can modify props
	:return:
	"""
	os.makedirs("edge_schema", exist_ok=True)
	df.to_csv(f"edge_schema/{edge_type}.csv", index=False)


def create_measurement_edge_schema_csv():
	df = pd.DataFrame()
	df["Weight"] = ["float"]
	create_edge_schema_csv("Sample__MEASURES__Metaprotein", df)


def create_peptides_csv(data):
	peptides_df = pd.DataFrame()
	peptides_df["id"] = data["PeptideSequence"]
	peptides_df["Proteins"] = data["Proteins"]
	create_nodes_csv("Peptide", peptides_df)


def create_peptides_schema_csv():
	peptide_schema_df = pd.DataFrame()
	peptide_schema_df["Proteins"] = ["list<String>"]
	create_node_schema("Peptide", peptide_schema_df)


def create_peptide_measurement_edges_csv(data, abundance_sample_translation_dict):
	adj = torch.from_numpy(data.iloc[:, 2:].values).type(torch.FloatTensor)
	edge_index = adj.nonzero(as_tuple=False).t()
	edge_weight = adj[edge_index[0], edge_index[1]]

	## Translation of of ids to the the ids used in abundance table
	samples = pd.Series([abundance_sample_translation_dict[sample.split(".")[-1]] for sample in pd.Series(data.columns[2:]).values.tolist()])

	peptides = pd.Series(data["PeptideSequence"])
	df = pd.DataFrame()
	df["Source"] = samples.iloc[edge_index[1, :].tolist()].values
	df["Target"] = peptides.iloc[edge_index[0, :].tolist()].values
	df["Weight"] = edge_weight
	create_edges_csv("Sample__MEASURES__Peptide", df)


def create_peptide_edge_schema_csv():
	df = pd.DataFrame()
	df["Weight"] = ["float"]
	create_edge_schema_csv("Sample__MEASURES__Peptide", df)


def create_peptide_metaprotein_association_edges_csv(abundance_data, peptide_data):
	exploded_accessions = pd.DataFrame()
	exploded_accessions["accessions"] = abundance_data["Protein Accessions"].str.replace("\"", "").str.replace("'",
																											   "").str.replace(
		"[", "").str.replace(
		"]", "").str.replace(" ", "").str.split(",").explode()
	exploded_accessions["abund_idx"] = exploded_accessions.index

	exploded_peptide_acc = pd.DataFrame()
	exploded_peptide_acc["accessions"] = peptide_data["Proteins"].str.split(";").explode()
	exploded_peptide_acc["peptide_idx"] = exploded_peptide_acc.index

	merged_acc_df = pd.merge(exploded_accessions, exploded_peptide_acc, on="accessions")

	df = pd.DataFrame()
	df["Source"] = abundance_data["Metaprotein Number"].iloc[merged_acc_df["abund_idx"].values].values
	df["Target"] = peptide_data.loc[merged_acc_df["peptide_idx"].values, "PeptideSequence"].values
	create_edges_csv("Metaprotein__ASSOCIATED_WITH__Peptide", df)


def create_peptide_metaprotein_association_edge_schema_csv():
	df = pd.DataFrame()
	create_edge_schema_csv("Metaprotein__ASSOCIATED_WITH__Peptide", df)


if __name__ == "__main__":
	abundance_data = pd.read_csv("data/AbundanceProteinsGroups.csv", sep=";")
	peptide_data = pd.read_csv("data/peptideMatrix_gut_final_thr0.tsv", sep="\t")
	## Sample to Metaprotein measurements
	abundance_sample_translation_dict = create_sample_nodes_csv(abundance_data)
	create_metaproteins_csv(abundance_data)
	create_metaprotein_schema_csv()
	create_measurement_edges_csv(abundance_data)
	create_measurement_edge_schema_csv()

	## Sample to Peptide measurements
	create_peptides_csv(peptide_data)
	create_peptides_schema_csv()
	create_peptide_measurement_edges_csv(peptide_data, abundance_sample_translation_dict)
	create_peptide_edge_schema_csv()

	## Peptide to Metaprotein connections
	create_peptide_metaprotein_association_edges_csv(abundance_data, peptide_data)
	create_peptide_edge_schema_csv()



