import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Directed graph data structure using adjacency list.
 */
public class Graph {
  private Map<String, Map<String, Integer>> adjacencyList;

  /**
   * Construct an empty graph.
   */
  public Graph() {
    this.adjacencyList = new HashMap<>();
  }

  /**
   * Add a directed edge from source to destination.
   *
   * @param source the source node
   * @param destination the destination node
   */
  public void addEdge(String source, String destination) {
    source = source.toLowerCase();
    destination = destination.toLowerCase();

    adjacencyList.putIfAbsent(source, new HashMap<>());
    adjacencyList.putIfAbsent(destination, new HashMap<>());

    Map<String, Integer> edges = adjacencyList.get(source);
    edges.put(destination, edges.getOrDefault(destination, 0) + 1);
  }

  /**
   * Get all nodes in the graph.
   *
   * @return set of node names
   */
  public Set<String> getNodes() {
    return adjacencyList.keySet();
  }

  /**
   * Get outgoing edges from a node.
   *
   * @param node the node name
   * @return map of neighbor nodes to edge weights
   */
  public Map<String, Integer> getEdges(String node) {
    return adjacencyList.getOrDefault(
        node.toLowerCase(), Collections.emptyMap());
  }

  /**
   * Check if a node exists in the graph.
   *
   * @param node the node name
   * @return true if the node exists
   */
  public boolean containsNode(String node) {
    return adjacencyList.containsKey(node.toLowerCase());
  }

  /**
   * Get the weight of an edge.
   *
   * @param source the source node
   * @param destination the destination node
   * @return the edge weight, or 0 if no edge exists
   */
  public int getWeight(String source, String destination) {
    Map<String, Integer> edges =
        adjacencyList.get(source.toLowerCase());
    if (edges == null) {
      return 0;
    }
    return edges.getOrDefault(destination.toLowerCase(), 0);
  }

  @Override
  public String toString() {
    StringBuilder sb = new StringBuilder();
    for (Map.Entry<String, Map<String, Integer>> entry
        : adjacencyList.entrySet()) {
      String source = entry.getKey();
      Map<String, Integer> edges = entry.getValue();
      sb.append(source).append(" -> ");
      if (edges.isEmpty()) {
        sb.append("(no outgoing edges)");
      } else {
        List<String> edgeStrings = new ArrayList<>();
        for (Map.Entry<String, Integer> edgeEntry
            : edges.entrySet()) {
          edgeStrings.add(edgeEntry.getKey()
              + "(" + edgeEntry.getValue() + ")");
        }
        sb.append(String.join(", ", edgeStrings));
      }
      sb.append(System.lineSeparator());
    }
    return sb.toString();
  }
}
