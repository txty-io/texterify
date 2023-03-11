import { InfoCircleOutlined, LockOutlined, LogoutOutlined, SolutionOutlined, UserOutlined } from "@ant-design/icons";
import { Popover } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AuthAPI } from "../api/v1/AuthAPI";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { IS_CLOUD } from "../utilities/Env";
import { Styles } from "./Styles";
import { UserAvatar } from "./UserAvatar";

const AccountProfileContentWrapper = styled.div`
    a {
        display: block;
        color: var(--select-single-color);
        padding: 4px 16px;

        .dark-theme & {
            background: none;
        }
    }

    a:hover {
        text-decoration: none;
        color: var(--select-selected-color);
        background: var(--select-selected-background-color);
    }
`;

interface IState {
    accountMenuVisible: boolean;
}

@observer
class UserProfileHeader extends React.Component<{}, IState> {
    state: IState = {
        accountMenuVisible: false
    };

    logout = async (): Promise<void> => {
        await AuthAPI.logout();
        history.push(Routes.AUTH.LOGIN);
    };

    render() {
        return (
            <div
                onClick={() => {
                    this.setState({ accountMenuVisible: true });
                }}
                role="button"
                style={{ cursor: "pointer", overflow: "hidden" }}
                data-id="user-profile-menu"
            >
                <Popover
                    title="Account"
                    placement="bottomRight"
                    trigger="click"
                    visible={this.state.accountMenuVisible}
                    onVisibleChange={() => {
                        this.setState({ accountMenuVisible: false });
                    }}
                    overlayClassName="popover-no-padding"
                    content={
                        <AccountProfileContentWrapper>
                            <ul>
                                <li
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.setState({ accountMenuVisible: false });
                                    }}
                                >
                                    <Link data-id="user-profile-menu-account" to={Routes.USER.SETTINGS.ACCOUNT}>
                                        <UserOutlined style={{ marginRight: 5, fontWeight: "bold" }} />
                                        Account
                                    </Link>
                                </li>
                                <li
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.setState({ accountMenuVisible: false });
                                    }}
                                >
                                    <Link
                                        data-id="user-profile-menu-access-tokens"
                                        to={Routes.USER.SETTINGS.ACCESS_TOKENS}
                                    >
                                        <LockOutlined style={{ marginRight: 5, fontWeight: "bold" }} />
                                        Access tokens
                                    </Link>
                                </li>
                                {IS_CLOUD && (
                                    <li
                                        role="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            this.setState({ accountMenuVisible: false });
                                        }}
                                    >
                                        <Link data-id="user-profile-menu-licenses" to={Routes.USER.SETTINGS.LICENSES}>
                                            <SolutionOutlined style={{ marginRight: 5, fontWeight: "bold" }} />
                                            Get a license
                                        </Link>
                                    </li>
                                )}
                                <li
                                    role="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        this.setState({ accountMenuVisible: false });
                                    }}
                                >
                                    <Link data-id="user-profile-menu-about" to={Routes.USER.SETTINGS.ABOUT}>
                                        <InfoCircleOutlined style={{ marginRight: 5, fontWeight: "bold" }} />
                                        About
                                    </Link>
                                </li>
                                <li>
                                    <a role="button" onClick={this.logout}>
                                        <LogoutOutlined style={{ marginRight: 5, fontWeight: "bold" }} />
                                        Logout
                                    </a>
                                </li>
                            </ul>
                        </AccountProfileContentWrapper>
                    }
                >
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <UserAvatar forceDark user={authStore.currentUser} />
                        <div
                            style={{
                                padding: "0 16px",
                                borderRadius: Styles.DEFAULT_BORDER_RADIUS,
                                lineHeight: "normal",
                                alignItems: "center",
                                justifyContent: "center",
                                fontWeight: "bold",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                overflow: "hidden"
                            }}
                        >
                            {authStore.currentUser && authStore.currentUser.username}
                        </div>
                    </div>
                </Popover>
            </div>
        );
    }
}

export { UserProfileHeader };
