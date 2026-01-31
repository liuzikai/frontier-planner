/**
 * Time Calculation Utility
 * 
 * DESIGN OVERVIEW:
 * ================
 * Calculate cumulative time estimates for a selected node by backtracing from it.
 * 
 * TWO METRICS:
 * - Sum: Total time counting each unique task once (avoids double-counting shared ancestors)
 * - Min: Minimum time with maximum parallelism (critical path)
 * 
 * TIME UNITS:
 * - 1 week = 5 days (work days)
 * - 1 month = 4 weeks = 20 days
 * - Display using the largest unit with non-zero integer part
 * 
 * ALGORITHM:
 * ==========
 * 1. Start from selected node and backtrace to find all ancestors
 * 2. For Sum: Count own time of each unique ancestor exactly once (avoid double-counting)
 * 3. For Min: Recursively calculate: own_time + max(min_time of all direct parents)
 * 4. Done/someday nodes contribute 0 time and stop the search
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
 * Calculate min time (critical path) for a node recursively with memoization
 * @param {string} nodeId - The node ID to calculate
 * @param {Array} nodes - All nodes
 * @param {Array} edges - All edges
 * @param {Map} memo - Memoization map
 * @returns {number|null} Min time in days, or null if invalid (node or ancestor has no time)
 */
const calculateMinTime = (nodeId, nodes, edges, memo) => {
  // Check memo
  if (memo.has(nodeId)) {
    return memo.get(nodeId);
  }
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    memo.set(nodeId, null);
    return null;
  }
  
  // Done/someday nodes contribute 0 time
  if (node.data.status === 'done' || node.data.status === 'someday') {
    memo.set(nodeId, 0);
    return 0;
  }
  
  // If node has no estimated time, return null (invalid)
  if (!node.data.estimatedTime) {
    memo.set(nodeId, null);
    return null;
  }
  
  // Get own time
  const ownTime = convertToDays(node.data.estimatedTime, node.data.estimatedTimeUnit);
  
  // Find all direct parents (incoming edges)
  const parents = edges.filter(edge => edge.target === nodeId).map(edge => edge.source);
  
  // If no parents, just return own time
  if (parents.length === 0) {
    memo.set(nodeId, ownTime);
    return ownTime;
  }
  
  // Calculate min time of all parents and take max (critical path)
  const parentMinTimes = parents.map(parentId => calculateMinTime(parentId, nodes, edges, memo));
  
  // If any parent is invalid (null), this node is also invalid
  if (parentMinTimes.some(time => time === null)) {
    memo.set(nodeId, null);
    return null;
  }
  
  const maxParentTime = Math.max(...parentMinTimes);
  
  const result = ownTime + maxParentTime;
  memo.set(nodeId, result);
  return result;
};

/**
 * Check if a node or any of its ancestors has missing time, with cycle detection
 * @param {string} nodeId - The node ID to check
 * @param {Array} nodes - All nodes
 * @param {Array} edges - All edges
 * @param {Set} visited - Set to track visited nodes (prevents cycles)
 * @param {Map} invalidCache - Cache for invalid status
 * @returns {boolean} True if this node or any ancestor has missing time
 */
const hasInvalidAncestor = (nodeId, nodes, edges, visited = new Set(), invalidCache = new Map()) => {
  // Check cache first
  if (invalidCache.has(nodeId)) {
    return invalidCache.get(nodeId);
  }
  
  // Detect cycles
  if (visited.has(nodeId)) {
    return false; // Already being processed in this path, assume valid
  }
  
  visited.add(nodeId);
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    invalidCache.set(nodeId, false);
    return false;
  }
  
  // Done/someday nodes don't block (they're complete)
  if (node.data.status === 'done' || node.data.status === 'someday') {
    invalidCache.set(nodeId, false);
    return false;
  }
  
  // If this node has no estimated time, it's invalid
  if (!node.data.estimatedTime) {
    invalidCache.set(nodeId, true);
    return true;
  }
  
  // Check all parents
  const parents = edges.filter(edge => edge.target === nodeId).map(edge => edge.source);
  
  for (const parentId of parents) {
    // Create new visited set for each branch to allow different paths
    const branchVisited = new Set(visited);
    if (hasInvalidAncestor(parentId, nodes, edges, branchVisited, invalidCache)) {
      invalidCache.set(nodeId, true);
      return true;
    }
  }
  
  invalidCache.set(nodeId, false);
  return false;
};

/**
 * Find all unique ancestor nodes by backtracing, stopping at done/someday nodes
 * @param {string} nodeId - The node ID to start from
 * @param {Array} nodes - All nodes
 * @param {Array} edges - All edges
 * @param {Set} visited - Set to track visited nodes (prevents cycles)
 * @returns {Set} Set of ancestor node IDs
 */
