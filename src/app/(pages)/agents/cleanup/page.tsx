"use client";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { altitude, altitudeOnPrem } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/select-field";
import { SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthProvider";
import { signInOnPremise } from "@/services/altitude/auth/signInOnPremise";
import { Header } from "@/components/header";

const schema = z.object({
  agentName: z.string().min(1, "Informe o username do agente"),
  platform: z.enum(["Cloud", "OnPremise"]),
});

type FormData = z.infer<typeof schema>;

export default function CleanupAgentsPage() {
  const { token: cloudToken } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [pendingAgent, setPendingAgent] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<"Cloud" | "OnPremise" | null>(null);

  const { register, handleSubmit, control, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function openOnPremDialog(data: FormData) {
    setPendingAgent(data.agentName.trim());
    setSelectedPlatform(data.platform);
    if (data.platform === "OnPremise") {
      setDialogOpen(true);
    } else {
      setLoading(true);
      await performCleanup(data.agentName.trim(), cloudToken, null);
      setLoading(false);
    }
  }

  async function performCleanup(agentName: string, cloudToken: string | null, onPremToken: string | null) {
    if (cloudToken) {
      try {
        await altitude.put(
          "/api/instance/agentManager/cleanupSupervisor",
          null,
          { headers: { Authorization: `Bearer ${cloudToken}` }, params: { agentName, "api-version": "8.53090" } }
        );
        toast.success(`✔ ${agentName} cleanup no Cloud concluído`);
      } catch (err: any) {
        if (err.response?.status === 400) {
          toast.warning(`⚠ ${agentName} não existe no Cloud`);
        } else {
          toast.error(`✖ Erro no cleanup de ${agentName} no Cloud`);
        }
      }
    }

    if (onPremToken) {
      try {
        await altitudeOnPrem.put(
          "/api/instance/agentManager/cleanupSupervisor",
          null,
          { headers: { Authorization: `Bearer ${onPremToken}` }, params: { agentName, "api-version": "8.53090" } }
        );
        toast.success(`✔ ${agentName} cleanup no OnPremise concluído`);
      } catch (err: any) {
        if (err.response?.status === 400) {
          toast.warning(`⚠ ${agentName} não existe no OnPremise`);
        } else {
          toast.error(`✖ Erro no cleanup de ${agentName} no OnPremise`);
        }
      }
    }
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

      if (pendingAgent) {
        await performCleanup(pendingAgent, null, access_token);
      }

      setLoading(false);
      setPendingAgent(null);
    } catch (err: any) {
      toast.error(err.message || "Erro ao autenticar no OnPremise");
      setLoginLoading(false);
    }
  }

  return (
    <div>
      <Header title="Clean Up"/>
      <div className="flex-1 flex justify-center p-4">
          <div className="w-80">
            <form onSubmit={handleSubmit(openOnPremDialog)} className="flex flex-col gap-4">
              <Input label="Username do agente" {...register("agentName")} error={errors.agentName?.message} />
              <Controller
                control={control}
                name="platform"
                render={({ field }) => (
                  <SelectField label="Plataforma" value={field.value} onValueChange={field.onChange}>
                    <SelectItem value="Cloud">Cloud</SelectItem>
                    <SelectItem value="OnPremise">OnPremise</SelectItem>
                  </SelectField>
                )}
              />
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Executando cleanup..." : "Executar Cleanup"}
              </Button>
            </form>
          </div>

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
                  {loginLoading ? "Entrando..." : "Entrar e executar cleanup"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
