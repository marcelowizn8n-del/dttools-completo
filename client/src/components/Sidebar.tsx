import { Calendar, BarChart3, FileText, Brain, Settings, TrendingUp, User } from "lucide-react";
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: location === "/" || location === "/dashboard" },
    { icon: FileText, label: "Weekly Reports", href: "/reports" },
    { icon: Calendar, label: "Project Management", href: "/projects" },
    { icon: Brain, label: "AI Insights", href: "/insights" },
    { icon: Settings, label: "Integrations", href: "/integrations" },
    { icon: TrendingUp, label: "Analytics", href: "/analytics" },
  ];

  return (
    <aside className="w-64 bg-card border-r border-border flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Calendar className="w-4 h-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-foreground">EventFlow Pro</h1>
            <p className="text-xs text-muted-foreground">Smart Event Automation</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <img 
            src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face" 
            alt="Sarah Johnson" 
            className="w-10 h-10 rounded-full object-cover"
            data-testid="img-user-avatar"
          />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground" data-testid="text-username">Sarah Johnson</p>
            <p className="text-xs text-muted-foreground" data-testid="text-user-role">Event Coordinator</p>
          </div>
          <button className="text-muted-foreground hover:text-foreground" data-testid="button-user-menu">
            <User className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
