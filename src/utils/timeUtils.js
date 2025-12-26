/**
 * Time Calculation Utility
 * 
 * DESIGN OVERVIEW:
 * ================
 * Calculate cumulative time estimates from frontier nodes to a selected node.
 * 
 * TWO METRICS:
 * - Sum: Total time if all tasks were done serially (sum of all dependency times)
 * - Min: Minimum time with maximum parallelism (max of parallel dependency times)
 * 
 * TIME UNITS:
 * - 1 week = 5 days (work days)
 * - 1 month = 4 weeks = 20 days
 * - Display using the largest unit with non-zero integer part
 * 
 * ALGORITHM:
 * ==========
 * 1. Start from frontier nodes (already identified)
 * 2. For each frontier: outputTime = { sum: ownTime, min: ownTime }
 * 3. Traverse dependencies forward (topologically):
 *    - For each node with dependencies:
 *      - sum = sum of all input sums + own time
 *      - min = max of all input mins + own time
 * 4. If a node has no estimated time, it doesn't propagate time (acts as barrier)
 */

/**
 * Convert time to days for calculation
 * @param {number} value - The time value
 * @param {string} unit - 'days', 'weeks', or 'months'
 * @returns {number} Time in days
 */
export const convertToDays = (value, unit) => {
  const numValue = parseFloat(value);
  if (!numValue || numValue <= 0 || isNaN(numValue)) return 0;
  
  switch (unit) {
    case 'weeks':
      return numValue * 5; // 5 work days per week
    case 'months':
      return numValue * 20; // 4 weeks * 5 days
    case 'days':
    default:
      return numValue;
  }
};

/**
 * Format days to best unit (largest unit with non-zero integer part)
 * @param {number} days - Time in days
 * @returns {string} Formatted string like "2.5 weeks" or "1.2 months"
 */
export const formatTime = (days) => {
  const numDays = parseFloat(days);
  if (!numDays || numDays <= 0 || isNaN(numDays)) return '';
  
  // Try months (20 days)
  if (numDays >= 20) {
    const months = numDays / 20;
    const value = months.toFixed(1).replace(/\.0$/, '');
    return `${value} ${parseFloat(value) === 1 ? 'month' : 'months'}`;
  }
  
  // Try weeks (5 days)
  if (numDays >= 5) {
    const weeks = numDays / 5;
    const value = weeks.toFixed(1).replace(/\.0$/, '');
    return `${value} ${parseFloat(value) === 1 ? 'week' : 'weeks'}`;
  }
  
  // Use days
  const value = numDays.toFixed(1).replace(/\.0$/, '');
  return `${value} ${parseFloat(value) === 1 ? 'day' : 'days'}`;
};

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
 * Calculate cumulative time estimates for all nodes
 * @param {string} selectedNodeId - The target node
 * @param {Set} frontierTasks - Set of frontier task IDs
 * @param {Array} nodes - All nodes
 * @param {Array} edges - All edges
 * @returns {Map} Map of nodeId -> { sum: days, min: days }
 */
export const calculateCumulativeTimes = (selectedNodeId, frontierTasks, nodes, edges) => {
  if (!selectedNodeId) {
    return new Map();
  }
  
  // Find all ancestors of the selected node
  const ancestors = findAncestors(selectedNodeId, edges);
  ancestors.delete(selectedNodeId); // Remove selected node from ancestors
  
  const cumulativeTimes = new Map();
  
  // Special case: if there are no ancestors, show selected node's own time
  if (ancestors.size === 0) {
    const selectedNode = nodes.find(n => n.id === selectedNodeId);
    if (selectedNode && selectedNode.data.estimatedTime) {
      const timeDays = convertToDays(selectedNode.data.estimatedTime, selectedNode.data.estimatedTimeUnit);
      cumulativeTimes.set(selectedNodeId, { sum: timeDays, min: timeDays });
    }
    return cumulativeTimes;
  }
  
  // Initialize frontier nodes with their own time
  frontierTasks.forEach(taskId => {
    const node = nodes.find(n => n.id === taskId);
    if (node && node.data.estimatedTime) {
      const timeDays = convertToDays(node.data.estimatedTime, node.data.estimatedTimeUnit);
      cumulativeTimes.set(taskId, { sum: timeDays, min: timeDays });
    }
  });
  
  // Topological traversal: process nodes level by level
  // Keep processing until no new nodes are added
  let changed = true;
  const maxIterations = 100; // Prevent infinite loops
  let iterations = 0;
  
  while (changed && iterations < maxIterations) {
    changed = false;
    iterations++;
    
    // For each node, check if all its dependencies have been processed
    nodes.forEach(node => {
      // Skip if not in the ancestor set (not in dependency path to selected node)
      if (!ancestors.has(node.id) && node.id !== selectedNodeId) {
        return;
      }
      
      // Skip done/someday nodes - they should not receive cumulative times
      if (node.data.status === 'done' || node.data.status === 'someday') {
        return;
      }
      
      // Skip if already processed
      if (cumulativeTimes.has(node.id)) {
        return;
      }
      
      // Get all incoming edges (dependencies)
      const incomingEdges = edges.filter(edge => edge.target === node.id);
      
      // If no dependencies, this should have been initialized already
      // Skip it now (it's already processed or has no time)
      if (incomingEdges.length === 0) {
        return;
      }
      
      // Check if all dependencies have cumulative times or are done/someday
      const dependencyTimes = incomingEdges
        .map(edge => {
          const depTime = cumulativeTimes.get(edge.source);
          if (depTime !== undefined) {
            return depTime;
          }
          
          // If dependency is 'done' or 'someday', it doesn't contribute to time (already complete or not blocking)
          const depNode = nodes.find(n => n.id === edge.source);
          if (depNode && (depNode.data.status === 'done' || depNode.data.status === 'someday')) {
            return { sum: 0, min: 0 };
          }
          
          return undefined;
        })
        .filter(time => time !== undefined);
      
      // If not all dependencies are ready, skip
      if (dependencyTimes.length !== incomingEdges.length) {
        return;
      }
      
      // Calculate sum and min from dependencies
      const sumOfSums = dependencyTimes.reduce((acc, time) => acc + time.sum, 0);
      const maxOfMins = Math.max(...dependencyTimes.map(time => time.min));
      
      // Add own time if this node has estimated time
      // If node has no estimated time, don't add it to cumulativeTimes (acts as barrier)
      if (!node.data.estimatedTime) {
        return;
      }
      
      const ownTime = convertToDays(node.data.estimatedTime, node.data.estimatedTimeUnit);
      
      cumulativeTimes.set(node.id, {
        sum: sumOfSums + ownTime,
        min: maxOfMins + ownTime,
      });
      
      changed = true;
    });
  }
  return cumulativeTimes;
};
