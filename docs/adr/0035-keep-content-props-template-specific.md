# Keep content props template-specific

Every Form Template will include polished default copy that works immediately. A template may expose a small number of optional Content Slots such as `title`, `description`, or `successMessage` only when they are natural reusable parts of that specific design. Other templates may expose no content props when their wording is tightly integrated into the composition.

FormMuse will not standardize the same content props across all templates, create a universal `content` configuration object, add render props for ordinary wording, or expose every field label, hint, button, and decorative sentence. Validation and safe failure messages remain controlled by the template. Each public Content Slot must be represented in structured FormMuse Metadata and the generated Props table. Deeper copy changes and localization remain direct edits to adopter-owned source in V1.
