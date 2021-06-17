const Routes = {
    ROOT: "/",
    AUTH: {
        LOGIN: "/",
        LOGOUT: "/logout",
        SIGNUP: "/signup",
        FORGOTT_PASSWORD: "/forgot-password",
        ACCOUNT_CONFIRMATION: "/account-confirmation",
        NEW_PASSWORD_SITE: "/new-password"
    },
    ERRORS: {
        INVALID_PASSWORD_RESET_LINK: "/invalid-password-reset-link",
        INVALID_ACCOUNT_CONFIRMATION_LINK: "/invalid-account-confirmation-link"
    },
    OTHER: {
        TERMS_OF_SERVICE: "https://texterify.com/terms-of-service",
        PRIVACY_POLICY: "https://texterify.com/privacy-policy"
    },
    PRODUCT: {
        FEATURES: "/features",
        PRICING: "/pricing",
        API_DOCS: "/documentation"
    },
    PAYMENT: {
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
        PROJECT_MACHINE_TRANSLATION: "/dashboard/projects/:projectId/machine-translation",
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
        SETUP: "/dashboard/setup",
        SETUP_ORGANIZATION_NEW: "/dashboard/setup/organization",
        SETUP_ORGANIZATION: "/dashboard/setup/organization/:organizationId",
        SETUP_ORGANIZATION_RESOLVER: (options: { organizationId: string }) => {
            return Routes.DASHBOARD.SETUP_ORGANIZATION.replace(":organizationId", options.organizationId);
        },
        SETUP_PROJECT_NEW: "/dashboard/setup/organization/:organizationId/project",
        SETUP_PROJECT: "/dashboard/setup/organization/:organizationId/project/:projectId",
        SETUP_PROJECT_RESOLVER: (options: { organizationId: string; projectId: string }) => {
            return Routes.DASHBOARD.SETUP_PROJECT.replace(":organizationId", options.organizationId).replace(
                ":projectId",
                options.projectId
            );
        },
        SETUP_PROJECT_LANGUAGES: "/dashboard/setup/organization/:organizationId/project/:projectId/languages",
        SETUP_PROJECT_LANGUAGES_RESOLVER: (options: { organizationId: string; projectId: string }) => {
            return Routes.DASHBOARD.SETUP_PROJECT_LANGUAGES.replace(":organizationId", options.organizationId).replace(
                ":projectId",
                options.projectId
            );
        },
        ORGANIZATIONS: "/dashboard/organizations",
        ORGANIZATION: "/dashboard/organizations/:organizationId",
        ORGANIZATION_MEMBERS: "/dashboard/organizations/:organizationId/members",
        ORGANIZATION_SETTINGS: "/dashboard/organizations/:organizationId/settings",
        ORGANIZATION_SUBSCRIPTION: "/dashboard/organizations/:organizationId/subscription",
        ORGANIZATION_MACHINE_TRANSLATION: "/dashboard/organizations/:organizationId/machine-translation",
        INSTANCE: {
            ROOT: "/dashboard/instance",
            LICENSES: "/dashboard/instance/licenses",
            SETTINGS: "/dashboard/instance/settings"
        }
    },
    USER: {
        SETTINGS: {
            ROOT: "/dashboard/settings/",
            ACCOUNT: "/dashboard/settings/account",
            ACCESS_TOKENS: "/dashboard/settings/access-tokens",
            LICENSES: "/dashboard/settings/licenses",
            ABOUT: "/dashboard/settings/about"
        }
    }
};

export { Routes };
