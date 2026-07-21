# Version templates without overwriting adopters

Every Form Template will have its own semantic Template Version and changelog. CLI Installation and Manual Installation will present the latest Published Template, while Git tags retain previous source for reproducibility. FormMuse will never automatically overwrite adopter-owned code; adopters or their coding agents will inspect upstream changes with the shadcn CLI `--diff` option and manually merge only the changes they want.
