type StageLike = { id: string };
type DealLike = { stage_id: string | null; status: string | null };

/**
 * Conversion between consecutive stages: of the deals that reached the previous stage, the share that reached this one.
 * A deal reached every stage up to its current one, and a won deal reached them all, so the rate never passes 100%.
 */
export function stageConversionRates(stages: StageLike[], deals: DealLike[]): number[] {
  const stageIndex = new Map(stages.map((s, i) => [s.id, i]));
  const reached = stages.map((_, i) =>
    deals.filter((d) => d.status === "won" || (stageIndex.get(d.stage_id ?? "") ?? -1) >= i).length);
  return stages.map((_, i) => {
    if (i === 0) return 100;
    return reached[i - 1] > 0 ? Math.round((reached[i] / reached[i - 1]) * 100) : 0;
  });
}
