# TypeScript to Rust Migration Guide

## Type Mappings

| TypeScript | Rust |
|------------|------|
| `string` | `String or &str` |
| `number` | `i32, i64, f64, etc.` |
| `boolean` | `bool` |
| `any` | `AVOID - use specific type` |
| `unknown` | `AVOID - use specific type` |
| `void` | `()` |
| `null | undefined` | `Option<T>` |
| `T | Error` | `Result<T, Error>` |
| `T[]` | `Vec<T>` |
| `Map<K,V>` | `HashMap<K,V>` |
| `Set<T>` | `HashSet<T>` |
| `Promise<T>` | `Future<Output = T>` |

## Pattern Mappings

| TypeScript Pattern | Rust Pattern |
|-------------------|-------------|
| `try { } catch { }` | `match result { Ok() => {}, Err() => {} }` |
| `throw new Error()` | `return Err(Error::new())` |
| `if (x === null)` | `if let None = x` |
| `x?.y?.z` | `x.and_then(|x| x.y).and_then(|y| y.z)` |
| `...spread` | `explicit cloning or field-by-field` |
| `async/await` | `async/.await (or remove if not needed)` |
| `JSON.parse()` | `serde_json::from_str()` |
| `JSON.stringify()` | `serde_json::to_string()` |

## API Function Signatures

### TypeScript
```typescript
loadWorkflow(yaml: string): Result<Flow>
saveWorkflow(flow: Flow): Result<string>
validateWorkflow(flow: Flow): ValidationError[]
addStep(flow: Flow, step: Step): Result<Flow>
```

### Rust
```rust
fn load_workflow(yaml: &str) -> Result<Flow, Error>
fn save_workflow(flow: &Flow) -> Result<String, Error>
fn validate_workflow(flow: &Flow) -> Vec<ValidationError>
fn add_step(flow: Flow, step: Step) -> Result<Flow, Error>
```
