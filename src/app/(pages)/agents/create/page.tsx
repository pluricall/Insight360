"use client";
import * as z from "zod";
import { useState } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { altitude, altitudeOnPrem } from "@/lib/axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { CheckCircle, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthProvider";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { signInOnPremise } from "@/services/altitude/auth/signInOnPremise";
import { SelectField } from "@/components/select-field";
import { Header } from "@/components/header";

interface CreateAgentBody {
  discriminator: string;
  AgentType: string;
  Name: string;
  RoleName: string;
  FullName: { RequestType: string; Value: string };
  Password: { RequestType: string; Value: string };
  DefaultExtension: { RequestType: string; Value: string };
}

const agentSchema = z.object({
  agentType: z.enum(["Human", "Ivr", "Routing", "NoValue"], {
    required_error: "Selecione o tipo de agente!",
    invalid_type_error: "Selecione o tipo de agente!",
  }),
  name: z.string().min(3, "O username deve ter mais de 3 dígitos."),
  password: z.string().min(3, "A senha deve ter mais de 3 dígitos."),
  fullName: z.string().min(3, "O nome do usuário é obrigatório."),
  roleName: z.enum(["Agent", "Supervisor"], {
    required_error: "Selecione um papel válido!",
    invalid_type_error: "Selecione um papel válido!",
  }),
  defaultExtension: z.string(),
});

const formSchema = z.object({
  agents: z.array(agentSchema).min(1),
});

type FormData = z.infer<typeof formSchema>;

