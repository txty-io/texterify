import { message } from "antd";

export const ERROR_MESSAGES = {
    invalid: "{name} is invalid.",
    taken: "{name} is already in use.",
    not_found: "{name} could not be found.",
    blank: "{name} cannot be blank."
};

type ERRORS_MESSAGE_IDS = keyof typeof ERROR_MESSAGES;

export const ERRORS: { [key: string]: ERRORS_MESSAGE_IDS } = {
    INVALID: "invalid",
    TAKEN: "taken",
    NOT_FOUND: "not_found",
    BLANK: "blank"
};

export interface IError {
    error: ERRORS_MESSAGE_IDS;
}

export interface IErrorsResponse {
    [field: string]: IError[];
}

export const ErrorUtils = {
    hasError(field: string, error: ERRORS_MESSAGE_IDS, errors: IErrorsResponse) {
        const fieldErrors = errors[field];
        return fieldErrors?.some((fieldError) => {
            return fieldError.error === error;
        });
    },

    showError(error: string) {
        message.error(error, 2000);
    },

    showErrors(errors: IErrorsResponse) {
        const keys = Object.keys(errors);

        keys.forEach((key) => {
            errors[key].forEach((error) => {
                this.showError(this.getErrorMessage(key, error.error));
            });
        });
    },

    getErrorMessage(name: string, error: ERRORS_MESSAGE_IDS) {
        return ERROR_MESSAGES[error].replace("{name}", name.charAt(0).toUpperCase() + name.slice(1));
    }
};
