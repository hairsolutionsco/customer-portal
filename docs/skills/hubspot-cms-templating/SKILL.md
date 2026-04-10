---
name: hubspot-cms-templating
description: Guide for writing and structuring HubSpot CMS templates using HubL (HubSpot Markup Language). Use for creating HTML+HubL templates, building custom modules, writing HubL syntax (variables, loops, conditionals), and implementing template inheritance.
---

# HubSpot CMS Templating & HubL

This skill provides comprehensive guidance on building templates and modules for the HubSpot CMS using HubL (HubSpot Markup Language). It covers syntax, control structures, variables, and best practices for creating dynamic, reusable components.

## HubL Overview

HubL is a templating language inspired by Jinja2, designed specifically for the HubSpot CMS. It allows developers to inject dynamic content, logic, and HubSpot data into HTML files. HubL is evaluated on the server before the final HTML is sent to the browser.

### Basic Syntax

HubL uses specific delimiters to distinguish its code from standard HTML:

*   **Statements (`{% %}`):** Used for logic and control structures, such as loops, conditionals, and variable assignments. These do not output anything directly to the page.
*   **Expressions (`{{ }}`):** Used to print the value of a variable or the result of an expression to the page.
*   **Comments (`{# #}`):** Used for developer notes. Anything within these delimiters is ignored by the HubL parser and will not appear in the final HTML.

## Control Structures

Control structures dictate the flow of execution within a template, allowing for dynamic content rendering based on specific conditions or data sets.

### Conditionals (If/Else)

Conditionals allow you to execute blocks of code only if a certain expression evaluates to true.

```hubl
{% if contact.firstname %}
  <p>Hello, {{ contact.firstname }}!</p>
{% elif request.query_dict.name %}
  <p>Hello, {{ request.query_dict.name }}!</p>
{% else %}
  <p>Hello, there!</p>
{% endif %}
```

### Loops (For)

For loops are used to iterate over sequences, such as lists or dictionaries. This is essential for rendering dynamic lists of content, like blog posts or product features.

```hubl
{% set colors = ["red", "green", "blue"] %}
<ul>
  {% for color in colors %}
    <li>{{ color }}</li>
  {% endfor %}
</ul>
```

HubL provides special variables within loops, such as `loop.index` (1-indexed), `loop.index0` (0-indexed), `loop.first`, and `loop.last`, which are useful for conditional formatting within the iteration.

## Variables and Data

HubL provides access to a wide range of data, including global variables, context-specific variables, and custom variables defined within the template.

### Setting Variables

You can define your own variables using the `set` statement. These variables can store strings, numbers, booleans, lists, or dictionaries.

```hubl
{% set my_string = "Hello World" %}
{% set my_list = [1, 2, 3] %}
{% set my_dict = {name: "HubSpot", type: "CMS"} %}
```

### Global Variables

HubSpot provides numerous global variables that contain information about the current page, the portal, or the visitor. Common examples include:

*   `content`: Information about the current page or blog post (e.g., `content.name`, `content.absolute_url`).
*   `request`: Information about the HTTP request (e.g., `request.query_dict`).
*   `hub_id`: The ID of the HubSpot account.

### Filters

Filters are used to modify variables before they are output. They are applied using the pipe (`|`) operator. Multiple filters can be chained together.

```hubl
{# Capitalize the first letter #}
{{ "hubspot"|capitalize }} 

{# Format a date #}
{{ content.publish_date|datetimeformat('%B %e, %Y') }}

{# Provide a default value if the variable is empty #}
{{ contact.firstname|default("Friend") }}
```

### Functions

Functions perform specific operations and return a value. They are called using parentheses.

```hubl
{# Require a CSS file #}
{{ require_css(get_asset_url("../../css/styles.css")) }}

{# Get a specific blog post #}
{% set post = blog_post_by_id(123456789) %}
```

## Modules and Template Inheritance

HubL facilitates code reuse through modules and template inheritance, ensuring consistency and reducing duplication.

### Using Modules in Templates

Modules are self-contained components that can be included in templates. They are inserted using the `module` tag, which requires the path to the module and allows you to pass parameters.

```hubl
{% module "my_custom_module" path="../modules/my_module", label="My Module" %}
```

### Template Inheritance

Template inheritance allows you to create a base "skeleton" template that contains the common structure of your site (header, footer, navigation) and defines "blocks" that child templates can override.

**Base Template (`base.html`):**

```hubl
<!DOCTYPE html>
<html>
<head>
  <title>{% block title %}Default Title{% endblock %}</title>
</head>
<body>
  <header>...</header>
  <main>
    {% block content %}{% endblock %}
  </main>
  <footer>...</footer>
</body>
</html>
```

**Child Template (`page.html`):**

```hubl
{% extends "./base.html" %}

{% block title %}My Custom Page Title{% endblock %}

{% block content %}
  <h1>Welcome to my page</h1>
  <p>This content replaces the block in the base template.</p>
{% endblock %}
```

## Best Practices

*   **Keep Logic Minimal:** Templates should primarily focus on presentation. Complex data manipulation should be handled by serverless functions or custom modules where possible.
*   **Use Macros for Reusable Snippets:** If you have a small block of HubL/HTML that you use repeatedly within a single template, define it as a macro.
*   **Escape Output:** When outputting user-generated content or data from external sources, ensure it is properly escaped to prevent Cross-Site Scripting (XSS) vulnerabilities. HubL automatically escapes most output, but be cautious when using the `safe` filter.
