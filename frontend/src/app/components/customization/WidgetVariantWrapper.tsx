import { useWidgetVariant } from "@/app/utils/useWidgetVariant";

/**
 * Thin wrapper that reads the selected widget variant from the
 * customization store and applies it as `data-widget-variant` on the
 * wrapper `<div>`. All `--flowty-*` CSS custom properties inside this
 * element inherit from the variant block in `theme.css`.
 *
 * Usage:
 * ```tsx
 * <WidgetVariantWrapper>
 *   <ToDoList />
 * </WidgetVariantWrapper>
 * ```
 */
export function WidgetVariantWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const variant = useWidgetVariant();

  return (
    <div data-widget-variant={variant} style={{ display: "contents" }}>
      {children}
    </div>
  );
}