import { Grid } from './grid';
import { GridValue } from './enums';

export type Position = { r: number; c: number };

/**
 * Checks if the given cell (r, c) in the grid is a WALL.
 * Assumes grid.rows and grid.cols are accessible (e.g., public readonly).
 */
export function isWall(grid: Grid, r: number, c: number): boolean {
  // Check bounds first, then get the value.
  // grid.rows and grid.cols are now public readonly.
  if (r < 0 || r >= grid.rows || c < 0 || c >= grid.cols) {
    return false; // Positions outside the grid are not considered GridValue.WALL
  }
  return grid.get(r, c) === GridValue.WALL;
}

/**
 * Checks if the cell (r, c) is a "data" cell (an odd-numbered row and column).
 * These are the cells that can contain numbers (0-3) or be BLANK from the input string.
 */
export function isDataCell(r: number, c: number): boolean {
  return r % 2 !== 0 && c % 2 !== 0;
}

/**
 * Checks if the position (r, c) is a valid position for a wall.
 * In this grid structure, walls are expected to be on even-numbered rows or columns,
 * separating the data cells. Thus, one coordinate must be even and the other odd.
 * E.g., (0,1), (1,0), (1,2), (2,1) are valid wall positions.
 * (0,0), (1,1), (2,2) are not. (0,0) is a corner, (1,1) is a data cell.
 */
export function isValidWallPosition(r: number, c: number): boolean {
  // A wall is on an "edge" or "line" between data cells.
  // This means one coordinate is even (the line itself) and the other is odd (aligning with data cells).
  return (r % 2 === 0 && c % 2 !== 0) || (r % 2 !== 0 && c % 2 === 0);
}

/**
 * Checks if all number clues (0-3) on the grid are satisfied.
 * A number clue at grid[r][c] is satisfied if the count of actual walls
 * adjacent (top, bottom, left, right) to it equals the number itself.
 * Also checks if there's at least one number clue on the grid.
 * @param grid The grid to check.
 * @returns True if all number constraints are met and at least one clue exists, false otherwise.
 */
export function checkNumberConstraints(grid: Grid): boolean {
  let hasNumberClue = false;

  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (isDataCell(r, c)) {
        const cellValue = grid.get(r, c);
        let expectedWalls = -1;

        switch (cellValue) {
          case GridValue.ZERO:
            expectedWalls = 0;
            hasNumberClue = true;
            break;
          case GridValue.ONE:
            expectedWalls = 1;
            hasNumberClue = true;
            break;
          case GridValue.TWO:
            expectedWalls = 2;
            hasNumberClue = true;
            break;
          case GridValue.THREE:
            expectedWalls = 3;
            hasNumberClue = true;
            break;
          // case GridValue.BLANK: // BLANK cells don't have wall constraints
          // case GridValue.WALL:  // WALL cells are not data cells
          // default: break; // Other enum values if any
        }

        if (expectedWalls !== -1) {
          let actualWalls = 0;
          // Check potential wall positions around grid[r][c]
          // Top: grid[r-1][c]
          if (isWall(grid, r - 1, c)) actualWalls++;
          // Bottom: grid[r+1][c]
          if (isWall(grid, r + 1, c)) actualWalls++;
          // Left: grid[r][c-1]
          if (isWall(grid, r, c - 1)) actualWalls++;
          // Right: grid[r][c+1]
          if (isWall(grid, r, c + 1)) actualWalls++;

          if (actualWalls !== expectedWalls) {
            // console.log(`Mismatch at [${r},${c}]: Expected ${expectedWalls}, Got ${actualWalls}`);
            return false; // Mismatch found
          }
        }
      }
    }
  }

  // After loops complete, check if any number clue was found
  if (!hasNumberClue) {
    // console.log("No number clues found on the grid.");
    return false; // No number clues found on the grid, considered invalid.
  }

  return true; // All number constraints met and at least one clue exists
}

