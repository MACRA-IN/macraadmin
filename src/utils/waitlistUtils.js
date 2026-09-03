const KITCHEN = { lat: 17.4875, lng: 78.3575 };
const BATCH_SIZE = 10; // bowls a rider carries in one trip
const ROAD_FACTOR = 1.35; // straight line -> real road distance
const AVG_SPEED_KMH = 19; // two-wheeler, Hyderabad traffic
const HANDOVER_MIN = 2.5; // minutes per drop

const toRad = (d) => (d * Math.PI) / 180;

const distanceKm = (a, b) => {
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

const orderRoute = (people) => {
  const remaining = [...people];
  const route = [];
  let cursor = KITCHEN;
  while (remaining.length) {
    let best = 0;
    for (let i = 1; i < remaining.length; i++) {
      if (distanceKm(cursor, remaining[i].pos) < distanceKm(cursor, remaining[best].pos)) best = i;
    }
    const next = remaining.splice(best, 1)[0];
    route.push(next);
    cursor = next.pos;
  }
  return route;
};

const routeStats = (route) => {
  if (!route.length) return { km: 0, minutes: 0 };
  let straight = distanceKm(KITCHEN, route[0].pos);
  for (let i = 0; i < route.length - 1; i++) straight += distanceKm(route[i].pos, route[i + 1].pos);
  straight += distanceKm(route[route.length - 1].pos, KITCHEN);
  const km = straight * ROAD_FACTOR;
  return { km, minutes: (km / AVG_SPEED_KMH) * 60 + route.length * HANDOVER_MIN };
};

export const buildBatches = (people) => {
  const pool = [...people];
  const batches = [];

  while (pool.length) {
    let seed = 0;
    for (let i = 1; i < pool.length; i++) {
      if (pool[i].kitchenKm < pool[seed].kitchenKm) seed = i;
    }
    const batch = [pool.splice(seed, 1)[0]];

    while (batch.length < BATCH_SIZE && pool.length) {
      const centre = {
        lat: batch.reduce((s, p) => s + p.pos.lat, 0) / batch.length,
        lng: batch.reduce((s, p) => s + p.pos.lng, 0) / batch.length,
      };
      let near = 0;
      for (let i = 1; i < pool.length; i++) {
        if (distanceKm(centre, pool[i].pos) < distanceKm(centre, pool[near].pos)) near = i;
      }
      batch.push(pool.splice(near, 1)[0]);
    }

    const route = orderRoute(batch);
    batches.push({ id: route[0].id, route, ...routeStats(route) });
  }

  return batches.sort((a, b) => a.km - b.km);
};

export const extractAreas = (payload) => {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
};

export const flatten = (areas) => {
  const seen = new Set();
  const people = [];

  areas.forEach((area) => {
    (area.people || []).forEach((p) => {
      if (p.id == null || seen.has(p.id)) return;
      seen.add(p.id);

      // Number(null) is 0, which would put a pin in the Atlantic. Guard it.
      const lat = p.latitude == null ? NaN : Number(p.latitude);
      const lng = p.longitude == null ? NaN : Number(p.longitude);
      const located = Number.isFinite(lat) && Number.isFinite(lng);
      const pos = located ? { lat, lng } : null;

      people.push({
        id: p.id,
        name: (p.name || "").trim() || `Person #${p.id}`,
        phone: p.phone || "",
        area: area.area_name || "Unknown area",
        approved: Boolean(p.is_approved),
        joined: p.created_at || null,
        located,
        pos,
        kitchenKm: located ? distanceKm(KITCHEN, pos) : Infinity,
      });
    });
  });

  return people.sort((a, b) => a.kitchenKm - b.kitchenKm);
};

export const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ""
    : d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
