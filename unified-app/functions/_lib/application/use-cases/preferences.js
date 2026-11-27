import { ValidationError } from "../../domain/errors.js";
import { avatar, color, optionalText, theme } from "../../domain/validation.js";

export function makePreferencesUseCases(repository) {
  return {
    get: (env, userId) => repository.get(env, userId),

    async update(env, userId, input) {
      const patch = {};
      const nextAvatar = avatar(input.avatar);
      if (nextAvatar !== undefined) patch.avatar = nextAvatar;
      const nextColor = color(input.accent);
      if (nextColor !== undefined) patch.accent = nextColor;
      const nextTheme = theme(input.theme);
      if (nextTheme !== undefined) patch.theme = nextTheme;

      if (input.displayName !== undefined) {
        const value = optionalText(input.displayName, 80, "Nombre para mostrar");
        if (value === "") throw new ValidationError("Nombre para mostrar inválido.");
        patch.display_name = value;
      }
      if (input.aiApiKey !== undefined) patch.ai_api_key = optionalText(input.aiApiKey, 512, "API key") || null;
      if (input.aiModel !== undefined) patch.ai_model = optionalText(input.aiModel, 80, "Modelo") || null;
      if (input.aiBaseUrl !== undefined) patch.ai_base_url = optionalText(input.aiBaseUrl, 200, "Endpoint") || null;

      const siteName = optionalText(input.siteName, 40, "Nombre de la web");
      if (siteName !== undefined && !siteName) throw new ValidationError("El nombre de la web debe tener entre 1 y 40 caracteres.");
      if (siteName !== undefined) patch.siteName = siteName;

      const tagline = optionalText(input.siteTagline, 80, "Subtítulo");
      if (tagline !== undefined) patch.siteTagline = tagline;
      const description = optionalText(input.siteDescription, 160, "Descripción");
      if (description !== undefined) patch.siteDescription = description;

      return repository.update(env, userId, patch);
    },
  };
}
