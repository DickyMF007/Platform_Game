export const ADMIN_USERNAME = "eveadmin";
export const ADMIN_PASSWORD = "eve3302";
export const ADMIN_SESSION_KEY = "eve-admin-session";

export function isValidAdminCredential(username: string, password: string) {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD;
}
