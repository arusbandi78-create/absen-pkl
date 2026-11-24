import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/pulang")({
  component: RedirectPulang,
});

function RedirectPulang() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate({ to: "/absen/$jenis", params: { jenis: "pulang" } });
  }, [navigate]);
  return null;
}
