import { Popover } from "antd";
import { observer } from "mobx-react";
import * as React from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { AuthAPI } from "../api/v1/AuthAPI";
import { history } from "../routing/history";
import { Routes } from "../routing/Routes";
import { authStore } from "../stores/AuthStore";
import { Styles } from "./Styles";
import { UserAvatar } from "./UserAvatar";
import { SettingOutlined, LogoutOutlined } from "@ant-design/icons";

const AccountProfileContentWrapper: any = styled.div`
    a {
        display: block;
        color: #888;
        padding: 4px 16px;
        background: #fcfcfc;
    }

    a:hover {
        text-decoration: none;
        background: #fcfcfc;
        color: #333;
    }
`;

interface IProps {}
interface IState {
    accountMenuVisible: boolean;
}

@observer
class UserProfileHeader extends React.Component<IProps, IState> {
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
                                    <Link to={Routes.USER.SETTINGS.ACCOUNT}>
                                        <SettingOutlined style={{ marginRight: 5, fontWeight: "bold" }} />
                                        Settings
                                    </Link>
                                </li>
                                <li>
                                    {/* tslint:disable-next-line:react-a11y-anchors */}
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
                        <UserAvatar light user={authStore.currentUser} />
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
