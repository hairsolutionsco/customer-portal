---
name: hubspot-cms-advanced-patterns
description: Guide for advanced HubSpot CMS development patterns. Use for implementing design systems, configuring theme and module fields (fields.json), optimizing performance, and applying SEO best practices.
---

# HubSpot CMS Advanced Patterns

This skill covers advanced techniques for developing robust, scalable, and performant themes on the HubSpot CMS. It focuses on creating intuitive editing experiences for content creators, implementing design systems, and optimizing site performance.

## Theme and Module Fields (`fields.json`)

The `fields.json` file is the cornerstone of the HubSpot CMS editing experience. It defines the controls available to content creators in the page editor and theme settings.

### Field Types

HubSpot offers a wide variety of field types to accommodate different content needs:

*   **Text & Rich Text:** For standard content input.
*   **Image & Video:** For media assets.
*   **Boolean:** For simple on/off toggles.
*   **Choice & Number:** For specific selections or numerical values.
*   **Color & Font:** For styling controls.
*   **Link:** For internal or external URLs.

### Organizing Fields

A well-organized `fields.json` is crucial for usability.

*   **Grouping:** Use the `group` field type to cluster related fields together (e.g., grouping all button styling options).
*   **Display Conditions:** Use `visibility` rules to show or hide fields based on the values of other fields. This prevents clutter and guides the user through the configuration process.

```json
{
  "name": "button_style",
  "label": "Button Style",
  "required": false,
  "locked": false,
  "type": "choice",
  "choices": [
    ["primary", "Primary"],
    ["secondary", "Secondary"]
  ],
  "default": "primary"
},
{
  "name": "custom_color",
  "label": "Custom Color",
  "required": false,
  "locked": false,
  "type": "color",
  "visibility": {
    "controlling_field": "button_style",
    "controlling_value_regex": "secondary"
  }
}
```

## Implementing Design Systems

A design system ensures consistency across a website. In HubSpot CMS, this is primarily achieved through the `theme.json` file and style fields.

### `theme.json` Configuration

The `theme.json` file defines the global settings for your theme. It allows you to establish a central repository for brand colors, typography, and spacing.

```json
{
  "name": "My Custom Theme",
  "author": "My Agency",
  "preview_path": "templates/home.html",
  "style_settings": [
    {
      "name": "colors",
      "label": "Brand Colors",
      "type": "group",
      "children": [
        {
          "name": "primary",
          "label": "Primary Color",
          "type": "color",
          "default": "#ff7a59"
        }
      ]
    }
  ]
}
```

### Using Theme Settings in CSS

The values defined in `theme.json` can be accessed in your CSS files using HubL. This allows you to create dynamic stylesheets that respond to changes made in the theme settings UI.

```css
/* In your theme's main CSS file (e.g., theme.css) */
:root {
  --primary-color: {{ theme.colors.primary.color }};
}

.button-primary {
  background-color: var(--primary-color);
}
```

## Performance Optimization

Website speed is critical for user experience and SEO. HubSpot CMS provides several mechanisms for optimizing performance.

### Image Optimization

HubSpot automatically resizes and compresses images, but developers should still follow best practices:

*   **Lazy Loading:** Use the `loading="lazy"` attribute on images that appear below the fold.
*   **Responsive Images:** Use the `srcset` attribute to serve appropriately sized images based on the user's device. The `resize_image_url` HubL function can generate these URLs.

```hubl
<img src="{{ resize_image_url(module.image_field.src, 800) }}" 
     srcset="{{ resize_image_url(module.image_field.src, 400) }} 400w,
             {{ resize_image_url(module.image_field.src, 800) }} 800w"
     sizes="(max-width: 600px) 400px, 800px"
     alt="{{ module.image_field.alt }}"
     loading="lazy">
```

### Code Minification and Concatenation

HubSpot automatically minifies CSS and JavaScript files when they are served. However, developers should strive to minimize the number of HTTP requests by concatenating files where appropriate or using HTTP/2 features.

### Caching

Leverage browser caching by setting appropriate cache headers for static assets. HubSpot handles much of this automatically, but understanding the caching mechanisms is beneficial.

## SEO Best Practices

HubSpot CMS includes built-in SEO tools, but developers must ensure the underlying code supports these efforts.

*   **Semantic HTML:** Use appropriate HTML5 tags (`<header>`, `<nav>`, `<main>`, `<article>`, `<footer>`) to structure content logically.
*   **Meta Tags:** Ensure templates include dynamic meta titles and descriptions using HubL variables (`{{ content.html_title }}`, `{{ content.meta_description }}`).
*   **Canonical URLs:** Include canonical tags to prevent duplicate content issues (`<link rel="canonical" href="{{ content.absolute_url }}">`).
*   **Structured Data (Schema.org):** Implement JSON-LD structured data to provide search engines with explicit context about the page content (e.g., Articles, Products, Events).

## Child Themes

Child themes allow you to extend or modify an existing theme without altering its core files. This is essential for maintaining upgradeability. When the parent theme is updated, the child theme inherits the changes while preserving its specific customizations.

To create a child theme, you define the `extends` property in the child theme's `theme.json` file, pointing to the path of the parent theme.
