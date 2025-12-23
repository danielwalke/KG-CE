export const COLORS = {
  // --- Existing Colors ---
  DRUG: "#E57373",          // Muted Salmon Red
  BioConcept: "#81C784",    // Soft Sage Green
  PROTEIN: "#64B5F6",       // Calm Sky Blue
  DISEASES_Gene: "#BA68C8", // Muted Orchid
  RNA: "#4DB6AC",           // Teal Muted
  TAXON: "#FFD54F",         // Soft Amber/Mustard
  PATHWAY: "#9575CD",       // Deep Lavender
  GENE: "#FF8A65",          // Burned Orange / Coral
  DISEASE: "#AED581",       // Light Olive / Kiwi

  // --- Mapped from Image (Existing Case Matches) ---
  Disease: "#AED581",       // Maps to DISEASE
  Gene: "#FF8A65",          // Maps to GENE
  Pathway: "#9575CD",       // Maps to PATHWAY
  Protein: "#64B5F6",       // Maps to PROTEIN

  // --- New Node Types from Image ---
  Somatic_mutation: "#EF5350",          // Slightly darker Red (Alert)
  Clinically_relevant_variant: "#EC407A", // Pink darken
  Tissue: "#FFB74D",                    // Orange Light
  Modified_protein: "#4DD0E1",          // Cyan Light
  Project: "#90A4AE",                   // Blue Grey
  Modification: "#4DB6AC",              // Teal (Similar to RNA context)
  Experimental_factor: "#A1887F",       // Brown Light
  Functional_region: "#DCE775",         // Lime
  Food: "#FFD54F",                      // Mustard (Similar to Taxon)
  Publication: "#BCAAA4",               // Soft Brown
  Biological_process: "#7986CB",        // Indigo
  Known_variant: "#AB47BC",             // Purple
  GWAS_study: "#66BB6A",                // Green
  Phenotype: "#F06292",                 // Soft Pink
  Amino_acid_sequence: "#4DB6AC",       // Teal
  Metabolite: "#FFF176",                // Yellow
  Complex: "#81C784",                   // Green (Similar to BioConcept)
  Experiment: "#E0E0E0",                // Light Grey
  Molecular_function: "#4FC3F7",        // Light Blue
  Peptide: "#81D4FA",                   // Lighter Blue
  Cellular_component: "#FFCC80",        // Orange Peal
  Transcript: "#26A69A",                // Teal Darken
  Chromosome: "#5C6BC0",                // Indigo Darken
  Protein_structure: "#78909C",         // Blue Grey Darken
  User: "#BDBDBD",                      // Medium Grey
  NamedEntity: "#FF7043"                // Deep Orange
};

// Calculated based on contrast ratio against the background
export const TEXT_COLORS = {
  // --- Existing Text Colors ---
  DRUG: "#000000",
  BioConcept: "#000000",
  PROTEIN: "#000000",
  DISEASES_Gene: "#FFFFFF",
  RNA: "#000000",
  TAXON: "#000000",
  PATHWAY: "#FFFFFF",
  GENE: "#000000",
  DISEASE: "#000000",

  // --- Mapped from Image ---
  Disease: "#000000",
  Gene: "#000000",
  Pathway: "#FFFFFF",
  Protein: "#000000",

  // --- New Node Types Text Colors ---
  Somatic_mutation: "#FFFFFF",          // Darker red needs white
  Clinically_relevant_variant: "#FFFFFF", // Dark pink needs white
  Tissue: "#000000",
  Modified_protein: "#000000",
  Project: "#FFFFFF",                   // Blue Grey is dark enough
  Modification: "#000000",
  Experimental_factor: "#FFFFFF",
  Functional_region: "#000000",
  Food: "#000000",
  Publication: "#FFFFFF",
  Biological_process: "#FFFFFF",        // Indigo is dark
  Known_variant: "#FFFFFF",
  GWAS_study: "#000000",
  Phenotype: "#000000",
  Amino_acid_sequence: "#000000",
  Metabolite: "#000000",
  Complex: "#000000",
  Experiment: "#000000",
  Molecular_function: "#000000",
  Peptide: "#000000",
  Cellular_component: "#000000",
  Transcript: "#FFFFFF",                // Dark Teal needs white
  Chromosome: "#FFFFFF",                // Dark Indigo needs white
  Protein_structure: "#FFFFFF",
  User: "#000000",
  NamedEntity: "#000000"
};