const findAllAncestors = (nodeId, nodes, edges, visited = new Set()) => {
  if (visited.has(nodeId)) {
    return visited;
  }
  
  visited.add(nodeId);
  
  const node = nodes.find(n => n.id === nodeId);
  if (!node) {
    return visited;
  }
  
  // Stop at done/someday nodes (don't traverse beyond them)
  if (node.data.status === 'done' || node.data.status === 'someday') {
    return visited;
  }
  
  // Find all edges that point TO this node
  const incomingEdges = edges.filter(edge => edge.target === nodeId);
  
  // Recursively find ancestors
  incomingEdges.forEach(edge => {
    findAllAncestors(edge.source, nodes, edges, visited);
  });
  
  return visited;
};

/**
 * Calculate cumulative time estimates for all nodes in the dependency path
 * @param {string} selectedNodeId - The target node
 * @param {Set} frontierTasks - Set of frontier task IDs (for display, not calculation)
 * @param {Array} nodes - All nodes
 * @param {Array} edges - All edges
 * @returns {Map} Map of nodeId -> { sum: days, min: days, showQuestionMark?: boolean }
 */
export const calculateCumulativeTimes = (selectedNodeId, frontierTasks, nodes, edges) => {
  if (!selectedNodeId) {
    return new Map();
  }
  
  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  if (!selectedNode) {
    return new Map();
  }
  
  // Don't show time labels for completed or someday nodes
  if (selectedNode.data.status === 'done' || selectedNode.data.status === 'someday') {
    return new Map();
  }
  
  // Find all unique ancestors by backtracing from selected node
  const allAncestors = findAllAncestors(selectedNodeId, nodes, edges);
  allAncestors.delete(selectedNodeId); // Remove selected node itself
  
  const cumulativeTimes = new Map();
  const invalidCache = new Map();
  
  // Calculate min time for all nodes using memoization
  const minMemo = new Map();
  
  // If selected node has no estimated time, mark it with question mark
  if (!selectedNode.data.estimatedTime) {
    cumulativeTimes.set(selectedNodeId, { sum: null, min: null, showQuestionMark: true });
  }
  
  // Check if selected node has invalid ancestor
  const selectedNodeIsValid = !hasInvalidAncestor(selectedNodeId, nodes, edges, new Set(), invalidCache);
  
  if (selectedNodeIsValid) {
    // Calculate times for selected node
    const totalMin = calculateMinTime(selectedNodeId, nodes, edges, minMemo);
    
    if (totalMin !== null) {
      // Calculate sum: sum of own time of each unique ancestor (counted once)
      let totalSum = 0;
      allAncestors.forEach(ancestorId => {
        const node = nodes.find(n => n.id === ancestorId);
        if (node && node.data.estimatedTime) {
          // Done/someday nodes already stopped the search, so we only have pending nodes here
          if (node.data.status !== 'done' && node.data.status !== 'someday') {
            totalSum += convertToDays(node.data.estimatedTime, node.data.estimatedTimeUnit);
          }
        }
      });
      
      // Add selected node's own time to sum
      if (selectedNode.data.estimatedTime) {
        totalSum += convertToDays(selectedNode.data.estimatedTime, selectedNode.data.estimatedTimeUnit);
      }
      
      // Set the selected node's cumulative time
      if (totalSum > 0 || totalMin > 0) {
        cumulativeTimes.set(selectedNodeId, { sum: totalSum, min: totalMin });
      }
    }
  }
  
  // Calculate times for all ancestors in the path
  allAncestors.forEach(ancestorId => {
    const node = nodes.find(n => n.id === ancestorId);
    if (!node || node.data.status === 'done' || node.data.status === 'someday') {
      return;
    }
    
    // If ancestor has no estimated time, mark it with question mark
    if (!node.data.estimatedTime) {
      cumulativeTimes.set(ancestorId, { sum: null, min: null, showQuestionMark: true });
      return;
    }
    
    // Check if this ancestor has invalid ancestors
    if (hasInvalidAncestor(ancestorId, nodes, edges, new Set(), invalidCache)) {
      return; // Skip ancestors with invalid time
    }
    
    // Calculate min time for this ancestor (will use memo if available)
    const ancestorMin = calculateMinTime(ancestorId, nodes, edges, minMemo);
    
    // Skip if min time is invalid
    if (ancestorMin === null) {
      return;
    }
    
    // Find unique ancestors of this ancestor
    const ancestorAncestors = findAllAncestors(ancestorId, nodes, edges);
    ancestorAncestors.delete(ancestorId);
    
    // Calculate sum for this ancestor
    let ancestorSum = 0;
    ancestorAncestors.forEach(id => {
      const n = nodes.find(node => node.id === id);
      if (n && n.data.estimatedTime && n.data.status !== 'done' && n.data.status !== 'someday') {
        ancestorSum += convertToDays(n.data.estimatedTime, n.data.estimatedTimeUnit);
      }
    });
    
    // Add own time
    if (node.data.estimatedTime) {
      ancestorSum += convertToDays(node.data.estimatedTime, node.data.estimatedTimeUnit);
    }
    
    if (ancestorSum > 0 || ancestorMin > 0) {
      cumulativeTimes.set(ancestorId, { sum: ancestorSum, min: ancestorMin });
    }
  });
  
  return cumulativeTimes;
};
