"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pencil,
  Check,
  X,
  Lock,
  Upload,
  User,
  Trophy,
  Flag,
  Calendar,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { UserProfile, UsernameValidation } from "@/types/user";
import Link from "next/link";

// Mock data - En producción esto vendría de una API
const mockUserProfile: UserProfile = {
  id: "1",
  username: "C4rnage",
  email: "c4rnage@hack2dawn.com",
  avatar: null,
  teamId: "team-1",
  teamName: "NullPointers",
  registeredAt: "2026-03-14T10:30:00Z",
  flagsCaptured: 42,
  userRank: 7,
  usernameChangeCount: 0,
};

interface Toast {
  id: number;
  message: string;
  type: "success" | "error";
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile>(mockUserProfile);
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [tempUsername, setTempUsername] = useState(profile.username);
  const [usernameValidation, setUsernameValidation] = useState<UsernameValidation>({ isValid: true });
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_USERNAME_CHANGES = 2;
  const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
  const MAX_IMAGE_SIZE = 2 * 1024 * 1024; // 2MB
  const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

  // Toast utilities
  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Validar username en tiempo real
  useEffect(() => {
    if (!isEditingUsername) return;

    const validateUsername = async () => {
      const trimmed = tempUsername.trim();

      // Validación de formato
      if (!USERNAME_REGEX.test(trimmed)) {
        setUsernameValidation({
          isValid: false,
          error: "El username debe tener 3-20 caracteres (letras, números, _ o -)",
        });
        return;
      }

      // Validación de username igual al anterior
      if (trimmed === profile.username) {
        setUsernameValidation({
          isValid: false,
          error: "El nuevo username no puede ser igual al anterior",
        });
        return;
      }

      // Simular verificación de disponibilidad del username
      setIsCheckingUsername(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsCheckingUsername(false);

      // Mock: Simular que "admin" ya está tomado
      if (trimmed.toLowerCase() === "admin") {
        setUsernameValidation({
          isValid: false,
          error: "Este nombre de usuario no está disponible",
        });
        return;
      }

      setUsernameValidation({ isValid: true });
    };

    validateUsername();
  }, [tempUsername, isEditingUsername, profile.username]);

  // Handlers de username
  const handleEditUsername = () => {
    if (profile.usernameChangeCount >= MAX_USERNAME_CHANGES) {
      showToast(`Solo puedes cambiar tu username ${MAX_USERNAME_CHANGES} veces durante el evento`, "error");
      return;
    }
    setIsEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    if (!usernameValidation.isValid) return;

    // Simular llamada a API
    await new Promise((resolve) => setTimeout(resolve, 500));

    setProfile((prev) => ({
      ...prev,
      username: tempUsername,
      usernameChangeCount: prev.usernameChangeCount + 1,
    }));

    setIsEditingUsername(false);
    showToast("Username actualizado correctamente", "success");
  };

  const handleCancelUsername = () => {
    setTempUsername(profile.username);
    setIsEditingUsername(false);
    setUsernameValidation({ isValid: true });
  };

  // Handlers de imagen
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Solo se permiten archivos .jpg, .jpeg, .png o .webp");
      return;
    }

