import * as sanitizeHtml from "sanitize-html";
import { IPlanIDS } from "../types/IPlan";
import { BASIC_PLAN, BUSINESS_PLAN, TEAM_PLAN } from "./Licenses";
import * as moment from "moment";

export const DATE_FORMAT = "DD.MM.YYYY";
export const DATE_TIME_FORMAT = "DD.MM.YYYY HH:mm";

export function escapeHTML(content: string) {
    if (!content) {
        return "";
    }

    return sanitizeHtml(content, {
        allowedTags: ["b", "i", "ul", "ol", "li", "p", "u", "pre", "code", "br"]
    });
}

const Utils = {
    capitalize: (s: string) => {
        return s.charAt(0).toUpperCase() + s.slice(1);
    },

    getCommandKeyDependingOnPlatform: () => {
        if (navigator.platform.includes("Mac")) {
            return "⌘";
        } else {
            return "Ctrl";
        }
    },

    createQueryParamsFromObject: (options: {
        currentParams: { [key: string]: string | string[] };
        add?: { key: string; value: string }[];
        remove?: string[];
    }) => {
        const queryParams = new URLSearchParams();
        if (options.add) {
            options.add.forEach((newKeyValue) => {
                queryParams.append(newKeyValue.key, newKeyValue.value);
            });
        }

        for (const [key, value] of Object.entries(options.currentParams)) {
            if (!queryParams.has(key)) {
                queryParams.append(key, value.toString());
            }
        }

        if (options.remove) {
            for (const key of options.remove) {
                queryParams.delete(key);
            }
        }

        return queryParams;
    },

    getPlanByPlanName(planName: IPlanIDS) {
        if (planName === "basic") {
            return BASIC_PLAN;
        } else if (planName === "team") {
            return TEAM_PLAN;
        } else if (planName === "business") {
            return BUSINESS_PLAN;
        }
    },

    formatDateTime(dateTime: string) {
        return moment.utc(dateTime, "YYYY-MM-DD HH:mm:ss").local().format("YYYY-MM-DD HH:mm");
    }
};

export { Utils };
