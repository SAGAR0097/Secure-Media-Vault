import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.SUPABASE_URL = "https://iqtqgiwnjvvuzdeicqtt.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdHFnaXduanZ2dXpkZWljcXR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY1MDU5NywiZXhwIjoyMDc0MjI2NTk3fQ.XF_2nYW5kZsD225sAmb8ew85we5zVCiJ8D_TFdLuQmY"
);
