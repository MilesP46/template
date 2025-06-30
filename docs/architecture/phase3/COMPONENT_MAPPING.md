# Doctor-Dok to Rasket Component Migration Map

## Overview
- **Total Doctor-Dok components**: 64 (including UI sub-components)
- **Direct mappings available**: 18
- **Custom components needed**: 46
- **Migration complexity**: HIGH

## Component Analysis Summary

### Doctor-Dok Stack
- **UI Framework**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS
- **Form Management**: react-hook-form
- **Icons**: lucide-react

### Rasket Stack
- **UI Framework**: Bootstrap 5 + React Bootstrap
- **Styling**: Bootstrap classes + SCSS
- **Form Management**: react-hook-form (compatible!)
- **Icons**: Lucide React (compatible!)

## Category Mappings

### Authentication & Forms

| Doctor-Dok Component | Path | Rasket Equivalent | Path | Migration Notes | Complexity |
|---------------------|------|------------------|------|-----------------|------------|
| authorize-database-form.tsx | /components/ | Custom Form with Bootstrap | - | Uses react-hook-form (compatible), needs Bootstrap styling | MEDIUM |
| authorize-popup.tsx | /components/ | Bootstrap Modal + Form | - | Convert Dialog to Modal | MEDIUM |
| create-database-form.tsx | /components/ | Custom Form with Bootstrap | - | Complex form with validation | HIGH |
| change-key-form.tsx | /components/ | Custom Form with Bootstrap | - | Password input handling | MEDIUM |
| change-key-popup.tsx | /components/ | Bootstrap Modal | - | Simple modal conversion | LOW |

### Layout & Navigation  

| Doctor-Dok Component | Path | Rasket Equivalent | Path | Migration Notes | Complexity |
|---------------------|------|------------------|------|-----------------|------------|
| top-header.tsx | /components/ | TopNavigationBar | /components/layout/TopNavigationBar/ | Major refactor needed | HIGH |
| top-header-static.tsx | /components/ | PageTitle + Breadcrumb | /components/ | Simpler static version | LOW |
| authorization-guard.tsx | /components/ | Custom HOC | - | Auth logic compatible | MEDIUM |
| theme-provider.tsx | /components/ | ThemeCustomizer | /components/ | Different theming approach | MEDIUM |

### Data Display

| Doctor-Dok Component | Path | Rasket Equivalent | Path | Migration Notes | Complexity |
|---------------------|------|------------------|------|-----------------|------------|
| record-item.tsx | /components/ | Bootstrap Card + Custom | - | Complex component (642 lines) | HIGH |
| record-list.tsx | /components/ | Table component | /components/Table/ | List to table conversion | MEDIUM |
| folder-item.tsx | /components/ | Bootstrap ListGroup.Item | - | Simple list item | LOW |
| stats-popup.tsx | /components/ | Bootstrap Modal + Charts | - | Modal with data viz | MEDIUM |
| audit-log.tsx | /components/ | Table component | /components/Table/ | Table-based display | LOW |
| audit-log-item.tsx | /components/ | Bootstrap Card/ListItem | - | Simple item component | LOW |

### Interactive Elements

| Doctor-Dok Component | Path | Rasket Equivalent | Path | Migration Notes | Complexity |
|---------------------|------|------------------|------|-----------------|------------|
| chat.tsx | /components/ | Custom Implementation | - | Complex chat UI (580 lines) | HIGH |
| chat-message.tsx | /components/ | Bootstrap Card variant | - | Message bubbles | MEDIUM |
| voice-recorder.tsx | /components/ | Custom Implementation | - | No Bootstrap equivalent | HIGH |
| encrypted-attachment-uploader.tsx | /components/ | DropzoneFormInput + Custom | /components/form/ | Complex file handling (529 lines) | HIGH |
| zoomable-image.tsx | /components/ | Bootstrap Modal + Custom | - | Image zoom functionality | MEDIUM |

### UI Components (shadcn/ui)

| Doctor-Dok Component | Path | Rasket Bootstrap Equivalent | Migration Notes | Complexity |
|---------------------|------|---------------------------|-----------------|------------|
| ui/button.tsx | /components/ui/ | Button (react-bootstrap) | Direct mapping | LOW |
| ui/input.tsx | /components/ui/ | FormControl | Direct mapping | LOW |
| ui/textarea.tsx | /components/ui/ | FormControl as="textarea" | Direct mapping | LOW |
| ui/select.tsx | /components/ui/ | Form.Select | Direct mapping | LOW |
| ui/checkbox.tsx | /components/ui/ | Form.Check type="checkbox" | Direct mapping | LOW |
| ui/label.tsx | /components/ui/ | Form.Label | Direct mapping | LOW |
| ui/card.tsx | /components/ui/ | Card components | Direct mapping | LOW |
| ui/alert.tsx | /components/ui/ | Alert | Direct mapping | LOW |
| ui/dialog.tsx | /components/ui/ | Modal | Different API | MEDIUM |
| ui/popover.tsx | /components/ui/ | OverlayTrigger + Popover | Different API | MEDIUM |
| ui/accordion.tsx | /components/ui/ | Accordion | Direct mapping | LOW |
| ui/tabs.tsx | /components/ui/ | Tabs | Direct mapping | LOW |
| ui/table.tsx | /components/ui/ | Table | Direct mapping | LOW |
| ui/avatar.tsx | /components/ui/ | Custom with Bootstrap | No direct equivalent | MEDIUM |
| ui/command.tsx | /components/ui/ | Custom implementation | Command palette | HIGH |
| ui/calendar.tsx | /components/ui/ | Custom with react-datepicker | No Bootstrap calendar | MEDIUM |
| ui/drawer.tsx | /components/ui/ | Offcanvas | Similar concept | MEDIUM |
| ui/sheet.tsx | /components/ui/ | Offcanvas | Similar to drawer | MEDIUM |
| ui/alert-dialog.tsx | /components/ui/ | Modal with confirm | Confirmation dialogs | MEDIUM |
| ui/sonner.tsx | /components/ui/ | Toast (react-bootstrap) | Toast notifications | MEDIUM |
| ui/password-input.tsx | /components/ui/ | PasswordFormInput | Already exists in Rasket | LOW |

