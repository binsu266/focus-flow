import { TimeBlock } from "./types";

export interface OverlapInfo {
  columnIndex: number;
  totalColumns: number;
}

// Calculate overlap information for all blocks
export function calculateOverlapInfo(blocks: TimeBlock[]): Map<string, OverlapInfo> {
  const overlapMap = new Map<string, OverlapInfo>();
  
  if (blocks.length === 0) return overlapMap;

  // Sort blocks by start time, then by duration (longer first)
  const sortedBlocks = [...blocks].sort((a, b) => {
    if (a.startHour !== b.startHour) return a.startHour - b.startHour;
    return b.duration - a.duration;
  });

  // For each block, find all blocks it overlaps with
  const overlappingGroups: TimeBlock[][] = [];

  for (const block of sortedBlocks) {
    const blockEnd = block.startHour + block.duration;
    
    // Find existing groups that this block overlaps with
    let addedToGroup = false;
    
    for (const group of overlappingGroups) {
      const overlapsWithGroup = group.some(groupBlock => {
        const groupBlockEnd = groupBlock.startHour + groupBlock.duration;
        // Check if there's any overlap (even 1 minute)
        return block.startHour < groupBlockEnd && blockEnd > groupBlock.startHour;
      });
      
      if (overlapsWithGroup) {
        group.push(block);
        addedToGroup = true;
        break;
      }
    }
    
    if (!addedToGroup) {
      overlappingGroups.push([block]);
    }
  }

  // Merge groups that share blocks
  const mergedGroups: Set<TimeBlock>[] = [];
  
  for (const group of overlappingGroups) {
    // Find all existing merged groups that share any block with this group
    const overlappingMergedIndices: number[] = [];
    
    for (let i = 0; i < mergedGroups.length; i++) {
      const hasShared = group.some(block => mergedGroups[i].has(block));
      if (hasShared) {
        overlappingMergedIndices.push(i);
      }
    }
    
    if (overlappingMergedIndices.length === 0) {
      // Create new merged group
      mergedGroups.push(new Set(group));
    } else {
      // Merge all overlapping groups together
      const firstIndex = overlappingMergedIndices[0];
      group.forEach(block => mergedGroups[firstIndex].add(block));
      
      // Merge other overlapping groups into the first one
      for (let i = overlappingMergedIndices.length - 1; i > 0; i--) {
        const idx = overlappingMergedIndices[i];
        mergedGroups[idx].forEach(block => mergedGroups[firstIndex].add(block));
        mergedGroups.splice(idx, 1);
      }
    }
  }

  // For each merged group, calculate column assignments using interval scheduling
  for (const groupSet of mergedGroups) {
    const groupBlocks = Array.from(groupSet).sort((a, b) => {
      if (a.startHour !== b.startHour) return a.startHour - b.startHour;
      return b.duration - a.duration;
    });

    // Find the maximum concurrent blocks at any point
    const events: { time: number; type: 'start' | 'end'; blockId: string }[] = [];
    
    for (const block of groupBlocks) {
      events.push({ time: block.startHour, type: 'start', blockId: block.id });
      events.push({ time: block.startHour + block.duration, type: 'end', blockId: block.id });
    }
    
    // Sort events: ends before starts at same time
    events.sort((a, b) => {
      if (a.time !== b.time) return a.time - b.time;
      return a.type === 'end' ? -1 : 1;
    });

    // Calculate max concurrent
    let maxConcurrent = 0;
    let current = 0;
    
    for (const event of events) {
      if (event.type === 'start') {
        current++;
        maxConcurrent = Math.max(maxConcurrent, current);
      } else {
        current--;
      }
    }

    // Limit to 4 columns max
    const totalColumns = Math.min(maxConcurrent, 4);

    // Assign columns using greedy algorithm
    const columnEndTimes: number[] = Array(totalColumns).fill(0);
    const blockColumns = new Map<string, number>();

    for (const block of groupBlocks) {
      // Find the first column that's free
      let assignedColumn = 0;
      
      for (let col = 0; col < totalColumns; col++) {
        if (columnEndTimes[col] <= block.startHour) {
          assignedColumn = col;
          break;
        }
        // If no free column, pick the one ending soonest
        if (columnEndTimes[col] < columnEndTimes[assignedColumn]) {
          assignedColumn = col;
        }
      }

      blockColumns.set(block.id, assignedColumn);
      columnEndTimes[assignedColumn] = block.startHour + block.duration;
    }

    // Set overlap info for all blocks in group
    for (const block of groupBlocks) {
      overlapMap.set(block.id, {
        columnIndex: blockColumns.get(block.id) || 0,
        totalColumns: groupBlocks.length > 1 ? totalColumns : 1,
      });
    }
  }

  // Set default for any blocks not in groups
  for (const block of blocks) {
    if (!overlapMap.has(block.id)) {
      overlapMap.set(block.id, { columnIndex: 0, totalColumns: 1 });
    }
  }

  return overlapMap;
}
