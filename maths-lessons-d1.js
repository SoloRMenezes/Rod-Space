window.mathsDetailedNotes=window.mathsDetailedNotes||{};
window.mathsDetailedNotes.d1={
  "1.1": {
    "summary": "An algorithm is a finite sequence of unambiguous instructions for solving a problem. A trace table records variable values after each operation, allowing you to verify what an algorithm does. Correctness, termination and efficiency are important ways to evaluate algorithms.",
    "rule": "Input → process → output; a finite algorithm must terminate",
    "example": "To find the maximum of 3,7,4: start max=3, compare 7→max=7, compare 4→unchanged; output 7."
  },
  "1.2": {
    "summary": "Flow charts represent decisions and repetition using standard shapes: ovals for start/end, parallelograms for input/output, rectangles for processing, and diamonds for conditions. Follow arrows to trace loops carefully. A loop must have an exit condition.",
    "rule": "Decision diamond splits into Yes/No branches",
    "example": "To output even/odd: input n → test n mod 2 = 0 → Yes: output even, No: output odd → end."
  },
  "1.3": {
    "summary": "Bubble sort makes repeated left-to-right passes, swapping adjacent items that are in the wrong order. After a complete ascending pass, the largest unsorted value is at the end. Stop when a pass makes no swaps or when the necessary passes finish.",
    "rule": "Worst-case comparisons grow roughly as n²",
    "example": "Sort 4,1,3: first pass swaps 4↔1 then 4↔3, producing 1,3,4; second pass makes no swaps, so stop."
  },
  "1.4": {
    "summary": "Quick sort picks a pivot, partitions values into groups smaller and larger than it, then recursively sorts the groups. The result is the ordered left group, pivot and ordered right group. Balanced pivots are efficient, while poor pivots may cause slow performance.",
    "rule": "Average time ∝ n log n; worst case ∝ n²",
    "example": "Sort 5,2,7,1 with pivot 5: left [2,1], right [7]; sort left to [1,2], giving [1,2,5,7]."
  },
  "1.5": {
    "summary": "Bin packing places objects of given sizes into fixed-capacity bins without exceeding capacity. Next fit considers only the current bin; first fit scans open bins from the beginning; decreasing versions sort items largest first. These are heuristics, not guaranteed optimal solutions.",
    "rule": "No bin's total may exceed its capacity",
    "example": "Capacity 10, first-fit items 6,4,5,2: bin 1=[6,4], bin 2=[5,2], so two bins."
  },
  "1.6": {
    "summary": "Binary search locates a target in an already sorted list by comparing it to the middle item. If it is smaller, discard the upper half; if larger, discard the lower half. Repeat until found or the search interval is empty.",
    "rule": "Binary search comparisons grow approximately as log₂n",
    "example": "Search 9 in [1,3,5,7,9,11,13]: check 7, then middle of [9,11,13] is 11, then 9; found."
  },
  "2.1": {
    "summary": "A network is a graph with vertices representing places or states and edges representing connections. Edges may have distances, times or costs as weights, and can be directed or undirected. Choose a network model that reflects actual allowed movement.",
    "rule": "Weighted edge = connection with associated cost",
    "example": "A delivery network with towns A,B,C and roads AB=4, BC=3, AC=8 has weighted edges 4,3,8."
  },
  "2.2": {
    "summary": "Graph theory uses precise terms: degree is the number of incident edges at a vertex; a walk may repeat vertices and edges, a trail has no repeated edges, and a path has no repeated vertices. In an undirected graph, the total of all degrees is twice the number of edges.",
    "rule": "Σ degree(v)=2E for undirected graphs",
    "example": "A graph with vertex degrees 2,3,3,2 has sum 10, so it contains 5 edges."
  },
  "2.3": {
    "summary": "A connected graph has a route between every pair of vertices. A tree is connected and has no cycles; a spanning tree includes every vertex. Eulerian graphs use every edge, while Hamiltonian cycles visit every vertex once. Distinguish edge versus vertex conditions.",
    "rule": "Tree with V vertices has V−1 edges",
    "example": "A connected network with 6 vertices and no cycles must have 5 edges; adding an extra edge creates a cycle."
  },
  "2.4": {
    "summary": "An adjacency matrix records whether vertices are connected, while a weighted matrix records edge costs. For undirected networks, a symmetric matrix results. A diagonal entry usually represents a loop or zero self-distance according to the chosen convention.",
    "rule": "Aᵢⱼ=1 if edge i–j exists, else 0",
    "example": "For vertices A,B,C with edges AB and BC: adjacency matrix rows are [0,1,0], [1,0,1], [0,1,0]."
  },
  "3.1": {
    "summary": "Kruskal's algorithm finds a minimum spanning tree by considering edges in ascending weight order. Add the next smallest edge only if it does not form a cycle, until all vertices are connected. For V vertices, the tree has V−1 edges.",
    "rule": "Choose cheapest safe edge; stop at V−1 edges",
    "example": "For AB=1, BC=2, AC=3, select AB and BC; AC would form a cycle. Tree weight = 3."
  },
  "3.2": {
    "summary": "Prim's algorithm builds a minimum spanning tree from one starting vertex. At each step, add the least costly edge that connects the current tree to an unvisited vertex. Never choose an edge between two already-included vertices.",
    "rule": "At every step, choose cheapest edge leaving current tree",
    "example": "Start at A, with AB=2, AC=5, BC=1: take AB=2, then BC=1; total 3."
  },
  "3.3": {
    "summary": "Prim's algorithm can work directly from a distance matrix. Mark all visited vertices, then inspect only matrix entries linking visited to unvisited vertices. Add the least cost, update the visited set and repeat.",
    "rule": "Ignore self-entries and edges between visited vertices",
    "example": "With A,B,C distances AB=4, AC=7, BC=2, start A: choose AB(4), then BC(2), total 6."
  },
  "3.4": {
    "summary": "Nearest neighbour constructs a tour by repeatedly travelling to the nearest unvisited vertex from the current one. After every vertex has been visited, return to the start if solving a travelling salesperson tour. It gives a feasible tour, not necessarily the optimal one.",
    "rule": "Tour length = sum of chosen edges including return edge",
    "example": "For distances AB=2, BC=3, CA=4, start A: go B, then C, return A; tour length 2+3+4=9."
  },
  "3.5": {
    "summary": "Dijkstra's algorithm finds shortest distances from a start vertex in a graph with non-negative edge weights. Label the start 0, repeatedly make permanent the smallest tentative label and relax neighbouring distances. Track predecessors to reconstruct the shortest route.",
    "rule": "New tentative distance = min(old, distance to current + edge weight)",
    "example": "For AB=4, AC=10, BC=3: from A, B gets 4, C gets 10; via B, C becomes 4+3=7, so shortest A–B–C."
  },
  "4.1": {
    "summary": "An Eulerian circuit uses every edge exactly once and returns to its starting vertex. A connected undirected network has one if every vertex has even degree. Exactly two odd-degree vertices means an Eulerian trail exists, but it must start and finish at those vertices.",
    "rule": "Eulerian circuit iff all vertex degrees even (connected non-isolated network)",
    "example": "A triangle A–B–C–A has degree 2 at each vertex, so the route A–B–C–A is Eulerian."
  },
  "4.2": {
    "summary": "Route inspection finds the shortest closed walk traversing every edge at least once, as in street sweeping. Sum all original edge weights, identify odd-degree vertices, and duplicate shortest paths to pair the odd vertices at minimum extra cost. The resulting network has all even degrees.",
    "rule": "Route inspection length = total edge weight + minimum pairing cost",
    "example": "A network has total edge length 40 and two odd vertices whose shortest connecting path is 7; shortest closed inspection length = 47."
  },
  "5.1": {
    "summary": "The travelling salesman problem seeks the shortest closed tour visiting every vertex exactly once before returning to the start. Exhaustive enumeration quickly becomes impractical as the number of vertices grows. Practical problems use bounds and heuristics.",
    "rule": "Optimal tour lies between lower and upper bounds",
    "example": "For three towns with AB=3, BC=4, CA=5, the sole tour up to reversal has length 3+4+5=12."
  },
  "5.2": {
    "summary": "A spanning tree is not a closed tour; to produce an upper bound, construct an actual feasible complete tour, for instance by doubling a minimum spanning tree and shortcutting repeated vertices where appropriate. A valid tour's cost cannot be below the optimum.",
    "rule": "Any valid complete tour gives an upper bound",
    "example": "MST of a triangle with AB=2, BC=3, AC=4 has weight 5; the tour A–B–C–A costs 2+3+4=9 and gives upper bound 9."
  },
  "5.3": {
    "summary": "To obtain a lower bound using minimum spanning trees, remove one vertex and compute the MST of the remaining network. Add the two smallest distinct edges incident to the removed vertex. Repeat with other removed vertices and take the largest valid lower bound.",
    "rule": "Lower bound = MST(other vertices)+2 smallest edges from removed vertex",
    "example": "For triangle AB=2, BC=3, AC=4, remove A: MST of B,C costs 3; smallest A-edges 2 and 4 give lower bound 9."
  },
  "5.4": {
    "summary": "Use nearest neighbour to create a complete route, including the return to the start, and treat its length as an upper bound. Try different starting vertices because the heuristic may give different routes. Compare the best upper bound against the lower bound.",
    "rule": "Optimum ≤ cost of any complete tour",
    "example": "If a nearest-neighbour route has edge costs 3,5,4,6 including return, its total 18 is an upper bound, not a proof of optimality."
  },
  "6.1": {
    "summary": "A project network represents activities linked by precedence constraints. An activity has a duration; some activities can overlap while others must wait for predecessors. An activity-on-arc network uses arrows for activities and nodes for events.",
    "rule": "Project duration is determined by longest start-to-finish path",
    "example": "If A lasts 3 days and B lasts 5 days in parallel, then C lasts 2 after both: project duration max(3,5)+2=7."
  },
  "6.2": {
    "summary": "Dummy activities have zero duration and express precedence without representing actual work. They preserve logical dependencies in activity-on-arc networks when activities would otherwise incorrectly share the same start and finish nodes. Dummies affect graph structure, not project duration.",
    "rule": "Dummy duration = 0",
    "example": "If C depends on A but not B, and A/B share an event, insert a zero-duration dummy to show C waits for A only."
  },
  "6.3": {
    "summary": "A forward pass finds earliest event times by taking the largest arrival time from predecessors. A backward pass finds latest event times by taking the smallest permitted departure time from successors. The final earliest time is the minimum project duration.",
    "rule": "Earliest at j = max(Eᵢ + durationᵢⱼ); Latest at i = min(Lⱼ − durationᵢⱼ)",
    "example": "If an event has predecessor completions at days 4 and 7, its earliest time is day 7, not day 4."
  },
  "6.4": {
    "summary": "An activity's total float is how much its start can be delayed without delaying project completion. It depends on earliest time of the starting event, latest time of the ending event and activity duration. Negative float signals inconsistent deadlines or constraints.",
    "rule": "Float = L(end) − E(start) − duration",
    "example": "If E(start)=3, L(end)=12 and duration=5, float=12−3−5=4 days."
  },
  "6.5": {
    "summary": "Critical activities have zero total float and lie on a critical path through the network. Delay to a critical activity usually delays the project unless the schedule changes. The critical path is a longest-duration start-to-finish path.",
    "rule": "Critical activity: float = 0",
    "example": "Two project paths last 9 and 11 days; the 11-day path is critical. If one of its activities slips by 2 days, completion may slip by 2 days."
  },
  "6.6": {
    "summary": "A Gantt chart uses horizontal bars along a time axis to show when activities start, finish and overlap. Dependencies limit how early activities can start. The chart is good for communication but alone may hide detailed network logic.",
    "rule": "Bar length = activity duration",
    "example": "Activity A runs days 0–3 and B days 3–7; draw adjacent bars of lengths 3 and 4 to show B follows A."
  },
  "6.7": {
    "summary": "Scheduling diagrams allocate tasks to workers or machines while respecting precedence. Draw eligible activities in a time grid, identify clashes and resource limits, and use critical activities to protect project completion. Resource limits may increase duration beyond the pure critical-path length.",
    "rule": "Feasible schedule respects predecessor finish and resource availability",
    "example": "If A and B both need the only machine and last 2 and 3 hours, they cannot overlap; even if independent, at least 5 machine-hours are needed."
  },
  "7.1": {
    "summary": "Linear programming finds the maximum or minimum of a linear objective under linear inequality constraints. Define decision variables, translate resource limits into inequalities and include non-negativity restrictions. Then search the feasible region.",
    "rule": "Maximise Z=ax+by subject to inequalities",
    "example": "If each product X uses 2 hours and Y uses 3, and 12 hours are available, constraint 2x+3y≤12 with x,y≥0."
  },
  "7.2": {
    "summary": "Graphical linear programming plots each inequality as a boundary line, then shades the correct half-plane. The common overlap is the feasible region. Corner coordinates come from intersecting the boundary lines.",
    "rule": "Feasible region = intersection of all constraint half-planes",
    "example": "For x≥0,y≥0,x+y≤6, feasible region has corners (0,0),(6,0),(0,6)."
  },
  "7.3": {
    "summary": "A linear objective over a closed bounded polygon reaches an optimum at a vertex (or along an entire boundary edge). Evaluate the objective at every feasible corner and compare. If the region is unbounded, check whether a finite optimum exists.",
    "rule": "Evaluate Z=ax+by at each feasible vertex",
    "example": "Maximise Z=2x+3y over x,y≥0,x+y≤4: corners give 0,8,12; maximum 12 at (0,4)."
  },
  "7.4": {
    "summary": "If decision variables must be whole numbers, a continuous vertex optimum may not be permitted. Search nearby feasible integer points and evaluate the objective rather than simply rounding coordinates. Rounding can violate constraints or miss the optimum.",
    "rule": "Integer optimum must satisfy all constraints and x,y∈ℤ",
    "example": "Maximise Z=3x+2y with x+y≤3, x,y≥0 integers. (3,0) gives 9 and is optimal among the feasible integer corners."
  }
};
