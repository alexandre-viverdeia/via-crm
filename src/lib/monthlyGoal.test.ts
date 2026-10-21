import { describe, it, expect } from "vitest";
import { orgRevenueGoal, monthWonRevenue } from "./monthlyGoal";

const now = new Date(2026, 9, 21); // 21 de outubro de 2026

const goal = (over: Partial<Parameters<typeof orgRevenueGoal>[0][number]>) => ({
  goal_type: "revenue",
  assign_type: "org",
  period_month: 10,
  period_year: 2026,
  target_value: 50000,
  created_at: "2026-10-01T12:00:00Z",
  ...over,
});

describe("Meta do Mês do Painel", () => {
  it("usa a Meta de receita da Organização para o mês atual", () => {
    expect(orgRevenueGoal([goal({})], now)).toBe(50000);
  });

  it("ignora Metas de outro mês, de outro tipo ou de um Membro ou Equipe", () => {
    const goals = [
      goal({ period_month: 9 }),
      goal({ period_year: 2025 }),
      goal({ goal_type: "deals_closed" }),
      goal({ assign_type: "individual" }),
      goal({ assign_type: "team" }),
    ];
    expect(orgRevenueGoal(goals, now)).toBeNull();
  });

  it("sem Meta, ou com Meta zerada, não há Meta do Mês", () => {
    expect(orgRevenueGoal([], now)).toBeNull();
    expect(orgRevenueGoal([goal({ target_value: 0 })], now)).toBeNull();
  });

  it("com duas Metas da Organização no mês, vale a mais recente", () => {
    const goals = [goal({ target_value: 40000 }), goal({ target_value: 60000, created_at: "2026-10-10T12:00:00Z" })];
    expect(orgRevenueGoal(goals, now)).toBe(60000);
  });
});

describe("receita ganha no mês", () => {
  it("soma os Negócios ganhos no mês, como a tela de Metas", () => {
    const deals = [
      { status: "won", value: 30000, updated_at: "2026-10-05T15:00:00Z" },
      { status: "won", value: 12000, updated_at: "2026-10-20T15:00:00Z" },
      { status: "won", value: 99000, updated_at: "2026-09-28T15:00:00Z" },
      { status: "open", value: 50000, updated_at: "2026-10-15T15:00:00Z" },
      { status: "lost", value: 7000, updated_at: "2026-10-15T15:00:00Z" },
    ];
    expect(monthWonRevenue(deals, now)).toBe(42000);
  });
});
