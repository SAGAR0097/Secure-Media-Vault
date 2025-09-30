"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
exports.supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL = "https://iqtqgiwnjvvuzdeicqtt.supabase.co", process.env.SUPABASE_SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxdHFnaXduanZ2dXpkZWljcXR0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODY1MDU5NywiZXhwIjoyMDc0MjI2NTk3fQ.XF_2nYW5kZsD225sAmb8ew85we5zVCiJ8D_TFdLuQmY");
