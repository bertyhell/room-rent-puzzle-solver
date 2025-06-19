import { Grid } from './grid';
import { GridValue } from './enums';
import { isValidSolution, isPruningCandidate } from './validation';
import type { Position } from './validation';

// Helper function to get all potential wall positions in row-by-row order
export function getPotentialWallPositions(grid: Grid): Position[] {
  const positions: Position[] = [];
  for (let r = 0; r < grid.rows; r++) {
    for (let c = 0; c < grid.cols; c++) {
      // Valid wall positions are where r % 2 !== c % 2
      // (one is even, one is odd)
      if ((r % 2 === 0 && c % 2 !== 0) || (r % 2 !== 0 && c % 2 === 0)) {
        positions.push({ r, c });
      }
    }
  }
  return positions;
}

export function solvePuzzle(initialGrid: Grid): Grid | null {
  const potentialWallPositions = getPotentialWallPositions(initialGrid);
  const M = potentialWallPositions.length;

  if (M === 0) {
    // No place to put walls, check if initial grid is already a solution
    // (e.g. all '0's and no walls, or a pre-solved grid)
    console.log("Solver: No potential wall positions (M=0). Checking if initial grid is a solution.");
    if (isValidSolution(initialGrid)) {
      console.log("Solver: Initial grid is already a valid solution.");
      return initialGrid.clone(); // Return a clone
    }
    console.log("Solver: Initial grid is not a valid solution.");
    return null;
  }

   if (M > 60) {
    console.warn(`Solver Warning: Puzzle has ${M} potential wall locations. Brute-force may be extremely slow (2^${M} states). Consider a smaller puzzle or more aggressive pruning if this takes too long.`);
  } else {
    console.log(`Solver: Total potential wall positions (M): ${M}. Total possible states: 2^${M}.`);
  }


  const totalPossibleStates = BigInt(2) ** BigInt(M);
  let statesExplored = BigInt(0);
  // Store as progress * 1000 to avoid float issues, and ensure it's an integer for comparison
  let lastReportedProgressPercentageTimes1000 = -1;
  const progressIncrementPercentageTimes1000 = 1; // Represents 0.1% increments (0.1 * 1000 = 1)

  // Create a working copy of the grid for the DFS to modify
  const workingGrid = initialGrid.clone();

  function dfs(index: number): Grid | null {
    statesExplored++;

    // Progress Reporting
    if (M > 0 && totalPossibleStates > 0) { // Avoid division by zero if M=0 (though handled above)
        // Calculate current progress scaled by 10000 (for 0.01% precision to be safe with floor)
        const currentProgressScaled = (statesExplored * BigInt(100000)) / totalPossibleStates; // 1000 * 100
        const currentProgressPercentageTimes1000 = Number(currentProgressScaled) / 100; // Convert to number for comparison with float-based threshold

        if (currentProgressPercentageTimes1000 >= lastReportedProgressPercentageTimes1000 + progressIncrementPercentageTimes1000) {
            console.log(`Solver progress: ${(currentProgressPercentageTimes1000 / 10).toFixed(1)}% (${statesExplored} states explored)`);
            lastReportedProgressPercentageTimes1000 = Math.floor(currentProgressPercentageTimes1000 / progressIncrementPercentageTimes1000) * progressIncrementPercentageTimes1000;
        }
    }


    if (index === M) { // All potential wall positions have been decided
      if (isValidSolution(workingGrid)) {
        return workingGrid.clone(); // Found a solution
      }
      return null; // This path is not a solution
    }

    const pos = potentialWallPositions[index];

    // Option 1: Try placing a WALL
    workingGrid.set(pos.r, pos.c, GridValue.WALL);
    // Pruning: Only proceed if this placement doesn't immediately violate "too many walls".
    if (!isPruningCandidate(workingGrid)) {
      const solution = dfs(index + 1);
      if (solution) {
        return solution;
      }
    }

    // Option 2: Backtrack and try BLANK
    workingGrid.set(pos.r, pos.c, GridValue.BLANK);
    // Re-check constraints for the BLANK state.
    // If setting to BLANK causes a "too many walls" issue (e.g. if a '0' needs no walls, this is fine)
    // or more subtly, if a '1' *needed* this wall, and now has 0, that's not what isPruningCandidate checks.
    // isPruningCandidate only checks for *too many* walls.
    // So, for the BLANK case, it's generally safe to proceed unless it somehow creates a "too many walls" scenario,
    // which is unlikely by removing a wall.
    // The original checkNumberConstraints was more thorough here.
    // However, if we stick to only isPruningCandidate for early exit:
    if (!isPruningCandidate(workingGrid)) { // This check might be redundant here or less effective for BLANK
      const solution = dfs(index + 1);
      if (solution) {
        return solution;
      }
    }

    return null; // No solution found from this path
  }

  console.log(`Solver: Starting DFS search...`);
  const solution = dfs(0);

  if (solution) {
    console.log(`Solver: Solution found after exploring ${statesExplored} of ${totalPossibleStates} (2^${M}) states.`);
  } else {
    console.log(`Solver: No solution found after exploring ${statesExplored} of ${totalPossibleStates} (2^${M}) states (entire relevant search space).`);
  }
  return solution;
}
