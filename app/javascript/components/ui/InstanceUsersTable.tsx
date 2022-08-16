import { Empty, Input, message, Table } from "antd";
import * as React from "react";
import { IGetInstanceUsersOptions, IGetInstanceUsersResponse, InstanceUsersAPI } from "../api/v1/InstanceUsersAPI";
import { DEFAULT_PAGE_SIZE, PAGE_SIZE_OPTIONS } from "./Config";
import { OkIndicator } from "./OkIndicator";
import { Utils } from "./Utils";
import { WarningIndicator } from "./WarningIndicator";
import * as _ from "lodash";

type DATA_INDEX =
    | "username"
    | "email"
    | "deactivated"
    | "deactivated_reason"
    | "is_superadmin"
    | "confirmed"
    | "sign_in_count"
    | "last_sign_in_at"
    | "created_at"
    | "created_at";

interface IColumn {
    title: string;
    dataIndex: DATA_INDEX;
    key: string;
    width?: number;
}

type IRow = {
    [k in DATA_INDEX]: React.ReactNode;
};

export function InstanceUsersTable(props: { tableReloader?: number; style?: React.CSSProperties }) {
    const [page, setPage] = React.useState<number>(1);
    const [perPage, setPerPage] = React.useState<number>(DEFAULT_PAGE_SIZE);
    const [search, setSearch] = React.useState<string>(null);
    const [usersResponse, setUsersResponse] = React.useState<IGetInstanceUsersResponse>(null);
    const [loading, setLoading] = React.useState<boolean>(false);

    async function reload(options?: IGetInstanceUsersOptions) {
        setLoading(true);

        try {
            const response = await InstanceUsersAPI.getUsers({
                search: options?.search || search,
                page: options?.page || page,
                perPage: options?.perPage || perPage
            });
            setUsersResponse(response);
        } catch (error) {
            console.error(error);
            message.error("Failed to load users.");
        }

        setLoading(false);
    }

    const debouncedSearch = React.useCallback(
        _.debounce((value: string) => {
            reload({ search: value });
        }, 500),
        []
    );

    React.useEffect(() => {
        (async () => {
            await reload();
        })();
    }, [props.tableReloader]);

    function getRows(): IRow[] {
        if (!usersResponse) {
            return [];
        }

        return usersResponse.data.map((user) => {
            return {
                key: user.attributes.id,
                username: user.attributes.username,
                email: user.attributes.email,
                deactivated: user.attributes.deactivated ? <WarningIndicator /> : <OkIndicator />,
                deactivated_reason: user.attributes.deactivated_reason || "-",
                is_superadmin: user.attributes.is_superadmin ? <OkIndicator /> : "-",
                confirmed: user.attributes.confirmed ? <OkIndicator /> : <WarningIndicator />,
                sign_in_count: user.attributes.sign_in_count,
                last_sign_in_at: user.attributes.last_sign_in_at
                    ? Utils.formatDateTime(user.attributes.last_sign_in_at)
                    : "-",
                created_at: Utils.formatDateTime(user.attributes.created_at)
            };
        }, []);
    }

    function getColumns() {
        const columns: IColumn[] = [
            {
                title: "Username",
                dataIndex: "username",
                key: "username"
            },
            {
                title: "E-Mail",
                dataIndex: "email",
                key: "email"
            },
            {
                title: "Active",
                dataIndex: "deactivated",
                key: "deactivated"
            },
            {
                title: "Deactivated reason",
                dataIndex: "deactivated_reason",
                key: "deactivatedReason"
            },
            {
                title: "Superadmin",
                dataIndex: "is_superadmin",
                key: "is_superadmin"
            },
            {
                title: "Confirmed",
                dataIndex: "confirmed",
                key: "confirmed"
            },
            {
                title: "Sign in count",
                dataIndex: "sign_in_count",
                key: "sign_in_count"
            },
            {
                title: "Last sign in",
                dataIndex: "last_sign_in_at",
                key: "last_sign_in_at"
            },
            {
                title: "Created at",
                dataIndex: "created_at",
                key: "created_at"
            }
        ];

        return columns;
    }

    const onSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
        setLoading(true);
        setSearch(event.target.value);
        debouncedSearch(event.target.value);
    };

    return (
        <div style={{ display: "flex", flexDirection: "column", ...props.style }}>
            <Input.Search
                placeholder="Search users by username or email"
                onChange={onSearch}
                style={{ maxWidth: "50%" }}
                data-id="instance-users-search"
                allowClear
            />

            <Table
                style={{ marginTop: 16 }}
                dataSource={getRows()}
                columns={getColumns()}
                bordered
                loading={loading}
                pagination={{
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                    showSizeChanger: true,
                    current: page,
                    pageSize: perPage,
                    total: usersResponse?.meta?.total || 0,
                    onChange: async (newPage, newPerPage) => {
                        const isPageSizeChange = perPage !== newPerPage;

                        if (isPageSizeChange) {
                            setPage(1);
                            setPerPage(newPerPage);
                            reload({ page: 1, perPage: newPerPage });
                        } else {
                            setPage(newPage);
                            reload({ page: newPage });
                        }
                    }
                }}
                locale={{
                    emptyText: <Empty description="No users found" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                }}
            />
        </div>
    );
}
