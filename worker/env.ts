export type Env = {
  DB: D1Database
  /** Cloudflare Access team domain, e.g. myteam.cloudflareaccess.com */
  TEAM_DOMAIN: string
  /** Audience (AUD) tag of the Access application */
  POLICY_AUD: string
  /** Local development only. Set in .dev.vars, never in wrangler.jsonc. */
  DEV_AUTH_BYPASS?: string
}
