const FileFormatOptions = [
    {
        value: "json-flat",
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
        value: "ios-strings",
        text: "iOS"
    },
    {
        value: "rails",
        text: "Ruby on Rails"
    }
].sort((a, b) => {
    return a.text.toLowerCase() < b.text.toLowerCase() ? -1 : 1;
});

export { FileFormatOptions };
