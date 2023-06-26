import { message } from "antd";

export const ERROR_MESSAGES = {
    INVALID: "{name} is invalid.",
    TAKEN: "{name} is already in use.",
    NOT_FOUND: "{name} could not be found.",
    BLANK: "{name} cannot be blank.",
    KEY_NAME_RESERVED: 'Key names starting with "texterify_" are reserved and can\'t be used.'
};

type ERRORS_MESSAGE_IDS = keyof typeof ERROR_MESSAGES;

export const ERRORS: { [K in ERRORS_MESSAGE_IDS]: K } = {
    INVALID: "INVALID",
    TAKEN: "TAKEN",
    NOT_FOUND: "NOT_FOUND",
    BLANK: "BLANK",
    KEY_NAME_RESERVED: "KEY_NAME_RESERVED"
};

export interface IError {
    error: ERRORS_MESSAGE_IDS;
}

export interface IErrorsResponse {
    [field: string]: IError[];
}

export const ErrorUtils = {
    hasError(field: string, error: ERRORS_MESSAGE_IDS, errors: IErrorsResponse) {
        if (!errors) {
            return false;
        }

        const fieldErrors = errors[field];
        return fieldErrors?.some((fieldError) => {
            return fieldError.error === error;
        });
    },

    showError(error: string) {
        message.error(error, 6);
    },

    showErrors(errors: IErrorsResponse) {
        if (errors) {
            const keys = Object.keys(errors);

            keys.forEach((key) => {
                errors[key].forEach((error) => {
                    this.showError(this.getErrorMessage(key, error.error));
                });
            });
        }
    },

    getErrorMessage(name: string, error: ERRORS_MESSAGE_IDS) {
        const normalizedError = error.toUpperCase();

        if (ERROR_MESSAGES[normalizedError].includes("{name}")) {
            return ERROR_MESSAGES[normalizedError].replace("{name}", name.charAt(0).toUpperCase() + name.slice(1));
        } else {
            return ERROR_MESSAGES[normalizedError];
        }
    }
};
