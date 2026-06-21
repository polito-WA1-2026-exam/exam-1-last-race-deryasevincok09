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


export async function validateAndExecuteRoute(userId, currentGame, selectedSegmentIds) {
  if (!currentGame) {
    throw new Error('No game in progress');
  }

  if (!Array.isArray(selectedSegmentIds)) {
    throw new Error('Invalid route format');
  }

  const uniqueSegmentIds = new Set(selectedSegmentIds);

  if (uniqueSegmentIds.size !== selectedSegmentIds.length) {
    return await storeInvalidGame(userId, 'A segment was selected more than once.');
  }

  if (selectedSegmentIds.length === 0) {
    return await storeInvalidGame(userId, 'The route is empty.');
  }

  const allSegments = await db.all(`
    SELECT
      segments.id,
      segments.line_id AS lineId,
      metro_lines.name AS lineName,
      s1.id AS station1Id,
      s1.name AS station1Name,
      s2.id AS station2Id,
      s2.name AS station2Name
    FROM segments
    JOIN metro_lines ON segments.line_id = metro_lines.id
    JOIN stations s1 ON segments.station1_id = s1.id
    JOIN stations s2 ON segments.station2_id = s2.id
  `);

  const segmentById = new Map();

  for (const segment of allSegments) {
    segmentById.set(segment.id, segment);
  }

  let currentStationId = currentGame.startStationId;
  let previousLineId = null;

  const routeStations = [await getStationById(currentGame.startStationId)];
  const orderedSegments = [];

  for (const segmentId of selectedSegmentIds) {
    const segment = segmentById.get(segmentId);

    if (!segment) {
      return await storeInvalidGame(userId, 'One selected segment does not exist.');
    }

    const segmentConnectedToCurrentStation =
      segment.station1Id === currentStationId ||
      segment.station2Id === currentStationId;

    if (!segmentConnectedToCurrentStation) {
      return await storeInvalidGame(userId, 'The route contains disconnected segments.');
    }

    if (previousLineId !== null && previousLineId !== segment.lineId) {
      const isInterchange = await isInterchangeStation(currentStationId);

      if (!isInterchange) {
        return await storeInvalidGame(
          userId,
          'Line changes are allowed only at interchange stations.'
        );
      }
    }

    const nextStationId =
      segment.station1Id === currentStationId
        ? segment.station2Id
        : segment.station1Id;

    const nextStationName =
      segment.station1Id === currentStationId
        ? segment.station2Name
        : segment.station1Name;

    orderedSegments.push({
      id: segment.id,
      lineId: segment.lineId,
      lineName: segment.lineName,
      fromStationId: currentStationId,
      fromStationName: routeStations[routeStations.length - 1].name,
      toStationId: nextStationId,
      toStationName: nextStationName
    });

    routeStations.push({
      id: nextStationId,
      name: nextStationName
    });

    currentStationId = nextStationId;
    previousLineId = segment.lineId;
  }

  if (currentStationId !== currentGame.destinationStationId) {
    return await storeInvalidGame(userId, 'The route does not reach the destination station.');
  }

  return await executeValidRoute(userId, orderedSegments, routeStations);
}


async function getStationById(stationId) {
  return await db.get(
    'SELECT id, name FROM stations WHERE id = ?',
    stationId
  );
}

async function isInterchangeStation(stationId) {
  const row = await db.get(
    `
    SELECT COUNT(*) AS lineCount
    FROM station_lines
    WHERE station_id = ?
    `,
    stationId
  );

  return row.lineCount > 1;
}

async function getRandomEvent() {
  const events = await db.all(`
    SELECT id, description, effect
    FROM events
  `);

  return events[Math.floor(Math.random() * events.length)];
}

async function storeInvalidGame(userId, reason) {
  await db.run(
    'INSERT INTO games (user_id, score, completed_at) VALUES (?, ?, ?)',
    userId,
    0,
    new Date().toISOString()
  );

  return {
    valid: false,
    reason,
    initialCoins: 20,
    finalCoins: 0,
    storedScore: 0,
    steps: []
  };
}

async function executeValidRoute(userId, orderedSegments, routeStations) {
  let coins = 20;
  const steps = [];

  for (const segment of orderedSegments) {
    const event = await getRandomEvent();

    coins += event.effect;

    steps.push({
      segmentId: segment.id,
      lineName: segment.lineName,
      fromStationName: segment.fromStationName,
      toStationName: segment.toStationName,
      eventDescription: event.description,
      eventEffect: event.effect,
      coinsAfterStep: coins
    });
  }

  const storedScore = Math.max(0, coins);

  await db.run(
    'INSERT INTO games (user_id, score, completed_at) VALUES (?, ?, ?)',
    userId,
    storedScore,
    new Date().toISOString()
  );

  return {
    valid: true,
    reason: null,
    initialCoins: 20,
    finalCoins: coins,
    storedScore,
    routeStations,
    steps
  };
}