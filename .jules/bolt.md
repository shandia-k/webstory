## 2024-05-23 - CSS Injection Anti-Pattern
**Learning:** Injecting <style> tags with @import inside React render loops causes performance degradation due to CSS re-parsing and layout thrashing on every render.
**Action:** Always move static styles and font imports to global CSS or HTML files.
