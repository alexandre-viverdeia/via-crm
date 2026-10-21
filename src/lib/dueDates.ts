// Datas de Tarefas e Atividades no fuso de quem usa o CRM.
// O banco guarda instantes em UTC; os campos da tela trabalham na hora local.

const pad = (n: number) => String(n).padStart(2, "0");

/** "AAAA-MM-DD" do dia local, para campos `type="date"`. */
export function localDateInput(date: Date = new Date()): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** Uma Tarefa com data vale até o fim desse dia, no fuso local. */
export function dueDateFromDateInput(value: string): string | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999).toISOString();
}

export function dateInputFromDueDate(iso: string | null): string {
  return iso ? localDateInput(new Date(iso)) : "";
}

/** Valor de um campo `type="datetime-local"`, lido na hora local. */
export function dueDateFromDateTimeInput(value: string): string | null {
  return value ? new Date(value).toISOString() : null;
}

export function dateTimeInputFromDueDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${localDateInput(d)}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