/**
 * Checks the structural integrity of the walls on the grid.
 * 1. All WALLs must be in valid positions (one coordinate even, one odd).
 * 2. Each wall segment must have exactly two neighboring wall segments.
 *    Neighbors for a horizontal wall (r_odd, c_even) are other walls connected
 *    through the 'dot' cells (r_odd, c_even-1) and (r_odd, c_even+1).
 *    Neighbors for a vertical wall (r_even, c_odd) are other walls connected
 *    through the 'dot' cells (r_even-1, c_odd) and (r_even+1, c_odd).
 * @param grid The grid to check.
 * @returns An object { isValid: boolean, wallSegments: Position[] }.
 *          `isValid` is true if the wall structure is valid.
 *          `wallSegments` contains the list of valid wall positions if structure is valid, otherwise empty.
 */
export function checkWallStructure(grid: Grid): { isValid: boolean; wallSegments: Position[] } {
  const wallSegments: Position[] = [];

  // First pass: collect all wall segments and validate their positions.
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      if (grid.get(r, c) === GridValue.WALL) {
        if (!isValidWallPosition(r, c)) {
          // Wall in an invalid place (e.g. data cell, or an even/even 'dot' cell)
          // console.log(`Invalid wall position at [${r},${c}]`);
          return { isValid: false, wallSegments: [] };
        }
        wallSegments.push({ r, c });
      }
    }
  }

  if (wallSegments.length === 0) {
    // Depending on puzzle rules, a grid with no walls might be valid or invalid.
    // For now, let's assume it's valid if there are no walls to check.
    // Or, if puzzle implies loops must be formed, this should be false.
    // Let's assume for now that if there are no walls, the "structure" is trivially valid.
    // If the puzzle requires a closed loop, other checks (like all data cells enclosed) would fail later.
    return { isValid: true, wallSegments: [] };
  }

  // Second pass: check neighbor count for each wall segment.
  for (const wallPos of wallSegments) {
    const { r, c } = wallPos;
    let actualWallNeighbors = 0;
    let potentialNeighborCoords: Position[] = [];

    if (r % 2 === 0) { // Current wall is vertical (r even, c odd - c must be odd due to isValidWallPosition)
      potentialNeighborCoords = [
        { r: r - 1, c: c - 1 }, { r: r + 1, c: c - 1 }, // one left one up/down
        { r: r - 2, c: c }, { r: r + 2, c: c },         // 2 up/down
        { r: r - 1, c: c + 1 }, { r: r + 1, c: c + 1 }  // one right one up/down
      ];
    } else { // Current wall is horizontal (r odd, c even - c must be even)
      potentialNeighborCoords = [
        { r: r - 1, c: c - 1 }, { r: r + 1, c: c - 1 }, // one left one up/down
        { r: r, c: c - 2 }, { r: r, c: c + 2 },         // 2 left/right
        { r: r - 1, c: c + 1 }, { r: r + 1, c: c + 1 }  // one right one up/down
      ];
    }

    for (const pn of potentialNeighborCoords) {
      // isWall checks bounds and if it's GridValue.WALL
      // isValidWallPosition is important to ensure we connect to another valid wall segment type
      if (isWall(grid, pn.r, pn.c) && isValidWallPosition(pn.r, pn.c)) {
        actualWallNeighbors++;
      }
    }

    if (actualWallNeighbors !== 2) {
      // console.log(`Wall at [${r},${c}] has ${actualWallNeighbors} neighbors, expected 2.`);
      return { isValid: false, wallSegments: [] };
    }
  }
  // All checks passed
  return { isValid: true, wallSegments };
}

/**
 * Checks if all wall segments form a single, continuous loop using BFS/DFS.
 * Assumes `checkWallStructure` has already validated that each wall segment
 * has exactly two valid neighbors.
 * @param grid The grid (used for isWall checks if needed, but primarily relies on wallSegments).
 * @param wallSegments An array of wall segment positions, assumed to be structurally sound.
 * @returns True if all wall segments form a single connected loop, false otherwise.
 */