### Specialized Components

| Doctor-Dok Component | Migration Strategy | Complexity |
|---------------------|-------------------|------------|
| credenza.tsx | Custom modal implementation | HIGH |
| translation-benchmark-popup.tsx | Bootstrap Modal + Custom | HIGH |
| template-string-renderer.tsx | Keep as utility | LOW |
| icons.tsx | Keep as-is (lucide compatible) | LOW |
| ParsingProgressDialog.tsx | Bootstrap Modal + ProgressBar | MEDIUM |
| settings-popup.tsx | Bootstrap Modal + Forms | HIGH |
| record-form.tsx | Complex form migration | HIGH |
| shared-keys-popup.tsx | Bootstrap Modal + List | MEDIUM |
| key-print.tsx | Custom print component | MEDIUM |

## Migration Priorities

### 1. **High Priority** (Blocking Phase 3 - Core functionality)
- authorization-guard.tsx (auth flow dependency)
- authorize-database-form.tsx (auth UI)
- top-header.tsx (main navigation)
- All ui/* basic components (foundation for other components)

### 2. **Medium Priority** (Core features)
- record-item.tsx (main data display)
- record-list.tsx (data listing)
- record-form.tsx (data entry)
- chat.tsx (if chat feature is essential)
- encrypted-attachment-uploader.tsx (file handling)

### 3. **Low Priority** (Enhancement features)
- voice-recorder.tsx
- translation-benchmark-popup.tsx
- stats-popup.tsx
- audit-log components
- zoomable-image.tsx

## Custom Components Required

### Must Build from Scratch
1. **Command Palette** (ui/command.tsx) - No Bootstrap equivalent
2. **Voice Recorder** - Audio recording functionality
3. **Chat System** - Real-time messaging UI
4. **Encrypted Attachment Handler** - Security-focused file upload
5. **Avatar Component** - User/profile images
6. **Calendar Component** - Date picker functionality

### Significant Customization Needed
1. **Record Item** - Complex card with many features
2. **Top Header** - Navigation with dynamic elements
3. **Settings Management** - Multi-tab preferences
4. **Translation Benchmark** - Specialized functionality

## Styling Migration Strategy

### Tailwind to Bootstrap Mapping
```
Tailwind Classes → Bootstrap Classes
- flex → d-flex
- flex-col → flex-column
- space-y-2 → Bootstrap spacing utilities (my-2)
- gap-2 → gap-2 (Bootstrap 5 supports gap!)
- text-sm → small or fs-6
- font-semibold → fw-semibold
- bg-* → bg-* (similar but different color names)
- border-2 → border border-2
- rounded → rounded
- shadow → shadow
```

### Theme System Integration
- Doctor-Dok uses CSS variables for theming
- Rasket uses Bootstrap's theming with SCSS variables
- Need adapter layer for theme switching

### Responsive Design Considerations
- Doctor-Dok uses Tailwind's responsive prefixes (sm:, md:, lg:)
- Rasket uses Bootstrap's responsive utilities (d-sm-*, col-md-*)
- Both are mobile-first, migration should be straightforward

## Component Dependencies

### Critical Path Dependencies
```
authorization-guard.tsx
  └─> authorize-database-form.tsx
      └─> ui/input, ui/button, ui/checkbox
          └─> Bootstrap form components

top-header.tsx
  └─> Multiple UI components
  └─> Theme provider
  └─> Navigation structure

record-item.tsx
  └─> ui/card, ui/button
  └─> chat-message.tsx
  └─> record-item-extra.tsx
  └─> zoomable-image.tsx
```

### Shared Utilities
- icons.tsx - Can be used as-is
- crypto.ts utilities - Keep unchanged
- API clients - Keep unchanged

## Testing Considerations

### Component Testing Strategy
1. **Unit tests** for each migrated component
2. **Visual regression tests** for UI consistency
3. **Integration tests** for form submissions
4. **E2E tests** for critical user flows

### Validation Checklist per Component
- [ ] Props interface matches original
- [ ] All features preserved
- [ ] Responsive behavior maintained
- [ ] Accessibility standards met
- [ ] Theme compatibility verified
- [ ] Performance benchmarked

## Migration Risks & Mitigation

### High Risk Areas
1. **Chat System** - Complex real-time functionality
   - Mitigation: Consider using existing chat library
2. **File Upload Security** - Encryption handling
   - Mitigation: Thorough security review
3. **Theme System** - Different approaches
   - Mitigation: Build adapter layer

### Medium Risk Areas
1. **Form Validation** - Different validation display
2. **Modal/Dialog behavior** - API differences
3. **Navigation state** - Router integration

## Notes

- React Hook Form is used in both systems (major win!)
- Lucide icons are compatible between both
- Consider creating a compatibility layer for smoother migration
- Some Doctor-Dok components are over-engineered for current needs
- Bootstrap 5's utility classes can replace much of Tailwind