/**
 * Prisma inputs can't mix raw foreign keys with relation operations, so DTO ids
 * are converted to relation ops: undefined = leave alone, null = clear, id = link.
 */
export function linkOne(id: string | null | undefined, mode: "create" | "update") {
  if (id === undefined) return undefined;
  if (id === null) return mode === "update" ? { disconnect: true } : undefined;
  return { connect: { id } };
}

export function linkMany(ids: string[] | undefined, mode: "create" | "update") {
  if (!ids) return undefined;
  const refs = ids.map((id) => ({ id }));
  return mode === "create" ? { connect: refs } : { set: refs };
}
