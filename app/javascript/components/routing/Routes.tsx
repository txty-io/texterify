const Routes = {
    AUTH: {
        LOGIN: "/",
        LOGOUT: "/logout",
        SIGNUP: "/signup",
        FORGOTT_PASSWORD: "/forgot-password",
        ACCOUNT_CONFIRMATION: "/account-confirmation",
        NEW_PASSWORD_SITE: "/new-password"
    },
    OTHER: {
        ROOT: "/",
        TERMS_OF_SERVICE: "/terms-of-service",
        PRIVACY_POLICY: "/privacy-policy",
        ABOUT: "/about",
        CONTACT: "/contact",
        CODE: "/code",
        TOOLS: "/tools"
    },
    PRODUCT: {
        FEATURES: "/features",
        PRICING: "/pricing",
        API_DOCS: "/documentation"
    },
    PAYMENT: {
        NEW: "/checkout",
        SUCCESS: "/checkout/success",
        ERROR: "/checkout/error"
    },
    DASHBOARD: {
        ROOT: "/dashboard",
        PROJECTS: "/dashboard/projects",
        ACTIVITY: "/dashboard/activity",
        PROJECT: "/dashboard/projects/:projectId",
        PROJECT_LANGUAGES: "/dashboard/projects/:projectId/languages",
        PROJECT_IMPORT: "/dashboard/projects/:projectId/import",
        PROJECT_EXPORT: "/dashboard/projects/:projectId/export",
        PROJECT_MEMBERS: "/dashboard/projects/:projectId/members",
        PROJECT_EXPORT_CONFIGURATIONS: "/dashboard/projects/:projectId/export/configurations",
        PROJECT_EXPORT_HIERARCHY: "/dashboard/projects/:projectId/export/hierarchy",
        PROJECT_SETTINGS: "/dashboard/projects/:projectId/settings",
        PROJECT_KEYS: "/dashboard/projects/:projectId/keys",
        PROJECT_ACTIVITY: "/dashboard/projects/:projectId/activity",
        PROJECT_INTEGRATIONS: "/dashboard/projects/:projectId/integrations",
        PROJECT_VALIDATIONS: "/dashboard/projects/:projectId/validations",
        PROJECT_OTA: "/dashboard/projects/:projectId/over-the-air",
        PROJECT_POST_PROCESSING: "/dashboard/projects/:projectId/post-processing",
        PROJECT_EDITOR: "/dashboard/projects/:projectId/editor",
        PROJECT_EDITOR_KEY: "/dashboard/projects/:projectId/editor/:keyId",
        TEAMS: "/dashboard/teams",
        TEAMS_NEW: "/dashboard/teams/new",
        MEMBERS: "/dashboard/members",
        SETTINGS: "/dashboard/settings",
        ORGANIZATIONS: "/dashboard/organizations",
        ORGANIZATION: "/dashboard/organizations/:organizationId",
        ORGANIZATION_MEMBERS: "/dashboard/organizations/:organizationId/members",
        ORGANIZATION_SETTINGS: "/dashboard/organizations/:organizationId/settings"
    },
    USER: {
        SETTINGS: {
            ROOT: "/dashboard/settings/",
            ACCOUNT: "/dashboard/settings/account",
            ACCESS_TOKENS: "/dashboard/settings/access-tokens"
        }
    }
};

export { Routes };
