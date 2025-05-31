// @app.route("/contacts/<contact_id>/email", methods=["GET"])
// def contacts_email_get(contact_id=0):
//     c = Contact.find(contact_id)
//     c.email = request.args.get('email')
//     c.validate()
//     return c.errors.get('email') or ""

import type { APIRoute } from "astro";
import { Contact } from "../../../contacts_model";

export const GET: APIRoute = function json_contacts_email_get({
  params: { contact_id = "0" },
  url,
}) {
  const contact = Contact.find(Number.parseInt(contact_id, 10));
  if (!contact) {
    return new Response("", {
      headers: { "Content-Type": "text/plain" },
    });
  }

  const email = url.searchParams.get("email") ?? "";
  contact.email = email;
  contact.validate();
  return new Response(contact.errors["email"] ?? "", {
    headers: { "Content-Type": "text/plain" },
  });
};
