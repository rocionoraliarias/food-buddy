import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const places = sqliteTable("places", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  notes: text("notes"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  country: text("country"),
  tags: text("tags").notNull().default("[]"),
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at").notNull(),
});
