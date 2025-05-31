import type { APIRoute } from "astro";
import { Archiver } from "../../../contacts_model";
import { readFile } from "fs/promises";

// @app.route("/contacts/archive/file", methods=["GET"])
export const GET: APIRoute = async function archive_content() {
  const archiver = Archiver.get();
  const filePath = archiver.archiveFilePath();
  const fileContent = await readFile(filePath);

  return new Response(fileContent, {
    headers: {
      "Content-Disposition": 'attachment; filename="archive.json"',
      "Content-Type": "application/json",
    },
  });
};
