---
name: hubspot-cms-fundamentals
description: Guide for setting up and managing HubSpot CMS local development environments. Use for initializing projects, configuring the HubSpot CLI, understanding theme and module file structures, and managing deployment workflows.
---

# HubSpot CMS Fundamentals

This skill provides the foundational knowledge and workflows required for developing on the HubSpot CMS platform using an Integrated Development Environment (IDE). It covers local environment setup, project structure, and deployment processes.

## Core Concepts

The HubSpot CMS is built around a specific architecture that separates design, content, and logic. Understanding these core components is essential for effective development.

A **Theme** serves as the foundation of a HubSpot website. It is a single directory containing all the necessary files—HTML, CSS, JavaScript, and modules—that dictate the site's appearance and functionality. Themes provide a cohesive design system that content creators can leverage without needing to write code.

**Modules** are reusable components that can be placed within templates or directly on pages. They encapsulate HTML, CSS, JavaScript, and HubL (HubSpot's templating language) along with customizable fields defined in a `fields.json` file. This structure allows developers to build complex, interactive elements that marketers can easily configure.

**Templates** define the layout and structure of pages, blogs, and emails. They are typically written using a combination of HTML and HubL. Templates can include modules and provide the framework within which content is displayed.

## Local Development Setup

Developing for HubSpot CMS locally requires specific tools and configurations to ensure a smooth workflow between your IDE and the HubSpot platform.

### Prerequisites

Before beginning development, ensure that Node.js is installed on your system. The HubSpot CLI requires Node.js version 20 or higher to function correctly. This is a strict requirement, as older versions are no longer supported.

### Installing the HubSpot CLI

The HubSpot Command Line Interface (CLI) is the primary tool for interacting with your HubSpot account from your local environment. It facilitates authentication, file syncing, and project management.

To install the CLI globally, execute the following command in your terminal:

```bash
npm install -g @hubspot/cli
```

### Authentication

Once the CLI is installed, you must authenticate it with your HubSpot account. This process generates a personal access key that allows the CLI to communicate securely with the platform.

Run the authentication command:

```bash
hs auth
```

This command will prompt you to log into your HubSpot account via a browser window and authorize the CLI. After successful authentication, the CLI will create a `hubspot.config.yml` file in your home directory, storing your credentials and account information.

## Project Structure

A well-organized project structure is crucial for maintainability and scalability. HubSpot CMS projects follow a specific directory layout.

### The CMS Boilerplate

The most efficient way to start a new project is by utilizing the official HubSpot CMS Boilerplate. This repository provides a best-practice foundation, including a pre-configured directory structure, essential modules, and foundational CSS.

To create a new project based on the boilerplate, use the CLI:

```bash
hs create website-theme my-new-theme
```

This command generates a new directory named `my-new-theme` containing the boilerplate files.

### Directory Layout

A typical HubSpot CMS theme directory includes several key folders and files:

*   **`css/`**: Contains all stylesheet files. It is recommended to use a preprocessor like Sass or PostCSS and compile the output into this directory.
*   **`js/`**: Houses all JavaScript files required by the theme.
*   **`modules/`**: Contains individual directories for each custom module. Each module directory typically includes `module.html`, `module.css`, `module.js`, `fields.json`, and `meta.json`.
*   **`templates/`**: Stores the HTML/HubL template files for pages, blogs, and system pages (e.g., 404 errors, password prompts).
*   **`theme.json`**: The central configuration file for the theme. It defines theme settings, global variables, and default styles that content creators can modify in the HubSpot interface.
*   **`fields.json`**: (Optional at the theme root) Defines the fields available in the theme settings UI.

## Development Workflow

The typical development workflow involves making changes locally and syncing them to the HubSpot platform for testing and deployment.

### Local Development Server

The HubSpot CLI includes a local development server that allows you to preview changes in real-time without constantly uploading files to the live environment. This server proxies requests to your HubSpot account, injecting your local files into the response.

To start the local development server, navigate to your project directory and run:

```bash
hs project dev
```

This command will start the server and provide a local URL (usually `http://localhost:8080`) where you can view your work.

### Syncing Files

If you prefer not to use the local development server, or if you need to upload specific files, you can use the CLI's watch and upload commands.

To automatically upload files as they are saved, use the watch command:

```bash
hs watch <source_directory> <destination_directory>
```

For example, to watch the `my-new-theme` directory and upload changes to a folder named `my-theme` in HubSpot:

```bash
hs watch my-new-theme my-theme
```

To manually upload a file or directory, use the upload command:

```bash
hs upload <source> <destination>
```

## Version Control and CI/CD

Integrating version control and Continuous Integration/Continuous Deployment (CI/CD) pipelines is highly recommended for professional development workflows.

HubSpot supports integration with GitHub, allowing you to automatically deploy changes when code is pushed to a specific branch. The official `hubspot-cms-deploy-action` provides a streamlined way to configure GitHub Actions for this purpose. This approach ensures that your codebase remains the single source of truth and facilitates collaborative development.
