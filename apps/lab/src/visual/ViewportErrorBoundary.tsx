import { Component, type ReactNode } from "react";

interface ViewportErrorBoundaryProps {
  children: ReactNode;
}

interface ViewportErrorBoundaryState {
  error: string | null;
}

export class ViewportErrorBoundary extends Component<ViewportErrorBoundaryProps, ViewportErrorBoundaryState> {
  override state: ViewportErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: unknown): ViewportErrorBoundaryState {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  override render() {
    if (this.state.error) {
      return (
        <div className="viewport-error" role="alert">
          <strong>3D model failed to load</strong>
          <code>{this.state.error}</code>
          <span>Choose another GLB/GLTF file or correct the URL.</span>
        </div>
      );
    }
    return this.props.children;
  }
}
