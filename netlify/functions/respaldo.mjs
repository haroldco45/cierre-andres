// Cierre Diario — copia de seguridad automática
// Todos los días copia las planillas a un almacén aparte y conserva las últimas 30 copias.
import { getStore } from "@netlify/blobs";

const DIAS = 30;

export default async () => {
  const origen = getStore("cierres");
  const copia = getStore("cierres-respaldo");
  const hoy = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(new Date());

  const { blobs } = await origen.list();
  const datos = {};
  for (const b of blobs) datos[b.key] = await origen.get(b.key, { type: "json" });
  await copia.setJSON(`dia/${hoy}`, { fecha: hoy, creado: Date.now(), datos });

  // Borra las copias más viejas
  const viejas = (await copia.list({ prefix: "dia/" })).blobs.map(b => b.key).sort().reverse().slice(DIAS);
  for (const k of viejas) await copia.delete(k);

  return new Response(JSON.stringify({ ok: true, fecha: hoy, claves: blobs.length }), { headers: { "content-type": "application/json" } });
};

// Todos los días a las 2:00 a. m. hora de Colombia (7:00 UTC)
export const config = { schedule: "0 7 * * *" };
