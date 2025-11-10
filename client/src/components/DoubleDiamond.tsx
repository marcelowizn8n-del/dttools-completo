import { Fragment, type ComponentType } from "react";
import { Users, Target, Lightbulb, TestTube, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

interface DoubleDiamondProps {
  currentPhase?: number;
}

type StageStatus = "completed" | "active" | "upcoming";

type StageConfig = {
  id: "discover" | "define" | "develop" | "deliver";
  icon: ComponentType<{ className?: string }>;
  phases: number[];
  gradient: string;
};

const stageConfig: StageConfig[] = [
  {
    id: "discover",
    icon: Users,
    phases: [1],
    gradient: "from-sky-400 via-sky-500 to-blue-600",
  },
  {
    id: "define",
    icon: Target,
    phases: [2],
    gradient: "from-indigo-400 via-indigo-500 to-purple-600",
  },
  {
    id: "develop",
    icon: Lightbulb,
    phases: [3, 4],
    gradient: "from-amber-300 via-orange-400 to-orange-500",
  },
  {
    id: "deliver",
    icon: TestTube,
    phases: [5],
    gradient: "from-emerald-400 via-emerald-500 to-teal-600",
  },
];

const diamondStyles: Record<StageStatus, string> = {
  completed: "shadow-xl",
  active: "shadow-lg animate-pulse",
  upcoming: "opacity-70 border border-white/40",
};

const connectorStyles: Record<StageStatus, { horizontal: string; vertical: string }> = {
  completed: {
    horizontal: "bg-gradient-to-r from-emerald-400 to-emerald-500",
    vertical: "bg-gradient-to-b from-emerald-400 to-emerald-500",
  },
  active: {
    horizontal: "bg-gradient-to-r from-blue-400 to-indigo-500",
    vertical: "bg-gradient-to-b from-blue-400 to-indigo-500",
  },
  upcoming: {
    horizontal: "bg-gradient-to-r from-gray-300 to-gray-200",
    vertical: "bg-gradient-to-b from-gray-300 to-gray-200",
  },
};

const badgeStyles: Record<StageStatus, string> = {
  completed: "bg-emerald-100 text-emerald-700 border-emerald-200",
  active: "bg-blue-100 text-blue-700 border-blue-200",
  upcoming: "bg-gray-100 text-gray-600 border-gray-200",
};

function getStageStatus(currentPhase: number, stagePhases: number[]): StageStatus {
  const minPhase = Math.min(...stagePhases);
  const maxPhase = Math.max(...stagePhases);

  if (currentPhase > maxPhase) return "completed";
  if (currentPhase >= minPhase && currentPhase <= maxPhase) return "active";
  return "upcoming";
}

export function DoubleDiamond({ currentPhase = 1 }: DoubleDiamondProps) {
  const { t } = useLanguage();
  const stageStatuses = stageConfig.map((stage) =>
    getStageStatus(currentPhase, stage.phases)
  );

  return (
    <div className="rounded-3xl border border-blue-100 bg-white shadow-lg">
      <div className="border-b border-blue-50 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-6 py-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("doubleDiamond.title")}
        </h2>
        <p className="mt-2 text-sm text-gray-600 max-w-3xl">
          {t("doubleDiamond.subtitle")}
        </p>
      </div>

      <div className="hidden md:flex items-center gap-6 px-10 py-10">
        {stageConfig.map((stage, index) => {
          const StatusIcon = stage.icon;
          const status = stageStatuses[index];

          return (
            <Fragment key={stage.id}>
              <div className="flex flex-col items-center text-center min-w-[190px]">
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-32 w-32 rotate-45 items-center justify-center rounded-3xl bg-gradient-to-br text-white transition-all duration-300",
                      `bg-gradient-to-br ${stage.gradient}`,
                      diamondStyles[status]
                    )}
                  >
                    <StatusIcon className="h-10 w-10 -rotate-45" />
                  </div>
                  {status === "completed" && (
                    <div className="absolute -top-3 -right-3 rounded-full border border-emerald-100 bg-white p-1.5 shadow-md">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                    {t("doubleDiamond.sequence", { number: String(index + 1).padStart(2, "0") })}
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">
                    {t(`doubleDiamond.${stage.id}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(`doubleDiamond.${stage.id}.description`)}
                  </p>
                  <Badge variant="outline" className={cn("mt-2", badgeStyles[status])}>
                    {t(`doubleDiamond.status.${status}`)}
                  </Badge>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t(`doubleDiamond.${stage.id}.phases`)}
                  </p>
                </div>
              </div>

              {index < stageConfig.length - 1 && (
                <div className="flex flex-1 items-center">
                  <div className={cn("h-1 w-full rounded-full", connectorStyles[status].horizontal)} />
                </div>
              )}
            </Fragment>
          );
        })}
      </div>

      <div className="flex flex-col items-center gap-8 px-6 py-8 md:hidden">
        {stageConfig.map((stage, index) => {
          const StatusIcon = stage.icon;
          const status = stageStatuses[index];

          return (
            <Fragment key={stage.id}>
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-28 w-28 rotate-45 items-center justify-center rounded-3xl bg-gradient-to-br text-white transition-all duration-300",
                      `bg-gradient-to-br ${stage.gradient}`,
                      diamondStyles[status]
                    )}
                  >
                    <StatusIcon className="h-9 w-9 -rotate-45" />
                  </div>
                  {status === "completed" && (
                    <div className="absolute -top-3 -right-3 rounded-full border border-emerald-100 bg-white p-1.5 shadow-md">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                  )}
                </div>

                <div className="mt-4 space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-500">
                    {t("doubleDiamond.sequence", { number: String(index + 1).padStart(2, "0") })}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t(`doubleDiamond.${stage.id}.title`)}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {t(`doubleDiamond.${stage.id}.description`)}
                  </p>
                  <Badge variant="outline" className={cn("mt-2", badgeStyles[status])}>
                    {t(`doubleDiamond.status.${status}`)}
                  </Badge>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    {t(`doubleDiamond.${stage.id}.phases`)}
                  </p>
                </div>
              </div>

              {index < stageConfig.length - 1 && (
                <div
                  className={cn("w-1 rounded-full", connectorStyles[status].vertical)}
                  style={{ height: "72px" }}
                />
              )}
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}
