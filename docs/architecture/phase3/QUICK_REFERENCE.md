# Phase 3 Component Migration - Quick Reference

## Common Tailwind to Bootstrap Mappings

### Layout & Spacing
| Tailwind | Bootstrap | Notes |
|----------|-----------|-------|
| `flex` | `d-flex` | |
| `flex-col` | `flex-column` | |
| `items-center` | `align-items-center` | |
| `justify-center` | `justify-content-center` | |
| `space-y-2` | Custom utility or `my-2` on children | |
| `gap-2` | `gap-2` | Bootstrap 5 supports gap! |
| `w-full` | `w-100` | |
| `h-full` | `h-100` | |
| `mx-auto` | `mx-auto` | Same! |

### Typography
| Tailwind | Bootstrap | Notes |
|----------|-----------|-------|
| `text-sm` | `small` or `fs-6` | |
| `text-lg` | `fs-5` | |
| `font-semibold` | `fw-semibold` | |
| `text-center` | `text-center` | Same! |
| `text-red-500` | `text-danger` | |
| `text-gray-500` | `text-muted` | |

### Components
| Tailwind/shadcn | Bootstrap | Notes |
|-----------------|-----------|-------|
| `<Button>` | `<Button>` | Different variants |
| `<Input>` | `<Form.Control>` | |
| `<Label>` | `<Form.Label>` | |
| `<Card>` | `<Card>` | Direct mapping |
| `<Dialog>` | `<Modal>` | Different API |
| `<Select>` | `<Form.Select>` | |
| `<Checkbox>` | `<Form.Check>` | |

### Colors
| Tailwind | Bootstrap |
|----------|-----------|
| `bg-blue-500` | `bg-primary` |
| `bg-red-500` | `bg-danger` |
| `bg-green-500` | `bg-success` |
| `bg-yellow-500` | `bg-warning` |
| `bg-gray-100` | `bg-light` |
| `bg-gray-900` | `bg-dark` |

### Borders & Shadows
| Tailwind | Bootstrap |
|----------|-----------|
| `border` | `border` |
| `border-2` | `border border-2` |
| `rounded` | `rounded` |
| `rounded-lg` | `rounded-3` |
| `shadow` | `shadow` |
| `shadow-lg` | `shadow-lg` |

## Component Migration Pattern

### Original (Doctor-Dok with Tailwind)
```tsx
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

<div className="flex flex-col space-y-2 gap-2 mb-4">
  <Label htmlFor="email">Email</Label>
  <Input type="email" id="email" />
  <Button variant="destructive" size="sm">Delete</Button>
</div>
```

### Migrated (Bootstrap)
```tsx
import { Form, Button } from 'react-bootstrap'

<div className="d-flex flex-column mb-4">
  <Form.Group className="mb-2">
    <Form.Label htmlFor="email">Email</Form.Label>
    <Form.Control type="email" id="email" />
  </Form.Group>
  <Button variant="danger" size="sm">Delete</Button>
</div>
```

## Form Integration with React Hook Form

### Both use react-hook-form! Just update the UI:

```tsx
// Doctor-Dok
<Input
  type="text"
  {...register("name", { required: true })}
/>

// Bootstrap (same register!)
<Form.Control
  type="text"
  {...register("name", { required: true })}
/>
```

## Modal/Dialog Pattern

### Doctor-Dok Dialog
```tsx
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Title</DialogTitle>
    </DialogHeader>
    {/* content */}
  </DialogContent>
</Dialog>
```

### Bootstrap Modal
```tsx
<Modal show={open} onHide={() => setOpen(false)}>
  <Modal.Header closeButton>
    <Modal.Title>Title</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {/* content */}
  </Modal.Body>
</Modal>
```

## Testing Checklist

For each migrated component:
- [ ] Visual appearance matches (or improves)
- [ ] All props work the same
- [ ] Events fire correctly
- [ ] Responsive behavior preserved
- [ ] Accessibility maintained/improved
- [ ] No console errors
- [ ] Performance similar or better

## Common Gotchas

1. **Button variants**: `destructive` → `danger`, `outline` → `outline-primary`
2. **Modal state**: `onOpenChange` → separate `onShow`/`onHide`
3. **Form validation**: Bootstrap shows validation differently
4. **Icons**: Lucide icons work in both!
5. **Spacing**: Bootstrap uses different scale (1-5 vs 1-12)
6. **Grid**: Bootstrap uses 12-column, Tailwind uses arbitrary

## Useful Commands

```bash
# Find all imports of a component
grep -r "from.*@/components/ui/button" .

# Count component usage
grep -r "<Button" . | wc -l

# Find Tailwind classes to convert
grep -r "className.*flex" . --include="*.tsx"
```

## Resources

- [Bootstrap 5 Utilities](https://getbootstrap.com/docs/5.0/utilities/flex/)
- [React Bootstrap Components](https://react-bootstrap.github.io/components/alerts/)
- [Bootstrap 5 Forms](https://getbootstrap.com/docs/5.0/forms/overview/)
- [Migration Utilities SCSS](/apps/combined-template/src/styles/migration/tailwind-to-bootstrap.scss)