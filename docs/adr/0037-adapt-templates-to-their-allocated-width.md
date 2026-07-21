# Adapt templates to their allocated width

Every Form Template will be mobile-first and fluid, but its responsive behavior will be based on the inline space actually allocated by the adopter rather than inferred only from the browser viewport. FormMuse calls that allocated space the Responsive Frame.

Templates will prefer naturally responsive Grid and Flexbox. When internal columns, spacing, alignment, content arrangement, or decorative placement needs explicit width thresholds, the template root will become a slug-named inline-size container and descendants will use Tailwind container variants. Templates whose fluid layout already works will not add unnecessary query containment.

The primary form flow will normally become one column at 320 CSS pixels, with an exception for compact groups that remain readable and operable. Templates must reflow at that width without losing information or functionality or creating page-level horizontal scrolling. Decorative artwork must recompose or clip safely without covering controls, focus indicators, validation, or submission feedback.

Viewport-width media queries are reserved for genuinely page-level behavior. Environmental and viewport-level queries remain appropriate for reduced motion, hover capability, print, orientation, and constrained viewport height.

Mobile-first does not make desktop an enlarged mobile layout. Every template will deliberately compose its intended narrow, intermediate, and wide presentations, using richer desktop arrangements when they strengthen the concept. Publication checks will cover 320 CSS pixels, widths immediately below and above every template-defined layout breakpoint, the intended wide presentation width, and the public desktop, tablet, and mobile preview presets.
