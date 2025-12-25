/**
 * Frontier Detection Utility
 * 
 * DESIGN OVERVIEW:
 * ================
 * When a task is selected, we identify "frontier tasks" - these are tasks that:
 * 1. Are in the dependency tree leading to the selected task (ancestors)
 * 2. Can be executed immediately (all their dependencies are completed)
 * 3. Are not themselves completed
 * 
 * ALGORITHM:
 * ==========
 * 1. Find all ancestor tasks of the selected task (recursive traversal)
 * 2. For each ancestor, check if it's "executable":
 *    - Status is not 'done'
 *    - All of its dependencies (incoming edges) have status 'done'
 * 3. Return the set of frontier task IDs
 * 
 * EXAMPLE:
 * ========
 *     A (done) ──┐
 *                ├──> C (todo) ──> E (selected)
 *     B (todo) ──┘
 * 
 * In this case:
 * - E is selected
 * - Ancestors: A, B, C
 * - A is done (not a frontier)
 * - B is todo and has no dependencies → B is a frontier
 * - C is todo but depends on A (done) and B (not done) → C is NOT a frontier
 * 
 * So frontier = [B]
 */

/**
 * Find all ancestor tasks of a given task by traversing backwards through edges
 * @param {string} taskId - The target task ID
 * @param {Array} edges - All edges in the graph
 * @param {Set} visited - Set to track visited nodes (prevents cycles)
 * @returns {Set} Set of ancestor task IDs
 */
const findAncestors = (taskId, edges, visited = new Set()) => {
  if (visited.has(taskId)) {
    return visited;
  }
  
  visited.add(taskId);
  
  // Find all edges that point TO this task (source -> target where target = taskId)
  const incomingEdges = edges.filter(edge => edge.target === taskId);
  
  // Recursively find ancestors of each source node
  incomingEdges.forEach(edge => {
    findAncestors(edge.source, edges, visited);
  });
  
  return visited;
};

/**
 * Check if a task is executable (all its dependencies are completed)
 * @param {string} taskId - The task to check
 * @param {Array} edges - All edges in the graph
 * @param {Array} nodes - All nodes in the graph
 * @returns {boolean} True if all dependencies are completed
 */
const isTaskExecutable = (taskId, edges, nodes) => {
  // Find all dependencies (incoming edges) of this task
  const dependencies = edges.filter(edge => edge.target === taskId);
  
  // Check if all dependency tasks are completed or someday (not blocking)
  return dependencies.every(edge => {
    const dependencyNode = nodes.find(node => node.id === edge.source);
    return dependencyNode && (dependencyNode.data.status === 'done' || dependencyNode.data.status === 'someday');
  });
};

/**
 * Find frontier tasks for a selected task
 * @param {string} selectedTaskId - The currently selected task ID
 * @param {Array} nodes - All task nodes
 * @param {Array} edges - All edges (dependencies)
 * @returns {Set} Set of frontier task IDs
 */
export const findFrontierTasks = (selectedTaskId, nodes, edges) => {
  if (!selectedTaskId) {
    return new Set();
  }
  
  // Find all ancestors of the selected task
  const ancestors = findAncestors(selectedTaskId, edges);
  
  // Remove the selected task itself from ancestors
  ancestors.delete(selectedTaskId);
  
  // Filter ancestors to find frontier tasks
  const frontierTasks = new Set();
  
  ancestors.forEach(ancestorId => {
    const ancestorNode = nodes.find(node => node.id === ancestorId);
    
    if (!ancestorNode) return;
    
    // Check if this ancestor is a frontier task:
    // 1. Not completed or someday
    // 2. All its dependencies are completed (executable)
    if (ancestorNode.data.status !== 'done' && ancestorNode.data.status !== 'someday' && isTaskExecutable(ancestorId, edges, nodes)) {
      frontierTasks.add(ancestorId);
    }
  });
  
  return frontierTasks;
};
