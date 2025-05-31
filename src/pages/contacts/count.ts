import type { APIRoute } from "astro";
import { Contact } from "../../contacts_model";

// @app.route("/contacts/count", methods=["GET"])
export const GET: APIRoute = async function contacts_count() {
  const count = await Contact.count();
  return new Response(`(${count} total Contacts)`, {
    headers: { "Content-Type": "text/plain" },
  });
};
