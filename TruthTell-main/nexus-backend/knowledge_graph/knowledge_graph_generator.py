import pandas as pd
import networkx as nx
import spacy
import pickle
from datetime import datetime
import os

# Load spaCy for NER
nlp = spacy.load("en_core_web_sm")

class KnowledgeGraphBuilder:
    def __init__(self, model_dir="models"):
        self.model_dir = model_dir
        self.knowledge_graph = nx.DiGraph()
    
    def extract_entities(self, text):
        """Extract named entities from text using spaCy"""
        try:
            # Convert to string and handle NaN/None values
            if pd.isna(text) or text is None:
                return []
            
            # Convert float or int to string if necessary
            if isinstance(text, (float, int)):
                text = str(text)
            
            # Ensure text is a string
            text = str(text).strip()
            
            # Skip empty strings
            if not text:
                return []
                
            doc = nlp(text)
            entities = [(ent.text, ent.label_) for ent in doc.ents]
            return entities
        except Exception as e:
            print(f"Error processing text: {text}")
            print(f"Error message: {str(e)}")
            return []

    def update_knowledge_graph(self, text, is_real):
        """Update knowledge graph with entities and their relationships"""
        try:
            entities = self.extract_entities(text)
            
            # Skip if no entities were found
            if not entities:
                return
            
            # Add nodes and edges to the graph
            for entity, entity_type in entities:
                # Add node if it doesn't exist
                if not self.knowledge_graph.has_node(entity):
                    self.knowledge_graph.add_node(
                        entity,
                        type=entity_type,
                        real_count=1 if is_real else 0,
                        fake_count=0 if is_real else 1
                    )
                else:
                    # Update counts
                    if is_real:
                        self.knowledge_graph.nodes[entity]['real_count'] += 1
                    else:
                        self.knowledge_graph.nodes[entity]['fake_count'] += 1
            
            # Add edges between entities in the same text
            for i, (entity1, _) in enumerate(entities):
                for entity2, _ in entities[i+1:]:
                    if not self.knowledge_graph.has_edge(entity1, entity2):
                        self.knowledge_graph.add_edge(
                            entity1,
                            entity2,
                            weight=1,
                            is_real=is_real
                        )
                    else:
                        self.knowledge_graph[entity1][entity2]['weight'] += 1
        except Exception as e:
            print(f"Error updating knowledge graph: {str(e)}")

    # def save_knowledge_graph(self, filename=None):
    #     """Save the knowledge graph to a file"""
    #     if filename is None:
    #         timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    #         filename = os.path.join(self.model_dir, f"knowledge_graph_{timestamp}.pkl")
        
    #     os.makedirs(self.model_dir, exist_ok=True)
        
    #     # Convert the graph to a dictionary format for better serialization
    #     graph_data = {
    #         'nodes': dict(self.knowledge_graph.nodes(data=True)),
    #         'edges': {}
    #     }
        
    #     # Properly format edges with their data
    #     for u, v, data in self.knowledge_graph.edges(data=True):
    #         if u not in graph_data['edges']:
    #             graph_data['edges'][u] = {}
    #         graph_data['edges'][u][v] = data
        
    #     try:
    #         with open(filename, 'wb') as f:
    #             pickle.dump(graph_data, f)
    #         print(f"Knowledge graph saved to {filename}")
    #         print(f"Total nodes: {len(graph_data['nodes'])}")
    #         print(f"Total edges: {sum(len(edges) for edges in graph_data['edges'].values())}")
    #         return filename
    #     except Exception as e:
    #         print(f"Error saving knowledge graph: {str(e)}")
    #         return None
    
    def get_graph_statistics(self):
        """Get basic statistics about the knowledge graph"""
        stats = {
            'total_nodes': self.knowledge_graph.number_of_nodes(),
            'total_edges': self.knowledge_graph.number_of_edges(),
            'entity_types': {},
            'reliability_scores': {}
        }
        
        # Count entity types
        for node, attrs in self.knowledge_graph.nodes(data=True):
            entity_type = attrs.get('type', 'UNKNOWN')
            stats['entity_types'][entity_type] = stats['entity_types'].get(entity_type, 0) + 1
            
            # Calculate reliability score
            real_count = attrs.get('real_count', 0)
            fake_count = attrs.get('fake_count', 0)
            total = real_count + fake_count
            if total > 0:
                reliability = real_count / total
                stats['reliability_scores'][node] = reliability
        
        return stats

def main():
    # Initialize the knowledge graph builder
    builder = KnowledgeGraphBuilder()
    
    # Load your dataset
    df = pd.read_csv('./combined.csv')  # Replace with your actual data file
    
    # Create knowledge graph
    print("Building knowledge graph...")
    total_rows = len(df)
    for idx, row in df.iterrows():
        try:
            builder.update_knowledge_graph(row['text'], row['label'] == 'REAL')
            if (idx + 1) % 100 == 0:
                print(f"Processed {idx + 1}/{total_rows} entries ({(idx + 1)/total_rows*100:.1f}%)...")
        except Exception as e:
            print(f"Error processing row {idx}: {str(e)}")
            continue
    
    # Save the knowledge graph
    graph_path = builder.save_knowledge_graph()
    
    # Print statistics
    stats = builder.get_graph_statistics()
    print("\nKnowledge Graph Statistics:")
    print(f"Total nodes: {stats['total_nodes']}")
    print(f"Total edges: {stats['total_edges']}")
    print("\nEntity types distribution:")
    for entity_type, count in stats['entity_types'].items():
        print(f"{entity_type}: {count}")

if __name__ == "__main__":
    main()