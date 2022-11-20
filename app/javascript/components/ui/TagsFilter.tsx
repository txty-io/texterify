import * as React from "react";
import { Select } from "antd";
import useTags from "../hooks/useTags";

export function TagsFilter(props: {
    projectId: string;
    style?: React.CSSProperties;
    onChange(values: string[]): void;
}) {
    const [search, setSearch] = React.useState<string>();

    const { tagsResponse, tagsLoading } = useTags({
        projectId: props.projectId,
        search: search
    });

    return (
        <Select
            mode="multiple"
            loading={tagsLoading}
            allowClear
            style={props.style}
            placeholder="Filter by tags"
            onChange={props.onChange}
            onSearch={(value) => {
                setSearch(value);
            }}
            onSelect={() => {
                setSearch("");
            }}
            onClear={() => {
                setSearch("");
            }}
            options={tagsResponse?.data?.map((tag) => {
                return {
                    label: tag.attributes.name,
                    value: tag.id
                };
            })}
            filterOption={false}
        />
    );
}
