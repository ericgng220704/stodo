CREATE TABLE "tasks" (
	"id" integer PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"date" text NOT NULL,
	"done" boolean DEFAULT false NOT NULL
);
