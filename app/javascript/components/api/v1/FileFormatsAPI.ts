import { axiosInstance } from "./API";

export type IImportFileFormat =
    | "json"
    | "json-plurals"
    | "json-formatjs"
    | "json-poeditor"
    | "ios"
    | "android"
    | "toml"
    | "rails"
    | "properties"
    | "po"
    | "arb"
    | "yaml"
    | "xliff";

export interface IFileFormatExtension {
    id: string;
    type: "file_format_extension";
    attributes: {
        id: string;
        extension: string;
    };
}

export interface IFileFormat {
    id: string;
    type: "file_format";
    attributes: {
        id: string;
        name: string;
        format: IImportFileFormat;
        import_support: boolean;
        export_support: boolean;
        plural_support: boolean;
        skip_empty_plural_translations_support: boolean;
    };
    relationships: {
        file_format_extensions: {
            data: IFileFormatExtension;
        };
    };
}

export interface IGetFileFormatsResponse {
    data: IFileFormat[];
}

export interface IGetFileFormatExtensionsResponse {
    data: IFileFormatExtension[];
}

const FileFormatsAPI = {
    getFileFormats: async ({ signal }) => {
        return axiosInstance.get<IGetFileFormatsResponse>("file_formats", { signal });
    },

    getFileFormatExtensions: async ({ signal }) => {
        return axiosInstance.get<IGetFileFormatExtensionsResponse>("file_format_extensions", { signal });
    }
};

export { FileFormatsAPI };
