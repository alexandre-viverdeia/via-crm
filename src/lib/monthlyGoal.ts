type GoalLike = {
  goal_type: string;
  assign_type: string;
  period_month: number;
  period_year: number;
  target_value: number;
  created_at: string | null;
};

type DealLike = { status: string | null; value: number | null; updated_at: string | null };

/** The org's revenue goal for the current month (the latest one, if there are several), or null. */
export function orgRevenueGoal(goals: GoalLike[], now: Date = new Date()): number | null {
  const candidates = goals
    .filter((g) =>
      g.goal_type === "revenue" &&
      g.assign_type === "org" &&
      g.period_month === now.getMonth() + 1 &&
      g.period_year === now.getFullYear() &&
      Number(g.target_value) > 0)
    .sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return candidates.length > 0 ? Number(candidates[0].target_value) : null;
}

/** Revenue of the deals won this month, counted the same way as the Sales Goals page. */
export function monthWonRevenue(deals: DealLike[], now: Date = new Date()): number {
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return deals
    .filter((d) => d.status === "won" && d.updated_at && new Date(d.updated_at) >= start && new Date(d.updated_at) < end)
    .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
}
