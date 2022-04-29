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
        PRIVACY_POLICY: "https://texterify.com/privacy-policy",
        WORDPRESS_INTEGRATION_GUIDE: "https://docs.texterify.com/integrations/wordpress",
        PLACEHOLDERS: "https://docs.texterify.com/placeholders"
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
        PROJECT_IMPORT_FILE: "/dashboard/projects/:projectId/import/file",
        PROJECT_IMPORT_FILE_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_IMPORT_FILE.replace(":projectId", options.projectId);
        },
        PROJECT_IMPORT_GITHUB: "/dashboard/projects/:projectId/import/github",
        PROJECT_EXPORT: "/dashboard/projects/:projectId/export",
        PROJECT_MEMBERS: "/dashboard/projects/:projectId/members",
        PROJECT_MACHINE_TRANSLATION: "/dashboard/projects/:projectId/machine-translation",
        PROJECT_MACHINE_TRANSLATION_SETTINGS: "/dashboard/projects/:projectId/machine-translation/settings",
        PROJECT_MACHINE_TRANSLATION_USAGE: "/dashboard/projects/:projectId/machine-translation/usage",
        PROJECT_EXPORT_CONFIGURATIONS: "/dashboard/projects/:projectId/export/configurations",
        PROJECT_EXPORT_HIERARCHY: "/dashboard/projects/:projectId/export/hierarchy",
        PROJECT_ISSUES_ACTIVE: "/dashboard/projects/:projectId/active-issues",
        PROJECT_ISSUES_IGNORED: "/dashboard/projects/:projectId/ignored-issues",
        PROJECT_SETTINGS: "/dashboard/projects/:projectId/settings",
        PROJECT_SETTINGS_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_SETTINGS.replace(":projectId", options.projectId);
        },
        PROJECT_SETTINGS_GENERAL: "/dashboard/projects/:projectId/settings/general",
        PROJECT_SETTINGS_GENERAL_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_SETTINGS_GENERAL.replace(":projectId", options.projectId);
        },
        PROJECT_SETTINGS_ADVANCED: "/dashboard/projects/:projectId/settings/advanced",
        PROJECT_SETTINGS_ADVANCED_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_SETTINGS_ADVANCED.replace(":projectId", options.projectId);
        },
        PROJECT_KEYS: "/dashboard/projects/:projectId/keys",
        PROJECT_ACTIVITY: "/dashboard/projects/:projectId/activity",
        PROJECT_INTEGRATIONS: "/dashboard/projects/:projectId/integrations",
        PROJECT_INTEGRATIONS_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_INTEGRATIONS.replace(":projectId", options.projectId);
        },
        PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS: "/dashboard/projects/:projectId/integrations/wordpress/settings",
        PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SETTINGS.replace(":projectId", options.projectId);
        },
        PROJECT_INTEGRATIONS_WORDPRESS: "/dashboard/projects/:projectId/integrations/wordpress",
        PROJECT_INTEGRATIONS_WORDPRESS_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS.replace(":projectId", options.projectId);
        },
        PROJECT_INTEGRATIONS_WORDPRESS_SYNC: "/dashboard/projects/:projectId/integrations/wordpress/sync",
        PROJECT_INTEGRATIONS_WORDPRESS_SYNC_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_INTEGRATIONS_WORDPRESS_SYNC.replace(":projectId", options.projectId);
        },
        PROJECT_VALIDATIONS: "/dashboard/projects/:projectId/validations",
        PROJECT_PLACEHOLDERS: "/dashboard/projects/:projectId/placeholders",
        PROJECT_PLACEHOLDERS_RESOLVER: (options: { projectId: string }) => {
            return Routes.DASHBOARD.PROJECT_PLACEHOLDERS.replace(":projectId", options.projectId);
        },
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
        SETUP_PLAN: "/dashboard/setup/organization/:organizationId/plan",
        SETUP_PLAN_RESOLVER: (options: { organizationId: string }) => {
            return Routes.DASHBOARD.SETUP_PLAN.replace(":organizationId", options.organizationId);
        },
        SETUP_PROJECT_NEW: "/dashboard/setup/organization/:organizationId/project",
        SETUP_PROJECT_NEW_RESOLVER: (options: { organizationId: string }) => {
            return Routes.DASHBOARD.SETUP_PROJECT_NEW.replace(":organizationId", options.organizationId);
        },
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
        SETUP_PROJECT_IMPORT: "/dashboard/setup/organization/:organizationId/project/:projectId/import",
        SETUP_PROJECT_IMPORT_RESOLVER: (options: { organizationId: string; projectId: string }) => {
            return Routes.DASHBOARD.SETUP_PROJECT_IMPORT.replace(":organizationId", options.organizationId).replace(
                ":projectId",
                options.projectId
            );
        },
        SETUP_PROJECT_INTEGRATIONS: "/dashboard/setup/organization/:organizationId/project/:projectId/integrations",
        SETUP_PROJECT_INTEGRATIONS_RESOLVER: (options: { organizationId: string; projectId: string }) => {
            return Routes.DASHBOARD.SETUP_PROJECT_INTEGRATIONS.replace(
                ":organizationId",
                options.organizationId
            ).replace(":projectId", options.projectId);
        },
        SETUP_PROJECT_SUCCESS: "/dashboard/setup/organization/:organizationId/project/:projectId/success",
        SETUP_PROJECT_SUCCESS_RESOLVER: (options: { organizationId: string; projectId: string }) => {
            return Routes.DASHBOARD.SETUP_PROJECT_SUCCESS.replace(":organizationId", options.organizationId).replace(
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
        ORGANIZATION_VALIDATIONS: "/dashboard/organizations/:organizationId/validations",
        ORGANIZATION_VALIDATIONS_RESOLVER: (options: { organizationId: string }) => {
            return Routes.DASHBOARD.ORGANIZATION_VALIDATIONS.replace(":organizationId", options.organizationId);
        },
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
