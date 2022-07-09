const FileFormatOptions: { value: string; text: string }[] = [
    {
        value: "json",
        text: "JSON Flat"
    },
    {
        value: "json-poeditor",
        text: "JSON POEditor"
    },
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
        value: "yaml",
        text: "YAML"
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
    },
    {
        value: "arb",
        text: "Flutter .arb"
    },
    {
        value: "xliff",
        text: "XLIFF .xlf, .xliff"
    }
].sort((a, b) => {
    return a.text.toLowerCase() < b.text.toLowerCase() ? -1 : 1;
});

export { FileFormatOptions };