export function checkSingleLoop(grid: Grid, wallSegments: Position[]): boolean {
  if (wallSegments.length === 0) {
    // This function checks for a *single loop*. Zero walls don't form a single loop.
    // The overall solution validity (e.g. if number clues were all zero) is a higher-level concern.
    return false;
  }

  const visited = new Set<string>(); // Store "r,c" strings for visited wall segments
  const queue: Position[] = [wallSegments[0]]; // Start BFS from the first wall segment
  visited.add(`${wallSegments[0].r},${wallSegments[0].c}`);
  let segmentsVisitedCount = 0;

  while (queue.length > 0) {
    const currentWall = queue.shift()!;
    segmentsVisitedCount++;
    const { r, c } = currentWall;

    let actualNeighborsOfCurrentWall: Position[] = [];
    let potentialNeighborCoords: Position[] = [];

    if (r % 2 === 0) { // Current wall is vertical (r even, c odd)
      potentialNeighborCoords = [
        { r: r - 1, c: c - 1 }, { r: r + 1, c: c - 1 },
        { r: r - 2, c: c }, { r: r + 2, c: c },
        { r: r - 1, c: c + 1 }, { r: r + 1, c: c + 1 }
      ];
    } else { // Current wall is horizontal (r odd, c even)
      potentialNeighborCoords = [
        { r: r - 1, c: c - 1 }, { r: r + 1, c: c - 1 },
        { r: r, c: c - 2 }, { r: r, c: c + 2 },
        { r: r - 1, c: c + 1 }, { r: r + 1, c: c + 1 }
      ];
    }

    for (const pn of potentialNeighborCoords) {
      if (isWall(grid, pn.r, pn.c) && isValidWallPosition(pn.r, pn.c)) {
        actualNeighborsOfCurrentWall.push(pn);
      }
    }

    // The checkWallStructure already ensures actualNeighborsOfCurrentWall will have exactly 2 items.
    for (const neighbor of actualNeighborsOfCurrentWall) {
      const neighborKey = `${neighbor.r},${neighbor.c}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push(neighbor);
      }
    }
  }

  // If BFS visited all segments, they form a single connected component.
  // Since checkWallStructure ensures each segment has 2 neighbors, this component must be a loop (or multiple loops).
  // This function specifically checks for a SINGLE loop by seeing if all known wall segments were visited.
  return segmentsVisitedCount === wallSegments.length;
}

/**
 * Determines if the given grid represents a valid and complete solution.
 * 1. All number clues must be satisfied by their adjacent walls.
 * 2. There must be at least one number clue on the grid.
 * 3. All walls must be in valid positions and form a correct structure (each segment has two neighbors).
 * 4. If walls exist, they must form a single, continuous loop.
 * 5. If no walls exist, all number clues must be 0.
 * @param grid The grid to validate.
 * @returns True if the grid is a valid solution, false otherwise.
 */
export function isValidSolution(grid: Grid): boolean {
  // 1. Check number constraints. This also ensures at least one number clue exists.
  const numbersAreValid = checkNumberConstraints(grid);
  if (!numbersAreValid) {
    // This means either a number clue is not satisfied, or no number clues were found on the grid.
    // Both are conditions for an invalid solution according to checkNumberConstraints's current logic.
    // console.log("isValidSolution: checkNumberConstraints failed.");
    return false;
  }

  // 2. Check the basic structure of the walls.
  // This ensures walls are in valid positions and each segment has two connections.
  const wallStructureResult = checkWallStructure(grid);
  if (!wallStructureResult.isValid) {
    // console.log("isValidSolution: checkWallStructure failed.");
    return false;
  }

  const wallSegments = wallStructureResult.wallSegments;

  // At this point:
  // - All number clues (if any, but checkNumberConstraints ensures at least one) are satisfied by the current walls.
  // - The wall segments themselves are structurally sound (e.g., form continuous paths, no branches/crossings at dots).

  if (wallSegments.length === 0) {
    // If there are no walls, and numbersAreValid is true,
    // it implies all number clues on the grid must have been '0'.
    // checkNumberConstraints would have verified this.
    // So, a grid with only '0's (and at least one '0') and no walls is a valid solution.
    // console.log("isValidSolution: No walls, and number constraints are met (implies all clues are 0). Valid.");
    return true;
  }

  // 3. If there are walls, and number constraints are met, the walls must form a single loop.
  // checkWallStructure already confirmed they form valid segments with 2 connections each.
  // Now check if all these segments form one single connected component (loop).
  const formsSingleLoop = checkSingleLoop(grid, wallSegments);
  if (!formsSingleLoop) {
    // console.log("isValidSolution: checkSingleLoop failed.");
    return false;
  }

  // All checks passed: number clues are satisfied, walls are well-formed, and form a single loop.
  // console.log("isValidSolution: All checks passed. Valid solution.");
  return true;
}
