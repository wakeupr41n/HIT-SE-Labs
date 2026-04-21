import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * White-box tests for Lab1.queryBridgeWords using basis path testing.
 *
 * Selected function: queryBridgeWords(String word1, String word2)
 * Source code lines (after fix): 187-236
 *
 * Control flow graph nodes:
 *   N1: 188-189 (toLowerCase)
 *   N2: 191 (if !containsNode(word1) || !containsNode(word2))
 *   N3: 192-193 (w1Missing, w2Missing assignment)
 *   N4: 194 (if w1Missing && w2Missing)
 *   N5: 195-196 (return both missing)
 *   N6: 198-199 (return one missing)
 *   N7: 202-203 (create bridges set, get word1Edges)
 *   N8: 205 (for loop iteration)
 *   N9: 206 (if edges(word3) contains word2)
 *   N10: 207 (bridges.add)
 *   N11: 211 (if bridges.isEmpty)
 *   N12: 212-213 (return no bridge words)
 *   N13: 219 (if sortedBridges.size() == 1)
 *   N14: 220-221 (return single bridge word)
 *   N15: 224-235 (return multiple bridge words)
 *
 * Cyclomatic complexity:
 *   V(G) = number of decision nodes + 1
 *   Decision nodes: N2, N4, N9, N11, N13 = 5
 *   V(G) = 5 + 1 = 6
 *
 * Basis paths (6):
 *   Path 1: N1->N2(true)->N3->N4(true)->N5
 *           (both words not in graph)
 *   Path 2: N1->N2(true)->N3->N4(false)->N6
 *           (one word not in graph)
 *   Path 3: N1->N2(false)->N7->N8->N9(false)->N8(end)
 *           ->N11(true)->N12
 *           (both in graph, no bridge words - loop body skips add)
 *   Path 4: N1->N2(false)->N7->N8->N9(true)->N10->N8(end)
 *           ->N11(false)->N13(true)->N14
 *           (both in graph, one bridge word)
 *   Path 5: N1->N2(false)->N7->N8->N9(true)->N10->N8(end)
 *           ->N11(false)->N13(false)->N15
 *           (both in graph, multiple bridge words)
 *   Path 6: N1->N2(false)->N7->N8(0 iterations)->N11(true)->N12
 *           (both in graph, word1 has no outgoing edges -> no bridge)
 */
public class Lab1WhiteBoxTest {

  @BeforeEach
  public void setUp() {
    Graph g = new Graph();
    // Build test graph for white-box testing
    // the -> scientist, team
    // scientist -> carefully, analyzed
    // carefully -> analyzed
    // analyzed -> the, it
    // data -> and, so
    // wrote -> a
    // a -> detailed
    // detailed -> report
    // report -> and, with
    // and -> shared, the
    // shared -> the, report
    // with -> the
    // team -> requested
    // requested -> more
    // more -> data
    // so -> the
    // it -> again
    // again -> (no outgoing)
    g.addEdge("the", "scientist");
    g.addEdge("the", "team");
    g.addEdge("scientist", "carefully");
    g.addEdge("scientist", "analyzed");
    g.addEdge("carefully", "analyzed");
    g.addEdge("analyzed", "the");
    g.addEdge("analyzed", "it");
    g.addEdge("data", "and");
    g.addEdge("data", "so");
    g.addEdge("wrote", "a");
    g.addEdge("a", "detailed");
    g.addEdge("detailed", "report");
    g.addEdge("report", "and");
    g.addEdge("report", "with");
    g.addEdge("and", "shared");
    g.addEdge("and", "the");
    g.addEdge("shared", "the");
    g.addEdge("shared", "report");
    g.addEdge("with", "the");
    g.addEdge("team", "requested");
    g.addEdge("requested", "more");
    g.addEdge("more", "data");
    g.addEdge("so", "the");
    g.addEdge("it", "again");
    Lab1.setGraph(g);
  }

  // WP1: Both words not in graph
  // Path: N1->N2(true)->N3->N4(true)->N5
  @Test
  @DisplayName("WP1: Both words not in graph")
  public void testBothWordsNotInGraph() {
    String result = Lab1.queryBridgeWords("hello", "world");
    assertEquals(
        "No \"hello\" and \"world\" in the graph!",
        result);
  }

  // WP2: Only one word not in graph
  // Path: N1->N2(true)->N3->N4(false)->N6
  @Test
  @DisplayName("WP2: One word not in graph")
  public void testOneWordNotInGraph() {
    String result = Lab1.queryBridgeWords("hello", "team");
    assertEquals("No \"hello\" in the graph!", result);
  }

  // WP3: Both in graph, word1 has outgoing edges but none lead to word2
  // (loop body executes, but N9 condition is false for all iterations)
  // Path: N1->N2(false)->N7->N8->N9(false)->N8->N11(true)->N12
  @Test
  @DisplayName("WP3: Both in graph, no bridge words (loop skips add)")
  public void testNoBridgeWordsLoopSkip() {
    // wrote->a->detailed->report->and/with, none leads to "team"
    String result = Lab1.queryBridgeWords("wrote", "team");
    assertEquals(
        "No bridge words from \"wrote\" to \"team\"!",
        result);
  }

  // WP4: Both in graph, exactly one bridge word
  // Path: N1->N2(false)->N7->N8->N9(true)->N10->N8(end)
  //       ->N11(false)->N13(true)->N14
  @Test
  @DisplayName("WP4: Both in graph, single bridge word")
  public void testSingleBridgeWord() {
    // analyzed->it->again, bridge is "it"
    String result = Lab1.queryBridgeWords("analyzed", "again");
    assertEquals(
        "The bridge word from \"analyzed\" to \"again\" is: it.",
        result);
  }

  // WP5: Both in graph, multiple bridge words
  // Path: N1->N2(false)->N7->N8->N9(true)->N10->N8(end)
  //       ->N11(false)->N13(false)->N15
  @Test
  @DisplayName("WP5: Both in graph, multiple bridge words")
  public void testMultipleBridgeWords() {
    // Custom graph: a->b, a->c, b->d, c->d => bridges for (a,d): b and c
    Graph g = new Graph();
    g.addEdge("a", "b");
    g.addEdge("a", "c");
    g.addEdge("b", "d");
    g.addEdge("c", "d");
    Lab1.setGraph(g);

    String result = Lab1.queryBridgeWords("a", "d");
    assertTrue(result.contains("b") && result.contains("c"),
        "Should contain both bridge words");
    assertTrue(result.startsWith("The bridge words from"),
        "Should indicate multiple bridge words");
  }

  // WP6: Both in graph, word1 has no outgoing edges (0 loop iterations)
  // Path: N1->N2(false)->N7->N8(0 iterations)->N11(true)->N12
  @Test
  @DisplayName("WP6: Both in graph, word1 has no outgoing edges")
  public void testWord1NoOutgoingEdges() {
    // "again" has no outgoing edges
    String result = Lab1.queryBridgeWords("again", "the");
    assertEquals(
        "No bridge words from \"again\" to \"the\"!",
        result);
  }
}
