import { Tag } from "antd";
import moment from "moment";
import * as React from "react";
import { APIUtils } from "../api/v1/APIUtils";
import FlagIcon from "./FlagIcons";
import { useQuery } from "./KeySearchSettings";

export function KeySearchSettingsActiveFilters(props: {
    style?: React.CSSProperties;
    languagesResponse: any;
    exportConfigsResponse: any;
}) {
    const currentQueryParams = useQuery();

    return (
        <div style={{ display: "flex", ...props.style }}>
            <div style={{ marginRight: 12 }}>Active filters:</div>
            {currentQueryParams.ou === "true" && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    only untranslated
                </Tag>
            )}
            {currentQueryParams.cc === "true" && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    case sensitive
                </Tag>
            )}
            {currentQueryParams.oo === "true" && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    only with overwrites
                </Tag>
            )}
            {currentQueryParams.l && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    {props.languagesResponse.data
                        .filter((language) => {
                            return currentQueryParams.l.includes(language.id);
                        })
                        .map((language) => {
                            const countryCode = APIUtils.getIncludedObject(
                                language.relationships.country_code.data,
                                props.languagesResponse.included
                            );

                            return (
                                <>
                                    {countryCode && (
                                        <span style={{ marginRight: 8 }}>
                                            <FlagIcon code={countryCode.attributes.code.toLowerCase()} />
                                        </span>
                                    )}
                                    {language.attributes.name}
                                </>
                            );
                        })
                        .reduce((prev, curr) => {
                            return [prev, " or ", curr];
                        })}
                </Tag>
            )}
            {currentQueryParams.ec && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    {props.exportConfigsResponse.data
                        .filter((exportConfig) => {
                            return currentQueryParams.ec.includes(exportConfig.id);
                        })
                        .map((exportConfig) => {
                            return exportConfig.attributes.name;
                        })
                        .reduce((prev, curr) => {
                            return [prev, " or ", curr];
                        })}
                </Tag>
            )}
            {currentQueryParams.ca && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    changed after {moment(currentQueryParams.ca).format("YYYY-MM-DD")}
                </Tag>
            )}
            {currentQueryParams.cb && (
                <Tag color="blue" style={{ marginRight: 8 }}>
                    changed before {moment(currentQueryParams.cb).format("YYYY-MM-DD")}
                </Tag>
            )}
        </div>
    );
}
