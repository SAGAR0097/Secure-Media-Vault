-- Align schema with GraphQL resolvers/definitions

-- Ensure asset table has expected columns
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'filename'
  ) THEN
    ALTER TABLE asset ADD COLUMN filename text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'mime'
  ) THEN
    ALTER TABLE asset ADD COLUMN mime text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'size'
  ) THEN
    ALTER TABLE asset ADD COLUMN size integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'sha256'
  ) THEN
    ALTER TABLE asset ADD COLUMN sha256 text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'status'
  ) THEN
    ALTER TABLE asset ADD COLUMN status text DEFAULT 'draft' NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'version'
  ) THEN
    ALTER TABLE asset ADD COLUMN version integer DEFAULT 1 NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'storagepath'
  ) THEN
    ALTER TABLE asset ADD COLUMN storagepath text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'ownerid'
  ) THEN
    ALTER TABLE asset ADD COLUMN ownerid text;
  END IF;

  -- Standardized timestamps used by API
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'createdat'
  ) THEN
    ALTER TABLE asset ADD COLUMN createdat timestamptz DEFAULT now() NOT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'asset' AND column_name = 'updatedat'
  ) THEN
    ALTER TABLE asset ADD COLUMN updatedat timestamptz DEFAULT now() NOT NULL;
  END IF;
END$$;

-- uploadticket table expected by createUploadUrl
CREATE TABLE IF NOT EXISTS uploadticket (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assetid text NOT NULL,
  userid text NOT NULL,
  nonce text NOT NULL,
  mime text,
  size integer,
  storagepath text,
  expiresat timestamptz NOT NULL,
  used boolean DEFAULT false NOT NULL
);

-- assetshare table expected by shareAsset
CREATE TABLE IF NOT EXISTS assetshare (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assetid text NOT NULL,
  touser text NOT NULL,
  candownload boolean DEFAULT false NOT NULL
);

-- downloadaudit table expected by getDownloadUrl
CREATE TABLE IF NOT EXISTS downloadaudit (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  assetid text NOT NULL,
  userid text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);


