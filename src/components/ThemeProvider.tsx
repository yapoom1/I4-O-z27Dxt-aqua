"use client";

import { useEffect } from "react";
import { THEME_MODE } from "@/config/theme";

/**
 * ThemeProvider
 *
 * Reads THEME_MODE from src/config/theme.ts and applies
 * a `data-theme` attribute to <html> so CSS variables resolve correctly.
 *
 *  'auto'  → follows system theme media queries
 *  'light' → forces light variables and disables prefers-color-scheme: dark rules
 *  'dark'  → forces dark variables and forces prefers-color-scheme: dark rules
 */
export default function ThemeProvider() {
  useEffect(() => {
    const html = document.documentElement;

    // Apply data-theme attribute for global variable shifts
    if (THEME_MODE === "auto") {
      html.removeAttribute("data-theme");
    } else {
      html.setAttribute("data-theme", THEME_MODE);
    }

    if (THEME_MODE === "auto") return;

    // Helper to override loaded component styles
    const overrideMediaRules = () => {
      try {
        for (let i = 0; i < document.styleSheets.length; i++) {
          const sheet = document.styleSheets[i];
          try {
            const rules = sheet.cssRules || sheet.rules;
            if (!rules) continue;
            for (let j = 0; j < rules.length; j++) {
              const rule = rules[j];
              // CSSMediaRule is type 4
              if (rule.type === 4 || (rule instanceof CSSMediaRule)) {
                const mediaRule = rule as CSSMediaRule;
                const mediaText = mediaRule.media.mediaText;
                if (
                  mediaText.includes("prefers-color-scheme: dark") || 
                  mediaText.includes("prefers-color-scheme:dark")
                ) {
                  if (THEME_MODE === "light") {
                    // Make it never match
                    mediaRule.media.mediaText = "not all";
                  } else if (THEME_MODE === "dark") {
                    // Make it always match
                    mediaRule.media.mediaText = "all";
                  }
                }
              }
            }
          } catch (err) {
            // Ignore security constraints on external sheets
          }
        }
      } catch (err) {
        // Safe check block
      }
    };

    // Execute immediately on mount
    overrideMediaRules();

    // Observe head changes for Next.js hot-reloaded dev stylesheet injections
    const observer = new MutationObserver(() => {
      overrideMediaRules();
    });
    observer.observe(document.head, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
    };
  }, []);

  return null;
}
