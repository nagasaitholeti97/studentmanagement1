import { Component, type ReactNode } from "react";

export default class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
    state = { error: null as Error | null };
    static getDerivedStateFromError(error: Error) { return { error }; }
    render() {
        if (this.state.error) {
            return (
                <pre style={{ padding: 16, color: "#B91C1C", whiteSpace: "pre-wrap" }}>
                    {this.state.error.message}{"\n"}{this.state.error.stack}
                </pre>
            );
        }
        return this.props.children;
    }
}