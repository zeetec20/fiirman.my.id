import * as React from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
	CircleCheckIcon,
	InfoIcon,
	Loader2Icon,
	OctagonXIcon,
	TriangleAlertIcon,
} from "lucide-react";

function useThemeFromDocument(): ToasterProps["theme"] {
	const [theme, setTheme] = React.useState<ToasterProps["theme"]>("system");

	React.useEffect(() => {
		const root = document.documentElement;
		const read = () => {
			const mode = root.getAttribute("data-theme");
			if (mode === "light" || mode === "dark") {
				setTheme(mode);
			} else {
				setTheme("system");
			}
		};
		read();
		const obs = new MutationObserver(read);
		obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
		return () => obs.disconnect();
	}, []);

	return theme;
}

const Toaster = ({ ...props }: ToasterProps) => {
	const theme = useThemeFromDocument();

	return (
		<Sonner
			theme={theme}
			className="toaster group"
			icons={{
				success: <CircleCheckIcon className="size-4" />,
				info: <InfoIcon className="size-4" />,
				warning: <TriangleAlertIcon className="size-4" />,
				error: <OctagonXIcon className="size-4" />,
				loading: <Loader2Icon className="size-4 animate-spin" />,
			}}
			style={
				{
					"--normal-bg": "var(--color-popover)",
					"--normal-text": "var(--color-popover-foreground)",
					"--normal-border": "var(--color-border)",
					"--border-radius": "var(--radius)",
				} as React.CSSProperties
			}
			toastOptions={{
				classNames: {
					toast: "cn-toast",
				},
			}}
			{...props}
		/>
	);
};

export { Toaster };
