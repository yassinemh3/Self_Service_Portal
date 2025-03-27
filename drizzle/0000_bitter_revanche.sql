CREATE TYPE "public"."item_in_request_list_status" AS ENUM('Accepted', 'Declined', 'Processing');--> statement-breakpoint
CREATE TYPE "public"."request_status" AS ENUM('Accepted', 'Declined', 'Processing');--> statement-breakpoint
CREATE TYPE "public"."ticket_status" AS ENUM('Open', 'Closed', 'In Progress', 'On Hold');--> statement-breakpoint
CREATE TABLE "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" varchar(32) NOT NULL,
	"item_id" integer NOT NULL,
	"purchase_date" timestamp DEFAULT now() NOT NULL,
	"update_date" timestamp,
	"status" varchar(32) DEFAULT 'OK' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "item_in_request_list" (
	"id" serial PRIMARY KEY NOT NULL,
	"request_id" integer NOT NULL,
	"item_id" integer NOT NULL,
	"quantity" integer NOT NULL,
	"organization_id" varchar(31) NOT NULL,
	"status" "item_in_request_list_status" DEFAULT 'Processing' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "request" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"status" "request_status" DEFAULT 'Processing' NOT NULL,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"organization_id" varchar(31) NOT NULL,
	"update_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "shop_item" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"url" varchar(255),
	"category_id" integer,
	"stock" integer NOT NULL,
	"organization_id" varchar(31) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "shop_item_category" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(32) NOT NULL,
	"organization_id" varchar(31) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"status" "ticket_status" DEFAULT 'Open' NOT NULL,
	"owner_id" varchar(32) NOT NULL,
	"creation_date" timestamp DEFAULT now() NOT NULL,
	"organization_id" varchar(31) NOT NULL,
	"support_id" varchar(32),
	"update_date" timestamp
);
--> statement-breakpoint
CREATE TABLE "ticket_conversation" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"user_id" varchar(32) NOT NULL,
	"content" text NOT NULL,
	"creation_date" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ticket_screenshot" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"url" varchar(255) NOT NULL
);
--> statement-breakpoint
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_item_id_shop_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shop_item"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_in_request_list" ADD CONSTRAINT "item_in_request_list_request_id_request_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."request"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "item_in_request_list" ADD CONSTRAINT "item_in_request_list_item_id_shop_item_id_fk" FOREIGN KEY ("item_id") REFERENCES "public"."shop_item"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "shop_item" ADD CONSTRAINT "shop_item_category_id_shop_item_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."shop_item_category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ticket_conversation" ADD CONSTRAINT "ticket_conversation_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "ticket_screenshot" ADD CONSTRAINT "ticket_screenshot_ticket_id_ticket_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "public"."ticket"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX "idx_item_request" ON "item_in_request_list" USING btree ("request_id");--> statement-breakpoint
CREATE INDEX "idx_item_organization" ON "item_in_request_list" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_request_user" ON "request" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_request_organization" ON "request" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_shop_item_organization" ON "shop_item" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_owner" ON "ticket" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_organization" ON "ticket" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "idx_ticket_conversation_ticket" ON "ticket_conversation" USING btree ("ticket_id");