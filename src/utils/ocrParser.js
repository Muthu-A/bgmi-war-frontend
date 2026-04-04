export function parseOCRText(text) {
  const lines = text.split("\n");

  let players = [];
  let currentRank = null;

  lines.forEach(line => {
    const full = line.match(/(\d+)\s+([A-Za-z0-9_ ]+)\s+(\d+)/);
    const sub = line.match(/^([A-Za-z0-9_ ]+)\s+(\d+)/);

    if (full) {
      currentRank = parseInt(full[1]);
      players.push({
        name: full[2].trim(),
        kills: parseInt(full[3]),
        rank: currentRank
      });
    } else if (sub && currentRank !== null) {
      players.push({
        name: sub[1].trim(),
        kills: parseInt(sub[2]),
        rank: currentRank
      });
    }
  });

  return players;
}

export function groupByRank(players, warType) {
  const grouped = {};

  players.forEach(p => {
    if (!grouped[p.rank]) grouped[p.rank] = [];
    grouped[p.rank].push(p);
  });

  return Object.keys(grouped).map(rank => ({
    rank: parseInt(rank),
    players: grouped[rank],
    totalKills: grouped[rank].reduce((a, b) => a + b.kills, 0)
  }));
}