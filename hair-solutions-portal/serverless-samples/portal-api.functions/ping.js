/**
 * Copy this folder to `src/portal-api.functions/` when your HubSpot account
 * has CMS serverless enabled (typically CMS Enterprise, or some developer sandboxes).
 */
exports.main = (context, sendResponse) => {
  const contact = context.contact || {};
  sendResponse({
    statusCode: 200,
    body: {
      ok: true,
      service: "hair-solutions-portal",
      contact_vid: contact.vid || null,
      is_logged_in: Boolean(contact.isLoggedIn),
    },
  });
};
