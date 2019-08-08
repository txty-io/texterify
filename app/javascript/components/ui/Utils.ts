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
                        converted += `<li>${item}</li>`;
                    });

                    if (block.data.style === "ordered") {
                        converted += "</ol>";
                    } else if (block.data.style === "unordered") {
                        converted += "</ul>";
                    }
                } else if (block.type === "paragraph") {
                    converted += `<p>${block.data.text}</p>`;
                }
            });

            return converted;
        } catch (e) {
            return htmlContent;
        }
    }
};

export { Utils };
