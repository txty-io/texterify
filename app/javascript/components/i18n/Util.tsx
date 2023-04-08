import { createIntl, createIntlCache, FormattedMessage } from "react-intl";
import en from "./en.json";
import { DEFAULT_LOCALE } from "./I18nDefaults";
import { ILocales } from "./ILocales";
import * as React from "react";

type IMessages = {
    [locale in ILocales]: {
        [message: string]: string;
    };
};

const intlMessages: IMessages = {
    en: en
};

const cache = createIntlCache();

let intl = createIntl(
    {
        locale: DEFAULT_LOCALE,
        messages: intlMessages[DEFAULT_LOCALE]
    },
    cache
);

export function setIntl(locale: ILocales) {
    intl = createIntl(
        {
            locale: locale,
            messages: intlMessages[locale]
        },
        cache
    );

    document.documentElement.lang = locale;

    console.log(`%cSet locale to "${locale}".`, "background: #eee; color: #666;");
}

export type MessageIDS = keyof typeof en;

function returnString(_messageId: MessageIDS, translation: string) {
    return translation;
}

const t = (messageId: MessageIDS, values?: Record<string, any>) => {
    return returnString(messageId, intl.formatMessage({ id: messageId }, values));
};

export const tHtml = (messageId: MessageIDS, values?: Record<string, any>) => {
    <FormattedMessage
        key={messageId}
        id={messageId}
        values={{
            ...values,
            b: (chunks) => {
                return <b>{chunks}</b>;
            },
            br: () => {
                return <br />;
            },
            div: (chunks) => {
                return <div>{chunks}</div>;
            },
            sup: (chunks) => {
                return <sup>{chunks}</sup>;
            },
            p: (chunks) => {
                return <p>{chunks}</p>;
            }
            // This is a more complexe example of how to use it with e.g. <a> or other HTML elements.
            // This example defines the attributes manually, but lets you dynamically
            // set the <a> content. The "chunks" param is everything you put between
            // your custom tags ("aPrivacyPolicy" are the tags in this example).
            // If you write "<aPrivacyPolicy>this is a link to my privacy policy</aPrivacyPolicy>" in your translation
            // you will get a link as defined below with the text "this is a link to my privacy policy".
            // aPrivacyPolicy: (chunks) => {
            //     const link: MessageIDS = "links.privacy_policy";
            //     return (
            //         <a href={intl.formatMessage({ id: link })} target="_blank" rel="noopener noreferrer">
            //             {chunks}
            //         </a>
            //     );
            // },
        }}
    />;
};

export function numberWithSeparator(x: number, sep: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, sep);
}

export { intl, intlMessages, t };
