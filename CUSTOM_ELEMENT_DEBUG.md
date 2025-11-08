# Custom Element Debugging Guide

## Overview

The custom element feature adds support for `££name::url££` syntax in markdown, which renders as:
```html
<span class="my-custom-span" data-name="name" href="url"></span>
```

## How It Works

### 1. **Pattern Detection** (smd.js lines 1411-1441)
- Detects opening `££` pattern
- When `p.pending === "£"` and `char === '£'`, it updates `p.pending = "££"`
- When `p.pending === "££"` and next char is not space/newline, creates `CUSTOM_ELEMENT` token

### 2. **Content Accumulation** (smd.js lines 1070-1101)
- While in `CUSTOM_ELEMENT` token state, accumulates all characters into `p.pending`
- Does NOT call `add_text()` to avoid creating text children
- Detects closing `££` pattern using `.endsWith("££")`

### 3. **Parsing & Attributes** (smd.js lines 1072-1090)
- When closing `££` is found:
  - Extracts content from `p.pending.slice(0, -1)` (removes trailing '£')
  - Splits on `::` to get name and url
  - Calls `p.renderer.set_attr()` for both NAME and HREF attributes
  - Calls `end_token()` without calling `add_text()`

### 4. **HTML Rendering** (smd.js lines 1679-1684)
- `default_add_token()` creates `<span class="my-custom-span">`
- `default_set_attr()` sets attributes as `data-name` and `href`

## Logging Points

All strategic logging has been added to trace execution:

### Parser Logs:
- **`case '£':`** (line 1412) - Shows when £ character is encountered
- **`case CUSTOM_ELEMENT:`** (line 1071) - Shows content accumulation
- **`No check hit:`** (line 1537) - Shows when pending gets flushed to text

### Renderer Logs:
- **`default_add_token()`** (line 1618) - Shows when tokens are created
- **`CUSTOM_ELEMENT case`** (line 1680) - Shows span creation
- **`default_set_attr()`** (line 1710) - Shows attribute setting

## Testing

### Run automated tests:
```bash
npm test
```

### Run debug script with full logs:
```bash
node test_custom_logs.js
```

### Open HTML demo (with visual debugging):
```bash
# Open demo_custom_element.html in a browser
# It will show:
# 1. Live markdown rendering
# 2. Console logs in the Debug Info section
# 3. Final HTML output
```

## Expected Behavior

### Input:
```markdown
Check out ££GitHub::https://github.com££ for more info.
```

### Logs should show:
1. `£ case:` triggered twice (for each £)
2. `CUSTOM_ELEMENT case:` for each character in "GitHub::https://github.com"
3. `Found closing ££, parsing content`
4. `Setting attributes: name = "GitHub" , url = "https://github.com"`
5. `default_add_token called with type: Custom_Element`
6. `Creating span.my-custom-span`
7. `default_set_attr: data-name = GitHub`
8. `default_set_attr: href = https://github.com`

### HTML Output:
```html
<p>
  <span class="fade-in">Check out </span>
  <span class="my-custom-span" data-name="GitHub" href="https://github.com"></span>
  <span class="fade-in"> for more info.</span>
</p>
```

## Common Issues

### Issue 1: Custom element renders as plain text
**Possible causes:**
- The `££` pattern is not being detected
- Token is not transitioning to CUSTOM_ELEMENT state
- Check logs for `case '£':` to see if it's being triggered

### Issue 2: No attributes on span
**Possible causes:**
- The `::` separator is missing or malformed
- Content is not being accumulated in `p.pending`
- Check logs for `separator_index` value

### Issue 3: Text appears as children instead of attributes
**Possible causes:**
- `add_text()` is being called during accumulation
- Check logs for "No check hit" during CUSTOM_ELEMENT processing
- Verify CUSTOM_ELEMENT is excluded from other token checks

## Key Code Changes

1. **Added token constant** (line 40):
   ```javascript
   CUSTOM_ELEMENT = 32
   ```

2. **Added NAME attribute** (line 129):
   ```javascript
   NAME = 32
   ```

3. **Fixed pattern detection** (line 1426):
   ```javascript
   } else if ("££" === p.pending) {  // Was just 'else' before
   ```

4. **Added CUSTOM_ELEMENT exclusion** (line 1521):
   ```javascript
   p.token !== CUSTOM_ELEMENT &&  // Added this line
   ```

5. **Content accumulation** (lines 1087-1101):
   - Accumulates in `p.pending` (not `p.text`)
   - Always calls `continue` to skip default handling

## Files Modified

- **smd.js** - Main parser and renderer
- **smd_test.js** - Added test cases
- **demo_custom_element.html** - Interactive demo with debugging
- **test_custom_logs.js** - CLI debugging script

## Next Steps

1. Open `demo_custom_element.html` in a browser
2. Check the Debug Info section for logs
3. Try entering: `Test ££example::https://example.com££ text`
4. Verify the span has correct attributes
5. If issues persist, check browser console for full logs
