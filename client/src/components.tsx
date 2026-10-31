import type {
  ButtonHTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
} from "react";
import * as Label from "@radix-ui/react-label";
export function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button {...props} className={`button ${props.className || ""}`} />;
}
export function Field({
  label,
  id,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string; id: string }) {
  return (
    <Label.Root className="field" htmlFor={id}>
      <span>{label}</span>
      <input id={id} {...props} />
    </Label.Root>
  );
}
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <section className={`card ${className}`}>{children}</section>;
}
