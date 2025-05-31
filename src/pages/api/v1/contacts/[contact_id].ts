import type { APIRoute } from "astro";
import { Contact } from "../../../../contacts_model";

// @app.route("/api/v1/contacts/<contact_id>", methods=["GET"])
export const GET: APIRoute = async function json_contacts_view({
  params: { contact_id = "0" },
}) {
  const contact = Contact.find(Number.parseInt(contact_id, 10));
  if (contact) {
    return new Response(JSON.stringify(contact), {
      headers: { "Content-Type": "application/json" },
    });
  }
  return new Response("Contact not found", { status: 404 });
};

// @app.route("/api/v1/contacts/<contact_id>", methods=["PUT"])
export const PUT: APIRoute = async function json_contacts_edit({
  params: { contact_id = "0" },
  request,
}) {
  const contact = Contact.find(Number.parseInt(contact_id, 10));
  if (!contact) {
    return new Response("Contact not found", { status: 404 });
  }

  const formData = await request.formData();
  contact.update({
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

// @app.route("/api/v1/contacts/<contact_id>", methods=["DELETE"])
export const DELETE: APIRoute = async function json_contacts_delete({
  params: { contact_id = "0" },
}) {
  const contact = Contact.find(Number.parseInt(contact_id, 10));
  contact?.delete();
  return new Response(JSON.stringify({ success: true }), {
    headers: { "Content-Type": "application/json" },
  });
};
