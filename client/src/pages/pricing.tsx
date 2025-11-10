import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Check, X, ArrowRight, Star, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useLocation } from "wouter";
import { useLanguage } from "@/contexts/LanguageContext";
import type { SubscriptionPlan } from "@shared/schema";

interface PricingCardProps {
  plan: SubscriptionPlan;
  isYearly: boolean;
  isPopular?: boolean;
  onSelectPlan: (planId: string, billingPeriod: "monthly" | "yearly") => void;
  isLoading?: boolean;
}

// Helper function to generate localized features based on plan limits and capabilities
function getLocalizedFeatures(plan: SubscriptionPlan, t: (key: string, params?: Record<string, string>) => string): string[] {
  const features: string[] = [];
  
  // Add core Design Thinking tools
  features.push(t("feature.all.phases"));
  
  // Add project limits
  if (plan.maxProjects) {
    features.push(t("feature.projects.limit", { count: plan.maxProjects.toString() }));
  } else {
    features.push(t("feature.unlimited.projects"));
  }
  
  // Add persona limits
  if (plan.maxPersonasPerProject) {
    features.push(t("feature.personas.limit", { count: plan.maxPersonasPerProject.toString() }));
  } else {
    features.push(t("feature.unlimited.personas"));
  }
  
  // Add AI chat limits
  if (plan.aiChatLimit) {
    features.push(t("feature.ai.chat.limit", { count: plan.aiChatLimit.toString() }));
  } else {
    features.push(t("feature.unlimited.ai.chat"));
  }
  
  // Add team collaboration features
  if (plan.hasCollaboration) {
    features.push(t("feature.collaboration"));
  }
  
  // Add team user limits for team and enterprise plans
  if (plan.name === "team" || plan.name === "enterprise") {
    if (plan.maxUsersPerTeam) {
      features.push(t("feature.team.users.limit", { count: plan.maxUsersPerTeam.toString() }));
    } else {
      features.push(t("feature.unlimited") + " " + t("feature.team.users"));
    }
  }
  
  // Add export formats if available
  if (plan.exportFormats && Array.isArray(plan.exportFormats) && plan.exportFormats.length > 0) {
    features.push(t("feature.export.formats", { formats: (plan.exportFormats as string[]).join(", ").toUpperCase() }));
  }
  
  // Add premium features based on plan type
  if (plan.name === "pro") {
    features.push(t("feature.advanced.tools"));
    features.push(t("feature.priority.support"));
  }
  
  if (plan.name === "team") {
    features.push(t("feature.advanced.tools"));
    features.push(t("feature.priority.support"));
  }
  
  if (plan.name === "enterprise") {
    features.push(t("feature.advanced.tools"));
    if (plan.hasSso) {
      features.push(t("feature.sso"));
    }
    if (plan.hasCustomIntegrations) {
      features.push(t("feature.custom.integrations"));
    }
    if (plan.has24x7Support) {
      features.push(t("feature.support"));
    }
    features.push(t("feature.onboarding"));
    features.push(t("feature.dedicated.manager"));
  }
  
  return features;
}

