---
name: hubspot-cms-data-apis
description: Guide for integrating data and APIs into HubSpot CMS. Use for writing GraphQL queries, building dynamic pages from CRM data or HubDB, and creating serverless functions for backend logic.
---

# HubSpot CMS Data & APIs

This skill provides guidance on building data-driven experiences within the HubSpot CMS. It covers querying data using GraphQL, generating dynamic pages from CRM objects and HubDB, and executing backend logic using serverless functions.

## GraphQL Data Fetching

GraphQL is the primary and most efficient method for querying HubSpot CRM data and HubDB tables from within CMS templates and modules. It allows you to request exactly the data you need, including associated records, in a single query.

### Writing GraphQL Queries

GraphQL queries in HubSpot are typically defined within a `.graphql` file or directly within a module's configuration.

A basic query to fetch a list of contacts might look like this:

```graphql
query getContacts {
  CRM {
    contact_collection(limit: 10) {
      items {
        firstname
        lastname
        email
      }
    }
  }
}
```

### Using GraphQL in Templates

To use the results of a GraphQL query in a HubL template, you first need to execute the query and assign the result to a variable.

If the query is saved in a file named `my_query.graphql`:

```hubl
{# Execute the query #}
{% set query_data = graphql("path/to/my_query.graphql") %}

{# Iterate over the results #}
<ul>
  {% for contact in query_data.data.CRM.contact_collection.items %}
    <li>{{ contact.firstname }} {{ contact.lastname }}</li>
  {% endfor %}
</ul>
```

## Dynamic Pages

Dynamic pages allow you to generate multiple website pages from a single template, populated by data from a specific source, such as a HubDB table or a CRM object (e.g., Products, Custom Objects).

### HubDB Dynamic Pages

HubDB is a relational database built into HubSpot. To create dynamic pages from a HubDB table:

1.  **Enable Dynamic Pages:** In the HubDB table settings, enable "Enable creation of dynamic pages using row data".
2.  **Configure Columns:** Ensure the table has columns for the page title and page path.
3.  **Create the Template:** Create a HubL template and link it to the HubDB table in the template settings.
4.  **Access Data:** Within the template, use the `dynamic_page_hubdb_row` variable to access the data for the current row.

```hubl
<h1>{{ dynamic_page_hubdb_row.name }}</h1>
<p>{{ dynamic_page_hubdb_row.description }}</p>
```

### CRM Object Dynamic Pages

You can also generate dynamic pages based on CRM objects. This is particularly useful for product catalogs or directories.

1.  **Create the Template:** Create a template and configure it to be a dynamic page for a specific CRM object type.
2.  **Access Data:** Use the `dynamic_page_crm_object` variable to access the properties of the current object.

```hubl
<h1>{{ dynamic_page_crm_object.name }}</h1>
<p>Price: ${{ dynamic_page_crm_object.price }}</p>
```

### GraphQL Directives for Dynamic Pages

When using GraphQL, you can use directives to tell HubSpot how to generate dynamic pages based on the query results.

```graphql
query getProducts {
  CRM {
    product_collection(limit: 100) {
      items @dynamic_page(slug_field: "hs_path") {
        name
        description
        price
      }
    }
  }
}
```

## Serverless Functions

Serverless functions allow you to execute server-side JavaScript within the HubSpot infrastructure. This is crucial for handling sensitive operations, such as API calls with secret keys, processing form submissions, or performing complex data manipulation that shouldn't be exposed to the client.

### Creating a Serverless Function

Serverless functions are defined within a `.functions` folder in your project directory. Each function requires a `serverless.json` configuration file and a JavaScript file containing the logic.

**`serverless.json`:**

```json
{
  "runtime": "nodejs18.x",
  "version": "1.0",
  "environment": {
    "MY_SECRET_KEY": "secret_value"
  },
  "endpoints": {
    "my-endpoint": {
      "method": "GET",
      "file": "my_function.js"
    }
  }
}
```

**`my_function.js`:**

```javascript
exports.main = async (context, sendResponse) => {
  // Access environment variables
  const secretKey = process.env.MY_SECRET_KEY;

  // Access query parameters
  const name = context.params.name;

  // Perform logic...

  // Send the response
  sendResponse({
    body: { message: `Hello, ${name}!` },
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
};
```

### Calling Serverless Functions

Once deployed, serverless functions can be called from your frontend JavaScript using standard `fetch` requests or AJAX. The endpoint URL is typically structured as `/_hcms/api/<function_name>`.

```javascript
fetch('/_hcms/api/my-endpoint?name=World')
  .then(response => response.json())
  .then(data => console.log(data.message));
```

## Best Practices

*   **Optimize GraphQL Queries:** Only request the specific fields you need to minimize payload size and improve performance.
*   **Secure Serverless Functions:** Never expose API keys or sensitive logic in frontend code. Always use serverless functions for these operations.
*   **Handle Errors Gracefully:** Implement robust error handling in your serverless functions and provide meaningful feedback to the frontend.
*   **Use HubDB for Structured Content:** HubDB is ideal for managing structured content like team directories, event listings, or resource libraries that need to be displayed dynamically.
