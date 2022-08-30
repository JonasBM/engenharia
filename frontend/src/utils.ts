import { UserProfileSerializer } from "./api/types/accountsTypes";

export const decimalFormatter = (
  value?: string | number | null,
  decimals: number = 2
) => {
  return value?.toLocaleString("pt-BR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const getUserInitials = (
  user?: UserProfileSerializer | null
): string => {
  if (user) {
    if (user.first_name) {
      return `${user.first_name.charAt(0)}${user.last_name?.charAt(
        0
      )}`.toUpperCase();
    } else {
      return user.username.charAt(0).toUpperCase();
    }
  }
  return "";
};

export const getUserFullName = (
  user?: UserProfileSerializer | null
): string => {
  if (user) {
    if (user.first_name) {
      return `${user.first_name} ${user.last_name}`;
    } else {
      return user.username;
    }
  }
  return "";
};

export const addServerErrors = <T>(
  errors: { [P in keyof T]?: string[] },
  setError: (
    fieldName: keyof T,
    error: { type: string; message: string }
  ) => void
) => {
  return Object.keys(errors).forEach((key) => {
    setError(key as keyof T, {
      type: "server",
      message: errors[key as keyof T]!.join(". "),
    });
  });
};

export const saveFile = (
  content: string,
  fileName: string,
  contentType: string
) => {
  var a = document.createElement("a");
  var file = new Blob([content], { type: contentType });
  a.href = URL.createObjectURL(file);
  a.download = fileName;
  a.click();
};

export const sanitizeFilename = (filename: string) => {
  return filename.replace(/[/\\?%*:|"<>#$!`&@{}='+=]/g, "");
};
