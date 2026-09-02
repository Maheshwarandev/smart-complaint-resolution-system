import {
  LayoutDashboard, FileText, Plus, BarChart3, Users, Shield,
  UserCircle, LogOut, Search, Download, Send, Paperclip,
  MessageSquare, Clock, Star, AlertTriangle, Loader2, Camera,
  Pencil, User, Wrench, Crown, Tag, Zap, Calendar, ChevronDown,
  ChevronRight, X, Check, ArrowRight, Sun, Moon, Menu,
  Image, File as FileIcon, ExternalLink,
} from "lucide-react";

// Sidebar navigation icons by role
export const NAV_ICONS = {
  dashboard: LayoutDashboard,
  complaints: FileText,
  submit: Plus,
  analytics: BarChart3,
  users: Users,
  agents: Shield,
  profile: UserCircle,
  logout: LogOut,
};

// Complaint status icons
export const STATUS_ICONS = {
  Open: FileText,
  "In Progress": Zap,
  Resolved: Check,
  Closed: X,
};

// Demo login role icons
export const DEMO_ICONS = {
  user: User,
  agent: Wrench,
  admin: Crown,
};

// Meta info icons
export const META_ICONS = {
  user: User,
  category: Tag,
  priority: Zap,
  date: Calendar,
  assignee: UserCircle,
  attachments: Paperclip,
  comments: MessageSquare,
  timeline: Clock,
  search: Search,
  download: Download,
  send: Send,
  camera: Camera,
  edit: Pencil,
  star: Star,
  alert: AlertTriangle,
  loading: Loader2,
  theme: { light: Sun, dark: Moon },
  menu: Menu,
  close: X,
  external: ExternalLink,
  image: Image,
  file: FileIcon,
};
