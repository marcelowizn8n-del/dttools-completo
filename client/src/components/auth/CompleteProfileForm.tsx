import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { UserCheck, MapPin, Building, Briefcase, AlertCircle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

const completeProfileSchema = z.object({
  company: z.string().optional(),
  role: z.string().min(1, "Cargo/função é obrigatório"),
  industry: z.string().min(1, "Área de atuação é obrigatória"),
  experience: z.string().min(1, "Experiência é obrigatória"),
  country: z.string().min(1, "País é obrigatório"),
  state: z.string().min(1, "Estado é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  zipCode: z.string().min(5, "CEP deve ter pelo menos 5 caracteres"),
  phone: z.string().optional(),
  bio: z.string().optional(),
  interests: z.array(z.string()).optional(),
});

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>;

interface CompleteProfileFormProps {
  userName: string;
  onComplete?: (profileData: CompleteProfileFormData) => void;
}

const industries = [
  "Tecnologia",
  "Design",
  "Consultoria",
  "Educação",
  "Saúde",
  "Financeiro",
  "Varejo",
  "Manufatura",
  "Serviços",
  "Startup",
  "ONGs",
  "Governo",
  "Outro"
];

const experienceLevels = [
  "Iniciante (0-2 anos)",
  "Intermediário (3-5 anos)",
  "Sênior (6-10 anos)",
  "Especialista (10+ anos)"
];

const interestOptions = [
  "UX/UI Design",
  "Product Management",
  "Inovação",
  "Design Thinking",
  "Service Design",
  "Design Research",
  "Prototipagem",
  "Workshop Facilitation",
  "Customer Experience",
  "Digital Transformation"
];

export function CompleteProfileForm({ userName, onComplete }: CompleteProfileFormProps) {
  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  const form = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      company: "",
      role: "",
      industry: "",
      experience: "",
      country: "Brasil",
      state: "",
      city: "",
      zipCode: "",
      phone: "",
      bio: "",
      interests: [],
    },
  });

  const onSubmit = async (data: CompleteProfileFormData) => {
    try {
      setError("");
      setIsLoading(true);
      
      const completeData = {
        ...data,
        interests: selectedInterests
      };
      
      onComplete?.(completeData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao completar perfil");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleInterest = (interest: string) => {
    setSelectedInterests(prev => 
      prev.includes(interest) 
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <UserCheck className="h-5 w-5 text-blue-600" />
          Complete seu Perfil
        </CardTitle>
        <CardDescription>
          Olá {userName}! Complete seu perfil para personalizar sua experiência no DTTools
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Profissionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Informações Profissionais
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Empresa (opcional)</Label>
                <Input
                  id="company"
                  placeholder="Nome da empresa"
                  data-testid="input-company"
                  {...form.register("company")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Cargo/Função *</Label>
                <Input
                  id="role"
                  placeholder="Ex: Designer, Product Manager"
                  data-testid="input-role"
                  {...form.register("role")}
                />
                {form.formState.errors.role && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.role.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Área de Atuação *</Label>
                <Select onValueChange={(value) => form.setValue("industry", value)}>
                  <SelectTrigger data-testid="select-industry">
                    <SelectValue placeholder="Selecione sua área" />
                  </SelectTrigger>
                  <SelectContent>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry}>
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.industry && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.industry.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">Experiência *</Label>
                <Select onValueChange={(value) => form.setValue("experience", value)}>
                  <SelectTrigger data-testid="select-experience">
                    <SelectValue placeholder="Nível de experiência" />
                  </SelectTrigger>
                  <SelectContent>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.experience && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.experience.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Localização */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Localização
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">País *</Label>
                <Input
                  id="country"
                  placeholder="Brasil"
                  data-testid="input-country"
                  {...form.register("country")}
                />
                {form.formState.errors.country && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.country.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">Estado *</Label>
                <Input
                  id="state"
                  placeholder="Ex: São Paulo"
                  data-testid="input-state"
                  {...form.register("state")}
                />
                {form.formState.errors.state && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.state.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  placeholder="Ex: São Paulo"
                  data-testid="input-city"
                  {...form.register("city")}
                />
                {form.formState.errors.city && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.city.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <Input
                  id="zipCode"
                  placeholder="00000-000"
                  data-testid="input-zipcode"
                  {...form.register("zipCode")}
                />
                {form.formState.errors.zipCode && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.zipCode.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Informações Adicionais</h3>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefone (opcional)</Label>
              <Input
                id="phone"
                placeholder="(11) 99999-9999"
                data-testid="input-phone"
                {...form.register("phone")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Sobre você (opcional)</Label>
              <Textarea
                id="bio"
                placeholder="Conte um pouco sobre sua experiência e objetivos..."
                className="min-h-[100px]"
                data-testid="textarea-bio"
                {...form.register("bio")}
              />
            </div>

            <div className="space-y-2">
              <Label>Áreas de Interesse (opcional)</Label>
              <p className="text-sm text-gray-600">Selecione suas áreas de interesse para personalizar sua experiência</p>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((interest) => (
                  <Badge
                    key={interest}
                    variant={selectedInterests.includes(interest) ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100"
                    onClick={() => toggleInterest(interest)}
                    data-testid={`badge-interest-${interest.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex gap-4">
            <Link href="/signup">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1"
                data-testid="button-back"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
              data-testid="button-complete"
            >
              {isLoading ? "Finalizando..." : "Finalizar Cadastro"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}