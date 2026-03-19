"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Boxes } from "@/components/ui/background-boxes";
import SectionHeader from "@/components/shared/SectionHeader";
import { CtfCard } from "@/components/shared/CtfCard";
import { cn } from "@/lib/utils";
import { UserProfile, UsernameValidation } from "@/types/user";
import "@hackernoon/pixel-icon-library/fonts/iconfont.css";

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

const MAX_USERNAME_CHANGES = 2;
const USERNAME_REGEX = /^[a-zA-Z0-9_-]{3,20}$/;
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

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

  const showToast = (message: string, type: "success" | "error") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!isEditingUsername) return;

    const validateUsername = async () => {
      const trimmed = tempUsername.trim();

      if (!USERNAME_REGEX.test(trimmed)) {
        setUsernameValidation({
          isValid: false,
          error: "El username debe tener 3-20 caracteres (letras, numeros, _ o -)",
        });
        return;
      }

      if (trimmed === profile.username) {
        setUsernameValidation({
          isValid: false,
          error: "El nuevo username no puede ser igual al anterior",
        });
        return;
      }

      setIsCheckingUsername(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
      setIsCheckingUsername(false);

      if (trimmed.toLowerCase() === "admin") {
        setUsernameValidation({
          isValid: false,
          error: "Este nombre de usuario no esta disponible",
        });
        return;
      }

      setUsernameValidation({ isValid: true });
    };

    validateUsername();
  }, [tempUsername, isEditingUsername, profile.username]);

  const handleEditUsername = () => {
    if (profile.usernameChangeCount >= MAX_USERNAME_CHANGES) {
      showToast(`Solo puedes cambiar tu username ${MAX_USERNAME_CHANGES} veces durante el evento`, "error");
      return;
    }
    setIsEditingUsername(true);
  };

  const handleSaveUsername = async () => {
    if (!usernameValidation.isValid) return;

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError("Solo se permiten archivos .jpg, .jpeg, .png o .webp");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("La imagen no debe superar 2MB");
      return;
    }

    setImageError(null);
    setSelectedFile(file);

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleConfirmImage = async () => {
    if (!selectedFile) return;

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
    <main className="min-h-screen relative w-full overflow-hidden bg-[#0a0006] px-4 py-12">
      <div className="absolute inset-0 z-0 hidden md:block">
        <Boxes />
      </div>
      <div className="absolute inset-0 z-10 bg-[radial-gradient(circle_at_top,rgba(239,1,186,0.22),transparent_55%),linear-gradient(180deg,rgba(10,0,6,0.12)_0%,rgba(10,0,6,0.94)_100%)] pointer-events-none" />

      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              "flex items-center gap-2 px-4 py-3 border shadow-lg backdrop-blur-sm animate-in slide-in-from-right",
              toast.type === "success"
                ? "bg-green-900/90 border-green-500/50 text-green-100"
                : "bg-red-900/90 border-red-500/50 text-red-100"
            )}
          >
            <span className="flex-1 text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Cerrar"
            >
              x
            </button>
          </div>
        ))}
      </div>

      <div className="relative z-20 mx-auto w-full max-w-6xl space-y-7">
        <SectionHeader
          label="// account.profile"
          title="Perfil de Operador"
          accentColor="#EF01BA"
          className="mb-3"
        />

        <section className="border border-white/10 bg-black/55 backdrop-blur-md p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
            <div className="space-y-6">
              <div className="border border-white/10 bg-black/40 p-5">
                <div className="flex items-center gap-3 mb-4">
                  <i className="hn hn-user-solid text-[#EF01BA] text-lg" aria-hidden="true" />
                  <h2 className="font-mono text-xs uppercase tracking-[0.24em] text-white/65">
                    Identidad del jugador
                  </h2>
                </div>

                <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
                  <div className="relative group">
                    <div
                      onClick={handleAvatarClick}
                      className="relative w-28 h-28 border-2 border-[#EF01BA]/50 overflow-hidden cursor-pointer transition-transform hover:scale-105 bg-black/40"
                    >
                      {imagePreview || profile.avatar ? (
                        <Image
                          src={imagePreview || profile.avatar!}
                          alt="Avatar"
                          fill
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl text-[#EF01BA]">
                          @
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/65 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="font-mono text-[10px] tracking-widest text-white/85">UPLOAD</span>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      onChange={handleFileSelect}
                      aria-label="Subir foto de perfil"
                      title="Subir foto de perfil"
                      className="hidden"
                    />
                  </div>

                  <div className="w-full space-y-3">
                    {imageError && <p className="text-red-400 text-sm">{imageError}</p>}

                    {imagePreview && (
                      <div className="flex gap-2">
                        <Button
                          onClick={handleConfirmImage}
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none"
                        >
                          [ CONFIRMAR ]
                        </Button>
                        <Button
                          onClick={handleCancelImage}
                          variant="ghost"
                          size="sm"
                          className="font-mono text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-none"
                        >
                          [ CANCELAR ]
                        </Button>
                      </div>
                    )}

                    <p className="text-xs text-white/50">Click en la imagen para cambiarla (max. 2MB).</p>
                  </div>
                </div>
              </div>

              <div className="border border-white/10 bg-black/40 p-5 space-y-5">
                <div>
                  <label className="block text-xs font-mono tracking-widest text-white/60 mb-2">USERNAME</label>
                  {isEditingUsername ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            value={tempUsername}
                            onChange={(e) => setTempUsername(e.target.value)}
                            className={cn(
                              "rounded-none bg-black/50 border-white/20 focus:border-[#EF01BA]",
                              !usernameValidation.isValid && "border-red-500"
                            )}
                            placeholder="Ingresa tu username"
                            maxLength={20}
                          />
                          {!usernameValidation.isValid && usernameValidation.error && (
                            <p className="mt-1 text-sm text-red-400">{usernameValidation.error}</p>
                          )}
                          {isCheckingUsername && (
                            <p className="mt-1 text-sm text-white/50">Verificando disponibilidad...</p>
                          )}
                        </div>
                        <Button
                          onClick={handleSaveUsername}
                          disabled={!usernameValidation.isValid || isCheckingUsername}
                          variant="ghost"
                          className="font-mono text-xs text-[#00F0FF] hover:text-black hover:bg-[#00F0FF] rounded-none"
                        >
                          [ OK ]
                        </Button>
                        <Button
                          onClick={handleCancelUsername}
                          variant="ghost"
                          className="font-mono text-xs text-white/70 hover:text-white hover:bg-white/10 rounded-none"
                        >
                          [ X ]
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2 border border-white/20 bg-black/45">
                        <p className="text-white font-medium">{profile.username}</p>
                      </div>
                      <Button
                        onClick={handleEditUsername}
                        variant="ghost"
                        size="sm"
                        disabled={!canChangeUsername}
                        title={
                          !canChangeUsername
                            ? "Has alcanzado el limite de cambios de username"
                            : "Editar username"
                        }
                        className="font-mono text-xs text-[#EF01BA] hover:text-black hover:bg-[#EF01BA] rounded-none"
                      >
                        [ EDITAR ]
                      </Button>
                    </div>
                  )}
                  <p className="mt-1 text-xs text-white/50">
                    {canChangeUsername
                      ? `Puedes cambiar tu username ${MAX_USERNAME_CHANGES - profile.usernameChangeCount} vez${MAX_USERNAME_CHANGES - profile.usernameChangeCount === 1 ? "" : "es"} mas`
                      : "Has alcanzado el limite de cambios de username"}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-mono tracking-widest text-white/60 mb-2">EMAIL</label>
                  <div className="px-3 py-2 border border-white/10 bg-black/30 opacity-70">
                    <p className="text-white">{profile.email}</p>
                  </div>
                  <p className="mt-1 text-xs text-white/50">El email no puede ser modificado.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <CtfCard
                label="team"
                title={profile.teamName ?? "Sin equipo"}
                description={profile.teamId ? "Equipo activo en competencia." : "Unete a un equipo para competir."}
                accentColor="#00F0FF"
                icon={<i className="hn hn-users-solid text-[#00F0FF] text-xl" aria-hidden="true" />}
                badge="01"
              >
                {profile.teamId && (
                  <Link href="/dashboard/team" className="font-mono text-xs text-[#00F0FF] hover:text-white">
                    [ VER TEAM DASHBOARD ]
                  </Link>
                )}
              </CtfCard>

              <CtfCard
                label="flags"
                title={`${profile.flagsCaptured}`}
                description="Flags resueltas durante el evento."
                accentColor="#FEF759"
                icon={<i className="hn hn-flag-solid text-[#FEF759] text-xl" aria-hidden="true" />}
                badge="02"
              />

              <CtfCard
                label="member"
                title={formatDate(profile.registeredAt)}
                description="Fecha de ingreso al evento."
                accentColor="#F77200"
                icon={<i className="hn hn-calender-solid text-[#F77200] text-xl" aria-hidden="true" />}
                badge="03"
              />

              <CtfCard
                label="rank"
                title={`#${profile.userRank}`}
                description="Posicion individual en el scoreboard."
                accentColor="#940992"
                icon={<i className="hn hn-trophy-solid text-[#940992] text-xl" aria-hidden="true" />}
                badge="04"
              />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
