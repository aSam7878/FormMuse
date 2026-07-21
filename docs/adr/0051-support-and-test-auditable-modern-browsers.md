# Support and test auditable modern browsers

FormMuse will support the current and immediately previous stable major releases, measured at each tagged release, of Chrome, Edge, Firefox, Safari, iOS Safari, and Android Chrome. Internet Explorer and legacy browsers are outside V1. The Tailwind CSS 4 browser baseline remains a hard lower bound.

Support guarantees correct form rendering, validation, accessibility, Submission Connection behavior, Form States, responsive layout, and a polished usable result. It does not promise pixel-identical rendering. Nonessential animation and decoration may progressively simplify when optional platform features are absent, but form meaning and operation may not degrade.

Pinned Playwright Chromium, Firefox, WebKit, and mobile-emulation projects run on every pull request. These provide continuous engine and emulation coverage; WebKit is not reported as branded Safari, and emulation is not reported as a real device. Before an individual template is published, it must pass current stable branded Chrome, Edge, Firefox, and Safari smoke tests and current real-device iOS Safari and Android Chrome smoke tests. Owned physical hardware or a reputable real-device cloud may supply real-device evidence.

The complete current-and-previous-major matrix runs before the initial public launch, every tagged FormMuse release, and compatibility-affecting shared changes. Exact browser, engine, operating-system, and device versions are retained as release evidence. FormMuse will never claim official support for a version it has not actually tested.
