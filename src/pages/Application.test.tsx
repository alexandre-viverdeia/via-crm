import { describe, expect, it, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import Application from "./Application";

const rpc = vi.fn();
vi.mock("@/integrations/supabase/client", () => ({ supabase: { rpc: (...args: unknown[]) => rpc(...args) } }));

function fill(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

describe("Application (landing page)", () => {
  beforeEach(() => rpc.mockReset());

  it("sends the application to the database and thanks the lead", async () => {
    rpc.mockResolvedValue({ data: "deal-id", error: null });
    render(<Application />);
    fill("Nome completo", "Helena Martins");
    fill("E-mail", "helena@exemplo.com.br");
    fill("Empresa", "Laboratório Vida Plena");
    fireEvent.click(screen.getByRole("button", { name: /enviar aplicação/i }));

    await waitFor(() => expect(screen.getByText("Recebemos a sua aplicação")).toBeInTheDocument());
    expect(rpc).toHaveBeenCalledWith("submit_application", expect.objectContaining({
      p_name: "Helena Martins", p_email: "helena@exemplo.com.br", p_company: "Laboratório Vida Plena", p_phone: null,
    }));
  });

  it("explains what to fix when the database rejects the e-mail", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "invalid_email" } });
    render(<Application />);
    fill("Nome completo", "Helena Martins");
    fill("E-mail", "helena@exemplo.com.br");
    fireEvent.click(screen.getByRole("button", { name: /enviar aplicação/i }));

    await waitFor(() => expect(screen.getByText("Confira o e-mail.")).toBeInTheDocument());
  });
});
