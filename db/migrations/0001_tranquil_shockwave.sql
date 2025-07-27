DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'pitch_status') THEN
    CREATE TYPE "public"."pitch_status" AS ENUM('draft', 'final', 'submitted');
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "pitches" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "user_id" text NOT NULL,
  "role_name" text NOT NULL,
  "organisation_name" text,
  "role_level" text NOT NULL,
  "pitch_word_limit" integer DEFAULT 650 NOT NULL,
  "role_description" text,
  "relevant_experience" text NOT NULL,
  "star_examples" jsonb,
  "star_example_descriptions" text[],
  "albert_guidance" text,
  "pitch_content" text,
  "agent_execution_id" text,
  "status" "pitch_status" DEFAULT 'draft' NOT NULL,
  "star_examples_count" integer DEFAULT 2 NOT NULL,
  "current_step" integer DEFAULT 1 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

ALTER TABLE "profiles" ALTER COLUMN "updated_at" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='credits'
  ) THEN
    ALTER TABLE "profiles" ADD COLUMN "credits" integer DEFAULT 2 NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='profiles' AND column_name='credits_used'
  ) THEN
    ALTER TABLE "profiles" ADD COLUMN "credits_used" integer DEFAULT 0 NOT NULL;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'pitches_user_id_profiles_user_id_fk'
  ) THEN
    ALTER TABLE "pitches" ADD CONSTRAINT "pitches_user_id_profiles_user_id_fk"
    FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("user_id") ON DELETE cascade ON UPDATE no action;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_stripe_customer_id_unique'
  ) THEN
    ALTER TABLE "profiles" ADD CONSTRAINT "profiles_stripe_customer_id_unique"
    UNIQUE("stripe_customer_id");
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'profiles_stripe_subscription_id_unique'
  ) THEN
    ALTER TABLE "profiles" ADD CONSTRAINT "profiles_stripe_subscription_id_unique"
    UNIQUE("stripe_subscription_id");
  END IF;
END
$$;
