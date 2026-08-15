'use client';

import { cloneElement, isValidElement, useId } from 'react';
import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactElement,
  ReactNode,
  TextareaHTMLAttributes,
} from 'react';

export type InputSize = 'md' | 'sm' | 'xs';

const SIZES: Record<InputSize, string> = {
  md: 'px-3 py-2 text-sm',
  sm: 'px-2 py-1.5 text-sm',
  xs: 'px-1.5 py-1 text-xs',
};

/* ── Icons (inline SVG, no external deps) ── */

type IconProps = { className?: string };

function Icon({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'h-4 w-4'}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Icon>
  );
}

export function XIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </Icon>
  );
}

export function ChevronUpIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m18 15-6-6-6 6" />
    </Icon>
  );
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ArrowLeftIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </Icon>
  );
}

export function SaveIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
      <path d="M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" />
      <path d="M7 3v4a1 1 0 0 0 1 1h7" />
    </Icon>
  );
}

export function DownloadIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" x2="12" y1="15" y2="3" />
    </Icon>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </Icon>
  );
}

export function DocIcon({ className }: IconProps) {
  return (
    <Icon className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </Icon>
  );
}

/* ── Primitives ── */

export function Card({
  title,
  action,
  children,
  className,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const hasHeader = title !== undefined || action !== undefined;
  return (
    <div className={`rounded-xl border border-gray-200 bg-white ${className ?? ''}`}>
      {hasHeader && (
        <div className="flex items-center justify-between gap-2 px-4 pt-3">
          {title !== undefined && <h4 className="text-sm font-semibold text-gray-900">{title}</h4>}
          {action}
        </div>
      )}
      <div className={`space-y-2 px-4 pb-4 ${hasHeader ? 'pt-2' : 'pt-4'}`}>{children}</div>
    </div>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      {action}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  return (
    <div className="grid grid-cols-[110px_1fr] items-center gap-2">
      <label htmlFor={id} className="text-sm text-gray-500">
        {label}
      </label>
      {isValidElement<Record<string, unknown>>(children)
        ? cloneElement(children, { id })
        : children}
    </div>
  );
}

export function TextInput({
  size = 'md',
  className = '',
  ...rest
}: Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & { size?: InputSize }) {
  return (
    <input
      {...rest}
      className={`w-full rounded-lg border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black ${SIZES[size]} ${className}`}
    />
  );
}

export function TextArea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...rest}
      className={`w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black ${className}`}
    />
  );
}

export function SelectInput({
  value,
  onChange,
  options,
  size = 'md',
  className = '',
  disabled,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
  size?: InputSize;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full rounded-lg border border-gray-200 bg-white text-gray-900 transition-colors outline-none focus:border-black focus:ring-1 focus:ring-black ${SIZES[size]} ${className}`}
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export function IconButton({
  children,
  title,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      title={title}
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function AddButton({
  onClick,
  children,
  className = '',
}: {
  onClick: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex shrink-0 items-center gap-1 rounded-lg border border-gray-200 px-2 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50 hover:text-gray-900 ${className}`}
    >
      {children}
    </button>
  );
}