function PricingCard({ plan, isYearly, isPopular, onSelectPlan, isLoading }: PricingCardProps) {
  const { t, convertPrice } = useLanguage();
  
  const price = isYearly ? plan.priceYearly : plan.priceMonthly;
  const convertedPrice = convertPrice(price);
  const yearlyDiscount = isYearly && plan.priceMonthly > 0 ? 
    Math.round((1 - (plan.priceYearly / 12) / plan.priceMonthly) * 100) : 0;

  const getButtonText = () => {
    if (plan.name === "free") return t("btn.start.free");
    if (plan.name === "enterprise") return t("btn.contact.sales");
    return t("btn.start.trial");
  };

  const getButtonVariant = () => {
    if (isPopular) return "default";
    if (plan.name === "free") return "outline";
    return "outline";
  };

  return (
    <Card 
      className={`relative h-full flex flex-col ${isPopular ? 'border-blue-500 shadow-lg' : 'border-gray-200'} transition-transform hover:scale-105`}
      data-testid={`card-plan-${plan.name}`}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge className="bg-blue-500 text-white px-3 py-1">
            <Star className="w-3 h-3 mr-1" />
            {t("pricing.popular")}
          </Badge>
        </div>
      )}
      
      <CardHeader className="text-center pb-4">
        {plan.name === "team" && (
          <Badge variant="secondary" className="mx-auto w-fit mb-2">
            {t("pricing.teams")}
          </Badge>
        )}
        {plan.name === "enterprise" && (
          <Badge variant="secondary" className="mx-auto w-fit mb-2">
            {t("pricing.enterprise")}
          </Badge>
        )}
        
        <CardTitle className="text-2xl font-bold" data-testid={`text-plan-name-${plan.name}`}>
          {t(`plan.${plan.name}`)}
        </CardTitle>
        
        <div className="mt-4 mb-4">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold" data-testid={`text-price-${plan.name}`}>
              {convertedPrice.formattedPrice}
            </span>
            {plan.priceMonthly > 0 && (
              <span className="text-gray-500">
                {isYearly ? t("currency.year") : t("currency.month")}
              </span>
            )}
          </div>
          {yearlyDiscount > 0 && (
            <div className="text-sm text-green-600 font-medium mt-2">
              {t("currency.save", { percent: yearlyDiscount.toString() })}
            </div>
          )}
        </div>
        
        <CardDescription className="mt-4 mb-6 text-base min-h-[3rem] flex items-center justify-center">
          {t(`plan.${plan.name}.desc`)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex flex-col flex-1">
        <div className="flex-1">
          <ul className="space-y-3 mb-8">
            {getLocalizedFeatures(plan, t).map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                <span className="text-sm text-gray-700">{feature}</span>
              </li>
            ))}
          </ul>
          
          {/* Additional features for higher tier plans */}
          {plan.name !== "free" && (
            <div className="mb-4 text-sm text-blue-600 font-medium">
              +{plan.name === "pro" ? "7" : plan.name === "team" ? "6" : "6"} {t("pricing.additional.features")}
            </div>
          )}
        </div>
        
        <Button
          onClick={() => onSelectPlan(plan.id, isYearly ? "yearly" : "monthly")}
          variant={getButtonVariant()}
          className={`w-full ${isPopular ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
          disabled={isLoading}
          data-testid={`button-select-${plan.name}`}
        >
          {isLoading ? t("btn.processing") : getButtonText()}
          {plan.name !== "free" && plan.name !== "enterprise" && (
            <ArrowRight className="w-4 h-4 ml-2" />
          )}
        </Button>
        
        {(plan.name === "pro" || plan.name === "team") && (
          <div className="text-center mt-2">
            <span className="text-xs text-gray-500">
              {t("trial.info")}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { t } = useLanguage();

  const { data: plans = [], isLoading, error } = useQuery({
    queryKey: ["/api/subscription-plans"],
  });

  const createCheckoutMutation = useMutation({
    mutationFn: async ({ planId, billingPeriod }: { planId: string; billingPeriod: "monthly" | "yearly" }) => {
      const response = await apiRequest("POST", "/api/create-checkout-session", {
        planId,
        billingPeriod,
      });
      return response;
    },
    onSuccess: (data) => {
      if ((data as any).url) {
        // Redirect to Stripe Checkout
        window.location.href = (data as any).url;
      } else if ((data as any).subscription) {
        // Free plan subscription created
        toast({
          title: t("toast.plan.activated"),
          description: t("toast.plan.activated.desc"),
        });
        setLocation("/dashboard");
      }
    },
    onError: (error: any) => {
      toast({
        title: t("toast.error"),
        description: error.message || t("toast.error.desc"),
        variant: "destructive",
      });
    },
  });

  const handleSelectPlan = (planId: string, billingPeriod: "monthly" | "yearly") => {
    createCheckoutMutation.mutate({ planId, billingPeriod });
  };

  // Sort plans by order and filter active plans
  const sortedPlans = (plans as SubscriptionPlan[])
    .filter(plan => plan.isActive !== false) // Allow for undefined/null
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  if (isLoading) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-20">
        <div className="text-lg">{t("loading.plans")}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-20">
        <div className="text-lg text-red-600">Erro ao carregar planos</div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <div className="text-center pt-16 pb-12 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("pricing.title")}
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          {t("pricing.subtitle")}
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mt-8">
          <Label htmlFor="billing-toggle" className={`text-lg ${!isYearly ? 'font-semibold' : ''}`}>
            {t("pricing.monthly")}
          </Label>
          <Switch
            id="billing-toggle"
            checked={isYearly}
            onCheckedChange={setIsYearly}
            data-testid="switch-billing"
          />
          <Label htmlFor="billing-toggle" className={`text-lg ${isYearly ? 'font-semibold' : ''}`}>
            {t("pricing.yearly")}
            <Badge variant="secondary" className="ml-2 text-xs">
              {t("pricing.save")}
            </Badge>
          </Label>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedPlans.map((plan: SubscriptionPlan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              isYearly={isYearly}
              isPopular={plan.name === "pro"}
              onSelectPlan={handleSelectPlan}
              isLoading={createCheckoutMutation.isPending}
            />
          ))}
        </div>
      </div>

      {/* Detailed Comparison */}
      <div className="max-w-7xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("pricing.comparison")}
          </h2>
          <p className="text-lg text-gray-600">
            {t("pricing.comparison.subtitle")}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 uppercase tracking-wider">
                    {t("feature.title")}
                  </th>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <th key={plan.id} className="px-6 py-4 text-center text-sm font-medium text-gray-900 uppercase tracking-wider">
                      {t(`plan.${plan.name}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.projects")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {plan.maxProjects ? plan.maxProjects : t("feature.unlimited")}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.personas")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {plan.maxPersonasPerProject ? plan.maxPersonasPerProject : t("feature.unlimited")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.ai.chat")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {plan.aiChatLimit ? plan.aiChatLimit : t("feature.unlimited")}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.team.users")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center text-sm text-gray-700">
                      {plan.maxUsersPerTeam ? plan.maxUsersPerTeam : 
                       plan.name === "free" || plan.name === "pro" ? "1" : t("feature.unlimited")}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.collaboration")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.hasCollaboration ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.sso")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.hasSso ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{t("feature.support")}</td>
                  {sortedPlans.map((plan: SubscriptionPlan) => (
                    <td key={plan.id} className="px-6 py-4 text-center">
                      {plan.has24x7Support ? (
                        <Check className="w-5 h-5 text-green-500 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-gray-400 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto px-4 pb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            {t("faq.title")}
          </h2>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{t("faq.q1")}</h3>
            <p className="text-gray-600">
              {t("faq.a1")}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{t("faq.q2")}</h3>
            <p className="text-gray-600">
              {t("faq.a2")}
            </p>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="font-semibold text-lg mb-2">{t("faq.q3")}</h3>
            <p className="text-gray-600">
              {t("faq.a3")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}