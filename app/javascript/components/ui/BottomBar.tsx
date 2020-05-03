import { Button, Dropdown, Menu } from "antd";
import * as React from "react";
import { Link } from "react-router-dom";
import { Routes } from "../routing/Routes";
import { DownOutlined } from "@ant-design/icons";

interface IState {
    currentLanguageKey: string;
    keyDisplayNameMapping: object;
}

class BottomBar extends React.Component<{}, IState> {
    state: IState = {
        currentLanguageKey: "en",
        keyDisplayNameMapping: {
            en: "English",
            de: "German"
        }
    };

    render() {
        const menu: any = (
            <Menu onClick={this.handleLanguageMenuClick}>
                <Menu.Item key="en">{this.getFlagElement("en")} English</Menu.Item>
                <Menu.Item key="de">{this.getFlagElement("de")} German</Menu.Item>
            </Menu>
        );

        return (
            <footer
                style={{
                    width: "100%",
                    padding: "50px 24px",
                    borderTop: "1px solid #dedede",
                    display: "flex",
                    justifyItems: "center",
                    background: "#f9f9f9"
                }}
            >
                <div style={{ maxWidth: 1040, display: "flex", flexGrow: 1, margin: "auto" }}>
                    <div style={{ flexGrow: 1 }}>
                        <h1 style={{ marginBottom: 0, fontSize: 20, color: "#a07cbd" }}>Texterify</h1>
                        <p>The easy way to localize.</p>
                        <p style={{ fontSize: 12, color: "#999" }}>Created with love by Chrztoph.</p>

                        <Dropdown overlay={menu}>
                            <Button style={{ marginTop: 10 }}>
                                {this.getFlagElement(this.state.currentLanguageKey)}
                                {this.getCurrentLanguageDisplayName()}
                                <DownOutlined />
                            </Button>
                        </Dropdown>
                    </div>
                    <div className="link-group">
                        <h3>Product</h3>
                        <ul>
                            <li>
                                <Link to={Routes.PRODUCT.FEATURES}>Features</Link>
                            </li>
                            <li>
                                <Link to={Routes.AUTH.LOGIN}>Login</Link>
                            </li>
                            <li>
                                <Link to={Routes.AUTH.SIGNUP}>Signup</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h3>Company</h3>
                        <ul>
                            <li>
                                <Link to={Routes.OTHER.ABOUT}>About</Link>
                            </li>
                            <li>
                                <Link to={Routes.OTHER.CONTACT}>Contact</Link>
                            </li>
                        </ul>
                    </div>
                    <div className="link-group">
                        <h3>Resources</h3>
                        <ul>
                            <li>
                                <Link to={Routes.OTHER.TERMS_OF_SERVICE}>Terms of service</Link>
                            </li>
                            <li>
                                <Link to={Routes.OTHER.PRIVACY_POLICY}>Privacy policy</Link>
                            </li>
                        </ul>
                    </div>
                </div>
            </footer>
        );
    }

    getFlagElement = (key: string): JSX.Element => {
        const flagCode: string = {
            en: "us",
            de: "de"
        }[key];

        return <span className={`flag-icon flag-icon-${flagCode}`} style={{ marginRight: 10 }} />;
    };

    getCurrentLanguageDisplayName = (): string => {
        return this.state.keyDisplayNameMapping[this.state.currentLanguageKey];
    };

    handleLanguageMenuClick = (e: any): void => {
        this.setState({
            currentLanguageKey: e.key
        });
    };
}

export { BottomBar };
