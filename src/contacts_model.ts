import * as fs from "node:fs";
import * as path from "node:path";

const PAGE_SIZE = 100;

interface ContactData {
  id?: number;
  first?: string;
  last?: string;
  phone?: string;
  email?: string;
}

class Contact {
  static db: Record<number, Contact> = {};
  id?: number;
  first?: string;
  last?: string;
  phone?: string;
  email?: string;
  errors: Record<string, string> = {};

  constructor(data: ContactData) {
    this.id = data.id;
    this.first = data.first;
    this.last = data.last;
    this.phone = data.phone;
    this.email = data.email;
  }

  toJSON(): string {
    return JSON.stringify(this);
  }

  update(data: ContactData): void {
    this.first = data.first;
    this.last = data.last;
    this.phone = data.phone;
    this.email = data.email;
  }

  validate(): boolean {
    if (!this.email) {
      this.errors["email"] = "Email Required";
    }
    const existingContact = Object.values(Contact.db).find(
      (c) => c.id !== this.id && c.email === this.email
    );
    if (existingContact) {
      this.errors["email"] = "Email Must Be Unique";
    }
    return Object.keys(this.errors).length === 0;
  }

  save(): boolean {
    if (!this.validate()) {
      return false;
    }
    if (this.id === undefined) {
      const maxId = Object.keys(Contact.db).length
        ? Math.max(...Object.keys(Contact.db).map((id) => parseInt(id)))
        : 0;
      this.id = maxId + 1;
    }
    Contact.db[this.id] = this;
    Contact.saveDb();
    return true;
  }

  delete(): void {
    if (this.id !== undefined) {
      delete Contact.db[this.id];
      Contact.saveDb();
    }
  }

  static count(): Promise<number> {
    return new Promise((resolve) =>
      setTimeout(() => resolve(Object.keys(Contact.db).length), 2000)
    );
  }

  static all(page: number = 1): Contact[] {
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return Object.values(Contact.db).slice(start, end);
  }

  static search(text: string): Contact[] {
    return Object.values(Contact.db).filter((c) => {
      const matchFirst = c.first && c.first.includes(text);
      const matchLast = c.last && c.last.includes(text);
      const matchEmail = c.email && c.email.includes(text);
      const matchPhone = c.phone && c.phone.includes(text);
      return matchFirst || matchLast || matchEmail || matchPhone;
    });
  }

  static loadDb(): void {
    const filePath = path.resolve(import.meta.dirname, "contacts.json");
    if (fs.existsSync(filePath)) {
      const contacts = JSON.parse(
        fs.readFileSync(filePath, "utf-8")
      ) as ContactData[];
      Contact.db = {};
      contacts.forEach((c) => {
        Contact.db[c.id!] = new Contact(c);
      });
    }
  }

  static saveDb(): void {
    const filePath = path.resolve(import.meta.dirname, "contacts.json");
    const outArr = Object.values(Contact.db).map((c) => ({
      id: c.id,
      first: c.first,
      last: c.last,
      phone: c.phone,
      email: c.email,
    }));
    fs.writeFileSync(filePath, JSON.stringify(outArr, null, 2), "utf-8");
  }

  static find(id: number): Contact | undefined {
    const contact = Contact.db[id];
    if (contact) {
      contact.errors = {};
    }
    return contact;
  }
}

class Archiver {
  static archiveStatus: "Waiting" | "Running" | "Complete" = "Waiting";
  static archiveProgress: number = 0;
  static thread: NodeJS.Timeout | null = null;

  status(): "Waiting" | "Running" | "Complete" {
    return Archiver.archiveStatus;
  }

  progress(): number {
    return Archiver.archiveProgress;
  }

  run(): void {
    if (Archiver.archiveStatus === "Waiting") {
      Archiver.archiveStatus = "Running";
      Archiver.archiveProgress = 0;
      Archiver.thread = setInterval(() => this.runImpl(), 1000);
    }
  }

  private runImpl(): void {
    if (Archiver.archiveProgress >= 1) {
      Archiver.archiveStatus = "Complete";
      if (Archiver.thread) {
        clearInterval(Archiver.thread);
        Archiver.thread = null;
      }
    } else {
      Archiver.archiveProgress += 0.1;
      console.log(`Progress: ${Archiver.archiveProgress}`);
    }
  }

  archiveFilePath(): string {
    return path.resolve(import.meta.dirname, this.archiveFile());
  }

  archiveFile(): string {
    return "contacts.json";
  }

  reset(): void {
    Archiver.archiveStatus = "Waiting";
    Archiver.archiveProgress = 0;
    if (Archiver.thread) {
      clearInterval(Archiver.thread);
      Archiver.thread = null;
    }
  }

  static get(): Archiver {
    return new Archiver();
  }
}

Contact.loadDb();

export { Contact, Archiver };
