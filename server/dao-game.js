import db from './db.js';

export async function createPlanningData() {
  const stations = await db.all(`
    SELECT id, name
    FROM stations
    ORDER BY name
  `);

  const segments = await db.all(`
    SELECT
      segments.id,
      s1.id AS station1Id,
      s1.name AS station1Name,
      s2.id AS station2Id,
      s2.name AS station2Name
    FROM segments
    JOIN stations s1 ON segments.station1_id = s1.id
    JOIN stations s2 ON segments.station2_id = s2.id
    ORDER BY segments.id
  `);

  const graph = buildGraph(stations, segments);
  const validPairs = [];

  for (const start of stations) {
    for (const destination of stations) {
      if (start.id === destination.id) {
        continue;
      }

      const distance = shortestDistance(graph, start.id, destination.id);

      if (distance >= 3) {
        validPairs.push({
          startStation: start,
          destinationStation: destination,
          distance
        });
      }
    }
  }

  if (validPairs.length === 0) {
    throw new Error('No valid start/destination pair found');
  }

  const selectedPair = validPairs[Math.floor(Math.random() * validPairs.length)];

  return {
    stations,
    segments,
    startStation: selectedPair.startStation,
    destinationStation: selectedPair.destinationStation,
    minimumDistance: selectedPair.distance
  };
}

function buildGraph(stations, segments) {
  const graph = new Map();

  for (const station of stations) {
    graph.set(station.id, []);
  }

  for (const segment of segments) {
    graph.get(segment.station1Id).push(segment.station2Id);
    graph.get(segment.station2Id).push(segment.station1Id);
  }

  return graph;
}

function shortestDistance(graph, startId, destinationId) {
  const visited = new Set();
  const queue = [{ stationId: startId, distance: 0 }];

  visited.add(startId);

  while (queue.length > 0) {
    const current = queue.shift();

    if (current.stationId === destinationId) {
      return current.distance;
    }

    const neighbors = graph.get(current.stationId);

    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          stationId: neighbor,
          distance: current.distance + 1
        });
      }
    }
  }

  return Infinity;
}