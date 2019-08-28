import * as sanitizeHtml from "sanitize-html";

function escapeContent(htmlContent: string) {
    return sanitizeHtml(htmlContent, {
        allowedTags: ["b", "i", "a"]
    });
}

const Utils = {
    getHTMLContentPreview: (htmlContent: string) => {
        try {
            // tslint:disable-next-line:no-unnecessary-local-variable
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
        if (json) {
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
        }

        return json;
    }
};

export { Utils };
