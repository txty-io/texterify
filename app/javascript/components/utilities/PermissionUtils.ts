const ROLE_TRANSLATOR = "translator";
const ROLE_DEVELOPER = "developer";
const ROLE_MANAGER = "manager";
const ROLE_OWNER = "owner";

export type ROLES = typeof ROLE_TRANSLATOR | typeof ROLE_DEVELOPER | typeof ROLE_MANAGER | typeof ROLE_OWNER;

const ROLE_PRIORITY_MAP = {
    translator: 1,
    developer: 2,
    manager: 3,
    owner: 4
};

export const ROLES_TRANSLATOR_UP = [ROLE_TRANSLATOR, ROLE_DEVELOPER, ROLE_MANAGER, ROLE_OWNER];
export const ROLES_DEVELOPER_UP = [ROLE_DEVELOPER, ROLE_MANAGER, ROLE_OWNER];
export const ROLES_MANAGER_UP = [ROLE_MANAGER, ROLE_OWNER];

const PermissionUtils = {
    isOwner: (role: string) => {
        return role === ROLE_OWNER;
    },
    isManagerOrHigher: (role: string) => {
        return ROLES_MANAGER_UP.includes(role);
    },
    isDeveloperOrHigher: (role: string) => {
        return ROLES_DEVELOPER_UP.includes(role);
    },
    isHigherRole: (roleA: string, roleB: string) => {
        return ROLE_PRIORITY_MAP[roleA] > ROLE_PRIORITY_MAP[roleB];
    },
    getColorByRole: (role: ROLES) => {
        if (role === "translator") {
            return "green";
        } else if (role === "developer") {
            return "blue";
        } else if (role === "manager") {
            return "magenta";
        } else if (role === "owner") {
            return "volcano";
        }
    }
};

export { PermissionUtils };
