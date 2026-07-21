# Submit only transport-friendly values

Every FormMuse V1 schema will produce recursively JSON-compatible Transport Values: strings, finite numbers, booleans, null, arrays of Transport Values, and plain objects whose properties are Transport Values. This keeps the universal `onSubmit` handoff predictable for APIs, email services, automation tools, databases, and coding agents without requiring a FormMuse serialization layer.

Published submission output will not contain `Date`, `File`, `Map`, `Set`, `undefined`, `NaN`, `Infinity`, `bigint`, functions, symbols, promises, DOM objects, events, custom class instances, or other values requiring custom serialization. Optional empty data will use a deliberately documented empty string, null, empty array, or omitted key; an object will not own a property whose runtime value is undefined. Complete defaults must follow the same representation.

Date-only values use `YYYY-MM-DD`, wall-clock times use `HH:mm` with seconds only when required, and absolute instants use RFC 3339 timestamps with `Z` or an explicit UTC offset. UI controls may use temporary `Date` objects internally, but schema output, defaults, exported public values, and `onSubmit` use strings. Date-only selections must not be shifted accidentally through UTC conversion.

Publication tests will prove that validated submission values survive a JSON stringify/parse round trip without loss or semantic change. Transport-friendly representation improves integration but does not make values trusted; adopter backends still validate every submission independently.
