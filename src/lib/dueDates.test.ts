import { describe, it, expect, beforeAll } from "vitest";
import {
  localDateInput,
  dueDateFromDateInput,
  dateInputFromDueDate,
  dueDateFromDateTimeInput,
  dateTimeInputFromDueDate,
} from "./dueDates";

beforeAll(() => {
  process.env.TZ = "America/Sao_Paulo";
});

describe("datas das Tarefas no fuso de quem usa", () => {
  it("a data de hoje às 22h em São Paulo ainda é hoje", () => {
    expect(localDateInput(new Date("2026-10-21T01:30:00Z"))).toBe("2026-10-20");
  });

  it("uma Tarefa para hoje vale até o fim do dia", () => {
    expect(dueDateFromDateInput("2026-10-20")).toBe("2026-10-21T02:59:59.999Z");
  });

  it("uma Tarefa para hoje não está Vencida às 23h", () => {
    const due = new Date(dueDateFromDateInput("2026-10-20")!);
    expect(due > new Date("2026-10-20T23:00:00-03:00")).toBe(true);
    expect(due < new Date("2026-10-21T00:00:00-03:00")).toBe(true);
  });

  it("a data volta igual ao abrir a Tarefa para editar", () => {
    expect(dateInputFromDueDate(dueDateFromDateInput("2026-10-20"))).toBe("2026-10-20");
  });

  it("sem data, a Tarefa fica sem data", () => {
    expect(dueDateFromDateInput("")).toBeNull();
    expect(dateInputFromDueDate(null)).toBe("");
  });
});

describe("data e hora das Atividades no fuso de quem usa", () => {
  it("14h digitadas em São Paulo são gravadas como 17h UTC", () => {
    expect(dueDateFromDateTimeInput("2026-10-21T14:00")).toBe("2026-10-21T17:00:00.000Z");
  });

  it("a hora volta como foi digitada ao abrir para editar", () => {
    expect(dateTimeInputFromDueDate("2026-10-21T17:00:00+00:00")).toBe("2026-10-21T14:00");
  });

  it("sem data, a Atividade fica sem data", () => {
    expect(dueDateFromDateTimeInput("")).toBeNull();
    expect(dateTimeInputFromDueDate(null)).toBe("");
  });
});
