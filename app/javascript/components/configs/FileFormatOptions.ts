const FileFormatOptions = [
    {
        value: "json",
        text: "JSON"
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
    }
].sort((a, b) => {
    return a.text.toLowerCase() < b.text.toLowerCase() ? -1 : 1;
});

export { FileFormatOptions };
