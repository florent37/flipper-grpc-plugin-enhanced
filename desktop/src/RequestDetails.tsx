import React from "react";
import {Header, Request, Response} from "./types";
import {Component, FlexColumn, ManagedTable, Panel, styled, Text, Button} from 'flipper';
import {notification} from 'antd';

const WrappingText = styled(Text)({
    wordWrap: 'break-word',
    width: '100%',
    lineHeight: '125%',
    padding: '3px 0',
});


type RequestDetailsProps = {
    request: Request;
    response?: Response;
};

type RequestDetailsState = {};


export default class RequestDetails extends Component<RequestDetailsProps, RequestDetailsState> {

    static Container = styled(FlexColumn)({
        height: '100%',
        overflow: 'auto',
    });

    render() {
        const {request, response} = this.props;
        return (
            <RequestDetails.Container>
                {request.headers.length > 0 ? (
                    <Panel
                        heading={'Request Headers'}
                        floating={false}
                        padded={false}>
                        <HeaderInspector headers={request.headers}/>
                    </Panel>
                ) : null}

                {request.data ? (
                    <Panel
                        heading={'Request Body'}
                        floating={false}
                        padded={false}>
                        <BodyInspector
                            data={request.data}
                        />
                    </Panel>
                ) : null}

                {response ? (
                    <>
                        {response.headers.length > 0 ? (
                            <Panel
                                heading={"Response Headers"}
                                floating={false}
                                padded={false}>
                                <HeaderInspector headers={response.headers}/>
                            </Panel>
                        ) : null}
                        {response.data ? (
                            <Panel
                                heading={"Response Body"}
                                floating={false}
                                padded={false}>
                                <BodyInspector
                                    data={response.data}
                                />
                            </Panel>
                        ) : null}
                    </>
                ) : null}

            </RequestDetails.Container>
        )
    }
}

const KeyValueColumnSizes = {
    key: '30%',
    value: 'flex',
};

const KeyValueColumns = {
    key: {
        value: 'Key',
        resizable: false,
    },
    value: {
        value: 'Value',
        resizable: false,
    },
};

type HeaderInspectorProps = {
    headers: Array<Header>;
};

type HeaderInspectorState = {
    computedHeaders: Object;
};

class HeaderInspector extends Component<HeaderInspectorProps, HeaderInspectorState> {
    render() {
        const rows = this.props.headers.map(({key, value}) => ({
            columns: {
                key: {
                    value: <WrappingText>{key}</WrappingText>,
                },
                value: {
                    value: <WrappingText>{value}</WrappingText>,
                },
            },
            copyText: value,
            key,
        }));

        return rows.length > 0 ? (
            <ManagedTable
                multiline={true}
                columnSizes={KeyValueColumnSizes}
                columns={KeyValueColumns}
                rows={rows}
                autoHeight={true}
                floating={false}
                zebra={false}
            />
        ) : null;
    }
}


const BodyContainer = styled.div({
    paddingTop: 10,
    paddingBottom: 10,
});

class JSONText extends Component<{ children: any }> {
    static NoScrollbarText = styled(Text)({
        overflowY: 'hidden',
    });

    render() {
        const jsonObject = this.props.children;
        return (
            <JSONText.NoScrollbarText code whiteSpace="pre" selectable>
                {JSON.stringify(jsonObject, null, 2)}
                {'\n'}
            </JSONText.NoScrollbarText>
        );
    }
}


class BodyInspector extends Component<{ data: string }> {
    handleCopy = () => {
        try {
            const {data} = this.props;
            const parsed = JSON.parse(data);
            const pretty = JSON.stringify(parsed, null, 2);
            navigator.clipboard.writeText(pretty);

            notification.success({
                message: 'Copied !',
                //description: 'Le contenu JSON a été copié dans le presse-papiers.',
                placement: 'bottomRight',
                duration: 2,
            });
        } catch (e) {
            console.error("Failed to copy JSON", e);
        }
    }

    render() {
        const {data} = this.props;
        const parsed = JSON.parse(data);

        return (
            <BodyContainer>
                <div style={{display: 'flex', justifyContent: 'flex-start', marginBottom: 8, marginLeft: 8}}>
                    <Button compact onClick={this.handleCopy}>Copy</Button>
                </div>
                <JSONText>{parsed}</JSONText>
            </BodyContainer>
        );
    }
}