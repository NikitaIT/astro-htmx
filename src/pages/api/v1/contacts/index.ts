import type { APIRoute } from "astro";
import { Contact } from "../../../../contacts_model";

// @app.route("/api/v1/contacts", methods=["GET"])
export const GET: APIRoute = async function json_contacts() {
  const contacts = Contact.all();
  return new Response(
    JSON.stringify({ contacts: contacts.map((c) => c.toJSON()) }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
};

// @app.route("/api/v1/contacts", methods=["POST"])
export const POST: APIRoute = async function json_contacts_new({ request }) {
  const formData = await request.formData();
  const contact = new Contact({
    first: formData.get("first_name")?.toString(),
    last: formData.get("last_name")?.toString(),
    phone: formData.get("phone")?.toString(),
    email: formData.get("email")?.toString(),
  });

  if (contact.save()) {
    return new Response(JSON.stringify(contact), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response(JSON.stringify({ errors: contact.errors }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
};
