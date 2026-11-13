# Android Chrome Password Manager Workaround

## Problem
Android Chrome shows an unnecessary password management popup above the keyboard for text input fields, taking up valuable screen real estate. This happens even for non-password fields like `type="text"`, `type="number"`, `type="tel"`, etc.

## Solution
We temporarily change the input type to `type="search"` on Android Chrome mobile devices only, as this type doesn't trigger the password manager popup. CSS is applied to remove the search input styling to maintain visual consistency.

## Implementation

### Files Modified
1. `src/components/ui/input.tsx` - Added detection and conditional type switching
2. `src/app/globals.css` - Added CSS to remove search input styling

### Detection Logic
- Only applies on Android devices
- Only applies on Chrome browser (not Edge or other Chromium browsers)
- Only applies on mobile/tablet viewports (< 768px width)
- Only applies to text-like input types that trigger the issue

### How to Remove This Workaround
When Chrome fixes this issue, remove the following:

1. In `src/components/ui/input.tsx`:
   - Remove the `useAndroidChromeWorkaround` function
   - Remove the `shouldApplyWorkaround` logic
   - Remove the `effectiveType` logic
   - Remove the conditional CSS classes for search styling
   - Revert to simply using `type={type}`

2. In `src/app/globals.css`:
   - Remove the entire "TODO: Remove this workaround" CSS block (lines with search input styling)

3. Delete this documentation file

## References
- [Stack Overflow Discussion](https://stackoverflow.com/questions/...)
- [Chrome Bug Report](https://bugs.chromium.org/p/chromium/issues/...)

## Testing
Test on Android Chrome to verify:
- No password manager popup appears
- Input still functions normally
- Visual appearance is unchanged
- Accessibility is not significantly impacted
