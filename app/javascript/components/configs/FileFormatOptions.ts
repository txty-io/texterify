const FileFormatOptions = [
    {
        value: "json",
        text: "JSON Flat"
    },
    // {
    //     value: "json-nested",
    //     text: "JSON Nested"
    // },
    {
        value: "json-formatjs",
        text: "JSON Format.js"
    },
    {
        value: "typescript",
        text: "TypeScript"
    },
    {
        value: "android",
        text: "Android"
    },
    {
        value: "ios",
        text: "iOS"
    },
    {
        value: "rails",
        text: "Ruby on Rails"
    },
    {
        value: "toml",
        text: "TOML"
    },
    {
        value: "properties",
        text: "Java .properties"
    },
    {
        value: "po",
        text: "PO"
    }
].sort((a, b) => {
    return a.text.toLowerCase() < b.text.toLowerCase() ? -1 : 1;
});

export { FileFormatOptions };