    // Validar tamaño
    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("La imagen no debe superar 2MB");
      return;
    }

    setImageError(null);
    setSelectedFile(file);

    // Generar preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmImage = async () => {
    if (!selectedFile) return;

    // Simular subida de imagen
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setProfile((prev) => ({
      ...prev,
      avatar: imagePreview,
    }));

    showToast("Foto de perfil actualizada", "success");
    setImagePreview(null);
    setSelectedFile(null);
  };

  const handleCancelImage = () => {
    setImagePreview(null);
    setSelectedFile(null);
    setImageError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Formatear fecha de registro
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  const canChangeUsername = profile.usernameChangeCount < MAX_USERNAME_CHANGES;

  return (
    <div className="relative min-h-screen bg-background">
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-right",
              toast.type === "success"
                ? "bg-green-900/90 border border-green-500/50 text-green-100"
                : "bg-red-900/90 border border-red-500/50 text-red-100"
            )}
          >
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-pink mb-2">Perfil de Usuario</h1>
          <p className="text-white/60">
            Gestiona tu información personal y personalización
          </p>
        </div>

        {/* Profile card */}
        <div className="border border-purple/30 rounded-lg bg-purple-dark/20 backdrop-blur-sm p-8">
          {/* Avatar section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative group">
              <div
                onClick={handleAvatarClick}
                className="relative w-32 h-32 rounded-full border-4 border-pink/50 overflow-hidden cursor-pointer transition-transform hover:scale-105"
              >
                {imagePreview || profile.avatar ? (
                  <img
                    src={imagePreview || profile.avatar!}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-purple flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Upload className="w-8 h-8 text-white" />
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            {imageError && (
              <p className="mt-2 text-red-400 text-sm">{imageError}</p>
            )}

            {imagePreview && (
              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleConfirmImage}
                  variant="default"
                  size="sm"
                  className="bg-pink hover:bg-pink/80"
                >
                  <Check className="w-4 h-4 mr-1" />
                  Confirmar
                </Button>
                <Button
                  onClick={handleCancelImage}
                  variant="outline"
                  size="sm"
                >
                  <X className="w-4 h-4 mr-1" />
                  Cancelar
                </Button>
              </div>
            )}

            <p className="mt-3 text-xs text-white/50">
              Click en la foto para cambiarla (máx. 2MB)
            </p>
          </div>

          {/* Profile information */}
          <div className="space-y-6">
            {/* Username field */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Username
              </label>
              <div className="relative">
                {isEditingUsername ? (
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <Input
                          value={tempUsername}
                          onChange={(e) => setTempUsername(e.target.value)}
                          className={cn(
                            "border-purple/50 focus:border-pink",
                            !usernameValidation.isValid && "border-red-500"
                          )}
                          placeholder="Ingresa tu username"
                          maxLength={20}
                        />
                        {!usernameValidation.isValid && usernameValidation.error && (
                          <p className="mt-1 text-sm text-red-400">
                            {usernameValidation.error}
                          </p>
                        )}
                        {isCheckingUsername && (
                          <p className="mt-1 text-sm text-white/50">
                            Verificando disponibilidad...
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={handleSaveUsername}
                        disabled={!usernameValidation.isValid || isCheckingUsername}
                        size="icon"
                        className="bg-pink hover:bg-pink/80"
                      >
                        <Check className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={handleCancelUsername}
                        variant="outline"
                        size="icon"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 border border-purple/30 rounded-lg bg-purple-dark/30">
                      <p className="text-white font-medium">{profile.username}</p>
                    </div>
                    <Button
                      onClick={handleEditUsername}
                      variant="ghost"
                      size="icon"
                      disabled={!canChangeUsername}
                      title={
                        !canChangeUsername
                          ? "Has alcanzado el límite de cambios de username"
                          : "Editar username"
                      }
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <p className="mt-1 text-xs text-white/50">
                  {canChangeUsername
                    ? `Puedes cambiar tu username ${MAX_USERNAME_CHANGES - profile.usernameChangeCount} vez${MAX_USERNAME_CHANGES - profile.usernameChangeCount === 1 ? "" : "es"} más`
                    : "Has alcanzado el límite de cambios de username"}
                </p>
              </div>
            </div>

            {/* Email field (read-only) */}
            <div>
              <label className="block text-sm font-medium text-white/80 mb-2">
                Email
              </label>
              <div className="flex items-center gap-2">
                <div className="flex-1 px-3 py-2 border border-purple/30 rounded-lg bg-purple-dark/10 opacity-60">
                  <p className="text-white">{profile.email}</p>
                </div>
                <div className="p-2 border border-purple/30 rounded-lg bg-purple-dark/10">
                  <Lock className="w-4 h-4 text-white/50" />
                </div>
              </div>
              <p className="mt-1 text-xs text-white/50">
                El email no puede ser modificado
              </p>
            </div>

            {/* Stats section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-purple/30">
              {/* Team */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-dark/30 border border-purple/20">
                <div className="p-2 rounded-lg bg-pink/10">
                  <Users className="w-5 h-5 text-pink" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Equipo</p>
                  {profile.teamId && profile.teamName ? (
                    <Link
                      href="/dashboard/team"
                      className="text-pink hover:text-pink/80 font-medium transition-colors"
                    >
                      {profile.teamName}
                    </Link>
                  ) : (
                    <p className="text-white/50 text-sm">Sin equipo</p>
                  )}
                </div>
              </div>

              {/* Registration date */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-dark/30 border border-purple/20">
                <div className="p-2 rounded-lg bg-orange/10">
                  <Calendar className="w-5 h-5 text-orange" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Miembro desde</p>
                  <p className="text-white font-medium">
                    {formatDate(profile.registeredAt)}
                  </p>
                </div>
              </div>

              {/* Flags captured */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-dark/30 border border-purple/20">
                <div className="p-2 rounded-lg bg-yellow/10">
                  <Flag className="w-5 h-5 text-yellow" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Flags capturadas</p>
                  <p className="text-white font-medium text-xl">
                    {profile.flagsCaptured}
                  </p>
                </div>
              </div>

              {/* User rank */}
              <div className="flex items-start gap-3 p-4 rounded-lg bg-purple-dark/30 border border-purple/20">
                <div className="p-2 rounded-lg bg-purple/20">
                  <Trophy className="w-5 h-5 text-purple" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/60 mb-1">Posición</p>
                  <p className="text-white font-medium text-xl">
                    #{profile.userRank}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}