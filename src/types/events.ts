// Event handler type definitions for React components

import { ChangeEvent, FormEvent, MouseEvent, KeyboardEvent, FocusEvent, DragEvent } from 'react';

// Form Events
export type FormSubmitEvent = FormEvent<HTMLFormElement>;
export type InputChangeEvent = ChangeEvent<HTMLInputElement>;
export type TextAreaChangeEvent = ChangeEvent<HTMLTextAreaElement>;
export type SelectChangeEvent = ChangeEvent<HTMLSelectElement>;

// Mouse Events
export type ButtonClickEvent = MouseEvent<HTMLButtonElement>;
export type DivClickEvent = MouseEvent<HTMLDivElement>;
export type AnchorClickEvent = MouseEvent<HTMLAnchorElement>;
export type GenericClickEvent = MouseEvent<HTMLElement>;

// Keyboard Events
export type InputKeyEvent = KeyboardEvent<HTMLInputElement>;
export type TextAreaKeyEvent = KeyboardEvent<HTMLTextAreaElement>;
export type GenericKeyEvent = KeyboardEvent<HTMLElement>;

// Focus Events
export type InputFocusEvent = FocusEvent<HTMLInputElement>;
export type TextAreaFocusEvent = FocusEvent<HTMLTextAreaElement>;
export type SelectFocusEvent = FocusEvent<HTMLSelectElement>;

// Drag Events
export type DivDragEvent = DragEvent<HTMLDivElement>;
export type GenericDragEvent = DragEvent<HTMLElement>;

// Custom Event Handlers
export type VoidEventHandler = () => void;
export type ValueEventHandler<T> = (value: T) => void;
export type ErrorEventHandler = (error: Error) => void;

// Generic Event Handler
export type EventHandler<T = void> = T extends void ? VoidEventHandler : ValueEventHandler<T>;