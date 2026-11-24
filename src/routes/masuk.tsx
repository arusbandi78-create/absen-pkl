import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/masuk")({
  component: RedirectMasuk,
});

function RedirectMasuk() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/absen/$jenis", params: { jenis: "masuk" } });
  }, [navigate]);
  return null;
}
