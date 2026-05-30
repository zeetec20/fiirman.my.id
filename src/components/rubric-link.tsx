import { Link, type LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

type Props = LinkProps & {
	children: ReactNode;
	className?: string;
};

/**
 * Inline link styled in rubric red with a hairline underline. Use for
 * navigation and prose links inside `<Link>`-eligible targets.
 *
 * Caller `className` is concatenated AFTER base utilities (not merged via
 * tailwind-merge). To override the base `text-rubric` colour at a single
 * call site, use Tailwind's important prefix: `className="!text-fg"`.
 */
export function RubricLink({ children, className = "", ...rest }: Props) {
	return (
		<Link
			{...rest}
			className={`text-rubric border-b border-current no-underline transition-[border-color] duration-[120ms] ease-[cubic-bezier(0.2,0,0.2,1)] hover:border-transparent ${className}`}
		>
			{children}
		</Link>
	);
}
