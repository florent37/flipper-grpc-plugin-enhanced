import React from "react";
import {Header, Request, Response} from "./types";
import {Component, FlexColumn, ManagedTable, Panel, styled, Text, Button} from 'flipper';
import {notification} from 'antd';
import {Input} from 'antd';

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
                        heading={'Request Body FLO'}
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
                                heading={`Response Headers`}
                                floating={false}
                                padded={false}>
                                <HeaderInspector headers={response.headers}/>
                            </Panel>
                        ) : null}
                        {response.data ? (
                            <Panel
                                heading={`Response Body`}
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

type BodyInspectorState = {
    searchTerm: string;
};

function safeStringify(obj: any, space = 2): string {
    const seen = new WeakSet();
    return JSON.stringify(obj, function (key, value) {
        if (typeof value === 'object' && value !== null) {
            if (seen.has(value)) {
                return '[Circular]';
            }
            seen.add(value);
        }
        return value;
    }, space);
}

class BodyInspector extends Component<{ data: string }, BodyInspectorState> {
    state: BodyInspectorState = {
        searchTerm: '',
    };

    handleCopy = () => {
        try {
            const {data} = this.props;
            const parsed = JSON.parse(data);
            const pretty = safeStringify(parsed, 2);
            navigator.clipboard.writeText(pretty);

            notification.success({
                message: 'Copied !',
                placement: 'bottomRight',
                duration: 2,
            });
        } catch (e) {
            console.error("Failed to copy JSON", e);
        }
    };

    handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        this.setState({searchTerm: e.target.value});
    };

    highlightMatches(jsonStr: string, term: string) {
        if (!term) return jsonStr;

        const regex = new RegExp(`(${term})`, 'gi');
        return jsonStr.split(regex).map((part, i) =>
            regex.test(part) ? <mark key={i}>{part}</mark> : part
        );
    }

    render() {
        const {data} = this.props;
        const {searchTerm} = this.state;

        let parsed;
        try {
            parsed = JSON.parse(data);
        } catch (e) {
            return <Text>Invalid JSON</Text>;
        }

        const prettyJson = safeStringify(parsed, 2);

        return (
            <BodyContainer>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, margin: '0 8px 8px 8px'}}>
                    <Button compact onClick={this.handleCopy}>Copy</Button>
                    <Input
                        placeholder="Search in body..."
                        size="small"
                        style={{width: 200}}
                        value={searchTerm}
                        onChange={this.handleSearch}
                    />
                </div>
                <JSONText>
                    {this.highlightMatches(prettyJson, searchTerm)}
                </JSONText>
            </BodyContainer>
        );
    }
}