export default function CreateAgentsPage() {
  const { token: cloudToken } = useAuth();
  const [status, setStatus] = useState<{ cloud: boolean; onprem: boolean }[]>(
    []
  );
  const [userExistsInAD, setUserExistsInAD] = useState<
    (null | boolean)[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [formDataToSubmit, setFormDataToSubmit] = useState<FormData | null>(null);

  const {
    control,
    handleSubmit,
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agents: [
        {
          agentType: "Human",
          roleName: "Agent",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "agents",
  });

  async function createAgentCloudAndOnPremise(
    body: CreateAgentBody,
    onPremToken: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const [cloudRes, onPremRes] = await Promise.allSettled([
        altitude.post("/api/instance/agentManager/createAgent", body, {
          headers: { Authorization: `Bearer ${cloudToken}` },
        }),
        altitudeOnPrem.post("/api/instance/agentManager/createAgent", body, {
          headers: { Authorization: `Bearer ${onPremToken}` },
        }),
      ]);

      const handleError = (result: any, env: "Cloud" | "OnPremise") => {
        if (result.status === "fulfilled") return null;

        const err = result.reason;
        const data = err.response?.data || {};
        const code = data.code || data.Code;
        const message = data.message || data.Message || err.message;

        if (code === "AgentNameMustBeUnique") {
          toast.error(`O agente "${body.Name}" já existe no ${env}.`);
          return "duplicate";
        }

        toast.error(`Erro ao criar agente no ${env}: ${message}`);
        return message;
      };

      const cloudError = handleError(cloudRes, "Cloud");
      const onPremError = handleError(onPremRes, "OnPremise");

      if (!cloudError && !onPremError) {
        toast.success(`Agente "${body.Name}" criado com sucesso nos dois ambientes!`);
        return { success: true };
      }

      if (!cloudError && onPremError) {
        toast.error(`"${body.Name}" criado na Cloud, mas falhou no OnPremise.`);
        return { success: false, error: onPremError };
      }

      if (cloudError && !onPremError) {
        toast.error(`"${body.Name}" criado no OnPremise, mas falhou na Cloud.`);
        return { success: false, error: cloudError };
      }

      return { success: false, error: cloudError || onPremError };
    } catch (err: any) {
      console.error("Erro inesperado ao criar agente:", err);
      toast.error(`Erro inesperado: ${err.message}`);
      return { success: false, error: err.message };
    }
  }

  const agentsWatch = watch("agents");

  function isAgentComplete(index: number) {
    const agent = agentsWatch[index];
    return (
      agent?.fullName?.trim() &&
      agent?.name?.trim() &&
      agent?.password?.trim() &&
      agent?.defaultExtension?.trim() &&
      agent?.roleName?.trim() &&
      agent?.agentType?.trim()
    );
  }

  function duplicateAgentWithSuffix(index: number, suffix: string) {
    const agent = agentsWatch[index];

    if (!agent) return;

    append({
      agentType: agent.agentType,
      name: agent.name ? `${agent.name}${suffix}` : "",
      roleName: agent.roleName,
      fullName: agent.fullName,
      password: agent.password,
      defaultExtension: agent.defaultExtension,
    });
  }

  async function handleCreateAgents(data: FormData) {
    const hasExistingUserAD = userExistsInAD.some((user) => user === true);

    if (hasExistingUserAD) {
      toast.error("Não é possível criar agentes que já existem no AD.");
      return;
    }
    setFormDataToSubmit(data);
    setDialogOpen(true);
  }

  async function findAvailableUsername(fullName: string, index: number) {
    const parts = fullName
      .trim()
      .split(/\s+/)
      .map((p) => p.replace(/[^a-zA-Z]/g, ""));

    if (parts.length === 0) return;

    const maxLen = 4;
    let triedUsernames = new Set<string>();

    function generateVariants(): string[] {
      const variants: string[] = [];

      let initials = parts.map((p) => p[0] || "").join("");
      if (initials.length < maxLen) {
        initials = (initials + parts[0].slice(1)).slice(0, maxLen);
      } else {
        initials = initials.slice(0, maxLen);
      }
      variants.push(initials.toLowerCase());

      for (let i = 1; i < maxLen; i++) {
        let combined = parts
          .map((p, idx) => (idx === 0 ? p.slice(0, i + 1) : p[0]))
          .join("");
        if (combined.length < maxLen) {
          combined = (combined + parts[0].slice(i + 1)).slice(0, maxLen);
        } else {
          combined = combined.slice(0, maxLen);
        }
        variants.push(combined.toLowerCase());
      }

      return variants.filter((v) => !triedUsernames.has(v));
    }

    const variants = generateVariants();
    for (const username of variants) {
      triedUsernames.add(username);
      const res = await fetch("/Insight360/api/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();

      if (!data.exists) {
        setValue(`agents.${index}.name`, username);
        checkUserExistsInAD(username, index);
        return;
      }
    }

    toast.error("Não foi possível gerar um username disponível de 4 letras.");
  }

  async function checkUserExistsInAD(username: string, index: number) {
    if (username.length < 3) return;

    try {
      const userWithoutWhiteSpace = username.trim()
      const res = await fetch("/Insight360/api/ad", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: userWithoutWhiteSpace }),
      });
      const data = await res.json();

      setUserExistsInAD((prev) => {
        const copy = [...prev];
        copy[index] = data.exists ? true : false;
        return copy;
      });

      if (data.exists) {
        toast.error(`O agente ${username} já está cadastrado no AD.`);
      }
    } catch (err) {
      console.error("Erro ao verificar AD:", err);
      toast("Não foi possível verificar o AD.");
    }
  }

  async function processAgentsCreation(data: FormData, onPremToken: string) {
    setLoading(true);
    const newStatus: { cloud: boolean; onprem: boolean }[] = [];

    await Promise.all(
      data.agents.map(async (agent, index) => {
        const body: CreateAgentBody = {
          discriminator: "",
          AgentType: agent.agentType,
          Name: agent.name.trim(),
          RoleName: agent.roleName,
          FullName: { RequestType: "Set", Value: agent.fullName },
          Password: { RequestType: "Set", Value: agent.password },
          DefaultExtension: {
            RequestType: "Set",
            Value: agent.defaultExtension,
          },
        };

        const createAgents = await createAgentCloudAndOnPremise(body, onPremToken);

        if (!createAgents.success) {
          if (createAgents.error === "duplicate") {
            newStatus[index] = { cloud: false, onprem: false };
            return toast.error(`O agente "${body.Name}" já existe.`);
          }
          return;
        }
      })
    );

    setStatus(newStatus);
    setLoading(false);
    setFormDataToSubmit(null);
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

      if (formDataToSubmit) {
        await processAgentsCreation(formDataToSubmit, access_token);
      }

    } catch (err: any) {
      alert(err.message);
      setLoginLoading(false);
    }
  }

  return (
    <div>
      <Header title="Criar agentes" />
      <div className={`flex-1 flex {} justify-center p-4`}>
        <form onSubmit={handleSubmit(handleCreateAgents)}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="p-2">
                <CardHeader className="p-0 flex items-end">
                  {index > 0 && (
                    <X
                      size={22}
                      onClick={() => remove(index)}
                      className="font-bold cursor-pointer"
                    />
                  )}
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <Controller
                    control={control}
                    name={`agents.${index}.agentType`}
                    render={({ field }) => (
                      <SelectField
                        label="Tipo de Agente"
                        placeholder="Selecione o tipo"
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.agents?.[index]?.agentType?.message}
                      >
                        <SelectItem value="Human">Human</SelectItem>
                        <SelectItem value="Ivr">Ivr</SelectItem>
                        <SelectItem value="Routing">Routing</SelectItem>
                        <SelectItem value="NoValue">NoValue</SelectItem>
                      </SelectField>
                    )}
                  />
                  <Controller
                    control={control}
                    name={`agents.${index}.roleName`}
                    render={({ field }) => (
                      <SelectField
                        label="Role"
                        placeholder="Selecione o tipo"
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.agents?.[index]?.roleName?.message}
                      >
                        <SelectItem value="Agent">Agent</SelectItem>
                        <SelectItem value="Supervisor">Supervisor</SelectItem>
                      </SelectField>
                    )}
                  />

                  <Input
                    label="FullName"
                    {...register(`agents.${index}.fullName`, {
                      onBlur: async (e) => {
                        const fullName = e.target.value;
                        if (!fullName) return;
                        const currentName = getValues(`agents.${index}.name`);
                        if (currentName.endsWith("_F0") || currentName.endsWith("_50")) return;
                        await findAvailableUsername(fullName, index);
                      },
                    })}
                    error={errors.agents?.[index]?.fullName?.message}
                  />
                  <div className="flex items-end gap-2">
                    <Input
                      label="Username"
                      {...register(`agents.${index}.name`, {
                        onBlur: (e) => checkUserExistsInAD(e.target.value, index),
                      })}
                      icon={
                        userExistsInAD[index] === false ?
                          <CheckCircle size={22} className="text-green-600" />
                          : <X size={22} className="text-red-600" />
                      }
                      error={errors.agents?.[index]?.name?.message}
                    />
                  </div>

                  <Input
                    label="Password"
                    type="text"
                    {...register(`agents.${index}.password`)}
                    error={errors.agents?.[index]?.password?.message}
                  />
                  <Input
                    label="Extension"
                    {...register(`agents.${index}.defaultExtension`)}
                    error={errors.agents?.[index]?.defaultExtension?.message}
                  />
                  <div className="flex gap-2 mt-2">
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isAgentComplete(index)}
                      onClick={() => duplicateAgentWithSuffix(index, "_F0")}
                    >
                      Criar _F0
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!isAgentComplete(index)}
                      onClick={() => duplicateAgentWithSuffix(index, "_50")}
                    >
                      Criar _50
                    </Button>
                  </div>

                  <div className="flex flex-col gap-1 mt-2 text-sm">
                    <div className="flex flex-col gap-1 mt-2 text-sm">
                      {status[index] && (
                        <>
                          {status[index].cloud !== undefined && (
                            <span
                              className={`flex items-center gap-1 ${status[index].cloud ? "text-blue-600" : "text-red-600"
                                }`}
                            >
                              {status[index].cloud ? 'Criado na Cloud' : 'Usuário já existe ou falhou'}
                            </span>
                          )}

                          {status[index].onprem !== undefined && (
                            <span
                              className={`flex items-center gap-1 ${status[index].onprem ? "text-green-600" : "text-red-600"
                                }`}
                            >
                              {status[index].onprem ? 'Criado no OnPremise' : 'Usuário já existe ou falhou.'}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="bg-green-700 hover:bg-green-600" disabled={loading}>
              {loading ? "Enviando..." : "Criar Agentes"}
            </Button>
            <Button
              type="button"
              onClick={() =>
                append({
                  agentType: "Human",
                  name: "",
                  roleName: "Agent",
                  fullName: "",
                  password: "",
                  defaultExtension: "",
                })
              }
            >
              + Adicionar Agente
            </Button>
          </div>
        </form>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Altitude OnPremise</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleOnPremLogin} className="space-y-4">
              <Input name="username" placeholder="Username" required />
              <Input
                name="password"
                type="password"
                placeholder="Password"
                required
              />
              <DialogFooter>
                <Button type="submit" disabled={loginLoading}>
                  {loginLoading ? "Entrando..." : "Entrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
