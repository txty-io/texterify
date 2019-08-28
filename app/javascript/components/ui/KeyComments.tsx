import { Button, Comment, Empty } from "antd";
import TextArea from "antd/lib/input/TextArea";
import * as React from "react";
import { authStore } from "../stores/AuthStore";
import { Styles } from "./Styles";
import { UserAvatar } from "./UserAvatar";

type IProps = {};
type IState = {};

class KeyComments extends React.Component<IProps, IState> {
    render() {
        return (
            <div style={{ display: "flex", flexDirection: "column" }}>
                <Empty
                    description="No comments found"
                    style={{ margin: "40px 0" }}
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
                <Comment
                    author={authStore.currentUser && authStore.currentUser.username}
                    content={
                        <>
                            <TextArea autosize={{ minRows: 2, maxRows: 6 }} />
                            <Button htmlType="submit" type="primary" style={{ marginTop: 8 }}>
                                Send message
                            </Button>
                        </>
                    }
                />
            </div>
        );
    }
}

export { KeyComments };
