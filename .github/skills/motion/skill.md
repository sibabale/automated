---
name: motion-design
description: >
  Makes Motion a first-class design tool. Use Motion for purposeful state,
  hierarchy, and continuity transitions while respecting reduced-motion
  preferences and keeping animation code simple and readable.
---

# Motion Design

## Purpose

Motion is a production dependency, not an afterthought. Use it when animation
explains a state change, spatial relationship, hierarchy, or user action.

The Header mobile menu is the reference implementation:

- `components/molecules/header/header.tsx`
- `components/molecules/header/header.styles.ts`

It uses `AnimatePresence` for the menu lifecycle, Motion variants for entry and
exit, and a brief item stagger to communicate that the items belong to the menu.

---

## Required Workflow

Before adding motion:

1. Identify what user action or state transition motion needs to explain.
2. Use the smallest transition that makes the change clear.
3. Define readable variants in the component's data section.
4. Keep visual styles in the component's `*.styles.ts` file.
5. Wrap animated UI in `MotionConfig reducedMotion="user"`.
6. Test the public state change, not the animation implementation.

---

## Motion Rules

- Import React Motion APIs from `motion/react`.
- Use `AnimatePresence` when an element needs an exit transition before
  unmounting.
- Use `motion` elements in the styles file (for example,
  `styled(motion.ul)`) so component JSX remains declarative.
- Prefer `opacity` and `transform` properties such as `x`, `y`, and `scale`.
- Keep interaction feedback between 100–150ms; routine state transitions
  between 150–300ms.
- Make exits faster than entrances.
- Use a small stagger only when a list enters as one related group.
- Keep the static, visible state meaningful if animation cannot run.

### Header Pattern

```tsx
<AnimatePresence initial={false}>
    {isOpen && (
        <MobileNavigation
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
        >
            <MobileMenuItem variants={mobileMenuItemVariants}>
                About
            </MobileMenuItem>
        </MobileNavigation>
    )}
</AnimatePresence>
```

### Good

```tsx
const menuVariants: Variants = {
    closed: { opacity: 0, y: -8 },
    open: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.2, ease: 'easeOut', staggerChildren: 0.04 },
    },
};
```

### Avoid

```tsx
// Avoid: layout-property animation causes unnecessary reflow.
animate={{ height: isOpen ? 400 : 0, marginTop: isOpen ? 16 : 0 }}
```

```tsx
// Avoid: animation without a user-facing purpose.
<motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity }} />
```

---

## Checklist

- [ ] Motion explains a user action or state transition.
- [ ] Entrance and exit both work through `AnimatePresence` when applicable.
- [ ] `MotionConfig reducedMotion="user"` is applied.
- [ ] The transition avoids layout-property animation.
- [ ] Animation values and variants are readable and local to the component.
- [ ] Tests verify the public result of the animation-triggering interaction.
