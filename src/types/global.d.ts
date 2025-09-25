/// <reference types="react" />
/// <reference types="react-dom" />

// Ensure JSX intrinsic elements are available
declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}