import db from './db.js';

export async function getFullNetwork() {
  const stations = await db.all(`
    SELECT 
      stations.id,
      stations.name,
      COUNT(station_lines.line_id) AS lineCount
    FROM stations
    LEFT JOIN station_lines ON stations.id = station_lines.station_id
    GROUP BY stations.id
    ORDER BY stations.name
  `);

  const lines = await db.all(`
    SELECT id, name, color
    FROM metro_lines
    ORDER BY id
  `);

  const segments = await db.all(`
    SELECT
      segments.id,
      segments.line_id AS lineId,
      metro_lines.name AS lineName,
      metro_lines.color AS lineColor,
      s1.id AS station1Id,
      s1.name AS station1Name,
      s2.id AS station2Id,
      s2.name AS station2Name
    FROM segments
    JOIN metro_lines ON segments.line_id = metro_lines.id
    JOIN stations s1 ON segments.station1_id = s1.id
    JOIN stations s2 ON segments.station2_id = s2.id
    ORDER BY segments.id
  `);

  return {
    stations: stations.map(station => ({
      id: station.id,
      name: station.name,
      interchange: station.lineCount > 1
    })),
    lines,
    segments
  };
}