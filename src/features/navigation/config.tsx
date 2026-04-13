import type { LucideIcon } from "lucide-react";
import {
  Bell,
  BookOpen,
  FolderKanban,
  Heart,
  History,
  Home,
  MessageSquare,
  PanelTop,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  UserCircle2,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const primaryNavigation: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/explorer", label: "Explorer", icon: Search },
  { href: "/comparer", label: "Comparer", icon: SlidersHorizontal },
  { href: "/projets", label: "Projets", icon: FolderKanban },
  { href: "/guide", label: "Guide", icon: BookOpen },
  { href: "/forum", label: "Forum", icon: MessageSquare },
];

export const mobileMainNavigation: NavItem[] = [
  { href: "/", label: "Accueil", icon: Home },
  { href: "/explorer", label: "Explorer", icon: Search },
  { href: "/projets", label: "Projets", icon: FolderKanban },
  { href: "/guide", label: "Guide", icon: BookOpen },
];

export const accountNavigation: NavItem[] = [
  { href: "/profil", label: "Mon profil", icon: UserCircle2 },
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/projets", label: "Projets", icon: FolderKanban },
  { href: "/assistant", label: "Assistant Mimo", icon: Sparkles },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];

export const mobileMoreNavigation: NavItem[] = [
  { href: "/profil", label: "Profil", icon: UserCircle2 },
  { href: "/favoris", label: "Favoris", icon: Heart },
  { href: "/comparer", label: "Comparer", icon: SlidersHorizontal },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
  { href: "/forum", label: "Forum", icon: MessageSquare },
  { href: "/historique", label: "Historique", icon: History },
  { href: "/notifications", label: "Notifications", icon: Bell },
  { href: "/pro", label: "MAREF Pro", icon: PanelTop },
  { href: "/parametres", label: "Paramètres", icon: Settings },
];
