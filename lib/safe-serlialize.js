// export function safeSerialize(obj) {
//   const seen = new WeakSet();
//   return JSON.stringify(obj, (key, value) => {
//     if (typeof value === "object" && value !== null) {
//       if (seen.has(value)) {
//         return "[Circular]";
//       }
//       seen.add(value);
//     }
//     return value;
//   });
// }

export function safeSerialize(data) {
  if (data === undefined || data === null) return null;
  // This round-trip strips all functions, Symbols, and internal references.
  return JSON.parse(JSON.stringify(data));
}
