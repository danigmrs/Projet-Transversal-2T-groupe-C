
// vérif pas champ vide (trim enleve espace)
export function isEmpty(value: string) {
  return !value || value.trim() === "";
}

//vérif email valide
export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
