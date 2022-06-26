import * as sanitizeHtml from "sanitize-html";
import { IPlanIDS } from "../types/IPlan";
import { BASIC_PLAN, BUSINESS_PLAN, TEAM_PLAN } from "./Licenses";

export const DATE_FORMAT = "DD.MM.YYYY";
export const DATE_TIME_FORMAT = "DD.MM.YYYY HH:mm";

function escapeContent(htmlContent: string) {
    return sanitizeHtml(htmlContent, {
        allowedTags: ["b", "i", "a"]
    });
}

const Utils = {
    getHTMLContentPreview: (htmlContent: string) => {
        try {
            const json = JSON.parse(htmlContent);

            let converted = "";
            json.blocks.map((block) => {
                if (block.type === "list") {
                    if (block.data.style === "ordered") {
                        converted += "<ol>";
                    } else if (block.data.style === "unordered") {
                        converted += "<ul>";
                    }

                    block.data.items.map((item) => {
                        converted += `<li>${escapeContent(item)}</li>`;
                    });

                    if (block.data.style === "ordered") {
                        converted += "</ol>";
                    } else if (block.data.style === "unordered") {
                        converted += "</ul>";
                    }
                } else if (block.type === "paragraph") {
                    converted += `<p>${escapeContent(block.data.text)}</p>`;
                }
            });

            return converted;
        } catch (e) {
            return htmlContent;
        }
    },

    escapeEditorContent: (json: any) => {
        if (json && json.blocks) {
            const blocks = json.blocks.map((block) => {
                if (block.type === "list") {
                    const items = block.data.items.map((item) => {
                        return escapeContent(item);
                    });
                    block.data.items = items;
                } else if (block.type === "paragraph") {
                    block.data.text = escapeContent(block.data.text);
                }

                return block;
            });

            json.blocks = blocks;
        } else {
            return {};
        }

        return json;
    },

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
    }
};

export { Utils };
