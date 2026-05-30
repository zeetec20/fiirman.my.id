import bio from "../data/bio.generated.json";

export function getBioHtml(): string {
	return (bio as { html: string }).html;
}
