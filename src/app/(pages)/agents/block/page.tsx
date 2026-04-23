"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { altitude, altitudeOnPrem } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthProvider";
import { signInOnPremise } from "@/services/altitude/auth/signInOnPremise";
import { Header } from "@/components/header";
import { Card } from "@/components/ui/card";

const schema = z.object({
  agentName: z.string().min(1, "Informe o username do agente"),
});

type FormData = z.infer<typeof schema>;

const SUFFIXES = ["", "_f0", "_50"];

export default function BlockAgentsPage() {
  const { token: cloudToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingBaseAgent, setPendingBaseAgent] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function openOnPremDialog(data: FormData) {
    setPendingBaseAgent(data.agentName.trim());
    setDialogOpen(true);
  }

  async function updateAgent(
    agentName: string,
    cloudToken: string | null,
    onPremToken: string
  ) {
    try {
      await altitude.put(
        "/api/instance/agentManager/updateAgent",
        {
          agentName,
          request: {
            discriminator: "AgentUpdateRequest",
            RoleName: { RequestType: "Set", Value: "Disabled Agents" },
            DefaultExtension: { RequestType: "Set", Value: "" },
          },
        },
        { headers: { Authorization: `Bearer ${cloudToken}` }, params: { "api-version": "8.53090" } }
      );
      toast.success(`✔ ${agentName} bloqueado no Cloud`);
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === "UnknownAgent") {
        toast.warning(`⚠ ${agentName} não existe no Cloud`);
      } else {
        toast.error(`✖ Erro ao bloquear ${agentName} no Cloud`);
      }
    }

    try {
      await altitudeOnPrem.put(
        "/api/instance/agentManager/updateAgent",
        {
          agentName,
          request: {
            discriminator: "AgentUpdateRequest",
            RoleName: { RequestType: "Set", Value: "Disabled Agents" },
            DefaultExtension: { RequestType: "Set", Value: "" },
            Password: { RequestType: "Set", Value: "12" },
          },
        },
        { headers: { Authorization: `Bearer ${onPremToken}` }, params: { "api-version": "8.53090" } }
      );
      toast.success(`✔ ${agentName} bloqueado no OnPremise`);
    } catch (err: any) {
      const code = err.response?.data?.code;
      if (code === "UnknownAgent") {
        toast.warning(`⚠ ${agentName} não existe no OnPremise`);
      } else {
        toast.error(`✖ Erro ao bloquear ${agentName} no OnPremise`);
      }
    }
  }

  async function blockAgents(baseAgent: string, onPremToken: string) {
    setLoading(true);

    for (const suffix of SUFFIXES) {
      const agent = `${baseAgent}${suffix}`;
      await updateAgent(agent, cloudToken, onPremToken);
    }

    setLoading(false);
    setPendingBaseAgent(null);
  }

  async function handleOnPremLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginLoading(true);

    const formData = new FormData(e.currentTarget);
    const username = String(formData.get("username"));
    const password = String(formData.get("password"));

    try {
      const { access_token } = await signInOnPremise({ username, password });
      setDialogOpen(false);
      setLoginLoading(false);
      setLoading(true);

      if (pendingBaseAgent) {
        await blockAgents(pendingBaseAgent, access_token);
      }
    } catch (err: any) {
      toast.error(err.message || "Erro ao autenticar no OnPremise");
      setLoginLoading(false);
    }
  }

  return (
    <div>
      <Header title="Bloquear Agentes (base, _f0, _50)" />
      <div className="flex-1 flex justify-center p-4">
        <Card className="w-80 p-4">
          <form onSubmit={handleSubmit(openOnPremDialog)} className="flex flex-col gap-2">
            <Input
              label="Usuário"
              {...register("agentName")}
              error={errors.agentName?.message}
            />
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Bloqueando logins..." : "Bloquear Agentes"}
            </Button>
          </form>
        </Card>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Login Altitude OnPremise</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleOnPremLogin} className="space-y-4">
              <Input name="username" placeholder="Username" required />
              <Input name="password" type="password" placeholder="Password" required />
              <DialogFooter>
                <Button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Entrando..." : "Entrar e Bloquear"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}